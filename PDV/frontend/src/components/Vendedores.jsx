import { useCallback, useEffect, useState } from 'react'
import './Vendedores.css'

const API_URL = 'http://localhost:5000/vendedores'

const formularioInicial = {
  nome: '',
  login: '',
  senha: '',
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

function Vendedores({ onVoltar }) {
  const [vendedores, setVendedores] = useState([])
  const [formulario, setFormulario] = useState(formularioInicial)
  const [vendedorSelecionado, setVendedorSelecionado] = useState(null)
  const [carregando, setCarregando] = useState(true)
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')
  const [mensagem, setMensagem] = useState('')

  const carregarVendedores = useCallback(async () => {
    setCarregando(true)
    setErro('')

    try {
      const resposta = await fetch(API_URL)
      const dados = await lerResposta(resposta)
      setVendedores(dados)
    } catch (error) {
      setErro(error.message)
    } finally {
      setCarregando(false)
    }
  }, [])

  useEffect(() => {
    carregarVendedores()
  }, [carregarVendedores])

  function atualizarCampo(event) {
    const { name, value } = event.target

    setFormulario((atual) => ({
      ...atual,
      [name]: value,
    }))
  }

  function limparFormulario() {
    setFormulario(formularioInicial)
    setVendedorSelecionado(null)
  }

  function selecionarVendedor(vendedor) {
    setVendedorSelecionado(vendedor)
    setFormulario({
      nome: vendedor.nome || '',
      login: vendedor.login || '',
      senha: '',
    })
    setMensagem('')
    setErro('')
  }

  async function salvarVendedor(event) {
    event.preventDefault()
    setSalvando(true)
    setErro('')
    setMensagem('')

    const codigo = vendedorSelecionado?.codigo
    const url = codigo ? `${API_URL}/${codigo}` : API_URL
    const metodo = codigo ? 'PUT' : 'POST'

    try {
      const resposta = await fetch(url, {
        method: metodo,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nome: formulario.nome.trim(),
          login: formulario.login.trim(),
          senha: formulario.senha,
        }),
      })

      await lerResposta(resposta)

      setMensagem(
        codigo
          ? 'Vendedor alterado com sucesso.'
          : 'Vendedor cadastrado com sucesso.'
      )

      limparFormulario()
      await carregarVendedores()
    } catch (error) {
      setErro(error.message)
    } finally {
      setSalvando(false)
    }
  }

  async function excluirVendedor(vendedor) {
    const confirmou = window.confirm(
      `Deseja excluir o vendedor "${vendedor.nome}"?`
    )

    if (!confirmou) {
      return
    }

    setErro('')
    setMensagem('')

    try {
      const resposta = await fetch(`${API_URL}/${vendedor.codigo}`, {
        method: 'DELETE',
      })

      await lerResposta(resposta)

      if (vendedorSelecionado?.codigo === vendedor.codigo) {
        limparFormulario()
      }

      setMensagem('Vendedor excluído com sucesso.')
      await carregarVendedores()
    } catch (error) {
      setErro(error.message)
    }
  }

  return (
    <main className="vendedores-pagina">
      <header className="vendedores-cabecalho">
        <button
          className="vendedores-voltar"
          type="button"
          onClick={onVoltar}
        >
          ← Tela principal
        </button>

        <div>
          <p className="vendedores-sobretitulo">CADASTROS</p>
          <h1>Manter Vendedor</h1>
          <p className="vendedores-descricao">
            Cadastre vendedores e consulte os registros existentes.
          </p>
        </div>
      </header>

      {erro && (
        <div className="vendedores-mensagem vendedores-erro" role="alert">
          {erro}
        </div>
      )}

      {mensagem && (
        <div className="vendedores-mensagem vendedores-sucesso" role="status">
          {mensagem}
        </div>
      )}

      <div className="vendedores-layout">
        <section className="vendedores-cartao">
          <h2>
            {vendedorSelecionado
              ? 'Alterar vendedor'
              : 'Cadastrar vendedor'}
          </h2>

          <form className="vendedores-formulario" onSubmit={salvarVendedor}>
            <label>
              Nome
              <input
                name="nome"
                value={formulario.nome}
                onChange={atualizarCampo}
                required
                maxLength={100}
              />
            </label>

            <label>
              Login
              <input
                name="login"
                value={formulario.login}
                onChange={atualizarCampo}
                required
                maxLength={45}
                autoComplete="username"
              />
            </label>

            <label>
              Senha
              <input
                name="senha"
                type="password"
                value={formulario.senha}
                onChange={atualizarCampo}
                required={!vendedorSelecionado}
                maxLength={50}
                autoComplete={
                  vendedorSelecionado ? 'new-password' : 'new-password'
                }
              />
              {vendedorSelecionado && (
                <small className="vendedores-ajuda-senha">
                  Deixe em branco para manter a senha atual.
                </small>
              )}
            </label>

            <div className="vendedores-botoes-formulario">
              <button
                className="vendedores-botao-principal"
                type="submit"
                disabled={salvando}
              >
                {salvando
                  ? 'Salvando...'
                  : vendedorSelecionado
                    ? 'Salvar alteração'
                    : 'Cadastrar vendedor'}
              </button>

              {vendedorSelecionado && (
                <button
                  className="vendedores-botao-secundario"
                  type="button"
                  onClick={limparFormulario}
                >
                  Cancelar
                </button>
              )}
            </div>
          </form>
        </section>

        <section className="vendedores-cartao vendedores-lista">
          <div className="vendedores-lista-cabecalho">
            <div>
              <h2>Vendedores cadastrados</h2>
              <p>{vendedores.length} registro(s)</p>
            </div>

            <button
              className="vendedores-atualizar"
              type="button"
              onClick={carregarVendedores}
              disabled={carregando}
            >
              Atualizar
            </button>
          </div>

          {carregando ? (
            <p className="vendedores-estado-lista">
              Carregando vendedores...
            </p>
          ) : vendedores.length === 0 ? (
            <p className="vendedores-estado-lista">
              Nenhum vendedor cadastrado.
            </p>
          ) : (
            <div className="vendedores-tabela-conteiner">
              <table className="vendedores-tabela">
                <thead>
                  <tr>
                    <th>Código</th>
                    <th>Nome</th>
                    <th>Login</th>
                    <th>Senha</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {vendedores.map((vendedor) => (
                    <tr key={vendedor.codigo}>
                      <td>{vendedor.codigo}</td>
                      <td>{vendedor.nome || '—'}</td>
                      <td>{vendedor.login || '—'}</td>
                      <td aria-label="Senha oculta">••••••••</td>
                      <td>
                        <div className="vendedores-acoes">
                          <button
                            className="vendedores-acao-alterar"
                            type="button"
                            onClick={() => selecionarVendedor(vendedor)}
                          >
                            Alterar
                          </button>
                          <button
                            className="vendedores-acao-excluir"
                            type="button"
                            onClick={() => excluirVendedor(vendedor)}
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

export default Vendedores