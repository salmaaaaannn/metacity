from fastapi import APIRouter, Query, Request
from fastapi.responses import JSONResponse
from typing import Any

router = APIRouter(prefix='/budget', tags=['budget'])


@router.get('/')
async def get_budget(request: Request, city_id: str = "default") -> Any:
    engine = request.app.state.engine
    if engine and hasattr(engine, "budget"):
        return JSONResponse(content=engine.budget.to_dict())
    return JSONResponse(content={})


@router.get('/transactions')
async def get_transactions(request: Request, limit: int = 50) -> Any:
    engine = request.app.state.engine
    if engine and hasattr(engine, "budget"):
        txs = engine.budget.get_all_transactions()[:limit]
        return JSONResponse(content=txs)
    return JSONResponse(content=[])
