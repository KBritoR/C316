from fastapi import FastAPI

app = FastAPI(title="Controle de Estoque API")


@app.get("/health")
def health():
    return {"status": "ok"}
