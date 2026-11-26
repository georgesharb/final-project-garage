import { PinIcon, ClockIcon } from './icons';

// "Visit us" section: where the garage is + opening hours, and a button
// that opens Google Maps. (Phone and email are in the footer.)
export default function Location({ garage, hours }) {
  const mapLink = `https://www.google.com/maps?q=${garage.latitude},${garage.longitude}`;

  return (
    <section className="section visit" id="visit">
      <div className="container">
        <h2>Visit us</h2>

        <div className="visit-grid">
          <div>
            <h3><PinIcon /> Location</h3>
            <p>{garage.address}</p>
          </div>

          <div>
            <h3><ClockIcon /> Opening hours</h3>
            {hours.map((h) => (
              <p className="hours-row" key={h.id}>
                <span>{h.days}</span>
                <span>{h.time}</span>
              </p>
            ))}
          </div>
        </div>

        <div className="visit-action">
          <a className="button" href={mapLink} target="_blank" rel="noreferrer">GET DIRECTIONS</a>
        </div>
      </div>
    </section>
  );
}
