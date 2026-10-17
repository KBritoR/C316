from fastapi import FastAPI

from app.api.routes.health import router as health_router
from app.api.routes.servicos import router as servicos_router

app = FastAPI(title="C316 Backend")
app.include_router(health_router)
app.include_router(servicos_router)
