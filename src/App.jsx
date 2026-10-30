import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AppProvider } from './context/AppContext'
import Header from './components/Header'
import Mesas from './pages/Mesas'
import Mesa from './pages/Mesa'
import Caixa from './pages/Caixa'
import Relatorio from './pages/Relatorio'
import Config from './pages/Config'

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <div className="min-h-screen pb-16">
          <Routes>
            <Route path="/" element={<Mesas />} />
            <Route path="/mesa/:id" element={<Mesa />} />
            <Route path="/caixa" element={<Caixa />} />
            <Route path="/caixa/:id" element={<Caixa />} />
            <Route path="/relatorio" element={<Relatorio />} />
            <Route path="/config" element={<Config />} />
          </Routes>
          <Header />
        </div>
      </BrowserRouter>
    </AppProvider>
  )
}
