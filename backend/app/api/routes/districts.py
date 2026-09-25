from fastapi import APIRouter, Query, Request, HTTPException
from fastapi.responses import JSONResponse
from typing import Any

router = APIRouter(prefix='/districts', tags=['districts'])


@router.get('/')
async def list_districts(request: Request, city_id: str = "default") -> Any:
    engine = request.app.state.engine
    if engine:
        return JSONResponse(content=[d.to_dict() for d in engine.world.districts.values()])
    return JSONResponse(content=[])


@router.get('/{district_id}')
async def get_district(request: Request, district_id: str) -> Any:
    engine = request.app.state.engine
    if not engine:
        raise HTTPException(status_code=503, detail="Simulation engine not running")

    details = engine.get_district_details(district_id)
    if details:
        return JSONResponse(content=details)
    raise HTTPException(status_code=404, detail="District not found")
