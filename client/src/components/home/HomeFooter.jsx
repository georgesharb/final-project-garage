// Footer of the main page: the garage name, quick links and the contact info
// ("Get in touch" at the top of the page scrolls here: id="contact")
export default function HomeFooter({ garage }) {
  return (
    <footer className="footer" id="contact">
      <div className="footer-grid">
        <div>
          <p className="brand">{garage.name} <span>{garage.accent}</span></p>
          <p>Car repair and maintenance for all brands, with the full history of every repair online.</p>
        </div>

        <div>
          <h3>Explore</h3>
          <a href="#services">Services</a>
          <a href="#about">About us</a>
          <a href="#visit">Visit us</a>
        </div>

        <div>
          <h3>Contact</h3>
          <a href={`tel:${garage.phone}`}>{garage.phone}</a>
          <a href={`mailto:${garage.email}`}>{garage.email}</a>
        </div>

      </div>

      <p className="footer-bottom">© {new Date().getFullYear()} {garage.name} {garage.accent} Garage. All rights reserved.</p>
    </footer>
  );
}
