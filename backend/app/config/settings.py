from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional

class Settings(BaseSettings):
    SUPABASE_URL: Optional[str] = None
    SUPABASE_ANON_KEY: Optional[str] = None
    SUPABASE_SERVICE_ROLE_KEY: Optional[str] = None
    
    REDIS_URL: str = "redis://localhost:6379"
    
    OPENAI_API_KEY: Optional[str] = None
    OPENAI_MODEL: str = "gpt-4o"
    GEMINI_API_KEY: Optional[str] = None
    GEMINI_MODEL: str = "gemini-2.0-flash"
    ANTHROPIC_API_KEY: Optional[str] = None
    ANTHROPIC_MODEL: Optional[str] = None
    OLLAMA_BASE_URL: Optional[str] = None
    OLLAMA_MODEL: Optional[str] = None
    
    SIMULATION_SEED: int = 42
    SIMULATION_CITY_SIZE: int = 8000
    SIMULATION_ACTIVE_CITIZENS: int = 1000
    SIMULATION_TICK_RATE: int = 10
    SIMULATION_CURRENCY: str = "MC"
    
    BACKEND_HOST: str = "0.0.0.0"
    BACKEND_PORT: int = 8000
    FRONTEND_URL: str = "http://localhost:3000"

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

settings = Settings()
