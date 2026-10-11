from fastapi import FastAPI

from routers.health import router as health_router
from routers.servicos import router as servicos_router

app = FastAPI(title="C316 Backend")
app.include_router(health_router)
app.include_router(servicos_router)
