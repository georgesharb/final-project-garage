import ServiceCard from './ServiceCard';
import { services } from '../../homeData';

// The services are a fixed list written in homeData.js (no loading needed)
export default function Services() {
  return (
    <section className="section" id="services">
      <div className="container services">
        <h2>Services</h2>
        <div className="service-grid">
          {services.map((s) => (
            <ServiceCard key={s.id} name={s.name} description={s.description} />
          ))}
        </div>
      </div>
    </section>
  );
}
