import ServiceCard from './ServiceCard';

export default function Services({ services, loading, error }) {
  return (
    <section className="section" id="services">
      <div className="container services">
        <div>
          <p className="label">OUR SERVICES</p>
          <h2>What we do best</h2>
        </div>

        {loading && <p className="note">Loading the services...</p>}
        {error && <p className="note" role="alert">{error}</p>}

        {!loading && !error && (
          <div className="service-grid">
            {services.map((s) => (
              <ServiceCard key={s.id} name={s.name} description={s.description} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
