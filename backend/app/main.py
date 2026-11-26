from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.erros import registrar_tratadores_de_erro
from app.api.routes.estoque import router as estoque_router
from app.api.routes.health import router as health_router
from app.api.routes.produtos import router as produtos_router
from app.core.config import CORS_ORIGINS

app = FastAPI(title="Controle de Estoque API")

# O frontend (porta 5173) e a API (porta 8000) sao origens diferentes,
# entao o navegador so le as respostas se a API autorizar a origem.
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=False,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE"],
    allow_headers=["Content-Type"],
)

registrar_tratadores_de_erro(app)

app.include_router(health_router)
app.include_router(produtos_router)
app.include_router(estoque_router)
