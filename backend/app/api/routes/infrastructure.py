from fastapi import APIRouter, Request, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Optional, List, Any

router = APIRouter(prefix='/infrastructure', tags=['infrastructure'])


class PlacementValidateRequest(BaseModel):
    item_type: str
    x: float
    z: float
    end_x: Optional[float] = None
    end_z: Optional[float] = None
    subtype: Optional[str] = None


class ConstructRequest(BaseModel):
    item_type: str
    x: float
    z: float
    name: Optional[str] = ""
    end_x: Optional[float] = None
    end_z: Optional[float] = None
    subtype: Optional[str] = None


@router.get('/')
async def list_infrastructure(request: Request) -> Any:
    engine = request.app.state.engine
    if engine and hasattr(engine, "infrastructure_manager"):
        return JSONResponse(content=engine.infrastructure_manager.to_list())
    return JSONResponse(content=[])


@router.post('/validate')
async def validate_placement(req: PlacementValidateRequest, request: Request) -> Any:
    engine = request.app.state.engine
    if not engine or not hasattr(engine, "infrastructure_manager"):
        raise HTTPException(status_code=503, detail="Simulation engine not ready")

    res = engine.infrastructure_manager.validate_placement(
        req.item_type, req.x, req.z, req.end_x, req.end_z, req.subtype
    )
    return JSONResponse(content=res)


@router.post('/')
async def construct_infrastructure(req: ConstructRequest, request: Request) -> Any:
    engine = request.app.state.engine
    if not engine or not hasattr(engine, "infrastructure_manager"):
        raise HTTPException(status_code=503, detail="Simulation engine not ready")

    res = engine.infrastructure_manager.construct(
        req.item_type, req.x, req.z, req.name, req.end_x, req.end_z, req.subtype
    )
    if not res.get("valid"):
        return JSONResponse(status_code=400, content=res)

    # Record into scenario if active
    if hasattr(engine, "scenario_manager"):
        engine.scenario_manager.record_action(
            action_type="ADD",
            item_type=req.item_type,
            params=req.model_dump(),
            inverse_params={"item_id": res["item"]["id"]},
            cost=res["item"]["construction_cost"]
        )

    return JSONResponse(content=res)


@router.patch('/{item_id}/upgrade')
async def upgrade_infrastructure(item_id: str, request: Request) -> Any:
    engine = request.app.state.engine
    if not engine or not hasattr(engine, "infrastructure_manager"):
        raise HTTPException(status_code=503, detail="Simulation engine not ready")

    res = engine.infrastructure_manager.upgrade(item_id)
    if not res.get("success"):
        return JSONResponse(status_code=400, content=res)

    if hasattr(engine, "scenario_manager"):
        engine.scenario_manager.record_action(
            action_type="UPGRADE",
            item_type=res["item"]["type"],
            params={"item_id": item_id},
            inverse_params={"item_id": item_id},
            cost=res["item"]["construction_cost"] * 0.5
        )

    return JSONResponse(content=res)


@router.delete('/{item_id}')
async def demolish_infrastructure(item_id: str, request: Request) -> Any:
    engine = request.app.state.engine
    if not engine or not hasattr(engine, "infrastructure_manager"):
        raise HTTPException(status_code=503, detail="Simulation engine not ready")

    item = engine.infrastructure_manager.items.get(item_id)
    item_copy = item.to_dict() if item else None

    res = engine.infrastructure_manager.demolish(item_id)
    if not res.get("success"):
        return JSONResponse(status_code=400, content=res)

    if hasattr(engine, "scenario_manager") and item_copy:
        engine.scenario_manager.record_action(
            action_type="REMOVE",
            item_type=item_copy["type"],
            params={"item_id": item_id},
            inverse_params={"item_data": item_copy},
            cost=item_copy["construction_cost"] * 0.15
        )

    return JSONResponse(content=res)
