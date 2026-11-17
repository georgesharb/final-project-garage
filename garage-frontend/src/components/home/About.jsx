export default function About({ steps }) {
  return (
    <section className="section section-dark" id="about">
      <div className="container about">
        <img src="/mechanic.jpg" alt="A mechanic working on a car engine" />
        <div>
          <p className="label">ABOUT US</p>
          <h2>Care you can follow online</h2>
          <p className="about-lead">
            We repair and maintain all car brands, and we keep the full repair
            history of every car that comes to us. Here is how it works.
          </p>
          {steps.map((s, index) => (
            <div className="step" key={s.id}>
              <span className="step-number">0{index + 1}</span>
              <div>
                <h3>{s.title}</h3>
                <p>{s.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
