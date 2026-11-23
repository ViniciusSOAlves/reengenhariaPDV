import { useCallback, useEffect, useState } from 'react'
import './Clientes.css'

const API_URL = 'http://localhost:5000/clientes'

const formularioInicial = {
  nome: '',
  cpf: '',
  endereco: '',
  cidade: '',
  estado: '',
  email: '',
  telefone: '',
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

function Clientes({ onVoltar }) {
  const [clientes, setClientes] = useState([])
  const [formulario, setFormulario] = useState(formularioInicial)
  const [clienteSelecionado, setClienteSelecionado] = useState(null)
  const [carregando, setCarregando] = useState(true)
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')
  const [mensagem, setMensagem] = useState('')

  const carregarClientes = useCallback(async () => {
    setCarregando(true)
    setErro('')

    try {
      const resposta = await fetch(API_URL)
      const dados = await lerResposta(resposta)
      setClientes(dados)
    } catch (error) {
      setErro(error.message)
    } finally {
      setCarregando(false)
    }
  }, [])

  useEffect(() => {
    carregarClientes()
  }, [carregarClientes])

  function atualizarCampo(event) {
    const { name, value } = event.target

    setFormulario((atual) => ({
      ...atual,
      [name]: value,
    }))
  }

  function limparFormulario() {
    setFormulario(formularioInicial)
    setClienteSelecionado(null)
  }

  function selecionarCliente(cliente) {
    setClienteSelecionado(cliente)
    setFormulario({
      nome: cliente.nome || '',
      cpf: cliente.cpf || '',
      endereco: cliente.endereco || '',
      cidade: cliente.cidade || '',
      estado: cliente.estado || '',
      email: cliente.email || '',
      telefone: cliente.telefone || '',
    })
    setMensagem('')
    setErro('')
  }

  async function salvarCliente(event) {
    event.preventDefault()
    setSalvando(true)
    setErro('')
    setMensagem('')

    const codigo = clienteSelecionado?.codigo
    const url = codigo ? `${API_URL}/${codigo}` : API_URL
    const metodo = codigo ? 'PUT' : 'POST'

    try {
      const resposta = await fetch(url, {
        method: metodo,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formulario,
          nome: formulario.nome.trim(),
          estado: formulario.estado.trim().toUpperCase(),
        }),
      })

      await lerResposta(resposta)
      setMensagem(codigo ? 'Cliente alterado com sucesso.' : 'Cliente cadastrado com sucesso.')
      limparFormulario()
      await carregarClientes()
    } catch (error) {
      setErro(error.message)
    } finally {
      setSalvando(false)
    }
  }

  async function excluirCliente(cliente) {
    const confirmou = window.confirm(
      `Deseja excluir o cliente "${cliente.nome}"?`
    )

    if (!confirmou) {
      return
    }

    setErro('')
    setMensagem('')

    try {
      const resposta = await fetch(`${API_URL}/${cliente.codigo}`, {
        method: 'DELETE',
      })

      await lerResposta(resposta)

      if (clienteSelecionado?.codigo === cliente.codigo) {
        limparFormulario()
      }

      setMensagem('Cliente excluído com sucesso.')
      await carregarClientes()
    } catch (error) {
      setErro(error.message)
    }
  }

  return (
    <main className="clientes-pagina">
      <header className="clientes-cabecalho">
        <button
          className="clientes-voltar"
          type="button"
          onClick={onVoltar}
        >
          ← Tela principal
        </button>
        <div>
          <p className="clientes-sobretitulo">CADASTROS</p>
          <h1>Manter Cliente</h1>
          <p className="clientes-descricao">
            Cadastre clientes e consulte os registros existentes.
          </p>
        </div>
      </header>

      {erro && (
        <div className="clientes-mensagem clientes-erro" role="alert">
          {erro}
        </div>
      )}

      {mensagem && (
        <div className="clientes-mensagem clientes-sucesso" role="status">
          {mensagem}
        </div>
      )}

      <div className="clientes-layout">
        <section className="clientes-cartao">
          <h2>{clienteSelecionado ? 'Alterar cliente' : 'Cadastrar cliente'}</h2>

          <form className="clientes-formulario" onSubmit={salvarCliente}>
            <label>
              Nome
              <input
                name="nome"
                value={formulario.nome}
                onChange={atualizarCampo}
                required
                maxLength={200}
              />
            </label>

            <label>
              CPF
              <input
                name="cpf"
                value={formulario.cpf}
                onChange={atualizarCampo}
                maxLength={45}
              />
            </label>

            <label>
              Endereço
              <input
                name="endereco"
                value={formulario.endereco}
                onChange={atualizarCampo}
                maxLength={200}
              />
            </label>

            <div className="clientes-campos-duplos">
              <label>
                Cidade
                <input
                  name="cidade"
                  value={formulario.cidade}
                  onChange={atualizarCampo}
                  maxLength={45}
                />
              </label>

              <label>
                Estado
                <input
                  name="estado"
                  value={formulario.estado}
                  onChange={atualizarCampo}
                  maxLength={2}
                />
              </label>
            </div>

            <label>
              E-mail
              <input
                name="email"
                type="email"
                value={formulario.email}
                onChange={atualizarCampo}
                maxLength={100}
              />
            </label>

            <label>
              Telefone
              <input
                name="telefone"
                type="tel"
                value={formulario.telefone}
                onChange={atualizarCampo}
                maxLength={45}
              />
            </label>

            <div className="clientes-botoes-formulario">
              <button
                className="clientes-botao-principal"
                type="submit"
                disabled={salvando}
              >
                {salvando
                  ? 'Salvando...'
                  : clienteSelecionado
                    ? 'Salvar alteração'
                    : 'Cadastrar cliente'}
              </button>

              {clienteSelecionado && (
                <button
                  className="clientes-botao-secundario"
                  type="button"
                  onClick={limparFormulario}
                >
                  Cancelar
                </button>
              )}
            </div>
          </form>
        </section>

        <section className="clientes-cartao clientes-lista">
          <div className="clientes-lista-cabecalho">
            <div>
              <h2>Clientes cadastrados</h2>
              <p>{clientes.length} registro(s)</p>
            </div>

            <button
              className="clientes-atualizar"
              type="button"
              onClick={carregarClientes}
              disabled={carregando}
            >
              Atualizar
            </button>
          </div>

          {carregando ? (
            <p className="clientes-estado-lista">Carregando clientes...</p>
          ) : clientes.length === 0 ? (
            <p className="clientes-estado-lista">
              Nenhum cliente cadastrado.
            </p>
          ) : (
            <div className="clientes-tabela-conteiner">
              <table className="clientes-tabela">
                <thead>
                  <tr>
                    <th>Código</th>
                    <th>Nome</th>
                    <th>CPF</th>
                    <th>Cidade</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {clientes.map((cliente) => (
                    <tr key={cliente.codigo}>
                      <td>{cliente.codigo}</td>
                      <td>{cliente.nome || '—'}</td>
                      <td>{cliente.cpf || '—'}</td>
                      <td>
                        {[cliente.cidade, cliente.estado]
                          .filter(Boolean)
                          .join(' / ') || '—'}
                      </td>
                      <td>
                        <div className="clientes-acoes">
                          <button
                            className="clientes-acao-alterar"
                            type="button"
                            onClick={() => selecionarCliente(cliente)}
                          >
                            Alterar
                          </button>
                          <button
                            className="clientes-acao-excluir"
                            type="button"
                            onClick={() => excluirCliente(cliente)}
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

export default Clientes