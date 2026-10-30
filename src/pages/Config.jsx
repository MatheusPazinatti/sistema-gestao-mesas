import { useState } from 'react'
import { useApp } from '../context/AppContext'

const formatBRL = (v) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

export default function Config() {
  const { state, dispatch } = useApp()
  const [novoProduto, setNovoProduto] = useState({ nome: '', preco: '', categoria: 'bebida' })
  const [editandoPreco, setEditandoPreco] = useState(false)
  const [precoTemp, setPrecoTemp] = useState(state.config.precoAvontade)
  const [editandoNome, setEditandoNome] = useState(false)
  const [nomeTemp, setNomeTemp] = useState(state.config.nomeRestaurante)

  const adicionarProduto = () => {
    if (!novoProduto.nome.trim() || !novoProduto.preco) return
    dispatch({
      type: 'ADICIONAR_PRODUTO',
      produto: { ...novoProduto, preco: parseFloat(novoProduto.preco) },
    })
    setNovoProduto({ nome: '', preco: '', categoria: 'bebida' })
  }

  const salvarPreco = () => {
    dispatch({ type: 'ATUALIZAR_CONFIG', config: { precoAvontade: parseFloat(precoTemp) || 0 } })
    setEditandoPreco(false)
  }

  const salvarNome = () => {
    dispatch({ type: 'ATUALIZAR_CONFIG', config: { nomeRestaurante: nomeTemp.trim() || 'Restaurante' } })
    setEditandoNome(false)
  }

  return (
    <div className="p-4 max-w-lg mx-auto">
      <div className="mb-5 pt-2">
        <h1 className="text-xl font-bold text-slate-800">Configurações</h1>
        <p className="text-sm text-slate-500 mt-0.5">Produtos, preços e dados do restaurante</p>
      </div>

      {/* nome do restaurante */}
      <div className="card p-4 mb-3">
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-semibold text-slate-700">Nome do restaurante</h2>
          {!editandoNome && (
            <button onClick={() => setEditandoNome(true)} className="text-sm text-primary-600 font-medium">
              Editar
            </button>
          )}
        </div>
        {editandoNome ? (
          <div className="flex gap-2">
            <input
              type="text"
              value={nomeTemp}
              onChange={e => setNomeTemp(e.target.value)}
              className="flex-1 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-primary-400"
            />
            <button onClick={salvarNome} className="btn btn-primary btn-sm">Salvar</button>
            <button onClick={() => { setEditandoNome(false); setNomeTemp(state.config.nomeRestaurante) }} className="btn btn-secondary btn-sm">✕</button>
          </div>
        ) : (
          <p className="text-slate-600">{state.config.nomeRestaurante}</p>
        )}
      </div>

      {/* preço à vontade */}
      <div className="card p-4 mb-3">
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-semibold text-slate-700">Preço — À vontade</h2>
          {!editandoPreco && (
            <button onClick={() => setEditandoPreco(true)} className="text-sm text-primary-600 font-medium">
              Editar
            </button>
          )}
        </div>
        {editandoPreco ? (
          <div className="flex gap-2">
            <div className="flex items-center gap-1 flex-1 border border-slate-200 rounded-xl px-3 py-2">
              <span className="text-slate-400 text-sm">R$</span>
              <input
                type="number"
                inputMode="decimal"
                value={precoTemp}
                onChange={e => setPrecoTemp(e.target.value)}
                className="flex-1 text-sm focus:outline-none"
              />
            </div>
            <button onClick={salvarPreco} className="btn btn-primary btn-sm">Salvar</button>
            <button onClick={() => { setEditandoPreco(false); setPrecoTemp(state.config.precoAvontade) }} className="btn btn-secondary btn-sm">✕</button>
          </div>
        ) : (
          <p className="text-2xl font-bold text-primary-700">{formatBRL(state.config.precoAvontade)}</p>
        )}
        <p className="text-xs text-slate-400 mt-1">Por pessoa, cobrado automaticamente no fechamento</p>
      </div>

      {/* lista de produtos */}
      <div className="card p-4 mb-3">
        <h2 className="font-semibold text-slate-700 mb-3">
          Bebidas e itens ({state.produtos.length})
        </h2>
        <div className="space-y-2 mb-4">
          {state.produtos.map(produto => (
            <div key={produto.id} className="flex items-center justify-between py-1.5 border-b border-slate-100 last:border-0">
              <div>
                <span className="text-sm text-slate-700">{produto.nome}</span>
                <span className={`ml-2 text-xs px-1.5 py-0.5 rounded ${
                  produto.categoria === 'bebida' ? 'bg-blue-50 text-blue-500' : 'bg-amber-50 text-amber-500'
                }`}>
                  {produto.categoria}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-slate-700">{formatBRL(produto.preco)}</span>
                <button
                  onClick={() => dispatch({ type: 'REMOVER_PRODUTO', produtoId: produto.id })}
                  className="text-slate-300 hover:text-red-400 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* adicionar produto */}
        <div className="border-t border-slate-100 pt-4">
          <p className="text-xs text-slate-500 font-medium mb-2 uppercase tracking-wide">Adicionar produto</p>
          <div className="space-y-2">
            <input
              type="text"
              placeholder="Nome (ex: Suco de maracujá)"
              value={novoProduto.nome}
              onChange={e => setNovoProduto(p => ({ ...p, nome: e.target.value }))}
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary-400"
            />
            <div className="flex gap-2">
              <div className="flex items-center gap-1 flex-1 border border-slate-200 rounded-xl px-3 py-2.5">
                <span className="text-slate-400 text-sm">R$</span>
                <input
                  type="number"
                  inputMode="decimal"
                  placeholder="0,00"
                  value={novoProduto.preco}
                  onChange={e => setNovoProduto(p => ({ ...p, preco: e.target.value }))}
                  className="flex-1 text-sm focus:outline-none"
                />
              </div>
              <select
                value={novoProduto.categoria}
                onChange={e => setNovoProduto(p => ({ ...p, categoria: e.target.value }))}
                className="border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none bg-white"
              >
                <option value="bebida">Bebida</option>
                <option value="extra">Extra</option>
              </select>
            </div>
            <button
              onClick={adicionarProduto}
              disabled={!novoProduto.nome.trim() || !novoProduto.preco}
              className="btn btn-primary w-full py-3 disabled:opacity-40"
            >
              Adicionar produto
            </button>
          </div>
        </div>
      </div>

      {/* versão */}
      <p className="text-center text-xs text-slate-300 mt-4">v1.0.0</p>
    </div>
  )
}
