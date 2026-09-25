from fastapi import APIRouter, Request, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Optional, Any
from app.simulation.environment.environment_state import WeatherCondition, Season

router = APIRouter(prefix='/environment', tags=['environment'])

class WeatherOverrideRequest(BaseModel):
    weather: str

class SeasonOverrideRequest(BaseModel):
    season: str

@router.get('/')
async def get_environment(request: Request) -> Any:
    engine = getattr(request.app.state, "engine", None)
    if not engine or not hasattr(engine, "environment_engine"):
        raise HTTPException(status_code=503, detail="Environment engine offline")
    return JSONResponse(content=engine.environment_engine.to_dict())

@router.post('/weather')
async def set_weather(req: WeatherOverrideRequest, request: Request) -> Any:
    engine = getattr(request.app.state, "engine", None)
    if not engine or not hasattr(engine, "environment_engine"):
        raise HTTPException(status_code=503, detail="Environment engine offline")
    try:
        cond = WeatherCondition(req.weather.upper())
        engine.environment_engine.set_weather(cond)
        return JSONResponse(content={"success": True, "weather": cond.value})
    except ValueError:
        raise HTTPException(status_code=400, detail=f"Invalid weather condition: {req.weather}")

@router.post('/season')
async def set_season(req: SeasonOverrideRequest, request: Request) -> Any:
    engine = getattr(request.app.state, "engine", None)
    if not engine or not hasattr(engine, "environment_engine"):
        raise HTTPException(status_code=503, detail="Environment engine offline")
    try:
        season = Season(req.season.upper())
        engine.environment_engine.set_season(season)
        return JSONResponse(content={"success": True, "season": season.value})
    except ValueError:
        raise HTTPException(status_code=400, detail=f"Invalid season: {req.season}")
