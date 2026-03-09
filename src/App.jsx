import { useState } from 'react'
import TheoryPage from './components/Theory/TheoryPage'
import QueryBuilderPage from './components/QueryBuilder/QueryBuilderPage'
import QuizPage from './components/Quiz/QuizPage'

const tabs = [
  { id: 'theory', icon: '📖', label: 'Теорія' },
  { id: 'query', icon: '🔧', label: 'Запити' },
  { id: 'quiz', icon: '✅', label: 'Тести' },
]

export default function App() {
  const [activeTab, setActiveTab] = useState('theory')

  return (
    <div className="app">
      {activeTab === 'theory' && <TheoryPage />}
      {activeTab === 'query' && <QueryBuilderPage />}
      {activeTab === 'quiz' && <QuizPage />}

      <nav className="bottom-nav">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`nav-item ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span className="nav-icon">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </nav>
    </div>
  )
}
