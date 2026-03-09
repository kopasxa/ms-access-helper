import { useState, useMemo } from 'react'
import schoolData from '../../data/school.json'

const STEPS = ['Поля', 'Умови', 'Сортування', 'Результат']

const operators = {
  text: [
    { value: '=', label: '=' },
    { value: '!=', label: '≠' },
    { value: 'contains', label: 'містить' },
  ],
  number: [
    { value: '=', label: '=' },
    { value: '!=', label: '≠' },
    { value: '>', label: '>' },
    { value: '<', label: '<' },
    { value: '>=', label: '≥' },
    { value: '<=', label: '≤' },
  ],
}

const challenges = [
  {
    id: 1,
    text: 'Покажіть прізвища та імена учнів класу 9-А',
    hint: 'Оберіть поля Прізвище, Імʼя. Умова: Клас = 9-А',
  },
  {
    id: 2,
    text: 'Знайдіть учнів з оцінкою з інформатики 10 або вище',
    hint: 'Оберіть потрібні поля. Умова: Інформатика >= 10',
  },
  {
    id: 3,
    text: 'Відсортуйте учнів 9-Б за оцінкою з математики (від найвищої)',
    hint: 'Умова: Клас = 9-Б, Сортування: Математика за спаданням',
  },
]

export default function QueryBuilderPage() {
  const [step, setStep] = useState(0)
  const [selectedFields, setSelectedFields] = useState([])
  const [conditions, setConditions] = useState([])
  const [sortField, setSortField] = useState('')
  const [sortDir, setSortDir] = useState('ASC')
  const [showHint, setShowHint] = useState(null)

  const toggleField = (name) => {
    setSelectedFields((prev) =>
      prev.includes(name) ? prev.filter((f) => f !== name) : [...prev, name]
    )
  }

  const addCondition = () => {
    setConditions((prev) => [
      ...prev,
      { field: schoolData.columns[1].name, operator: '=', value: '' },
    ])
  }

  const updateCondition = (index, key, value) => {
    setConditions((prev) =>
      prev.map((c, i) => (i === index ? { ...c, [key]: value } : c))
    )
  }

  const removeCondition = (index) => {
    setConditions((prev) => prev.filter((_, i) => i !== index))
  }

  const filteredRows = useMemo(() => {
    let rows = [...schoolData.rows]

    for (const cond of conditions) {
      if (!cond.value) continue
      const col = schoolData.columns.find((c) => c.name === cond.field)
      rows = rows.filter((row) => {
        const val = row[cond.field]
        const target = col?.type === 'number' ? Number(cond.value) : cond.value
        switch (cond.operator) {
          case '=': return String(val) === String(target)
          case '!=': return String(val) !== String(target)
          case '>': return val > target
          case '<': return val < target
          case '>=': return val >= target
          case '<=': return val <= target
          case 'contains': return String(val).toLowerCase().includes(String(target).toLowerCase())
          default: return true
        }
      })
    }

    if (sortField) {
      const col = schoolData.columns.find((c) => c.name === sortField)
      rows.sort((a, b) => {
        const va = a[sortField]
        const vb = b[sortField]
        const cmp = col?.type === 'number' ? va - vb : String(va).localeCompare(String(vb), 'uk')
        return sortDir === 'ASC' ? cmp : -cmp
      })
    }

    return rows
  }, [conditions, sortField, sortDir])

  const displayFields = selectedFields.length > 0
    ? schoolData.columns.filter((c) => selectedFields.includes(c.name))
    : schoolData.columns

  const buildSQL = () => {
    const fields = selectedFields.length > 0
      ? selectedFields.map((f) => schoolData.columns.find((c) => c.name === f)?.label).join(', ')
      : '*'
    let sql = `SELECT ${fields}\nFROM ${schoolData.tableName}`

    if (conditions.length > 0 && conditions.some((c) => c.value)) {
      const parts = conditions
        .filter((c) => c.value)
        .map((c) => {
          const col = schoolData.columns.find((col) => col.name === c.field)
          const label = col?.label || c.field
          if (col?.type === 'number') {
            return `${label} ${c.operator === 'contains' ? '=' : c.operator} ${c.value}`
          }
          return `${label} ${c.operator === 'contains' ? 'LIKE' : c.operator} '${c.operator === 'contains' ? `%${c.value}%` : c.value}'`
        })
      sql += `\nWHERE ${parts.join('\n  AND ')}`
    }

    if (sortField) {
      const label = schoolData.columns.find((c) => c.name === sortField)?.label
      sql += `\nORDER BY ${label} ${sortDir}`
    }

    return sql
  }

  const renderSQL = () => {
    const sql = buildSQL()
    return sql.split('\n').map((line, i) => (
      <div key={i}>
        {line.split(/(\b(?:SELECT|FROM|WHERE|AND|ORDER BY|ASC|DESC|LIKE)\b)/g).map((part, j) => {
          if (/^(SELECT|FROM|WHERE|AND|ORDER BY|ASC|DESC|LIKE)$/.test(part)) {
            return <span key={j} className="sql-keyword">{part}</span>
          }
          if (/^'[^']*'$/.test(part) || /'%[^']*%'/.test(part)) {
            return <span key={j} className="sql-string">{part}</span>
          }
          return <span key={j}>{part}</span>
        })}
      </div>
    ))
  }

  return (
    <div className="page fade-in">
      <h1 className="page-title">Конструктор запитів</h1>
      <p className="page-subtitle">
        Створюй запити покроково — як у Microsoft Access
      </p>

      {/* Step indicator */}
      <div className="step-indicator">
        {STEPS.map((s, i) => (
          <div
            key={s}
            className={`step-dot ${i === step ? 'active' : ''} ${i < step ? 'done' : ''}`}
          />
        ))}
      </div>

      {/* Step labels */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        {STEPS.map((s, i) => (
          <button
            key={s}
            onClick={() => setStep(i)}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '0.8rem',
              fontWeight: i === step ? 600 : 400,
              color: i === step ? 'var(--primary)' : 'var(--gray-400)',
              cursor: 'pointer',
              padding: '4px',
            }}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Step 1: Fields */}
      {step === 0 && (
        <div className="card fade-in">
          <h3 className="card-title">Які поля показати?</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--gray-500)', marginBottom: 12 }}>
            В Access це відповідає рядку «Поле» в QBE-сітці конструктора запитів
          </p>
          <div className="field-grid">
            {schoolData.columns.map((col) => (
              <button
                key={col.name}
                className={`field-toggle ${selectedFields.includes(col.name) ? 'selected' : ''}`}
                onClick={() => toggleField(col.name)}
              >
                {col.isKey && '🔑 '}{col.label}
              </button>
            ))}
          </div>
          {selectedFields.length === 0 && (
            <div className="info-box warning">
              Якщо не обрати жодного поля — покажуться всі (аналог SELECT *)
            </div>
          )}
          <button className="btn btn-primary btn-block" onClick={() => setStep(1)}>
            Далі →
          </button>
        </div>
      )}

      {/* Step 2: Conditions */}
      {step === 1 && (
        <div className="card fade-in">
          <h3 className="card-title">Умови фільтрації</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--gray-500)', marginBottom: 12 }}>
            В Access це рядок «Умова відбору» (Criteria) в конструкторі запитів
          </p>

          {conditions.map((cond, i) => {
            const col = schoolData.columns.find((c) => c.name === cond.field)
            const ops = operators[col?.type || 'text']
            return (
              <div key={i} className="condition-row">
                <select
                  value={cond.field}
                  onChange={(e) => updateCondition(i, 'field', e.target.value)}
                >
                  {schoolData.columns.map((c) => (
                    <option key={c.name} value={c.name}>{c.label}</option>
                  ))}
                </select>
                <select
                  value={cond.operator}
                  onChange={(e) => updateCondition(i, 'operator', e.target.value)}
                >
                  {ops.map((op) => (
                    <option key={op.value} value={op.value}>{op.label}</option>
                  ))}
                </select>
                <input
                  type={col?.type === 'number' ? 'number' : 'text'}
                  placeholder="Значення"
                  value={cond.value}
                  onChange={(e) => updateCondition(i, 'value', e.target.value)}
                />
                <button className="btn btn-sm btn-secondary" onClick={() => removeCondition(i)}>
                  ✕
                </button>
              </div>
            )
          })}

          <button
            className="btn btn-secondary btn-block"
            onClick={addCondition}
            style={{ marginBottom: 12 }}
          >
            + Додати умову
          </button>

          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setStep(0)}>
              ← Назад
            </button>
            <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => setStep(2)}>
              Далі →
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Sorting */}
      {step === 2 && (
        <div className="card fade-in">
          <h3 className="card-title">Сортування</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--gray-500)', marginBottom: 12 }}>
            В Access це рядок «Сортування» (Sort) — за зростанням або спаданням
          </p>

          <select
            value={sortField}
            onChange={(e) => setSortField(e.target.value)}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--gray-300)',
              fontSize: '0.9rem',
              marginBottom: 8,
            }}
          >
            <option value="">Без сортування</option>
            {schoolData.columns.map((c) => (
              <option key={c.name} value={c.name}>{c.label}</option>
            ))}
          </select>

          {sortField && (
            <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
              <button
                className={`btn btn-sm ${sortDir === 'ASC' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ flex: 1 }}
                onClick={() => setSortDir('ASC')}
              >
                ↑ За зростанням
              </button>
              <button
                className={`btn btn-sm ${sortDir === 'DESC' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ flex: 1 }}
                onClick={() => setSortDir('DESC')}
              >
                ↓ За спаданням
              </button>
            </div>
          )}

          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setStep(1)}>
              ← Назад
            </button>
            <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => setStep(3)}>
              Показати результат →
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Results */}
      {step === 3 && (
        <div className="fade-in">
          <div className="card">
            <h3 className="card-title">SQL-запит</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--gray-500)', marginBottom: 8 }}>
              Це SQL-код, який Access генерує «під капотом» вашого запиту
            </p>
            <div className="sql-preview">{renderSQL()}</div>
          </div>

          <div className="card">
            <h3 className="card-title">
              Результат ({filteredRows.length} {filteredRows.length === 1 ? 'запис' : filteredRows.length < 5 ? 'записи' : 'записів'})
            </h3>

            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    {displayFields.map((col) => (
                      <th key={col.name}>{col.label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredRows.length === 0 ? (
                    <tr>
                      <td colSpan={displayFields.length} style={{ textAlign: 'center', color: 'var(--gray-400)', padding: 20 }}>
                        Жоден запис не відповідає умовам
                      </td>
                    </tr>
                  ) : (
                    filteredRows.map((row) => (
                      <tr key={row.id}>
                        {displayFields.map((col) => (
                          <td key={col.name} className={col.isKey ? 'key-cell' : ''}>
                            {row[col.name]}
                          </td>
                        ))}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile card view */}
            <div className="result-cards" style={{ display: 'none' }}>
              {filteredRows.map((row) => (
                <div key={row.id} className="result-card">
                  {displayFields.map((col) => (
                    <div key={col.name} className="result-card-row">
                      <span className="result-card-label">{col.label}</span>
                      <span className="result-card-value">{row[col.name]}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>

          <button className="btn btn-secondary btn-block" onClick={() => setStep(0)}>
            Новий запит
          </button>
        </div>
      )}

      {/* Challenges */}
      <div style={{ marginTop: 24 }}>
        <h3 className="card-title">Завдання для практики</h3>
        {challenges.map((ch) => (
          <div key={ch.id} className="task-card">
            <div className="task-label">Завдання {ch.id}</div>
            <p style={{ fontSize: '0.9rem', marginBottom: 8 }}>{ch.text}</p>
            <button
              className="btn btn-sm btn-secondary"
              onClick={() => setShowHint(showHint === ch.id ? null : ch.id)}
            >
              {showHint === ch.id ? 'Сховати підказку' : 'Підказка'}
            </button>
            {showHint === ch.id && (
              <div className="info-box info" style={{ marginTop: 8 }}>
                {ch.hint}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
