import { useState, useMemo } from 'react'
import questions from '../../data/quizQuestions.json'

export default function QuizPage() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState({})
  const [showResult, setShowResult] = useState(false)
  const [revealed, setRevealed] = useState(false)

  const question = questions[currentIndex]
  const totalQuestions = questions.length
  const progress = ((currentIndex + 1) / totalQuestions) * 100

  const score = useMemo(() => {
    return questions.reduce(
      (acc, q) => (answers[q.id] === q.correct ? acc + 1 : acc),
      0
    )
  }, [answers])

  const handleAnswer = (optionIndex) => {
    if (revealed) return
    setAnswers((prev) => ({ ...prev, [question.id]: optionIndex }))
    setRevealed(true)
  }

  const nextQuestion = () => {
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex((prev) => prev + 1)
      setRevealed(false)
    } else {
      setShowResult(true)
    }
  }

  const restart = () => {
    setCurrentIndex(0)
    setAnswers({})
    setShowResult(false)
    setRevealed(false)
  }

  const getOptionClass = (optionIndex) => {
    if (!revealed) {
      return answers[question.id] === optionIndex ? 'selected' : ''
    }
    if (optionIndex === question.correct) return 'correct'
    if (answers[question.id] === optionIndex && optionIndex !== question.correct)
      return 'wrong'
    return ''
  }

  const getGrade = () => {
    const percent = (score / totalQuestions) * 100
    if (percent >= 90) return { text: 'Відмінно! 🎉', color: 'var(--success)' }
    if (percent >= 70) return { text: 'Добре! 👍', color: 'var(--primary)' }
    if (percent >= 50) return { text: 'Задовільно', color: 'var(--warning)' }
    return { text: 'Потрібно повторити матеріал', color: 'var(--error)' }
  }

  if (showResult) {
    const grade = getGrade()
    return (
      <div className="page fade-in">
        <h1 className="page-title">Результати тесту</h1>

        <div className="card">
          <div className="score-display">
            <div className="score-number" style={{ color: grade.color }}>
              {score}/{totalQuestions}
            </div>
            <div className="score-label">{grade.text}</div>
          </div>

          <div className="progress-bar" style={{ height: 10, marginTop: 16 }}>
            <div
              className="progress-fill"
              style={{
                width: `${(score / totalQuestions) * 100}%`,
                background: grade.color,
              }}
            />
          </div>
        </div>

        {/* Review answers */}
        <h3 className="card-title" style={{ marginTop: 16, marginBottom: 12 }}>
          Розбір відповідей
        </h3>
        {questions.map((q, i) => {
          const isCorrect = answers[q.id] === q.correct
          return (
            <div
              key={q.id}
              className="card"
              style={{
                borderLeft: `4px solid ${isCorrect ? 'var(--success)' : 'var(--error)'}`,
              }}
            >
              <p style={{ fontSize: '0.85rem', color: 'var(--gray-500)', marginBottom: 4 }}>
                Питання {i + 1}
              </p>
              <p style={{ fontSize: '0.95rem', fontWeight: 500, marginBottom: 8 }}>
                {q.question}
              </p>
              <p style={{ fontSize: '0.85rem' }}>
                {isCorrect ? (
                  <span style={{ color: 'var(--success)' }}>✓ Правильно</span>
                ) : (
                  <>
                    <span style={{ color: 'var(--error)' }}>
                      ✕ Ваша відповідь: {q.options[answers[q.id]]}
                    </span>
                    <br />
                    <span style={{ color: 'var(--success)' }}>
                      ✓ Правильна: {q.options[q.correct]}
                    </span>
                  </>
                )}
              </p>
              <div className="info-box info" style={{ marginTop: 8, marginBottom: 0 }}>
                {q.explanation}
              </div>
            </div>
          )
        })}

        <button
          className="btn btn-primary btn-block"
          onClick={restart}
          style={{ marginTop: 16 }}
        >
          Пройти ще раз
        </button>
      </div>
    )
  }

  return (
    <div className="page fade-in">
      <h1 className="page-title">Самоперевірка</h1>
      <p className="page-subtitle">
        {totalQuestions} запитань з теорії баз даних та SQL-запитів
      </p>

      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${progress}%` }} />
      </div>

      <div className="card">
        <p style={{ fontSize: '0.8rem', color: 'var(--gray-400)', marginBottom: 8 }}>
          Питання {currentIndex + 1} з {totalQuestions}
          {question.section === 'theory' ? ' • Теорія' : ' • Запити'}
        </p>

        <h3 style={{ fontSize: '1.05rem', fontWeight: 600, marginBottom: 16, lineHeight: 1.4 }}>
          {question.question}
        </h3>

        {question.options.map((option, i) => (
          <button
            key={i}
            className={`quiz-option ${getOptionClass(i)}`}
            onClick={() => handleAnswer(i)}
            disabled={revealed}
          >
            {option}
          </button>
        ))}

        {revealed && (
          <div className="fade-in">
            <div
              className={`info-box ${
                answers[question.id] === question.correct ? 'success' : 'error'
              }`}
            >
              {answers[question.id] === question.correct
                ? '✓ Правильно!'
                : `✕ Неправильно. Правильна відповідь: ${question.options[question.correct]}`}
            </div>
            <div className="info-box info" style={{ marginBottom: 16 }}>
              {question.explanation}
            </div>
            <button className="btn btn-primary btn-block" onClick={nextQuestion}>
              {currentIndex < totalQuestions - 1 ? 'Наступне питання →' : 'Показати результат'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
