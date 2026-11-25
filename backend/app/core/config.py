import os

# Fora do Docker o banco e acessado pela porta publicada em localhost.
# Dentro do Compose, o docker-compose.yml injeta a URL com o host "db".
DATABASE_URL = os.environ.get(
    "DATABASE_URL",
    "postgresql+psycopg://estoque:estoque@localhost:5432/estoque",
)
