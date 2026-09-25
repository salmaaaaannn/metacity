from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.config.settings import settings
from app.simulation.engine import SimulationEngine
from app.api.routes import (
    cities, districts, infrastructure, citizens, budget,
    simulation, websocket, businesses, roads, scenarios,
    environment, disasters, ai
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize and start simulation engine
    app.state.engine = SimulationEngine(settings)
    await app.state.engine.start()
    yield
    # Cleanup
    await app.state.engine.stop()


app = FastAPI(
    title='METACITY API',
    version='5.0.0-phase5',
    description='Autonomous Living AI City Digital Twin with Climate, Disasters & AI Planner',
    lifespan=lifespan
)

# CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount routers
app.include_router(cities.router)
app.include_router(districts.router)
app.include_router(infrastructure.router)
app.include_router(roads.router)
app.include_router(scenarios.router)
app.include_router(citizens.router)
app.include_router(budget.router)
app.include_router(businesses.router)
app.include_router(simulation.router)
app.include_router(websocket.router)
app.include_router(environment.router)
app.include_router(disasters.router)
app.include_router(ai.router)


@app.get('/health')
async def health():
    return {'status': 'ok', 'version': '3.0.0-phase3'}
