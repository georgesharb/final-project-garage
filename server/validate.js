// Input checks (Session 21). Each function returns an error message, or null if OK.

// name@domain.ending, the ending (com, net, lb...) needs at least 2 letters
const isEmail = (value) => /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/.test(value || '');
// phone: only numbers (spaces and a + at the start are allowed), 7 to 20 characters
// examples: 03 123 456   +961 3 123 456
const isPhone = (value) => /^\+?[0-9 ]{7,20}$/.test(String(value || '').trim());
export const isEmpty = (value) => value === undefined || value === null || String(value).trim() === '';

export function checkPassword(password) {
  if (!password || password.length < 6) return 'Password must be at least 6 characters';
  return null;
}

export function checkPhone(phone) {
  if (!isPhone(phone)) return 'Phone must contain only numbers (example: 03 123 456)';
  return null;
}

export function checkEmailPassword({ email, password }) {
  if (!isEmail(email)) return 'Invalid email (example: email@example.com)';
  return checkPassword(password);
}

// name, phone and email are all required
export function checkClient({ name, phone, email }) {
  if (isEmpty(name) || isEmpty(phone) || isEmpty(email)) return 'Name, phone and email are required';
  if (!isPhone(phone)) return 'Phone must contain only numbers (example: 03 123 456)';
  if (!isEmail(email)) return 'Invalid email (example: email@example.com)';
  return null;
}

// everything required except the plate number
export function checkCar({ brand, model, year, vin }) {
  if (isEmpty(brand) || isEmpty(model) || isEmpty(year) || isEmpty(vin)) {
    return 'Brand, model, year and VIN are required';
  }
  if (String(vin).trim().length !== 17) return 'VIN must be exactly 17 characters';
  const thisYear = new Date().getFullYear();
  if (isNaN(year) || year < 1950 || year > thisYear + 1) return 'Invalid year';
  return null;
}

// everything required
export function checkRepair({ description, cost, date, status }) {
  if (isEmpty(description) || isEmpty(cost) || isEmpty(date) || isEmpty(status)) {
    return 'Description, cost, date and status are required';
  }
  if (isNaN(cost) || Number(cost) < 0) return 'Cost must be a positive number';
  if (isNaN(Date.parse(date))) return 'Invalid date';
  if (!['in progress', 'done'].includes(status)) return 'Invalid status';
  return null;
}

// login: email, password and the account type are all needed
export function checkLogin({ email, password, role }) {
  if (isEmpty(email) || isEmpty(password)) return 'Email and password are required';
  if (!['client', 'owner'].includes(role)) return 'Choose Client or Owner';
  return null;
}

export function checkFutureDate(value) {
  if (!value || isNaN(Date.parse(value))) return 'Invalid date';
  if (new Date(value) < new Date()) return 'The date must be in the future';
  return null;
}
