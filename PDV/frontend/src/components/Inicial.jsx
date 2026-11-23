import { useState } from 'react'
import Clientes from './Clientes'
import Produtos from './Produtos'
import Vendedores from './Vendedores'
import Venda from './Venda'
import './Inicial.css'

const modulos = [
  {
    codigo: 'CL',
    nome: 'Manter Cliente',
    descricao: 'Cadastrar, consultar, alterar e excluir clientes.',
  },
  {
    codigo: 'PR',
    nome: 'Manter Produto',
    descricao: 'Gerenciar produtos, preços e quantidades em estoque.',
  },
  {
    codigo: 'VE',
    nome: 'Manter Vendedor',
    descricao: 'Cadastrar e consultar vendedores.',
  },
  {
    codigo: 'VD',
    nome: 'Venda',
    descricao: 'Registrar uma venda e atualizar o estoque.',
  },
]

function Inicial() {
  const [moduloSelecionado, setModuloSelecionado] = useState(null)

  function voltarParaInicio() {
    setModuloSelecionado(null)
  }

  if (moduloSelecionado?.codigo === 'CL') {
    return <Clientes onVoltar={voltarParaInicio} />
  }

  if (moduloSelecionado?.codigo === 'PR') {
    return <Produtos onVoltar={voltarParaInicio} />
  }

  if (moduloSelecionado?.codigo === 'VE') {
    return <Vendedores onVoltar={voltarParaInicio} />
  }

  if (moduloSelecionado?.codigo === 'VD') {
    return <Venda onVoltar={voltarParaInicio} />
  }

  return (
    <main className="pdv-pagina">
      <header className="pdv-cabecalho">
        <div className="pdv-marca">
          <span>Mercado PDV</span>
        </div>
        <span className="pdv-status">Sistema de vendas</span>
      </header>

      <section className="pdv-conteudo">
        {moduloSelecionado ? (
          <div className="pdv-painel">
            <button
              className="pdv-voltar"
              type="button"
              onClick={voltarParaInicio}
            >
              ← Voltar à tela principal
            </button>

            <h1>{moduloSelecionado.nome}</h1>
            <p className="pdv-subtitulo">{moduloSelecionado.descricao}</p>

            <div className="pdv-aviso">
              Este módulo será conectado ao backend em uma próxima etapa.
            </div>
          </div>
        ) : (
          <div className="pdv-painel">
            <div className="pdv-titulo">
              <div>
                <p className="pdv-sobretitulo">BEM-VINDO</p>
                <h1>Tela Principal</h1>
                <p className="pdv-subtitulo">
                  Selecione uma opção para continuar.
                </p>
              </div>
            </div>

            <div className="pdv-opcoes">
              {modulos.map((modulo) => (
                <button
                  className="pdv-opcao"
                  key={modulo.codigo}
                  type="button"
                  onClick={() => setModuloSelecionado(modulo)}
                >
                  <span className="pdv-opcao-texto">
                    <strong>{modulo.nome}</strong>
                    <small>{modulo.descricao}</small>
                  </span>
                  <span className="pdv-opcao-seta">›</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </section>

      <footer className="pdv-rodape">
        <span>PDV</span>
        <span>Reengenharia do sistema de vendas</span>
      </footer>
    </main>
  )
}

export default Inicial