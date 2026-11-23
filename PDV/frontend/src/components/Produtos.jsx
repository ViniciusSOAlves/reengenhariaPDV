import { useCallback, useEffect, useState } from 'react'
import './Produtos.css'

const API_URL = 'http://localhost:5000/produtos'

const formularioInicial = {
  descricao: '',
  preco: '',
  quantidade: '',
}

async function lerResposta(resposta) {
  const dados = await resposta.json().catch(() => ({}))

  if (!resposta.ok) {
    throw new Error(
      dados.erro || dados.mensagem || 'Não foi possível concluir a operação.'
    )
  }

  return dados
}

function formatarPreco(valor) {
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

function Produtos({ onVoltar }) {
  const [produtos, setProdutos] = useState([])
  const [formulario, setFormulario] = useState(formularioInicial)
  const [produtoSelecionado, setProdutoSelecionado] = useState(null)
  const [carregando, setCarregando] = useState(true)
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')
  const [mensagem, setMensagem] = useState('')

  const carregarProdutos = useCallback(async () => {
    setCarregando(true)
    setErro('')

    try {
      const resposta = await fetch(API_URL)
      const dados = await lerResposta(resposta)
      setProdutos(dados)
    } catch (error) {
      setErro(error.message)
    } finally {
      setCarregando(false)
    }
  }, [])

  useEffect(() => {
    carregarProdutos()
  }, [carregarProdutos])

  function atualizarCampo(event) {
    const { name, value } = event.target

    setFormulario((atual) => ({
      ...atual,
      [name]: value,
    }))
  }

  function limparFormulario() {
    setFormulario(formularioInicial)
    setProdutoSelecionado(null)
  }

  function selecionarProduto(produto) {
    setProdutoSelecionado(produto)
    setFormulario({
      descricao: produto.descricao || '',
      preco: produto.preco ?? '',
      quantidade: produto.quantidade ?? '',
    })
    setMensagem('')
    setErro('')
  }

  async function salvarProduto(event) {
    event.preventDefault()
    setSalvando(true)
    setErro('')
    setMensagem('')

    const codigo = produtoSelecionado?.codigo
    const url = codigo ? `${API_URL}/${codigo}` : API_URL
    const metodo = codigo ? 'PUT' : 'POST'

    try {
      const resposta = await fetch(url, {
        method: metodo,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          descricao: formulario.descricao.trim(),
          preco: Number(formulario.preco),
          quantidade: Number(formulario.quantidade),
        }),
      })

      await lerResposta(resposta)

      setMensagem(
        codigo
          ? 'Produto alterado com sucesso.'
          : 'Produto cadastrado com sucesso.'
      )

      limparFormulario()
      await carregarProdutos()
    } catch (error) {
      setErro(error.message)
    } finally {
      setSalvando(false)
    }
  }

  async function excluirProduto(produto) {
    const confirmou = window.confirm(
      `Deseja excluir o produto "${produto.descricao}"?`
    )

    if (!confirmou) {
      return
    }

    setErro('')
    setMensagem('')

    try {
      const resposta = await fetch(`${API_URL}/${produto.codigo}`, {
        method: 'DELETE',
      })

      await lerResposta(resposta)

      if (produtoSelecionado?.codigo === produto.codigo) {
        limparFormulario()
      }

      setMensagem('Produto excluído com sucesso.')
      await carregarProdutos()
    } catch (error) {
      setErro(error.message)
    }
  }

  return (
    <main className="produtos-pagina">
      <header className="produtos-cabecalho">
        <button
          className="produtos-voltar"
          type="button"
          onClick={onVoltar}
        >
          ← Tela principal
        </button>

        <div>
          <p className="produtos-sobretitulo">CADASTROS</p>
          <h1>Manter Produto</h1>
          <p className="produtos-descricao">
            Gerencie os produtos, os preços e o estoque.
          </p>
        </div>
      </header>

      {erro && (
        <div className="produtos-mensagem produtos-erro" role="alert">
          {erro}
        </div>
      )}

      {mensagem && (
        <div className="produtos-mensagem produtos-sucesso" role="status">
          {mensagem}
        </div>
      )}

      <div className="produtos-layout">
        <section className="produtos-cartao">
          <h2>
            {produtoSelecionado ? 'Alterar produto' : 'Cadastrar produto'}
          </h2>

          <form className="produtos-formulario" onSubmit={salvarProduto}>
            <label>
              Descrição
              <input
                name="descricao"
                value={formulario.descricao}
                onChange={atualizarCampo}
                required
                maxLength={100}
              />
            </label>

            <label>
              Preço unitário
              <input
                name="preco"
                type="number"
                min="0"
                step="any"
                value={formulario.preco}
                onChange={atualizarCampo}
                required
              />
            </label>

            <label>
              Quantidade em estoque
              <input
                name="quantidade"
                type="number"
                min="0"
                step="any"
                value={formulario.quantidade}
                onChange={atualizarCampo}
                required
              />
            </label>

            <div className="produtos-botoes-formulario">
              <button
                className="produtos-botao-principal"
                type="submit"
                disabled={salvando}
              >
                {salvando
                  ? 'Salvando...'
                  : produtoSelecionado
                    ? 'Salvar alteração'
                    : 'Cadastrar produto'}
              </button>

              {produtoSelecionado && (
                <button
                  className="produtos-botao-secundario"
                  type="button"
                  onClick={limparFormulario}
                >
                  Cancelar
                </button>
              )}
            </div>
          </form>
        </section>

        <section className="produtos-cartao produtos-lista">
          <div className="produtos-lista-cabecalho">
            <div>
              <h2>Produtos cadastrados</h2>
              <p>{produtos.length} registro(s)</p>
            </div>

            <button
              className="produtos-atualizar"
              type="button"
              onClick={carregarProdutos}
              disabled={carregando}
            >
              Atualizar
            </button>
          </div>

          {carregando ? (
            <p className="produtos-estado-lista">Carregando produtos...</p>
          ) : produtos.length === 0 ? (
            <p className="produtos-estado-lista">
              Nenhum produto cadastrado.
            </p>
          ) : (
            <div className="produtos-tabela-conteiner">
              <table className="produtos-tabela">
                <thead>
                  <tr>
                    <th>Código</th>
                    <th>Descrição</th>
                    <th>Preço</th>
                    <th>Estoque</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {produtos.map((produto) => (
                    <tr key={produto.codigo}>
                      <td>{produto.codigo}</td>
                      <td>{produto.descricao || '—'}</td>
                      <td>{formatarPreco(produto.preco)}</td>
                      <td>{formatarQuantidade(produto.quantidade)}</td>
                      <td>
                        <div className="produtos-acoes">
                          <button
                            className="produtos-acao-alterar"
                            type="button"
                            onClick={() => selecionarProduto(produto)}
                          >
                            Alterar
                          </button>
                          <button
                            className="produtos-acao-excluir"
                            type="button"
                            onClick={() => excluirProduto(produto)}
                          >
                            Excluir
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  )
}

export default Produtos