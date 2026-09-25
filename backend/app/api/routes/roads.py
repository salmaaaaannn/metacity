from fastapi import APIRouter, Request, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Optional, Any

router = APIRouter(prefix='/roads', tags=['roads'])


class RoadBuildRequest(BaseModel):
    road_type: str = "arterial"  # 'local', 'arterial', 'highway', 'bridge'
    start_x: float
    start_z: float
    end_x: float
    end_z: float
    name: Optional[str] = ""


@router.post('/validate')
async def validate_road(req: RoadBuildRequest, request: Request) -> Any:
    engine = request.app.state.engine
    if not engine or not hasattr(engine, "infrastructure_manager"):
        raise HTTPException(status_code=503, detail="Simulation engine not ready")

    res = engine.infrastructure_manager.validate_placement(
        req.road_type, req.start_x, req.start_z, req.end_x, req.end_z
    )
    return JSONResponse(content=res)


@router.post('/')
async def build_road(req: RoadBuildRequest, request: Request) -> Any:
    engine = request.app.state.engine
    if not engine or not hasattr(engine, "infrastructure_manager"):
        raise HTTPException(status_code=503, detail="Simulation engine not ready")

    res = engine.infrastructure_manager.construct(
        req.road_type,
        req.start_x,
        req.start_z,
        name=req.name or f"{req.road_type.title()} Link",
        end_x=req.end_x,
        end_z=req.end_z
    )
    if not res.get("valid"):
        return JSONResponse(status_code=400, content=res)

    if hasattr(engine, "scenario_manager"):
        engine.scenario_manager.record_action(
            action_type="ADD",
            item_type=req.road_type,
            params=req.model_dump(),
            inverse_params={"item_id": res["item"]["id"]},
            cost=res["item"]["construction_cost"]
        )

    return JSONResponse(content=res)
