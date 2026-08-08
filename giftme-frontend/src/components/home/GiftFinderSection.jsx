import { useId, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import Container from '../common/Container.jsx'
import Button from '../common/Button.jsx'
import Icon from '../common/Icon.jsx'
import Reveal from '../common/Reveal.jsx'
import { giftFinderQuestions, recommendGift } from '../../data/giftFinder.js'
import { formatPrice, getProductById } from '../../data/products.js'
import { paths, sectionIds } from '../../app/paths.js'
import './GiftFinderSection.css'

const NO_ANSWERS = { recipient: '', occasion: '', budget: '' }

/**
 * UI-only gift matcher. State lives here, the matching rules live in
 * data/giftFinder.js, and nothing is sent anywhere — there is no API yet.
 */
function GiftFinderSection() {
  const [answers, setAnswers] = useState(NO_ANSWERS)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  const groupId = useId()
  const firstInputRefs = useRef({})

  const handleChange = (questionId, value) => {
    setAnswers((previous) => ({ ...previous, [questionId]: value }))
    setError('')
  }

  const handleSubmit = (event) => {
    event.preventDefault()

    const unanswered = giftFinderQuestions.find(
      (question) => !answers[question.id],
    )

    if (unanswered) {
      setResult(null)
      setError(`Choose an answer for “${unanswered.legend}” to see a match.`)
      firstInputRefs.current[unanswered.id]?.focus()
      return
    }

    setError('')
    setResult(recommendGift(answers))
  }

  const handleReset = () => {
    setAnswers(NO_ANSWERS)
    setResult(null)
    setError('')
  }

  const recommended = result ? getProductById(result.productId) : null

  return (
    <section
      className="gift-finder"
      id={sectionIds.giftFinder}
      aria-labelledby="gift-finder-title"
    >
      <Container>
        <Reveal className="gift-finder__panel">
          <div className="gift-finder__intro">
            <p className="eyebrow">Gift finder</p>
            <h2 id="gift-finder-title" className="gift-finder__title">
              Not sure what to gift?
            </h2>
            <p className="gift-finder__lead">
              Tell us a little about them. We&rsquo;ll help you find something
              special.
            </p>
          </div>

          <form className="gift-finder__form" onSubmit={handleSubmit}>
            <div className="gift-finder__questions">
              {giftFinderQuestions.map((question) => (
                <fieldset key={question.id} className="gift-finder__group">
                  <legend className="gift-finder__legend">
                    {question.legend}
                  </legend>

                  <div className="gift-finder__options">
                    {question.options.map((option, index) => (
                      <label key={option.value} className="gift-finder__chip">
                        <input
                          className="sr-only"
                          type="radio"
                          name={`${groupId}-${question.id}`}
                          value={option.value}
                          checked={answers[question.id] === option.value}
                          onChange={() =>
                            handleChange(question.id, option.value)
                          }
                          ref={(element) => {
                            if (index === 0) {
                              firstInputRefs.current[question.id] = element
                            }
                          }}
                        />
                        <span className="gift-finder__chip-label">
                          {option.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </fieldset>
              ))}
            </div>

            <div className="gift-finder__actions">
              <Button type="submit" size="lg" trailingIcon="arrowRight">
                Find My Gift
              </Button>

              {result ? (
                <Button variant="ghost" onClick={handleReset}>
                  Start over
                </Button>
              ) : null}
            </div>

            {error ? (
              <p className="gift-finder__error" role="alert">
                {error}
              </p>
            ) : null}
          </form>

          <div className="gift-finder__result" role="status">
            {recommended ? (
              <article className="gift-finder__match">
                <img
                  className="gift-finder__match-image"
                  src={recommended.image}
                  alt={recommended.imageAlt}
                  width="800"
                  height="1000"
                />

                <div className="gift-finder__match-body">
                  <p className="gift-finder__match-summary">
                    {result.summary.join(' · ')}
                  </p>

                  <h3 className="gift-finder__match-name">
                    {recommended.name}
                  </h3>

                  <p className="gift-finder__match-reason">{result.reason}</p>

                  <p className="gift-finder__match-price">
                    {formatPrice(recommended)}
                  </p>

                  <Link
                    className="gift-finder__match-link"
                    to={paths.product(recommended.slug)}
                  >
                    Personalize this gift
                    <Icon name="arrowRight" size={18} />
                  </Link>
                </div>
              </article>
            ) : null}
          </div>
        </Reveal>
      </Container>
    </section>
  )
}

export default GiftFinderSection
