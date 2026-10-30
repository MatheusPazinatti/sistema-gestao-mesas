import { useParams, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useApp } from '../context/AppContext'

const formatBRL = (v) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

function ModalAbrirMesa({ onAbrir, onCancelar }) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center">
      <div className="bg-white rounded-t-3xl w-full max-w-lg p-6 pb-10 animate-slide-up">
        <h2 className="text-lg font-bold text-slate-800 mb-2">Abrir mesa</h2>
        <p className="text-slate-500 text-sm mb-6">Adicione as pessoas depois de abrir.</p>
        <div className="flex gap-3">
          <button onClick={onCancelar} className="btn btn-secondary flex-1">Cancelar</button>
          <button onClick={onAbrir} className="btn btn-primary flex-1">Abrir mesa</button>
        </div>
      </div>
    </div>
  )
}

function SecaoPessoas({ sessao, config, dispatch, mesaId }) {
  const { pessoas } = sessao

  return (
    <div className="card p-4 mb-3">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-semibold text-slate-700">Pessoas</h2>
        <span className="text-sm text-slate-400">{pessoas.length} na mesa</span>
      </div>

      {pessoas.length === 0 && (
        <p className="text-sm text-slate-400 text-center py-2">Nenhuma pessoa adicionada ainda</p>
      )}

      <div className="space-y-2 mb-4">
        {pessoas.map((pessoa, idx) => (
          <div key={pessoa.id} className="flex items-center gap-2 bg-slate-50 rounded-xl px-3 py-2">
            <span className="text-sm text-slate-500 w-6">#{idx + 1}</span>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
              pessoa.tipo === 'avontade'
                ? 'bg-primary-100 text-primary-700'
                : 'bg-amber-100 text-amber-700'
            }`}>
              {pessoa.tipo === 'avontade' ? 'À vontade' : 'Por quilo'}
            </span>
            {pessoa.tipo === 'avontade' && (
              <span className="text-sm text-slate-600 ml-auto">{formatBRL(config.precoAvontade)}</span>
            )}
            {pessoa.tipo === 'quilo' && (
              <div className="ml-auto flex items-center gap-1.5">
                <input
                  type="number"
                  inputMode="decimal"
                  placeholder="0,00"
                  value={pessoa.valor || ''}
                  onChange={e => dispatch({ type: 'SET_VALOR_QUILO', mesaId, pessoaId: pessoa.id, valor: e.target.value })}
                  className="w-24 border border-amber-200 rounded-lg px-2 py-1.5 text-sm font-semibold text-right focus:outline-none focus:border-amber-400 bg-amber-50"
                />
                <span className="text-xs text-amber-600 font-semibold">balança</span>
              </div>
            )}
            <button
              onClick={() => dispatch({ type: 'REMOVER_PESSOA', mesaId, pessoaId: pessoa.id })}
              className="text-slate-300 hover:text-red-400 transition-colors ml-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => dispatch({ type: 'ADICIONAR_PESSOA', mesaId, tipo: 'avontade' })}
          className="btn bg-primary-50 text-primary-700 border border-primary-200 py-3 text-sm font-semibold rounded-xl active:scale-95"
        >
          + À vontade
        </button>
        <button
          onClick={() => dispatch({ type: 'ADICIONAR_PESSOA', mesaId, tipo: 'quilo' })}
          className="btn bg-amber-50 text-amber-700 border border-amber-200 py-3 text-sm font-semibold rounded-xl active:scale-95"
        >
          + Por quilo
        </button>
      </div>
    </div>
  )
}

function SecaoBebidas({ sessao, produtos, dispatch, mesaId }) {
  const { pedidos } = sessao

  const getQtd = (produtoId) => {
    const p = pedidos.find(p => p.produtoId === produtoId)
    return p ? p.quantidade : 0
  }

  return (
    <div className="card p-4 mb-3">
      <h2 className="font-semibold text-slate-700 mb-3">Bebidas e itens</h2>

      <div className="space-y-2">
        {produtos.map(produto => {
          const qtd = getQtd(produto.id)
          return (
            <div key={produto.id} className="flex items-center justify-between py-1">
              <div>
                <span className="text-sm font-medium text-slate-700">{produto.nome}</span>
                <span className="text-xs text-slate-400 ml-2">{formatBRL(produto.preco)}</span>
              </div>
              <div className="flex items-center gap-2">
                {qtd > 0 && (
                  <button
                    onClick={() => dispatch({ type: 'REMOVER_PEDIDO', mesaId, produtoId: produto.id })}
                    className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-lg active:scale-90"
                  >
                    −
                  </button>
                )}
                {qtd > 0 && (
                  <span className="w-6 text-center font-semibold text-slate-700 text-sm">{qtd}</span>
                )}
                <button
                  onClick={() => dispatch({ type: 'ADICIONAR_PEDIDO', mesaId, produtoId: produto.id })}
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-lg active:scale-90 transition-colors ${
                    qtd > 0
                      ? 'bg-primary-600 text-white'
                      : 'bg-primary-50 text-primary-700 border border-primary-200'
                  }`}
                >
                  +
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function Mesa() {
  const { id } = useParams()
  const navigate = useNavigate()
  const mesaId = parseInt(id)
  const { state, dispatch, getSessaoPorMesa, getTotalSessao } = useApp()
  const [confirmarAbrir, setConfirmarAbrir] = useState(false)

  const mesa = state.mesas.find(m => m.id === mesaId)
  const sessao = getSessaoPorMesa(mesaId)
  const total = getTotalSessao(mesaId)

  if (!mesa) {
    return (
      <div className="p-4 text-center">
        <p className="text-slate-500">Mesa não encontrada.</p>
        <button onClick={() => navigate('/')} className="btn btn-primary mt-4">Voltar</button>
      </div>
    )
  }

  const handleAbrir = () => {
    dispatch({ type: 'ABRIR_MESA', mesaId })
    setConfirmarAbrir(false)
  }

  return (
    <div className="p-4 max-w-lg mx-auto">
      {/* cabeçalho */}
      <div className="flex items-center gap-3 mb-5 pt-2">
        <button onClick={() => navigate('/')} className="text-slate-400 hover:text-slate-600 active:scale-90">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div>
          <h1 className="text-xl font-bold text-slate-800">Mesa {mesa.numero}</h1>
          <span className={`text-xs font-semibold ${mesa.status === 'ocupada' ? 'text-red-500' : 'text-primary-600'}`}>
            {mesa.status === 'ocupada' ? 'Ocupada' : 'Livre'}
          </span>
        </div>
      </div>

      {/* mesa livre */}
      {mesa.status === 'livre' && (
        <div className="card p-8 flex flex-col items-center text-center gap-4">
          <div className="w-16 h-16 rounded-full bg-primary-50 flex items-center justify-center">
            <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <div>
            <h2 className="font-semibold text-slate-700">Mesa disponível</h2>
            <p className="text-sm text-slate-400 mt-1">Toque para abrir quando os clientes sentarem</p>
          </div>
          <button
            onClick={() => setConfirmarAbrir(true)}
            className="btn btn-primary btn-lg mt-2"
          >
            Abrir mesa
          </button>
        </div>
      )}

      {/* mesa ocupada */}
      {mesa.status === 'ocupada' && sessao && (
        <>
          <SecaoPessoas
            sessao={sessao}
            config={state.config}
            dispatch={dispatch}
            mesaId={mesaId}
          />
          <SecaoBebidas
            sessao={sessao}
            produtos={state.produtos}
            dispatch={dispatch}
            mesaId={mesaId}
          />

          {/* resumo parcial */}
          {sessao.pessoas.length > 0 && (
            <div className="card p-4 mb-3 bg-slate-800 border-slate-700">
              <div className="flex justify-between items-center">
                <span className="text-slate-300 text-sm">Total parcial</span>
                <span className="text-white font-bold text-lg">{formatBRL(total)}</span>
              </div>
              <p className="text-slate-500 text-xs mt-1">
                * Pessoas por quilo: valor registrado na balança
              </p>
            </div>
          )}

          {/* botão fechar via caixa */}
          <button
            onClick={() => navigate(`/caixa/${mesaId}`)}
            className="btn btn-danger btn-lg"
          >
            Fechar no caixa
          </button>
        </>
      )}

      {/* modal confirmar abertura */}
      {confirmarAbrir && (
        <ModalAbrirMesa
          onAbrir={handleAbrir}
          onCancelar={() => setConfirmarAbrir(false)}
        />
      )}
    </div>
  )
}
