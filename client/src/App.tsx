import { useState } from 'react'
import { Dashboard } from './pages/Dashboard'
import { Cards } from './pages/Cards'

type Tab = 'dashboard' | 'cards'

export function App() {
  const [tab, setTab] = useState<Tab>('dashboard')

  return (
    <div className="app">
      <header>
        <h1>OPCARD</h1>
        <nav>
          <button
            className={tab === 'dashboard' ? 'active' : ''}
            onClick={() => setTab('dashboard')}
          >
            ダッシュボード
          </button>
          <button
            className={tab === 'cards' ? 'active' : ''}
            onClick={() => setTab('cards')}
          >
            カード
          </button>
        </nav>
      </header>
      <main>
        {tab === 'dashboard' && <Dashboard />}
        {tab === 'cards' && <Cards />}
      </main>
    </div>
  )
}
