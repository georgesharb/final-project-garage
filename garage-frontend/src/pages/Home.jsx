import { useEffect, useState } from 'react';
import { api, getUser, logout } from '../api';
import { garage, slides, steps, hours } from '../homeData';
import HomeNavbar from '../components/home/HomeNavbar';
import Hero from '../components/home/Hero';
import Services from '../components/home/Services';
import About from '../components/home/About';
import Location from '../components/home/Location';
import HomeFooter from '../components/home/HomeFooter';
import '../home.css';

// The public main page. Everyone can see it, logged in or not.
export default function Home() {
  const [user, setUser] = useState(getUser()); // null if not logged in
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Load the services from the backend when the page opens
  useEffect(() => {
    async function loadServices() {
      try {
        setServices(await api('/services'));
      } catch {
        setError('We could not load the services. Please try again later.');
      } finally {
        setLoading(false);
      }
    }
    loadServices();
  }, []);

  function handleLogout() {
    logout();
    setUser(null);
  }

  // "Book a visit" opens the appointments page. Visitors are sent to the login page first.
  const bookLink = user && user.role === 'owner' ? '/owner/appointments' : '/client/appointments';

  return (
    <div className="home">
      <HomeNavbar user={user} onLogout={handleLogout} />
      <main>
        <Hero slides={slides} phone={garage.phone} bookLink={bookLink} />
        <Services services={services} loading={loading} error={error} />
        <About steps={steps} />
        <Location garage={garage} hours={hours} />
      </main>
      <HomeFooter garage={garage} />
    </div>
  );
}
