export default function HomeFooter({ garage }) {
  return (
    <footer className="footer">
      <p className="brand">BlueLine <span>Garage</span></p>
      <p>{garage.address}</p>
      <p>
        <a href={`tel:${garage.phone}`}>{garage.phone}</a> - <a href={`mailto:${garage.email}`}>{garage.email}</a>
      </p>
    </footer>
  );
}
