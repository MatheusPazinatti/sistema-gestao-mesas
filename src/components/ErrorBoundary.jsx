import React from 'react'

// ─── ErrorBoundary ────────────────────────────────────────────────────────────
// Captura erros de renderização React antes que travem o app inteiro.
// Exibe uma tela de recuperação em vez de tela branca.
export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { temErro: false, erro: null }
  }

  static getDerivedStateFromError(erro) {
    return { temErro: true, erro }
  }

  componentDidCatch(erro, info) {
    console.error('[Sistema] Erro capturado pelo ErrorBoundary:', erro, info)
  }

  handleRecarregar = () => {
    this.setState({ temErro: false, erro: null })
  }

  handleResetarTudo = () => {
    try { localStorage.clear() } catch (_) {}
    window.location.reload()
  }

  render() {
    if (!this.state.temErro) return this.props.children

    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50">
        <div className="max-w-sm w-full text-center">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>

          <h1 className="text-xl font-bold text-slate-800 mb-2">Algo deu errado</h1>
          <p className="text-sm text-slate-500 mb-6">
            Ocorreu um erro inesperado. Tente recarregar ou, se o problema persistir, reinicie o sistema.
          </p>

          <div className="space-y-2">
            <button
              onClick={this.handleRecarregar}
              className="btn btn-primary btn-lg"
            >
              Tentar novamente
            </button>
            <button
              onClick={this.handleResetarTudo}
              className="btn btn-secondary btn-lg text-red-600 border-red-200"
            >
              Reiniciar sistema (apaga dados)
            </button>
          </div>

          {process.env.NODE_ENV === 'development' && this.state.erro && (
            <details className="mt-6 text-left bg-slate-100 rounded-xl p-3">
              <summary className="text-xs text-slate-500 cursor-pointer mb-2">Detalhes do erro</summary>
              <pre className="text-xs text-red-600 whitespace-pre-wrap overflow-auto">
                {this.state.erro.toString()}
              </pre>
            </details>
          )}
        </div>
      </div>
    )
  }
}
