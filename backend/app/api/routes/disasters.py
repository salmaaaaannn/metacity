from fastapi import APIRouter, Request, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Optional, Dict, Any
from app.simulation.disasters.disaster_types import DisasterType

router = APIRouter(prefix='/disasters', tags=['disasters'])

class TriggerDisasterRequest(BaseModel):
    disaster_type: str
    epicenter_x: Optional[float] = 4000.0
    epicenter_z: Optional[float] = 4000.0
    severity: Optional[int] = 2
    radius: Optional[float] = 1200.0
    duration_seconds: Optional[float] = 180.0
    metadata: Optional[Dict[str, Any]] = None

@router.get('/')
async def get_disasters(request: Request) -> Any:
    engine = getattr(request.app.state, "engine", None)
    if not engine or not hasattr(engine, "disaster_manager"):
        raise HTTPException(status_code=503, detail="Disaster manager offline")
    return JSONResponse(content=engine.disaster_manager.get_hud_metrics())

@router.post('/trigger')
async def trigger_disaster(req: TriggerDisasterRequest, request: Request) -> Any:
    engine = getattr(request.app.state, "engine", None)
    if not engine or not hasattr(engine, "disaster_manager"):
        raise HTTPException(status_code=503, detail="Disaster manager offline")
    try:
        dtype = DisasterType(req.disaster_type.upper())
    except ValueError:
        raise HTTPException(status_code=400, detail=f"Invalid disaster type: {req.disaster_type}")

    incident = engine.disaster_manager.trigger_disaster(
        disaster_type=dtype,
        epicenter_x=req.epicenter_x or 4000.0,
        epicenter_z=req.epicenter_z or 4000.0,
        severity=req.severity or 2,
        radius=req.radius or 1200.0,
        duration_seconds=req.duration_seconds or 180.0,
        metadata=req.metadata
    )
    return JSONResponse(content={"success": True, "incident": incident.to_dict()})

@router.post('/{incident_id}/pause')
async def pause_disaster(incident_id: str, request: Request) -> Any:
    engine = getattr(request.app.state, "engine", None)
    if not engine or not hasattr(engine, "disaster_manager"):
        raise HTTPException(status_code=503, detail="Disaster manager offline")
    paused = engine.disaster_manager.pause_disaster(incident_id)
    if not paused:
        raise HTTPException(status_code=404, detail="Incident not found")
    return JSONResponse(content={"success": True, "incident_id": incident_id})

@router.post('/{incident_id}/stop')
async def stop_disaster(incident_id: str, request: Request) -> Any:
    engine = getattr(request.app.state, "engine", None)
    if not engine or not hasattr(engine, "disaster_manager"):
        raise HTTPException(status_code=503, detail="Disaster manager offline")
    res = engine.disaster_manager.stop_disaster(incident_id)
    if not res:
        raise HTTPException(status_code=404, detail="Incident not found")
    return JSONResponse(content={"success": True, "recovery": res})

@router.post('/reset')
async def reset_disasters(request: Request) -> Any:
    engine = getattr(request.app.state, "engine", None)
    if not engine or not hasattr(engine, "disaster_manager"):
        raise HTTPException(status_code=503, detail="Disaster manager offline")
    engine.disaster_manager.reset_all()
    return JSONResponse(content={"success": True, "message": "All disasters reset"})

@router.get('/resilience')
async def get_resilience(request: Request) -> Any:
    engine = getattr(request.app.state, "engine", None)
    if not engine or not hasattr(engine, "disaster_manager"):
        raise HTTPException(status_code=503, detail="Disaster manager offline")
    env = getattr(engine, "environment_engine", None)
    env_state = env.state if env else None
    return JSONResponse(content=engine.disaster_manager.get_resilience(env_state))
