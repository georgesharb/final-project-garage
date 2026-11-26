// Fixed content of the main page. Change the garage info here, in one place.

export const garage = {
  name: 'GTA',            // shown as "GTA V" (the V in gold)
  accent: 'V',
  phone: '+961 1 234 567',
  email: 'contact@gtavgarage.test',
  address: 'Corniche El Nahr Street, near the Beirut River, Beirut, Lebanon',
  latitude: 33.8879, // Corniche El Nahr, Beirut (for the Google Maps link)
  longitude: 35.5324,
};

// the three slides of the hero: only the text changes
export const slides = [
  {
    id: 'care',
    title: 'Precision care for the car you love.',
    text: 'Expert repairs and maintenance, done with care, and a clear price before we start.',
  },
  {
    id: 'history',
    title: 'Every repair, kept on the record.',
    text: 'Log in to see the full repair history of your car, any time you need it.',
  },
  {
    id: 'booking',
    title: 'Book your visit in a minute.',
    text: 'Ask for an appointment online. We confirm it or propose another date.',
  },
];

export const steps = [
  { id: 'signup', title: 'Create your account', text: 'Sign up in one minute with your name, phone and email.' },
  { id: 'book', title: 'Book a visit', text: 'Add your car and ask for an appointment online.' },
  { id: 'follow', title: 'Follow every repair', text: 'Log in any time to see what was done and what it cost.' },
];

export const hours = [
  { id: 'week', days: 'Monday to Friday', time: '8:00 - 18:00' },
  { id: 'sat', days: 'Saturday', time: '8:00 - 14:00' },
  { id: 'sun', days: 'Sunday', time: 'Closed' },
];

// The services: a fixed list written here (no API call, no database table).
// Used on the main page and in the client's "Book an appointment" dropdown.
export const services = [
  { id: 1, name: 'Oil change', description: 'Engine oil and filter replacement' },
  { id: 2, name: 'Brakes', description: 'Pads, discs and brake fluid' },
  { id: 3, name: 'Diagnostics', description: 'Computer check of engine and sensors' },
  { id: 4, name: 'Air conditioning', description: 'Gas refill and AC repair' },
  { id: 5, name: 'Tires', description: 'Change, balancing and alignment' },
  { id: 6, name: 'General repair', description: 'Engine, gearbox and suspension work' },
];
