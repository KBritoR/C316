from fastapi import FastAPI

from app.api.erros import registrar_tratadores_de_erro
from app.api.routes.estoque import router as estoque_router
from app.api.routes.health import router as health_router
from app.api.routes.produtos import router as produtos_router

app = FastAPI(title="Controle de Estoque API")

registrar_tratadores_de_erro(app)

app.include_router(health_router)
app.include_router(produtos_router)
app.include_router(estoque_router)
