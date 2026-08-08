import { useLocation } from 'react-router-dom'
import Container from '../../components/common/Container.jsx'
import Button from '../../components/common/Button.jsx'
import { paths, homeAnchor, sectionIds } from '../../app/paths.js'
import './NotFoundPage.css'

/**
 * Catch-all for anything outside `/`.
 *
 * Most of the site's links already point at routes that are designed but not
 * built yet (shop, cart, tracking, the admin area). Landing here should read as
 * "not ready" rather than "broken", so the copy says so plainly and offers the
 * two things that do work today.
 */
function NotFoundPage() {
  const { pathname } = useLocation()

  return (
    <section className="not-found">
      <Container size="narrow" className="not-found__inner">
        <p className="eyebrow">Coming soon</p>

        <h1 className="not-found__title">
          This page isn&rsquo;t <em>here yet.</em>
        </h1>

        <p className="not-found__lead">
          <code className="not-found__path">{pathname}</code> is part of the
          GiftMe experience we&rsquo;re still building. The home page is where
          everything lives for now.
        </p>

        <div className="not-found__actions">
          <Button to={paths.home} size="lg" trailingIcon="arrowRight">
            Back to home
          </Button>
          <Button
            to={homeAnchor(sectionIds.featuredGifts)}
            variant="secondary"
            size="lg"
          >
            See the gifts
          </Button>
        </div>
      </Container>
    </section>
  )
}

export default NotFoundPage
