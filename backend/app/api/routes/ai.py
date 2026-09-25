from fastapi import APIRouter, Request, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Optional, Dict, Any, List
from app.ai.llm.llm_provider import LLMProvider
from app.ai.recommendations.report_generator import generate_report

router = APIRouter(prefix='/ai', tags=['ai'])
llm_provider = LLMProvider()

class QueryRequest(BaseModel):
    question: str

class PlanGenerateRequest(BaseModel):
    goal: str
    weights: Optional[Dict[str, float]] = None

@router.get('/analytics/history')
async def get_analytics_history(request: Request, limit: int = 50) -> Any:
    engine = getattr(request.app.state, "engine", None)
    if not engine or not hasattr(engine, "analytics_engine"):
        raise HTTPException(status_code=503, detail="Analytics engine offline")
    return JSONResponse(content=engine.analytics_engine.get_history(limit=limit))

@router.get('/predictions')
async def get_predictions(request: Request) -> Any:
    engine = getattr(request.app.state, "engine", None)
    if not engine or not hasattr(engine, "forecasting_engine"):
        raise HTTPException(status_code=503, detail="Forecasting engine offline")
    history = engine.analytics_engine.get_history(limit=50)
    forecasts = engine.forecasting_engine.generate_all_forecasts(history)
    return JSONResponse(content=forecasts)

@router.post('/planner/generate')
async def generate_plan(req: PlanGenerateRequest, request: Request) -> Any:
    engine = getattr(request.app.state, "engine", None)
    if not engine or not hasattr(engine, "ai_planner"):
        raise HTTPException(status_code=503, detail="AI Planner offline")
    candidates = engine.ai_planner.generate_plan_candidates(req.goal, req.weights)
    return JSONResponse(content={"goal": req.goal, "candidates": candidates})

@router.post('/query')
async def query_ai(req: QueryRequest, request: Request) -> Any:
    engine = getattr(request.app.state, "engine", None)
    if not engine:
        raise HTTPException(status_code=503, detail="Simulation engine offline")
    res = llm_provider.answer_query(req.question, engine)
    return JSONResponse(content=res)

@router.get('/reports/{report_type}')
async def get_report(report_type: str, request: Request) -> Any:
    engine = getattr(request.app.state, "engine", None)
    if not engine:
        raise HTTPException(status_code=503, detail="Simulation engine offline")
    rep = generate_report(report_type, engine)
    return JSONResponse(content=rep)
