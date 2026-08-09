import { useEffect, useId, useMemo, useRef, useState } from 'react'
import Container from '../../common/Container.jsx'
import Button from '../../common/Button.jsx'
import Reveal from '../../common/Reveal.jsx'
import GiftFinderOption from './GiftFinderOption.jsx'
import GiftFinderResult from './GiftFinderResult.jsx'
import ErrorState from '../../ui/ErrorState.jsx'
import Spinner from '../../ui/Spinner.jsx'
import { buildGiftFinderSteps, recommendGift } from '../../../data/giftFinder.js'
import { listProducts } from '../../../api/products.js'
import { useAsync } from '../../../hooks/useAsync.js'
import { sectionIds } from '../../../app/paths.js'

/**
 * The gift finder is a consultation, not a filter.
 *
 * That is the whole reason it asks one question at a time. Three questions on
 * screen at once is a form — the eye prices the effort before it reads the
 * first one, and the panel has to be tall and empty to hold them. One question
 * at a time is a conversation: the panel stays small, each question gets the
 * whole stage, and the rail along the top carries both the progress and the
 * answers already given, so nothing is hidden — it is just not all shouting at
 * once.
 *
 * The matching rules live in data/giftFinder.js, but the catalog they choose
 * from is the real one: the section loads `GET /api/products` up front, so the
 * budget bands describe prices GiftMe actually charges and the answer is always
 * a product a shopper can go on to buy.
 */

const NO_ANSWERS = { recipient: '', occasion: '', budget: '' }

/** How each step lays its answers out — a property of the design, not of the
    question, so it stays here rather than in the data file. */
const OPTION_GRID = {
  recipient: 'grid-cols-2 sm:grid-cols-3',
  occasion: 'grid-cols-2',
  budget: 'grid-cols-1 sm:grid-cols-3',
}

const ARROW_KEYS = [
  'ArrowRight',
  'ArrowDown',
  'ArrowLeft',
  'ArrowUp',
  'Home',
  'End',
]

/**
 * The section's one mark: a short clay rule closing the copy, the same object
 * the eyebrows use at the top of every section. The drawn bow that used to sit
 * here was the last piece of illustration left on the page.
 */
function Rule({ className = '' }) {
  return (
    <div aria-hidden="true" className={`flex items-center gap-3 ${className}`}>
      <span className="h-px w-10 shrink-0 bg-clay" />
      <span className="h-px flex-1 bg-line" />
    </div>
  )
}

function GiftFinderSection() {
  const [answers, setAnswers] = useState(NO_ANSWERS)
  const [stepIndex, setStepIndex] = useState(0)
  const [result, setResult] = useState(null)
  const [hint, setHint] = useState('')

  const baseId = useId()
  const questionId = `${baseId}-question`
  const pickId = `${baseId}-pick`

  const optionsRef = useRef(null)
  const resultRef = useRef(null)

  /* Focus only ever moves in answer to a click or a key. Driving these from
     the render instead would pull the page down to this section on load. */
  const focusOptions = useRef(false)
  const focusResult = useRef(false)

  /* One catalog read serves the whole consultation: the budget bands are
     computed from these prices, and the answer is one of these products. */
  const {
    data: catalog,
    error: catalogError,
    loading: catalogLoading,
    run: reloadCatalog,
  } = useAsync(() => listProducts({ size: 100 }), [])

  const products = useMemo(() => catalog?.content ?? [], [catalog])
  const steps = useMemo(() => buildGiftFinderSteps(products), [products])

  const step = steps[stepIndex]
  const chosen = step ? answers[step.id] : ''
  const isLastStep = stepIndex === steps.length - 1
  const product = result?.product ?? null

  useEffect(() => {
    if (!focusOptions.current) return

    focusOptions.current = false

    const group = optionsRef.current

    if (!group) return

    const target =
      group.querySelector('[role="radio"][aria-checked="true"]') ??
      group.querySelector('[role="radio"]')

    target?.focus()
  }, [stepIndex, result])

  /* "Find My Gift" replaces the button that was pressed, so focus would fall
     back to the document. Send it to the answer instead. */
  useEffect(() => {
    if (!focusResult.current || !result) return

    focusResult.current = false
    resultRef.current?.focus()
  }, [result])

  const goToStep = (index) => {
    focusOptions.current = true
    setStepIndex(index)
    setResult(null)
    setHint('')
  }

  const handleSelect = (value) => {
    setAnswers((previous) => ({ ...previous, [step.id]: value }))
    setHint('')
  }

  const handleNext = () => {
    if (!chosen) {
      setHint(
        isLastStep
          ? 'Pick a budget to see your match.'
          : 'Pick one to continue.',
      )
      return
    }

    if (!isLastStep) {
      goToStep(stepIndex + 1)
      return
    }

    setHint('')
    focusResult.current = true
    setResult(recommendGift(answers, products))
  }

  const handleStartOver = () => {
    setAnswers(NO_ANSWERS)
    goToStep(0)
  }

  /* The WAI-ARIA radio-group contract, so a keyboard reaches the group once
     and then chooses inside it with the arrows — what native radios give for
     free, and what a row of plain buttons would have taken away. */
  const handleOptionKeys = (event) => {
    if (!ARROW_KEYS.includes(event.key)) return

    const radios = Array.from(
      optionsRef.current?.querySelectorAll('[role="radio"]') ?? [],
    )

    if (!radios.length) return

    const active = radios.indexOf(document.activeElement)
    const from = active < 0 ? 0 : active

    let next

    if (event.key === 'Home') {
      next = 0
    } else if (event.key === 'End') {
      next = radios.length - 1
    } else {
      const direction =
        event.key === 'ArrowLeft' || event.key === 'ArrowUp' ? -1 : 1

      next = (from + direction + radios.length) % radios.length
    }

    event.preventDefault()
    radios[next].focus()
    radios[next].click()
  }

  /**
   * The panel's four states, as early returns. The consultation cannot start
   * until the catalog is in — the budget question is written from its prices,
   * and an answer has to be a product that exists.
   */
  function renderPanelBody() {
    if (catalogLoading) {
      return (
        <div className="flex min-h-[11rem] items-center justify-center text-ink-soft">
          <Spinner size={24} label="Loading gifts" />
        </div>
      )
    }

    if (catalogError) {
      return (
        <ErrorState
          compact
          error={catalogError}
          onRetry={reloadCatalog}
          title="We couldn't load the gifts"
        />
      )
    }

    if (products.length === 0) {
      return (
        <p className="py-8 text-center text-ink-soft [font-size:var(--text-sm)]">
          There are no gifts in the shop right now, so there is nothing to
          recommend just yet.
        </p>
      )
    }

    if (result && product) {
      return (
        <GiftFinderResult
          key={product.id}
          ref={resultRef}
          product={product}
          reason={result.reason}
          titleId={pickId}
        />
      )
    }

    return (
      <>
        <h3 id={questionId} className="text-[1.3rem] leading-tight sm:text-[1.5rem]">
          {step.question}
        </h3>

        <div
          ref={optionsRef}
          role="radiogroup"
          aria-labelledby={questionId}
          aria-required="true"
          onKeyDown={handleOptionKeys}
          className={`mt-5 grid gap-2.5 ${OPTION_GRID[step.id]}`}
        >
          {step.options.map((option, index) => (
            <GiftFinderOption
              key={option.value}
              option={option}
              checked={chosen === option.value}
              tabbable={chosen ? chosen === option.value : index === 0}
              onSelect={handleSelect}
            />
          ))}
        </div>
      </>
    )
  }

  /** Nothing in the footer can act before the catalog has arrived. */
  const catalogReady = !catalogLoading && !catalogError && products.length > 0

  return (
    <section
      className="relative isolate overflow-hidden border-y border-line bg-bone py-(--section-y)"
      id={sectionIds.giftFinder}
      aria-labelledby="gift-finder-title"
    >
      {/* Atmosphere, mirrored from the hero so the page alternates rather than
          repeats: the cool field high on the left here, where the hero puts it
          low, and warm sand low on the right. Both faint enough to read as
          light rather than as colour. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -top-[22%] -left-[14%] -z-10 aspect-square w-[min(560px,72%)] opacity-60 [background:radial-gradient(circle,var(--color-secondary-light)_0%,transparent_68%)]"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -right-[16%] -bottom-[26%] -z-10 aspect-square w-[min(620px,80%)] opacity-70 [background:radial-gradient(circle,var(--color-surface-sand)_0%,transparent_66%)]"
      />

      <Container>
        <div className="grid max-nav:gap-10 nav:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] nav:items-center nav:max-wide:gap-12 wide:gap-16">
          <Reveal>
            <div className="max-w-[34rem]">
              <p className="eyebrow">The gift finder</p>

              <h2
                id="gift-finder-title"
                className="mt-5 [font-size:var(--text-display-2)]"
              >
                Not sure <em className="text-burgundy italic">what to gift?</em>
              </h2>

              <p className="mt-5 max-w-[42ch] text-ink-soft [font-size:var(--text-lg)]">
                Tell us a little about them. We&rsquo;ll help you find something
                they&rsquo;ll love.
              </p>

              <Rule className="mt-8 max-w-[22rem]" />

              <p className="mt-5 text-[0.6875rem] font-medium tracking-[0.14em] text-ink-soft uppercase">
                Three questions · no account, no email
              </p>
            </div>
          </Reveal>

          <Reveal delay={120}>
            <div className="relative">
              {/* A hairline register mark offset behind the panel — the panel
                  reads as something printed rather than as a form card. */}
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 hidden translate-x-2 translate-y-2 rounded-(--radius-lg) border border-line-strong sm:block"
              />

              <div className="relative rounded-(--radius-lg) border border-line bg-white shadow-(--shadow-md) max-sm:p-5 sm:max-wide:p-7 wide:p-8">
                <ol
                  aria-label="Gift finder steps"
                  className="grid grid-cols-3 gap-x-2 sm:gap-x-4"
                >
                  {steps.map((entry, index) => {
                    const answer = entry.options.find(
                      (option) => option.value === answers[entry.id],
                    )
                    const isCurrent = !result && index === stepIndex

                    return (
                      <li
                        key={entry.id}
                        aria-current={isCurrent ? 'step' : undefined}
                        className="min-w-0"
                      >
                        <span
                          className={`block h-[2px] w-full transition-colors duration-300 ease-brand ${
                            answer || isCurrent ? 'bg-olive' : 'bg-line'
                          }`}
                        />

                        {answer ? (
                          <button
                            type="button"
                            onClick={() => goToStep(index)}
                            className="group mt-2.5 block w-full min-w-0 text-left"
                          >
                            <span className="block text-[0.68rem] tracking-[0.14em] text-olive-deep uppercase">
                              {entry.index}
                            </span>
                            <span className="mt-0.5 block truncate text-[0.78rem] underline-offset-4 group-hover:underline sm:text-[0.85rem]">
                              {answer.label}
                            </span>
                            <span className="sr-only">
                              — change your {entry.name.toLowerCase()}
                            </span>
                          </button>
                        ) : (
                          <span className="mt-2.5 block">
                            <span
                              className={`block text-[0.68rem] tracking-[0.14em] uppercase ${
                                isCurrent ? 'text-olive-deep' : 'text-ink-soft'
                              }`}
                            >
                              {entry.index}
                            </span>
                            <span
                              className={`mt-0.5 block truncate text-[0.78rem] sm:text-[0.85rem] ${
                                isCurrent
                                  ? 'font-medium text-ink'
                                  : 'text-ink-soft'
                              }`}
                            >
                              {entry.name}
                            </span>
                          </span>
                        )}
                      </li>
                    )
                  })}
                </ol>

                <div className="mt-6 border-t border-line pt-6 sm:mt-7 sm:pt-7">
                  {renderPanelBody()}
                </div>

                <div
                  className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-3 border-t border-line pt-5 sm:mt-7"
                  hidden={!catalogReady}
                >
                  {result ? (
                    <Button variant="ghost" onClick={handleStartOver}>
                      Start over
                    </Button>
                  ) : (
                    <>
                      {stepIndex > 0 ? (
                        <Button
                          variant="ghost"
                          onClick={() => goToStep(stepIndex - 1)}
                        >
                          Back
                        </Button>
                      ) : null}

                      {/* aria-disabled rather than `disabled`: the control stays
                          reachable, so a keyboard can find out why it is dimmed
                          instead of tabbing straight past it. */}
                      <Button
                        size="lg"
                        trailingIcon="arrowRight"
                        onClick={handleNext}
                        aria-disabled={chosen ? undefined : 'true'}
                        className="ml-auto w-full sm:w-auto"
                      >
                        {isLastStep ? 'Find My Gift' : 'Continue'}
                      </Button>
                    </>
                  )}
                </div>

                {hint ? (
                  <p
                    role="alert"
                    className="mt-3 text-[0.85rem] text-burgundy-deep"
                  >
                    {hint}
                  </p>
                ) : null}
              </div>
            </div>
          </Reveal>
        </div>
      </Container>
    </section>
  )
}

export default GiftFinderSection
