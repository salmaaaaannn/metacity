from fastapi import APIRouter, Query, Request, HTTPException
from fastapi.responses import JSONResponse
from typing import Any

router = APIRouter(prefix='/citizens', tags=['citizens'])


@router.get('/')
async def list_citizens(request: Request, city_id: str = "default", limit: int = 100) -> Any:
    engine = request.app.state.engine
    if engine:
        cits = list(engine.citizens.values())[:limit]
        return JSONResponse(content=[c.to_position_dict() for c in cits])
    return JSONResponse(content=[])


@router.get('/{citizen_id}')
async def get_citizen(request: Request, citizen_id: str) -> Any:
    engine = request.app.state.engine
    if engine and citizen_id in engine.citizens:
        return JSONResponse(content=engine.citizens[citizen_id].to_detail_dict())
    raise HTTPException(status_code=404, detail="Citizen not found")
