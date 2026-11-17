export default function Location({ garage, hours }) {
  const { latitude, longitude } = garage;

  // OpenStreetMap embed: free, no API key
  const params = new URLSearchParams({
    bbox: `${longitude - 0.01},${latitude - 0.006},${longitude + 0.01},${latitude + 0.006}`,
    layer: 'mapnik',
    marker: `${latitude},${longitude}`,
  });
  const mapUrl = `https://www.openstreetmap.org/export/embed.html?${params}`;

  return (
    <section className="section" id="location">
      <div className="container">
        <p className="label">LOCATION</p>
        <h2>Find us</h2>
        <div className="location">
          <div>
            <h3>Address</h3>
            <p>{garage.address}</p>

            <h3>Contact</h3>
            <p>
              <a href={`tel:${garage.phone}`}>{garage.phone}</a><br />
              <a href={`mailto:${garage.email}`}>{garage.email}</a>
            </p>

            <h3>Opening hours</h3>
            {hours.map((h) => (
              <p className="hours-row" key={h.id}>
                <span className="hours-days">{h.days}</span>
                <span>{h.time}</span>
              </p>
            ))}
          </div>
          <iframe className="map" src={mapUrl} title="Map showing the garage location"></iframe>
        </div>
      </div>
    </section>
  );
}
