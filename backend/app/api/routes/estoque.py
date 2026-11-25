from fastapi import APIRouter, Depends

from app.api.dependencias import get_produto_service
from app.schemas.resumo import ResumoEstoqueOut
from app.services.produto_service import ProdutoService

router = APIRouter(prefix="/estoque", tags=["estoque"])


@router.get("/resumo", response_model=ResumoEstoqueOut)
def resumo_do_estoque(service: ProdutoService = Depends(get_produto_service)):
    return service.resumo()
