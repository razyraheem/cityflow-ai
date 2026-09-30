import os
from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "CITYFLOW AI"
    VERSION: str = "2.4.0"
    TAGLINE: str = "From Camera Perception to Predictive City Intelligence."
    API_V1_STR: str = "/api"
    
    SECRET_KEY: str = os.getenv("JWT_SECRET", "cityflow_ai_sih2026_secure_key_production_grade")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./cityflow.db")
    
    CORS_ORIGINS: List[str] = ["*"]
    
    DEMO_MODE: bool = True
    SIMULATION_INTERVAL_SECONDS: float = 3.0
    
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="allow")

settings = Settings()

