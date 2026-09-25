from fastapi import APIRouter, Request, HTTPException
from fastapi.responses import JSONResponse
from typing import Any

router = APIRouter(prefix='/businesses', tags=['businesses'])


@router.get('/')
async def list_businesses(request: Request) -> Any:
    engine = request.app.state.engine
    if engine and hasattr(engine.world, "business_manager"):
        return JSONResponse(content=engine.world.business_manager.to_list())
    return JSONResponse(content=[])


@router.get('/{business_id}')
async def get_business(request: Request, business_id: str) -> Any:
    engine = request.app.state.engine
    if engine and hasattr(engine.world, "business_manager"):
        biz = engine.world.business_manager.businesses.get(business_id)
        if biz:
            return JSONResponse(content=biz.to_dict())
    raise HTTPException(status_code=404, detail="Business not found")
