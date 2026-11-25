from enum import StrEnum


class TipoMovimentacao(StrEnum):
    ENTRADA = "entrada"
    SAIDA = "saida"


class QuantidadeInvalidaError(ValueError):
    pass


class EstoqueInsuficienteError(ValueError):
    def __init__(self, saldo_atual: int, quantidade: int) -> None:
        self.saldo_atual = saldo_atual
        self.quantidade = quantidade
        super().__init__(
            f"Estoque insuficiente: saldo atual {saldo_atual}, saída solicitada {quantidade}"
        )


def calcular_novo_saldo(saldo_atual: int, tipo: TipoMovimentacao, quantidade: int) -> int:
    if quantidade <= 0:
        raise QuantidadeInvalidaError("A quantidade da movimentação deve ser maior que zero")

    if tipo == TipoMovimentacao.ENTRADA:
        return saldo_atual + quantidade

    if quantidade > saldo_atual:
        raise EstoqueInsuficienteError(saldo_atual, quantidade)
    return saldo_atual - quantidade


def esta_com_estoque_baixo(quantidade: int, estoque_minimo: int) -> bool:
    return quantidade <= estoque_minimo
