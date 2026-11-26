import { useState } from 'react';
import { getUser, logout } from '../api';
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

  function handleLogout() {
    logout();
    setUser(null);
  }

  // "Book a visit": a visitor must log in first, a client books from his page,
  // the owner goes to the appointments he has to answer.
  let bookLink = '/login';
  if (user && user.role === 'client') bookLink = '/client';
  if (user && user.role === 'owner') bookLink = '/owner/appointments';

  return (
    <div className="home">
      <HomeNavbar name={garage.name} accent={garage.accent} user={user} onLogout={handleLogout} />
      <main>
        <Hero slides={slides} bookLink={bookLink} />
        <Services />
        <About steps={steps} />
        <Location garage={garage} hours={hours} />
      </main>
      <HomeFooter garage={garage} />
    </div>
  );
}
