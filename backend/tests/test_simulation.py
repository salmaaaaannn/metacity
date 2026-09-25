import pytest
import asyncio
from app.config.settings import Settings
from app.simulation.engine import SimulationEngine

@pytest.mark.asyncio
async def test_simulation_engine_initialization():
    settings = Settings(SIMULATION_ACTIVE_CITIZENS=10)
    engine = SimulationEngine(settings)
    
    assert engine.world is not None
    assert engine.clock is not None
    assert engine.budget is not None
    assert len(engine.citizens) == 10
    assert not engine.is_running
    
    await engine.tick()
    assert engine.clock.tick == 1
    
    # Check citizens moved or stayed depending on path
    for c in engine.citizens.values():
        assert c.current_x is not None
        assert c.current_z is not None
