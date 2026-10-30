import React, { createContext, useContext, useReducer, useEffect } from 'react'
import { mesasIniciais, produtosIniciais, configInicial } from '../data/initial'

const AppContext = createContext(null)

// ─── helpers ────────────────────────────────────────────────────────────────
const gerarId = () => Date.now().toString(36) + Math.random().toString(36).slice(2)

const calcularTotalSessao = (sessao, produtos, config) => {
  if (!sessao) return 0

  const totalPessoas = sessao.pessoas.reduce((acc, p) => {
    if (p.tipo === 'avontade') return acc + config.precoAvontade
    if (p.tipo === 'quilo') return acc + (p.valor || 0)
    return acc
  }, 0)

  const totalPedidos = sessao.pedidos.reduce((acc, pedido) => {
    const produto = produtos.find(pr => pr.id === pedido.produtoId)
    return acc + (produto ? produto.preco * pedido.quantidade : 0)
  }, 0)

  return totalPessoas + totalPedidos
}

// ─── versionamento do estado ─────────────────────────────────────────────────
// Incremente ao fazer mudanças incompatíveis na estrutura do estado.
// Isso garante que estados antigos sejam descartados sem travar o app.
const VERSAO_ESTADO = 2

const estadoPadrao = () => ({
  _versao: VERSAO_ESTADO,
  mesas: mesasIniciais,
  sessoes: [],
  historico: [],
  produtos: produtosIniciais,
  config: configInicial,
})

// Verifica se o estado salvo tem todos os campos obrigatórios
const validarEstado = (estado) =>
  estado &&
  Array.isArray(estado.mesas) &&
  Array.isArray(estado.sessoes) &&
  Array.isArray(estado.historico) &&
  Array.isArray(estado.produtos) &&
  typeof estado.config === 'object'

// ─── persistência ────────────────────────────────────────────────────────────
const STORAGE_KEY = 'restaurante-estado'

const carregarEstado = () => {
  try {
    const salvo = localStorage.getItem(STORAGE_KEY)
    if (!salvo) return estadoPadrao()

    const estado = JSON.parse(salvo)

    // Migração de versão: descarta estado incompatível de forma segura
    if (!estado._versao || estado._versao < VERSAO_ESTADO) {
      console.info('[Sistema] Nova versão detectada — reiniciando estado salvo')
      localStorage.removeItem(STORAGE_KEY)
      return estadoPadrao()
    }

    if (!validarEstado(estado)) {
      console.warn('[Sistema] Estado inválido — usando padrão')
      localStorage.removeItem(STORAGE_KEY)
      return estadoPadrao()
    }

    // Merge com configInicial para garantir novos campos (ex: novo restaurante)
    return {
      ...estado,
      config: { ...configInicial, ...estado.config },
    }
  } catch (e) {
    console.warn('[Sistema] Erro ao carregar estado:', e)
    try { localStorage.removeItem(STORAGE_KEY) } catch (_) {}
    return estadoPadrao()
  }
}

const estadoInicial = carregarEstado()

// ─── reducer ─────────────────────────────────────────────────────────────────
function reducer(state, action) {
  switch (action.type) {

    case 'ABRIR_MESA': {
      const { mesaId } = action
      // Evita duplicar sessão se a mesa já estiver aberta
      if (state.sessoes.some(s => s.mesaId === mesaId)) return state
      const novaSessao = {
        id: gerarId(),
        mesaId,
        abertaEm: new Date().toISOString(),
        pessoas: [],
        pedidos: [],
      }
      return {
        ...state,
        mesas: state.mesas.map(m => m.id === mesaId ? { ...m, status: 'ocupada' } : m),
        sessoes: [...state.sessoes, novaSessao],
      }
    }

    case 'ADICIONAR_PESSOA': {
      const { mesaId, tipo } = action // tipo: 'avontade' | 'quilo'
      return {
        ...state,
        sessoes: state.sessoes.map(s =>
          s.mesaId === mesaId
            ? { ...s, pessoas: [...s.pessoas, { id: gerarId(), tipo, valor: 0 }] }
            : s
        ),
      }
    }

    case 'REMOVER_PESSOA': {
      const { mesaId, pessoaId } = action
      return {
        ...state,
        sessoes: state.sessoes.map(s =>
          s.mesaId === mesaId
            ? { ...s, pessoas: s.pessoas.filter(p => p.id !== pessoaId) }
            : s
        ),
      }
    }

    case 'SET_VALOR_QUILO': {
      const { mesaId, pessoaId, valor } = action
      return {
        ...state,
        sessoes: state.sessoes.map(s =>
          s.mesaId === mesaId
            ? {
                ...s,
                pessoas: s.pessoas.map(p =>
                  p.id === pessoaId ? { ...p, valor: parseFloat(valor) || 0 } : p
                ),
              }
            : s
        ),
      }
    }

    case 'ADICIONAR_PEDIDO': {
      const { mesaId, produtoId } = action
      return {
        ...state,
        sessoes: state.sessoes.map(s => {
          if (s.mesaId !== mesaId) return s
          const existente = s.pedidos.find(p => p.produtoId === produtoId)
          if (existente) {
            return {
              ...s,
              pedidos: s.pedidos.map(p =>
                p.produtoId === produtoId ? { ...p, quantidade: p.quantidade + 1 } : p
              ),
            }
          }
          return {
            ...s,
            pedidos: [...s.pedidos, { id: gerarId(), produtoId, quantidade: 1 }],
          }
        }),
      }
    }

    case 'REMOVER_PEDIDO': {
      const { mesaId, produtoId } = action
      return {
        ...state,
        sessoes: state.sessoes.map(s => {
          if (s.mesaId !== mesaId) return s
          const existente = s.pedidos.find(p => p.produtoId === produtoId)
          if (!existente) return s
          if (existente.quantidade === 1) {
            return { ...s, pedidos: s.pedidos.filter(p => p.produtoId !== produtoId) }
          }
          return {
            ...s,
            pedidos: s.pedidos.map(p =>
              p.produtoId === produtoId ? { ...p, quantidade: p.quantidade - 1 } : p
            ),
          }
        }),
      }
    }

    case 'FECHAR_MESA': {
      const { mesaId } = action
      const sessao = state.sessoes.find(s => s.mesaId === mesaId)
      if (!sessao) return state
      const sessaoFechada = {
        ...sessao,
        fechadaEm: new Date().toISOString(),
        total: calcularTotalSessao(sessao, state.produtos, state.config),
      }
      return {
        ...state,
        mesas: state.mesas.map(m => m.id === mesaId ? { ...m, status: 'livre' } : m),
        sessoes: state.sessoes.filter(s => s.mesaId !== mesaId),
        historico: [...state.historico, sessaoFechada],
      }
    }

    case 'ATUALIZAR_CONFIG': {
      return { ...state, config: { ...state.config, ...action.config } }
    }

    case 'ADICIONAR_PRODUTO': {
      const novoProduto = { id: gerarId(), ...action.produto }
      return { ...state, produtos: [...state.produtos, novoProduto] }
    }

    case 'REMOVER_PRODUTO': {
      return { ...state, produtos: state.produtos.filter(p => p.id !== action.produtoId) }
    }

    case 'ATUALIZAR_PRODUTO': {
      return {
        ...state,
        produtos: state.produtos.map(p =>
          p.id === action.produtoId ? { ...p, ...action.dados } : p
        ),
      }
    }

    case 'LIMPAR_HISTORICO': {
      return { ...state, historico: [] }
    }

    // Reset de emergência — disponível na tela de Configurações
    case 'RESETAR_ESTADO': {
      try { localStorage.removeItem(STORAGE_KEY) } catch (_) {}
      return estadoPadrao()
    }

    default:
      return state
  }
}

// ─── provider ────────────────────────────────────────────────────────────────
export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, estadoInicial)

  // Persiste no localStorage a cada mudança de estado
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch (e) {
      console.warn('[Sistema] Erro ao salvar estado:', e)
    }
  }, [state])

  const getSessaoPorMesa = (mesaId) =>
    state.sessoes.find(s => s.mesaId === mesaId) || null

  const getTotalSessao = (mesaId) => {
    const sessao = getSessaoPorMesa(mesaId)
    return calcularTotalSessao(sessao, state.produtos, state.config)
  }

  const getRelatorioHoje = () => {
    const hoje = new Date().toDateString()
    const sessoesHoje = state.historico.filter(s =>
      new Date(s.fechadaEm).toDateString() === hoje
    )
    const totalFaturado  = sessoesHoje.reduce((acc, s) => acc + (s.total || 0), 0)
    const totalPessoas   = sessoesHoje.reduce((acc, s) => acc + s.pessoas.length, 0)
    const totalMesas     = sessoesHoje.length
    const totalAvontade  = sessoesHoje.reduce(
      (acc, s) => acc + s.pessoas.filter(p => p.tipo === 'avontade').length, 0
    )
    const totalQuilo     = sessoesHoje.reduce(
      (acc, s) => acc + s.pessoas.filter(p => p.tipo === 'quilo').length, 0
    )
    const totalBebidas   = sessoesHoje.reduce(
      (acc, s) => acc + s.pedidos.reduce((a, p) => a + p.quantidade, 0), 0
    )
    return { totalFaturado, totalPessoas, totalMesas, totalAvontade, totalQuilo, totalBebidas, sessoesHoje }
  }

  return (
    <AppContext.Provider value={{ state, dispatch, getSessaoPorMesa, getTotalSessao, getRelatorioHoje }}>
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp deve ser usado dentro de AppProvider')
  return ctx
}
