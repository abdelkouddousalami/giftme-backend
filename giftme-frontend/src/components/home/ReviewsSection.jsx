import Container from '../common/Container.jsx'
import SectionHeading from '../common/SectionHeading.jsx'
import Reveal from '../common/Reveal.jsx'
import Icon from '../common/Icon.jsx'
import { reviews } from '../../data/reviews.js'
import './ReviewsSection.css'

function ReviewsSection() {
  return (
    <section className="reviews" aria-labelledby="reviews-title">
      <Container>
        <Reveal>
          <SectionHeading
            id="reviews-title"
            align="center"
            eyebrow="Kind words"
            title={
              <>
                What people <em>felt.</em>
              </>
            }
          />
        </Reveal>

        <ul className="reviews__grid">
          {reviews.map((review, index) => (
            <Reveal as="li" key={review.id} delay={index * 80}>
              <figure className="review">
                <div
                  className="review__stars"
                  role="img"
                  aria-label={`Rated ${review.rating} out of 5`}
                >
                  {Array.from({ length: review.rating }, (_, star) => (
                    <Icon key={star} name="star" size={15} />
                  ))}
                </div>

                <blockquote className="review__quote">
                  <p>{review.quote}</p>
                </blockquote>

                <figcaption className="review__author">
                  <span className="review__name">{review.author}</span>
                  <span className="review__context">{review.context}</span>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </ul>
      </Container>
    </section>
  )
}

export default ReviewsSection
