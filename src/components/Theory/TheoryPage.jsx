import { useState } from 'react'
import schoolData from '../../data/school.json'

const concepts = [
  {
    id: 'db',
    label: 'База даних',
    description:
      'База даних (БД) — це організована сукупність взаємоповʼязаних даних, призначена для зберігання та обробки інформації. Уяви шкільний журнал — це теж свого роду база даних!',
    highlight: null,
  },
  {
    id: 'table',
    label: 'Таблиця',
    description:
      'Таблиця — основний обʼєкт реляційної БД. Вона складається з рядків і стовпців. Наприклад, таблиця "Учні" містить інформацію про кожного учня школи.',
    highlight: null,
  },
  {
    id: 'field',
    label: 'Поле',
    description:
      'Поле — це стовпець таблиці. Кожне поле має назву та тип даних (текст, число тощо). Наприклад: "Прізвище", "Клас", "Оцінка з математики".',
    highlight: 'field',
  },
  {
    id: 'record',
    label: 'Запис',
    description:
      'Запис — це рядок таблиці, що містить усі дані про один обʼєкт. Один запис = один учень з усіма його даними.',
    highlight: 'record',
  },
  {
    id: 'key',
    label: 'Ключ',
    description:
      'Первинний ключ — це поле (або набір полів), значення якого унікально ідентифікує кожен запис. У нашій таблиці ключ — це поле ID. Два учні не можуть мати однаковий ID.',
    highlight: 'key',
  },
  {
    id: 'dbms',
    label: 'СКБД',
    description:
      'СКБД (система керування базами даних) — це програма для створення та роботи з базами даних. Microsoft Access — приклад СКБД, з якою ми працювали на уроках.',
    highlight: null,
  },
]

export default function TheoryPage() {
  const [activeConcept, setActiveConcept] = useState('db')
  const [highlightedRow, setHighlightedRow] = useState(2)

  const current = concepts.find((c) => c.id === activeConcept)
  const highlightClass = current?.highlight ? `highlight-${current.highlight}` : ''

  return (
    <div className="page fade-in">
      <h1 className="page-title">Структура бази даних</h1>
      <p className="page-subtitle">
        Натисніть на поняття, щоб побачити його пояснення та виділення в таблиці
      </p>

      <div className="concept-chips">
        {concepts.map((c) => (
          <button
            key={c.id}
            className={`chip ${activeConcept === c.id ? 'active' : ''}`}
            onClick={() => setActiveConcept(c.id)}
          >
            {c.label}
          </button>
        ))}
      </div>

      <div className="info-box info">{current?.description}</div>

      <div className="card" style={{ padding: '12px' }}>
        <div className={`table-wrapper ${highlightClass}`}>
          <table className="data-table">
            <thead>
              <tr>
                {schoolData.columns.map((col) => (
                  <th key={col.name}>{col.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {schoolData.rows.map((row, i) => (
                <tr
                  key={row.id}
                  className={
                    current?.highlight === 'record' && i === highlightedRow
                      ? 'highlighted'
                      : ''
                  }
                  onClick={() => {
                    if (current?.highlight === 'record') setHighlightedRow(i)
                  }}
                >
                  {schoolData.columns.map((col) => (
                    <td
                      key={col.name}
                      className={col.isKey ? 'key-cell' : ''}
                    >
                      {row[col.name]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {current?.highlight === 'record' && (
        <div className="info-box warning">
          Натисніть на будь-який рядок таблиці, щоб виділити запис
        </div>
      )}

      <div className="card">
        <h3 className="card-title">Аналогія з Microsoft Access</h3>
        <p style={{ fontSize: '0.9rem', lineHeight: 1.6 }}>
          В Microsoft Access таблиця виглядає так само — рядки та стовпці. Коли
          ви відкриваєте таблицю в режимі <strong>«Таблиця»</strong>, ви бачите
          записи (рядки) та поля (стовпці). Поле з іконкою ключа 🔑 — це
          первинний ключ.
        </p>
      </div>

      <div className="card">
        <h3 className="card-title">Типи даних полів</h3>
        <div style={{ fontSize: '0.9rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--gray-100)' }}>
            <span style={{ color: 'var(--gray-500)' }}>ID</span>
            <span style={{ fontWeight: 500 }}>Лічильник (AutoNumber)</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--gray-100)' }}>
            <span style={{ color: 'var(--gray-500)' }}>Прізвище, Імʼя, Клас, Місто</span>
            <span style={{ fontWeight: 500 }}>Текстовий (Text)</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
            <span style={{ color: 'var(--gray-500)' }}>Оцінки</span>
            <span style={{ fontWeight: 500 }}>Числовий (Number)</span>
          </div>
        </div>
      </div>
    </div>
  )
}
