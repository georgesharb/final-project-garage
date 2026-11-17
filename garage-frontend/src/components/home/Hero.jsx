import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function Hero({ slides, phone, bookLink }) {
  // which slide is shown: 0, 1 or 2
  const [index, setIndex] = useState(0);
  const slide = slides[index];

  function next() {
    setIndex((i) => (i + 1) % slides.length);
  }

  function previous() {
    setIndex((i) => (i - 1 + slides.length) % slides.length);
  }

  return (
    <section className="hero">
      <div className="hero-text">
        <p className="label">PREMIUM CAR CARE - MAR ROUKOZ</p>
        <h1>{slide.title}</h1>
        <p className="hero-lead">{slide.text}</p>
        <div className="hero-actions">
          <Link className="button" to={bookLink}>BOOK A VISIT</Link>
          <a className="button button-outline" href={`tel:${phone}`}>CALL {phone}</a>
        </div>
      </div>

      <img className="hero-photo" src="/hero-car.jpg" alt="A black sports car in a dark studio" />

      <div className="hero-controls">
        <div className="slide-numbers">
          {slides.map((s, i) => (
            <span key={s.id} className={i === index ? 'slide-number active' : 'slide-number'}>
              0{i + 1}
              {i === index && <span className="slide-line"></span>}
            </span>
          ))}
        </div>
        <div className="slide-arrows">
          <button className="arrow" aria-label="Previous slide" onClick={previous}>&lsaquo;</button>
          <button className="arrow" aria-label="Next slide" onClick={next}>&rsaquo;</button>
        </div>
      </div>
    </section>
  );
}
