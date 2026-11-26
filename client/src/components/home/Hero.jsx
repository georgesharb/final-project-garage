import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

export default function Hero({ slides, bookLink }) {
  // which slide is shown: 0, 1 or 2
  const [index, setIndex] = useState(0);
  const slide = slides[index];

  // Slideshow: go to the next slide every 5 seconds.
  // The effect runs again each time the slide changes (index), so clicking
  // a number restarts the 5 seconds. clearInterval stops the old timer.
  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [index, slides.length]);

  return (
    <section className="hero" id="top">
      <div className="hero-text">
        <p className="label">PREMIUM CAR CARE</p>
        <h1>{slide.title}</h1>
        <p className="hero-lead">{slide.text}</p>
        <div className="hero-actions">
          <Link className="button" to={bookLink}>BOOK A VISIT</Link>
          <a className="button button-line" href="#contact">GET IN TOUCH</a>
        </div>
      </div>

      <img className="hero-photo" src="/hero-car.jpg" alt="A black sports car in a dark studio" width="950" height="670" fetchPriority="high" />

      <div className="hero-controls">
        <div className="slide-numbers">
          {slides.map((s, i) => (
            <button
              key={s.id}
              className={i === index ? 'slide-number active' : 'slide-number'}
              aria-label={`Show slide ${i + 1}`}
              onClick={() => setIndex(i)}
            >
              0{i + 1}
              {i === index && <span className="slide-line"></span>}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
