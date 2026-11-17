// DEMO ONLY: a fake backend that lives in the browser memory.
// It copies the real API's rules so the UI can be tried without SQL Server.
// It is used only when VITE_DEMO=true (npm run demo). Not part of the real app.

const db = {
  users: [
    { id: 1, email: 'owner@garage.com', password: 'owner123', role: 'owner' },
    { id: 2, email: 'client@garage.com', password: 'client123', role: 'client' }
  ],
  clients: [
    { id: 1, user_id: 2, name: 'Rami Haddad', phone: '03 123 456', email: 'client@garage.com', address: 'Beirut' },
    { id: 2, user_id: null, name: 'Maya Khoury', phone: '71 222 333', email: 'maya@mail.com', address: 'Jounieh' }
  ],
  cars: [
    { id: 1, client_id: 1, brand: 'Toyota', model: 'Corolla', year: 2018, vin: 'JT2BF22K1W0123456', plate_number: 'B 123456' },
    { id: 2, client_id: 2, brand: 'Kia', model: 'Picanto', year: 2020, vin: 'KNABX512BLT654321', plate_number: 'M 778899' }
  ],
  repairs: [
    { id: 1, car_id: 1, client_id: 1, repair_date: '2026-10-02', description: 'Oil change + filters', cost: 60, status: 'done' },
    { id: 2, car_id: 1, client_id: 1, repair_date: today(), description: 'Brake pads', cost: 120, status: 'done' },
    { id: 3, car_id: 2, client_id: 2, repair_date: today(), description: 'AC repair', cost: 200, status: 'in progress' }
  ],
  appointments: [
    { id: 1, client_id: 1, car_id: 1, appointment_date: '2026-11-20T10:00', proposed_date: null, note: 'Strange noise', status: 'pending', created_at: today() }
  ]
};

function today() {
  return new Date().toISOString().slice(0, 10);
}

let nextId = 100;
const fail = (message) => { throw new Error(message); };
const clientName = (id) => db.clients.find((c) => c.id == id)?.name;
const findCar = (id) => db.cars.find((c) => c.id == id);

function checkUnique(car, ignoreId) {
  const taken = db.cars.some((c) => c.id != ignoreId && (c.vin === car.vin || c.plate_number === car.plate_number));
  if (taken) fail('Already exists (email, VIN or plate is taken)');
}

export async function fakeServer(path, method, body = {}, token) {
  await new Promise((r) => setTimeout(r, 120)); // feel like a network call
  const [url, queryString] = path.split('?');
  const params = new URLSearchParams(queryString);
  const parts = url.split('/').filter(Boolean); // e.g. ['owner', 'cars', '3']
  const user = db.users.find((u) => 'demo-' + u.id === token);
  const me = user && db.clients.find((c) => c.user_id === user.id);

  /* ---------- auth ---------- */
  if (parts[0] === 'auth') {
    if (parts[1] === 'owner-exists') return { exists: db.users.some((u) => u.role === 'owner') };
    if (parts[1] === 'login') {
      const u = db.users.find((x) => x.email === body.email && x.password === body.password);
      if (!u) fail('Wrong email or password');
      return { token: 'demo-' + u.id, user: { id: u.id, email: u.email, role: u.role } };
    }
    if (parts[1] === 'register-owner') {
      if (db.users.some((u) => u.role === 'owner')) fail('Owner registration is closed');
      db.users.push({ id: nextId++, email: body.email, password: body.password, role: 'owner' });
      return { message: 'Owner account created' };
    }
    if (parts[1] === 'register') {
      if (db.users.some((u) => u.email === body.email)) fail('Already exists (email, VIN or plate is taken)');
      const u = { id: nextId++, email: body.email, password: body.password, role: 'client' };
      db.users.push(u);
      db.clients.push({ id: nextId++, user_id: u.id, name: body.name, phone: body.phone, email: body.email, address: null });
      return { message: 'Account created' };
    }
  }

  /* ---------- public services list (main page) ---------- */
  if (parts[0] === 'services') {
    return [
      { id: 1, name: 'Oil change', description: 'Engine oil and filter replacement' },
      { id: 2, name: 'Brakes', description: 'Pads, discs and brake fluid' },
      { id: 3, name: 'Diagnostics', description: 'Computer check of engine and sensors' },
      { id: 4, name: 'Air conditioning', description: 'Gas refill and AC repair' },
      { id: 5, name: 'Tires', description: 'Change, balancing and alignment' },
      { id: 6, name: 'General repair', description: 'Engine, gearbox and suspension work' }
    ];
  }

  if (!user) fail('Please log in');

  /* ---------- client (/me) ---------- */
  if (parts[0] === 'me') {
    if (user.role !== 'client') fail('Access denied');
    if (!parts[1]) {
      if (method === 'PUT') Object.assign(me, { name: body.name, phone: body.phone, address: body.address });
      return me;
    }
    if (parts[1] === 'cars') {
      const myCars = db.cars.filter((c) => c.client_id === me.id);
      if (method === 'GET') return myCars;
      if (method === 'POST') {
        checkUnique(body);
        const car = { ...body, id: nextId++, client_id: me.id };
        db.cars.push(car);
        return car;
      }
      const car = myCars.find((c) => c.id == parts[2]) || fail('Car not found');
      if (method === 'PUT') { checkUnique(body, car.id); return Object.assign(car, body); }
      if (method === 'DELETE') return deleteCar(car.id);
    }
    if (parts[1] === 'appointments') {
      if (method === 'GET') return withDetails(db.appointments.filter((a) => a.client_id === me.id));
      if (method === 'POST') {
        const car = findCar(body.car_id);
        if (!car || car.client_id !== me.id) fail('Choose one of your registered cars');
        const a = { id: nextId++, client_id: me.id, car_id: car.id, appointment_date: body.appointment_date, proposed_date: null, note: body.note, status: 'pending' };
        db.appointments.push(a);
        return a;
      }
      const a = db.appointments.find((x) => x.id == parts[2] && x.client_id === me.id && x.status === 'proposed') || fail('No proposal to answer');
      if (body.accept) { a.status = 'accepted'; a.appointment_date = a.proposed_date; } else { a.status = 'cancelled'; }
      return a;
    }
  }

  /* ---------- owner ---------- */
  if (parts[0] === 'owner') {
    if (user.role !== 'owner') fail('Access denied');
    const [, resource, id, action] = parts;

    if (resource === 'dashboard') {
      const month = today().slice(0, 7);
      return {
        total_clients: db.clients.length,
        total_cars: db.cars.length,
        cars_in_garage: db.repairs.filter((r) => r.status === 'in progress').length,
        pending_appointments: db.appointments.filter((a) => a.status === 'pending').length,
        income_this_month: db.repairs.filter((r) => r.status === 'done' && r.repair_date.startsWith(month)).reduce((s, r) => s + Number(r.cost), 0)
      };
    }

    if (resource === 'clients') {
      if (!id && method === 'GET') {
        const s = (params.get('search') || '').toLowerCase();
        return db.clients.filter((c) => [c.name, c.phone, c.email].some((v) => (v || '').toLowerCase().includes(s)));
      }
      if (method === 'POST') { const c = { ...body, id: nextId++, user_id: null }; db.clients.push(c); return c; }
      const client = db.clients.find((c) => c.id == id) || fail('Client not found');
      if (method === 'GET') {
        const repairs = withCar(db.repairs.filter((r) => r.client_id === client.id));
        return { client, cars: db.cars.filter((c) => c.client_id === client.id), repairs, total_spent: repairs.reduce((s, r) => s + Number(r.cost), 0) };
      }
      if (method === 'PUT') return Object.assign(client, body);
      if (method === 'DELETE') {
        if (db.cars.some((c) => c.client_id === client.id) || db.repairs.some((r) => r.client_id === client.id) || client.user_id) {
          fail('Invalid link, or it is still used elsewhere (delete its cars/repairs first)');
        }
        db.clients = db.clients.filter((c) => c !== client);
        return { message: 'Client deleted' };
      }
    }

    if (resource === 'cars') {
      if (id === 'search') {
        const q = params.get('q');
        const car = db.cars.find((c) => c.plate_number === q || c.vin === q) || fail('No car found');
        const owner = db.clients.find((c) => c.id == car.client_id);
        return { car: { ...car, client_name: owner.name, client_phone: owner.phone }, repairs: db.repairs.filter((r) => r.car_id === car.id) };
      }
      if (!id && method === 'GET') return db.cars.map((c) => ({ ...c, client_name: clientName(c.client_id) }));
      if (method === 'POST') { checkUnique(body); const car = { ...body, id: nextId++, client_id: Number(body.client_id) }; db.cars.push(car); return car; }
      const car = findCar(id) || fail('Car not found');
      if (method === 'PUT') { checkUnique(body, car.id); return Object.assign(car, body, { client_id: Number(body.client_id) }); }
      if (method === 'DELETE') return deleteCar(car.id);
    }

    if (resource === 'repairs') {
      if (!id && method === 'GET') {
        const status = params.get('status');
        return withCar(db.repairs.filter((r) => !status || r.status === status));
      }
      if (method === 'POST') {
        const car = findCar(body.car_id) || fail('Car not found');
        const r = { id: nextId++, car_id: car.id, client_id: car.client_id, description: body.description, cost: Number(body.cost || 0), repair_date: body.repair_date || today(), status: body.status || 'in progress' };
        db.repairs.push(r);
        return r;
      }
      const repair = db.repairs.find((r) => r.id == id) || fail('Repair not found');
      if (method === 'PUT') return Object.assign(repair, { description: body.description, cost: Number(body.cost || 0), repair_date: body.repair_date || repair.repair_date, status: body.status || repair.status });
      if (method === 'DELETE') { db.repairs = db.repairs.filter((r) => r !== repair); return { message: 'Repair deleted' }; }
    }

    if (resource === 'appointments') {
      if (!id) {
        const status = params.get('status');
        return withDetails(db.appointments.filter((a) => !status || a.status === status));
      }
      const a = db.appointments.find((x) => x.id == id) || fail('Appointment not found');
      if (action === 'propose' && !body.proposed_date) fail('Proposed date is required');
      a.status = { accept: 'accepted', reject: 'rejected', propose: 'proposed' }[action];
      a.proposed_date = action === 'propose' ? body.proposed_date : null;
      return a;
    }
  }

  fail('Route not found');
}

function deleteCar(id) {
  if (db.repairs.some((r) => r.car_id === id) || db.appointments.some((a) => a.car_id === id)) {
    fail('Invalid link, or it is still used elsewhere (delete its cars/repairs first)');
  }
  db.cars = db.cars.filter((c) => c.id !== id);
  return { message: 'Car deleted' };
}

function withCar(repairs) {
  return repairs.map((r) => {
    const car = findCar(r.car_id) || {};
    return { ...r, brand: car.brand, model: car.model, plate_number: car.plate_number, client_name: clientName(r.client_id) };
  });
}

function withDetails(appointments) {
  return appointments.map((a) => {
    const car = findCar(a.car_id) || {};
    const client = db.clients.find((c) => c.id === a.client_id) || {};
    return { ...a, brand: car.brand, model: car.model, plate_number: car.plate_number, client_name: client.name, client_phone: client.phone };
  });
}
