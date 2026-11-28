from fastapi import APIRouter, Depends, Response

from app.api.dependencias import get_produto_service
from app.schemas.movimentacao import MovimentacaoCreate, MovimentacaoOut
from app.schemas.produto import ProdutoCreate, ProdutoOut, ProdutoPatch, ProdutoUpdate
from app.services.produto_service import ProdutoService

router = APIRouter(prefix="/produtos", tags=["produtos"])


@router.get("", response_model=list[ProdutoOut])
def listar_produtos(
    categoria: str | None = None,
    busca: str | None = None,
    estoque_baixo: bool | None = None,
    service: ProdutoService = Depends(get_produto_service),
):
    return service.listar(categoria=categoria, busca=busca, estoque_baixo=estoque_baixo)


@router.get("/{produto_id}", response_model=ProdutoOut)
def obter_produto(produto_id: int, service: ProdutoService = Depends(get_produto_service)):
    return service.obter(produto_id)


@router.post("", response_model=ProdutoOut, status_code=201)
def criar_produto(dados: ProdutoCreate, service: ProdutoService = Depends(get_produto_service)):
    return service.criar(dados)


@router.put("/{produto_id}", response_model=ProdutoOut)
def atualizar_produto(
    produto_id: int, dados: ProdutoUpdate, service: ProdutoService = Depends(get_produto_service)
):
    return service.atualizar(produto_id, dados)


@router.patch("/{produto_id}", response_model=ProdutoOut)
def atualizar_produto_parcialmente(
    produto_id: int, dados: ProdutoPatch, service: ProdutoService = Depends(get_produto_service)
):
    return service.atualizar_parcialmente(produto_id, dados)


@router.delete("/{produto_id}", status_code=204)
def excluir_produto(produto_id: int, service: ProdutoService = Depends(get_produto_service)):
    service.excluir(produto_id)
    return Response(status_code=204)


@router.post("/{produto_id}/movimentacoes", response_model=MovimentacaoOut, status_code=201)
def registrar_movimentacao(
    produto_id: int,
    dados: MovimentacaoCreate,
    service: ProdutoService = Depends(get_produto_service),
):
    return service.registrar_movimentacao(produto_id, dados)


@router.get("/{produto_id}/movimentacoes", response_model=list[MovimentacaoOut])
def listar_movimentacoes(produto_id: int, service: ProdutoService = Depends(get_produto_service)):
    return service.listar_movimentacoes(produto_id)
