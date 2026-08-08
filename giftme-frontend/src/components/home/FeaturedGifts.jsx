import Container from '../common/Container.jsx'
import SectionHeading from '../common/SectionHeading.jsx'
import Reveal from '../common/Reveal.jsx'
import Icon from '../common/Icon.jsx'
import { Link } from 'react-router-dom'
import { formatPrice, products } from '../../data/products.js'
import { paths, sectionIds } from '../../app/paths.js'
import './FeaturedGifts.css'

function FeaturedGifts() {
  return (
    <section
      className="featured"
      id={sectionIds.featuredGifts}
      aria-labelledby="featured-title"
    >
      <Container>
        <Reveal>
          <SectionHeading
            id="featured-title"
            eyebrow="Featured gifts"
            title={
              <>
                Made to <em>mean more.</em>
              </>
            }
            description="Three ways to say it. Each one made to order, printed with your photo and packed to be opened slowly."
          />
        </Reveal>

        <ul className="featured__grid">
          {products.map((product, index) => (
            <Reveal
              as="li"
              key={product.id}
              delay={index * 90}
              className="featured__item"
            >
              <article className="product-card">
                <div className="product-card__media">
                  <img
                    src={product.image}
                    alt={product.imageAlt}
                    width="800"
                    height="1000"
                    loading="lazy"
                  />
                  {product.badge ? (
                    <span className="product-card__badge">{product.badge}</span>
                  ) : null}
                </div>

                <div className="product-card__body">
                  <h3 className="product-card__name">{product.name}</h3>
                  <p className="product-card__tagline">{product.tagline}</p>
                  <p className="product-card__detail">{product.detail}</p>

                  <div className="product-card__footer">
                    <span className="product-card__price">
                      {formatPrice(product)}
                    </span>

                    {/* Stretched link: one link per card, whole card clickable */}
                    <Link
                      className="product-card__cta"
                      to={paths.product(product.slug)}
                    >
                      <span>Personalize</span>
                      <span className="sr-only">{product.name}</span>
                      <Icon name="arrowRight" size={18} />
                    </Link>
                  </div>
                </div>
              </article>
            </Reveal>
          ))}
        </ul>
      </Container>
    </section>
  )
}

export default FeaturedGifts
