import os

# Fora do Docker o banco e acessado pela porta publicada em localhost.
# Dentro do Compose, o docker-compose.yml injeta a URL com o host "db".
DATABASE_URL = os.environ.get(
    "DATABASE_URL",
    "postgresql+psycopg://estoque:estoque@localhost:5432/estoque",
)

# Origens do frontend autorizadas no CORS (separadas por virgula). Nada de "*":
# so liberamos quem realmente consome a API.
CORS_ORIGINS = [
    origem.strip()
    for origem in os.environ.get(
        "CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173"
    ).split(",")
    if origem.strip()
]
