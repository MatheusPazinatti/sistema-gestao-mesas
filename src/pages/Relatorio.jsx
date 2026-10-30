import { useApp } from '../context/AppContext'

const formatBRL = (v) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

const formatHora = (iso) => {
  const d = new Date(iso)
  return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

function Stat({ label, valor, sub }) {
  return (
    <div className="card p-4 text-center">
      <p className="text-2xl font-bold text-slate-800">{valor}</p>
      <p className="text-xs text-slate-500 mt-0.5">{label}</p>
      {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
    </div>
  )
}

export default function Relatorio() {
  const { getRelatorioHoje, dispatch } = useApp()
  const rel = getRelatorioHoje()

  const hoje = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long', day: 'numeric', month: 'long'
  })

  return (
    <div className="p-4 max-w-lg mx-auto">
      <div className="mb-5 pt-2">
        <h1 className="text-xl font-bold text-slate-800">Relatório do dia</h1>
        <p className="text-sm text-slate-500 mt-0.5 capitalize">{hoje}</p>
      </div>

      {rel.totalMesas === 0 ? (
        <div className="card p-10 text-center">
          <p className="text-slate-400 text-sm">Nenhuma mesa fechada hoje ainda.</p>
        </div>
      ) : (
        <>
          {/* faturamento destaque */}
          <div className="card p-5 mb-4 bg-primary-700 border-primary-600 text-center">
            <p className="text-primary-100 text-sm">Faturamento total</p>
            <p className="text-4xl font-bold text-white mt-1">{formatBRL(rel.totalFaturado)}</p>
          </div>

          {/* grid de stats */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <Stat label="Mesas atendidas" valor={rel.totalMesas} />
            <Stat label="Total de pessoas" valor={rel.totalPessoas} />
            <Stat label="À vontade" valor={rel.totalAvontade} sub="pessoas" />
            <Stat label="Por quilo" valor={rel.totalQuilo} sub="pessoas" />
            <Stat label="Itens / bebidas" valor={rel.totalBebidas} />
          </div>

          {/* histórico detalhado */}
          <div className="card p-4 mb-4">
            <h2 className="font-semibold text-slate-700 mb-3">Mesas fechadas hoje</h2>
            <div className="space-y-3">
              {[...rel.sessoesHoje].reverse().map(sessao => (
                <div key={sessao.id} className="flex items-center justify-between py-1 border-b border-slate-100 last:border-0">
                  <div>
                    <span className="text-sm font-semibold text-slate-700">Mesa {sessao.mesaId}</span>
                    <div className="flex gap-2 text-xs text-slate-400 mt-0.5">
                      <span>{sessao.pessoas.length} pessoa{sessao.pessoas.length !== 1 ? 's' : ''}</span>
                      <span>·</span>
                      <span>{formatHora(sessao.fechadaEm)}</span>
                    </div>
                  </div>
                  <span className="font-bold text-slate-700">{formatBRL(sessao.total || 0)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* botão limpar */}
          <button
            onClick={() => {
              if (window.confirm('Limpar histórico do dia?')) {
                dispatch({ type: 'LIMPAR_HISTORICO' })
              }
            }}
            className="btn btn-secondary btn-lg text-red-500"
          >
            Limpar histórico
          </button>
        </>
      )}
    </div>
  )
}
