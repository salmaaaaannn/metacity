from fastapi import APIRouter, Request, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Optional, Any

router = APIRouter(prefix='/scenarios', tags=['scenarios'])


class ScenarioCreateRequest(BaseModel):
    name: str
    description: Optional[str] = ""


@router.get('/')
async def list_scenarios(request: Request) -> Any:
    engine = request.app.state.engine
    if engine and hasattr(engine, "scenario_manager"):
        scens = [s.to_dict() for s in engine.scenario_manager.scenarios.values()]
        return JSONResponse(content=scens)
    return JSONResponse(content=[])


@router.post('/')
async def create_scenario(req: ScenarioCreateRequest, request: Request) -> Any:
    engine = request.app.state.engine
    if not engine or not hasattr(engine, "scenario_manager"):
        raise HTTPException(status_code=503, detail="Simulation engine not ready")

    scen = engine.scenario_manager.create_scenario(req.name, req.description)
    return JSONResponse(content=scen.to_dict())


@router.get('/comparison')
async def get_comparison(request: Request, scenario_id: Optional[str] = None) -> Any:
    engine = request.app.state.engine
    if not engine or not hasattr(engine, "scenario_manager"):
        raise HTTPException(status_code=503, detail="Simulation engine not ready")

    comp = engine.scenario_manager.get_comparison(scenario_id)
    return JSONResponse(content=comp)


@router.post('/undo')
async def undo_action(request: Request) -> Any:
    engine = request.app.state.engine
    if not engine or not hasattr(engine, "scenario_manager"):
        raise HTTPException(status_code=503, detail="Simulation engine not ready")

    res = engine.scenario_manager.undo()
    return JSONResponse(content=res)


@router.post('/redo')
async def redo_action(request: Request) -> Any:
    engine = request.app.state.engine
    if not engine or not hasattr(engine, "scenario_manager"):
        raise HTTPException(status_code=503, detail="Simulation engine not ready")

    res = engine.scenario_manager.redo()
    return JSONResponse(content=res)
