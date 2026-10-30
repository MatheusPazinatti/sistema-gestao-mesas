import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'

export default function Mesas() {
  const { state } = useApp()
  const navigate = useNavigate()

  const livres = state.mesas.filter(m => m.status === 'livre').length
  const ocupadas = state.mesas.filter(m => m.status === 'ocupada').length

  return (
    <div className="p-4 max-w-lg mx-auto">
      {/* cabeçalho */}
      <div className="mb-5 pt-2">
        <h1 className="text-xl font-bold text-slate-800">{state.config.nomeRestaurante}</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          {ocupadas > 0
            ? <><span className="text-red-500 font-semibold">{ocupadas} ocupada{ocupadas > 1 ? 's' : ''}</span> · {livres} livre{livres !== 1 ? 's' : ''}</>
            : <span className="text-primary-600 font-medium">Todas as mesas livres</span>
          }
        </p>
      </div>

      {/* grid de mesas */}
      <div className="grid grid-cols-3 gap-3">
        {state.mesas.map(mesa => {
          const sessao = state.sessoes.find(s => s.mesaId === mesa.id)
          const nPessoas = sessao ? sessao.pessoas.length : 0
          const nPedidos = sessao ? sessao.pedidos.reduce((a, p) => a + p.quantidade, 0) : 0
          const ocupada = mesa.status === 'ocupada'

          return (
            <button
              key={mesa.id}
              onClick={() => navigate(`/mesa/${mesa.id}`)}
              className={`card p-4 flex flex-col items-center gap-1.5 active:scale-95 transition-all text-center ${
                ocupada
                  ? 'border-red-200 bg-red-50'
                  : 'border-slate-100 bg-white hover:border-primary-200 hover:bg-primary-50'
              }`}
            >
              <span className={`text-2xl font-bold ${ocupada ? 'text-red-600' : 'text-slate-700'}`}>
                {mesa.numero}
              </span>
              <span className={`text-xs font-semibold uppercase tracking-wide ${
                ocupada ? 'text-red-500' : 'text-slate-400'
              }`}>
                {ocupada ? 'Ocupada' : 'Livre'}
              </span>
              {ocupada && nPessoas > 0 && (
                <div className="flex flex-col items-center gap-0.5 mt-0.5">
                  <span className="text-xs text-slate-500">
                    {nPessoas} pessoa{nPessoas > 1 ? 's' : ''}
                  </span>
                  {nPedidos > 0 && (
                    <span className="text-xs text-slate-400">
                      {nPedidos} item{nPedidos > 1 ? 's' : ''}
                    </span>
                  )}
                </div>
              )}
            </button>
          )
        })}
      </div>

      {/* legenda */}
      <div className="flex gap-4 justify-center mt-5 text-xs text-slate-400">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-slate-200 inline-block" />
          Livre
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-red-400 inline-block" />
          Ocupada
        </span>
      </div>
    </div>
  )
}
