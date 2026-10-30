import { useParams, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useApp } from '../context/AppContext'

const formatBRL = (v) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

// ─── Tela de fechamento de uma mesa específica ────────────────────────────────
function FechamentoMesa({ mesaId, onVoltar }) {
  const { state, dispatch, getSessaoPorMesa } = useApp()
  const [valoresQuilo, setValoresQuilo] = useState({})
  const [confirmando, setConfirmando] = useState(false)

  const sessao = getSessaoPorMesa(mesaId)
  const mesa = state.mesas.find(m => m.id === mesaId)

  if (!sessao || !mesa) return null

  const getValorQuilo = (pessoaId) => {
    if (valoresQuilo[pessoaId] !== undefined) return valoresQuilo[pessoaId]
    const p = sessao.pessoas.find(p => p.id === pessoaId)
    return p?.valor || ''
  }

  const totalPessoas = sessao.pessoas.reduce((acc, p) => {
    if (p.tipo === 'avontade') return acc + state.config.precoAvontade
    const v = parseFloat(valoresQuilo[p.id] ?? p.valor) || 0
    return acc + v
  }, 0)

  const totalBebidas = sessao.pedidos.reduce((acc, pedido) => {
    const produto = state.produtos.find(pr => pr.id === pedido.produtoId)
    return acc + (produto ? produto.preco * pedido.quantidade : 0)
  }, 0)

  const total = totalPessoas + totalBebidas

  const handleFechar = () => {
    // aplica valores de quilo antes de fechar
    sessao.pessoas.filter(p => p.tipo === 'quilo').forEach(p => {
      const val = parseFloat(valoresQuilo[p.id]) || 0
      dispatch({ type: 'SET_VALOR_QUILO', mesaId, pessoaId: p.id, valor: val })
    })
    dispatch({ type: 'FECHAR_MESA', mesaId })
    onVoltar()
  }

  return (
    <div className="p-4 max-w-lg mx-auto">
      <div className="flex items-center gap-3 mb-5 pt-2">
        <button onClick={onVoltar} className="text-slate-400 hover:text-slate-600 active:scale-90">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div>
          <h1 className="text-xl font-bold text-slate-800">Fechar Mesa {mesa.numero}</h1>
          <span className="text-xs text-slate-400">Confira antes de cobrar</span>
        </div>
      </div>

      {/* pessoas */}
      <div className="card p-4 mb-3">
        <h2 className="font-semibold text-slate-700 mb-3">
          Pessoas ({sessao.pessoas.length})
        </h2>
        <div className="space-y-3">
          {sessao.pessoas.map((pessoa, idx) => (
            <div key={pessoa.id} className="flex items-center gap-3">
              <span className="text-sm text-slate-400 w-6">#{idx + 1}</span>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                pessoa.tipo === 'avontade'
                  ? 'bg-primary-100 text-primary-700'
                  : 'bg-amber-100 text-amber-700'
              }`}>
                {pessoa.tipo === 'avontade' ? 'À vontade' : 'Por quilo'}
              </span>
              {pessoa.tipo === 'avontade' && (
                <span className="text-sm font-semibold text-slate-700 ml-auto">
                  {formatBRL(state.config.precoAvontade)}
                </span>
              )}
              {pessoa.tipo === 'quilo' && (
                <div className="ml-auto flex items-center gap-1">
                  <span className="text-slate-400 text-sm">R$</span>
                  <input
                    type="number"
                    inputMode="decimal"
                    placeholder="0,00"
                    value={getValorQuilo(pessoa.id)}
                    onChange={e => setValoresQuilo(prev => ({ ...prev, [pessoa.id]: e.target.value }))}
                    className="w-24 border border-slate-200 rounded-lg px-2 py-1.5 text-sm font-semibold text-right focus:outline-none focus:border-primary-400"
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* bebidas */}
      {sessao.pedidos.length > 0 && (
        <div className="card p-4 mb-3">
          <h2 className="font-semibold text-slate-700 mb-3">Bebidas e itens</h2>
          <div className="space-y-2">
            {sessao.pedidos.map(pedido => {
              const produto = state.produtos.find(p => p.id === pedido.produtoId)
              if (!produto) return null
              const subtotal = produto.preco * pedido.quantidade
              return (
                <div key={pedido.id} className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">{pedido.quantidade}× {produto.nome}</span>
                  <span className="font-semibold text-slate-700">{formatBRL(subtotal)}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {sessao.pedidos.length === 0 && (
        <div className="card p-4 mb-3 text-center text-sm text-slate-400">
          Nenhuma bebida pedida
        </div>
      )}

      {/* total */}
      <div className="card p-4 mb-4 bg-slate-800 border-slate-700">
        <div className="space-y-1.5 mb-3">
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">Pratos</span>
            <span className="text-slate-300">{formatBRL(totalPessoas)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">Bebidas</span>
            <span className="text-slate-300">{formatBRL(totalBebidas)}</span>
          </div>
          <div className="border-t border-slate-600 my-1" />
          <div className="flex justify-between">
            <span className="text-white font-semibold">Total</span>
            <span className="text-white font-bold text-xl">{formatBRL(total)}</span>
          </div>
        </div>
      </div>

      {!confirmando ? (
        <button
          onClick={() => setConfirmando(true)}
          className="btn btn-primary btn-lg"
        >
          Fechar mesa e cobrar
        </button>
      ) : (
        <div className="space-y-2">
          <p className="text-center text-sm text-slate-500 mb-2">Confirmar fechamento da mesa {mesa.numero}?</p>
          <button onClick={handleFechar} className="btn btn-primary btn-lg">
            Confirmar — {formatBRL(total)}
          </button>
          <button onClick={() => setConfirmando(false)} className="btn btn-secondary btn-lg">
            Cancelar
          </button>
        </div>
      )}
    </div>
  )
}

// ─── Tela principal do caixa (lista de mesas abertas) ────────────────────────
export default function Caixa() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { state, getTotalSessao } = useApp()

  // Se vier com ID, mostra fechamento direto
  if (id) {
    return (
      <FechamentoMesa
        mesaId={parseInt(id)}
        onVoltar={() => navigate('/caixa')}
      />
    )
  }

  const mesasAbertas = state.mesas.filter(m => m.status === 'ocupada')

  return (
    <div className="p-4 max-w-lg mx-auto">
      <div className="mb-5 pt-2">
        <h1 className="text-xl font-bold text-slate-800">Caixa</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          {mesasAbertas.length === 0
            ? 'Nenhuma mesa aberta no momento'
            : `${mesasAbertas.length} mesa${mesasAbertas.length > 1 ? 's' : ''} para fechar`
          }
        </p>
      </div>

      {mesasAbertas.length === 0 && (
        <div className="card p-10 flex flex-col items-center gap-3 text-center">
          <div className="w-14 h-14 rounded-full bg-primary-50 flex items-center justify-center">
            <svg className="w-7 h-7 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <p className="font-semibold text-slate-700">Tudo em dia</p>
            <p className="text-sm text-slate-400 mt-1">Nenhuma mesa aguardando fechamento</p>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {mesasAbertas.map(mesa => {
          const sessao = state.sessoes.find(s => s.mesaId === mesa.id)
          const total = getTotalSessao(mesa.id)
          const nPessoas = sessao?.pessoas.length || 0
          const nBebidas = sessao?.pedidos.reduce((a, p) => a + p.quantidade, 0) || 0
          const temQuiloSemValor = sessao?.pessoas.some(p => p.tipo === 'quilo' && !p.valor)

          return (
            <button
              key={mesa.id}
              onClick={() => navigate(`/caixa/${mesa.id}`)}
              className="card p-4 w-full text-left active:scale-[0.98] transition-all border-orange-100 bg-orange-50"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="font-bold text-lg text-slate-800">Mesa {mesa.numero}</span>
                  <div className="flex gap-3 mt-1 text-sm text-slate-500">
                    <span>{nPessoas} pessoa{nPessoas !== 1 ? 's' : ''}</span>
                    {nBebidas > 0 && <span>{nBebidas} bebida{nBebidas !== 1 ? 's' : ''}</span>}
                  </div>
                  {temQuiloSemValor && (
                    <span className="text-xs text-amber-600 mt-1 block">⚠ Aguardando pesagem na balança</span>
                  )}
                </div>
                <div className="text-right">
                  <span className="font-bold text-slate-800">{formatBRL(total)}</span>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {temQuiloSemValor ? 'parcial' : 'total'}
                  </p>
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
