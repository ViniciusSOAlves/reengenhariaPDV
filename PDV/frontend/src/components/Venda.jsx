import { useCallback, useEffect, useState } from 'react'
import './Venda.css'

const CLIENTES_URL = 'http://localhost:5000/clientes'
const VENDEDORES_URL = 'http://localhost:5000/vendedores'
const PRODUTOS_URL = 'http://localhost:5000/produtos'
const VENDA_URL = 'http://localhost:5000/realizarVenda'

async function lerResposta(resposta) {
  const dados = await resposta.json().catch(() => ({}))

  if (!resposta.ok) {
    throw new Error(
      dados.erro || dados.mensagem || 'Não foi possível concluir a operação.'
    )
  }

  return dados
}

function formatarMoeda(valor) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(Number(valor) || 0)
}

function formatarQuantidade(valor) {
  return new Intl.NumberFormat('pt-BR', {
    maximumFractionDigits: 2,
  }).format(Number(valor) || 0)
}

function arredondarMoeda(valor) {
  return Math.round((valor + Number.EPSILON) * 100) / 100
}

function Venda({ onVoltar }) {
  const [clientes, setClientes] = useState([])
  const [vendedores, setVendedores] = useState([])
  const [produtos, setProdutos] = useState([])
  const [itens, setItens] = useState([])
  const [clienteCodigo, setClienteCodigo] = useState('')
  const [vendedorCodigo, setVendedorCodigo] = useState('')
  const [produtoCodigo, setProdutoCodigo] = useState('')
  const [quantidade, setQuantidade] = useState('1')
  const [carregando, setCarregando] = useState(true)
  const [finalizando, setFinalizando] = useState(false)
  const [erro, setErro] = useState('')
  const [mensagem, setMensagem] = useState('')

  const carregarDados = useCallback(async () => {
    setCarregando(true)
    setErro('')

    try {
      const [respostaClientes, respostaVendedores, respostaProdutos] =
        await Promise.all([
          fetch(CLIENTES_URL),
          fetch(VENDEDORES_URL),
          fetch(PRODUTOS_URL),
        ])

      const [dadosClientes, dadosVendedores, dadosProdutos] =
        await Promise.all([
          lerResposta(respostaClientes),
          lerResposta(respostaVendedores),
          lerResposta(respostaProdutos),
        ])

      setClientes(dadosClientes)
      setVendedores(dadosVendedores)
      setProdutos(dadosProdutos)
    } catch (error) {
      setErro(error.message)
    } finally {
      setCarregando(false)
    }
  }, [])

  useEffect(() => {
    carregarDados()
  }, [carregarDados])

  const total = itens.reduce((soma, item) => soma + item.subtotal, 0)

  function adicionarProduto(event) {
    event.preventDefault()
    setErro('')
    setMensagem('')

    const produto = produtos.find(
      (item) => item.codigo === Number(produtoCodigo)
    )
    const quantidadeInformada = Number(quantidade)

    if (!produto) {
      setErro('Selecione um produto.')
      return
    }

    if (!Number.isFinite(quantidadeInformada) || quantidadeInformada <= 0) {
      setErro('Informe uma quantidade maior que zero.')
      return
    }

    const itemExistente = itens.find(
      (item) => item.codigo === produto.codigo
    )
    const quantidadeAtual = itemExistente?.quantidade || 0
    const quantidadeNova = quantidadeAtual + quantidadeInformada
    const estoque = Number(produto.quantidade) || 0

    if (quantidadeNova > estoque) {
      setErro(
        `Estoque insuficiente para ${produto.descricao}. Disponível: ${formatarQuantidade(
          estoque - quantidadeAtual
        )}.`
      )
      return
    }

    const preco = Number(produto.preco) || 0
    const subtotal = arredondarMoeda(preco * quantidadeNova)

    setItens((atuais) => {
      const existe = atuais.some((item) => item.codigo === produto.codigo)

      if (existe) {
        return atuais.map((item) =>
          item.codigo === produto.codigo
            ? {
                ...item,
                quantidade: quantidadeNova,
                subtotal,
              }
            : item
        )
      }

      return [
        ...atuais,
        {
          codigo: produto.codigo,
          descricao: produto.descricao,
          preco,
          quantidade: quantidadeNova,
          subtotal,
        },
      ]
    })

    setProdutoCodigo('')
    setQuantidade('1')
  }

  function removerProduto(codigo) {
    setItens((atuais) =>
      atuais.filter((item) => item.codigo !== codigo)
    )
    setErro('')
    setMensagem('')
  }

  async function finalizarVenda() {
    setErro('')
    setMensagem('')

    if (!clienteCodigo) {
      setErro('Selecione um cliente.')
      return
    }

    if (!vendedorCodigo) {
      setErro('Selecione um vendedor.')
      return
    }

    if (itens.length === 0) {
      setErro('Adicione pelo menos um produto à venda.')
      return
    }

    setFinalizando(true)

    try {
      const resposta = await fetch(VENDA_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          codCliente: Number(clienteCodigo),
          codVendedor: Number(vendedorCodigo),
          codProduto: itens.map((item) => item.codigo),
          quantidade: itens.map((item) => item.quantidade),
        }),
      })

      const dados = await lerResposta(resposta)

      setMensagem(
        `Venda ${dados.venda.codigo} finalizada. Total: ${formatarMoeda(
          dados.venda.total
        )}.`
      )

      setItens([])
      setClienteCodigo('')
      setVendedorCodigo('')
      setProdutoCodigo('')
      setQuantidade('1')

      await carregarDados()
    } catch (error) {
      setErro(error.message)
    } finally {
      setFinalizando(false)
    }
  }

  function nomeCliente(cliente) {
    return cliente.nome || `Cliente ${cliente.codigo}`
  }

  function nomeVendedor(vendedor) {
    return vendedor.nome || `Vendedor ${vendedor.codigo}`
  }

  return (
    <main className="venda-pagina">
      <header className="venda-cabecalho">
        <button
          className="venda-voltar"
          type="button"
          onClick={onVoltar}
        >
          ← Tela principal
        </button>

        <div>
          <p className="venda-sobretitulo">PDV</p>
          <h1>Nova Venda</h1>
          <p className="venda-descricao">
            Selecione o cliente e o vendedor, depois adicione os produtos.
          </p>
        </div>
      </header>

      {erro && (
        <div className="venda-mensagem venda-erro" role="alert">
          {erro}
        </div>
      )}

      {mensagem && (
        <div className="venda-mensagem venda-sucesso" role="status">
          {mensagem}
        </div>
      )}

      {carregando ? (
        <section className="venda-cartao">
          <p className="venda-estado">Carregando dados para a venda...</p>
        </section>
      ) : (
        <div className="venda-layout">
          <section className="venda-cartao venda-conteudo">
            <div className="venda-selecoes">
              <label>
                Cliente
                <select
                  value={clienteCodigo}
                  onChange={(event) => setClienteCodigo(event.target.value)}
                >
                  <option value="">Selecione um cliente</option>
                  {clientes.map((cliente) => (
                    <option key={cliente.codigo} value={cliente.codigo}>
                      {cliente.codigo} — {nomeCliente(cliente)}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Vendedor
                <select
                  value={vendedorCodigo}
                  onChange={(event) => setVendedorCodigo(event.target.value)}
                >
                  <option value="">Selecione um vendedor</option>
                  {vendedores.map((vendedor) => (
                    <option key={vendedor.codigo} value={vendedor.codigo}>
                      {vendedor.codigo} — {nomeVendedor(vendedor)}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <form className="venda-adicionar" onSubmit={adicionarProduto}>
              <label>
                Produto
                <select
                  value={produtoCodigo}
                  onChange={(event) => setProdutoCodigo(event.target.value)}
                  required
                >
                  <option value="">Selecione um produto</option>
                  {produtos.map((produto) => {
                    const itemNoCarrinho = itens.find(
                      (item) => item.codigo === produto.codigo
                    )
                    const quantidadeNoCarrinho =
                      itemNoCarrinho?.quantidade || 0
                    const estoqueRestante =
                      Number(produto.quantidade || 0) - quantidadeNoCarrinho

                    return (
                      <option
                        key={produto.codigo}
                        value={produto.codigo}
                        disabled={estoqueRestante <= 0}
                      >
                        {produto.codigo} — {produto.descricao} —{' '}
                        {formatarMoeda(produto.preco)} — estoque:{' '}
                        {formatarQuantidade(estoqueRestante)}
                      </option>
                    )
                  })}
                </select>
              </label>

              <label>
                Quantidade
                <input
                  type="number"
                  min="0.01"
                  step="any"
                  value={quantidade}
                  onChange={(event) => setQuantidade(event.target.value)}
                  required
                />
              </label>

              <button className="venda-botao-adicionar" type="submit">
                Adicionar
              </button>
            </form>

            <div className="venda-tabela-conteiner">
              <table className="venda-tabela">
                <thead>
                  <tr>
                    <th>Código</th>
                    <th>Descrição</th>
                    <th>Preço unitário</th>
                    <th>Quantidade</th>
                    <th>Subtotal</th>
                    <th>Ação</th>
                  </tr>
                </thead>
                <tbody>
                  {itens.length === 0 ? (
                    <tr>
                      <td className="venda-tabela-vazia" colSpan="6">
                        Nenhum produto adicionado à venda.
                      </td>
                    </tr>
                  ) : (
                    itens.map((item) => (
                      <tr key={item.codigo}>
                        <td>{item.codigo}</td>
                        <td>{item.descricao}</td>
                        <td>{formatarMoeda(item.preco)}</td>
                        <td>{formatarQuantidade(item.quantidade)}</td>
                        <td>{formatarMoeda(item.subtotal)}</td>
                        <td>
                          <button
                            className="venda-botao-remover"
                            type="button"
                            onClick={() => removerProduto(item.codigo)}
                          >
                            Remover
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <aside className="venda-cartao venda-resumo">
            <p className="venda-resumo-legenda">Data da venda</p>
            <strong className="venda-data">
              {new Intl.DateTimeFormat('pt-BR').format(new Date())}
            </strong>

            <div className="venda-resumo-linha">
              <span>Itens</span>
              <span>{itens.length}</span>
            </div>

            <div className="venda-total">
              <span>Total da venda</span>
              <strong>{formatarMoeda(total)}</strong>
            </div>

            <button
              className="venda-botao-finalizar"
              type="button"
              onClick={finalizarVenda}
              disabled={finalizando || itens.length === 0}
            >
              {finalizando ? 'Finalizando...' : 'Finalizar venda'}
            </button>
          </aside>
        </div>
      )}
    </main>
  )
}

export default Venda