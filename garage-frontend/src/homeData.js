// Fixed content of the main page. The services come from the API (GET /api/services).

export const garage = {
  phone: '+961 1 234 567',
  email: 'contact@bluelinegarage.test',
  address: 'USJ - ESIB, Campus des Sciences et Technologies, Mar Roukoz, Lebanon',
  latitude: 33.8655,
  longitude: 35.5643,
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
  { id: 'signup', title: 'Create your account', text: 'Sign up in one minute with your email.' },
  { id: 'book', title: 'Book a visit', text: 'Add your car and ask for an appointment online.' },
  { id: 'follow', title: 'Follow every repair', text: 'Log in any time to see what was done and what it cost.' },
];

export const hours = [
  { id: 'week', days: 'Monday to Friday', time: '8:00 - 18:00' },
  { id: 'sat', days: 'Saturday', time: '8:00 - 14:00' },
  { id: 'sun', days: 'Sunday', time: 'Closed' },
];
