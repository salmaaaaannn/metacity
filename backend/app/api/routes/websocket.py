from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Request
from typing import List

router = APIRouter(tags=['websocket'])

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    async def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, message: dict):
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except:
                pass

    async def send_to(self, websocket: WebSocket, message: dict):
        try:
            await websocket.send_json(message)
        except:
            pass

manager = ConnectionManager()

@router.websocket('/ws/simulation/{run_id}')
async def simulation_websocket(websocket: WebSocket, run_id: str):
    await manager.connect(websocket)
    engine = getattr(websocket.app.state, "engine", None)
    if not engine:
        await websocket.close()
        return

    # Send initial snapshot
    await manager.send_to(websocket, engine.get_state_snapshot())
    
    async def on_tick(delta: dict):
        await manager.send_to(websocket, delta)
        
    engine.add_tick_callback(on_tick)

    try:
        while True:
            data = await websocket.receive_text()
            # Handle incoming commands if needed
    except WebSocketDisconnect:
        engine.remove_tick_callback(on_tick)
        await manager.disconnect(websocket)
