from fastapi import APIRouter, Request, HTTPException
from typing import Optional

router = APIRouter(prefix='/simulation', tags=['simulation'])

@router.get('/runs/{run_id}/metrics')
async def get_metrics(run_id: str) -> dict:
    return {}

@router.post('/control')
async def control_simulation(request: Request, action: str, speed: Optional[float] = None) -> dict:
    engine = request.app.state.engine
    if not engine:
        raise HTTPException(status_code=503, detail="Simulation engine not running")
        
    if action == 'pause':
        engine.pause()
    elif action == 'resume':
        engine.resume()
    elif action == 'set_speed' and speed is not None:
        engine.set_speed(speed)
    else:
        raise HTTPException(status_code=400, detail="Invalid action")
        
    return {"status": "success", "action": action}
