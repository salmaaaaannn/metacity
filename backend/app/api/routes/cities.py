from fastapi import APIRouter, Request, HTTPException
from fastapi.responses import JSONResponse
from typing import Any

router = APIRouter(prefix='/cities', tags=['cities'])


@router.get('/')
async def list_cities() -> list:
    return []


@router.get('/{city_id}/state')
async def get_city_state(city_id: str, request: Request) -> Any:
    engine = request.app.state.engine
    if not engine:
        raise HTTPException(status_code=503, detail="Simulation engine not running")
    snapshot = engine.get_state_snapshot()
    return JSONResponse(content=snapshot)


@router.get('/{city_id}')
async def get_city(city_id: str, request: Request) -> Any:
    engine = request.app.state.engine
    if not engine:
        raise HTTPException(status_code=404, detail="City not found")
    return JSONResponse(content={"id": city_id, "name": "METACITY", "world_size_x": 8000, "world_size_z": 8000})
