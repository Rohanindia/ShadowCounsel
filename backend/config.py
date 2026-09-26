from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    groq_api_key: str = ""
    database_url: str = "sqlite+aiosqlite:///./shadowcounsel.db"
    chroma_persist_dir: str = "./chroma_store"
    cors_origins: str = "http://localhost:3000"
    groq_model: str = "openai/gpt-oss-20b"
    
    @property
    def cors_origins_list(self) -> List[str]:
        return [origin.strip() for origin in self.cors_origins.split(",")]
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

settings = Settings()
