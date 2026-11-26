import { useState } from 'react';
import { api, decodeVin } from '../../api';

const emptyForm = { brand: '', model: '', year: '', vin: '', plate_number: '' };

// The client can see and ADD cars (only the owner can edit or delete them)
export default function CarsSection({ cars, onCarAdded }) {
  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');
  const [checkingVin, setCheckingVin] = useState(false); // true while the VIN is being checked
  const [vinMessage, setVinMessage] = useState('');       // what the VIN decoder found

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      await api('/me/cars', 'POST', form);
      setForm(emptyForm);
      setShowForm(false);
      onCarAdded(); // ClientHome reloads the cars
    } catch (err) {
      setError(err.message);
    }
  }

  // "Fill from VIN": brand, model and year come from the free NHTSA API (through our backend)
  async function fillFromVin() {
    setError('');
    setVinMessage('');
    setCheckingVin(true);
    try {
      const car = await decodeVin(form.vin);
      setForm({ ...form, brand: car.brand, model: car.model, year: car.year || form.year });
      setVinMessage(`Found: ${car.brand} ${car.model} ${car.year || ''}` + (car.model ? '' : ' (add the model by hand)'));
    } catch (err) {
      setError(err.message);
    }
    setCheckingVin(false);
  }

  return (
    <section className="card">
      <h2>My cars</h2>

      {cars.length === 0 ? (
        <p className="muted">No cars yet. Add your car to book an appointment.</p>
      ) : (
        <div className="table-wrap">
          <table>
            <thead><tr><th>Car</th><th>Year</th><th>Plate</th><th>VIN</th></tr></thead>
            <tbody>
              {cars.map((car) => (
                <tr key={car.id}>
                  <td>{car.brand} {car.model}</td>
                  <td>{car.year}</td>
                  <td>{car.plate_number || '-'}</td>
                  <td>{car.vin}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!showForm ? (
        <button className="btn-light section-button" onClick={() => setShowForm(true)}>+ Add a car</button>
      ) : (
        <form className="form-grid section-form" onSubmit={handleSubmit}>
          <input aria-label="VIN (17 characters)" name="vin" placeholder="VIN (17 characters) *" minLength={17} maxLength={17} value={form.vin} onChange={handleChange} required />
          <button type="button" className="btn-light" onClick={fillFromVin} disabled={checkingVin || form.vin.trim().length !== 17}>
            {checkingVin ? 'Checking...' : 'Fill from VIN'}
          </button>
          {vinMessage && <p className="success" role="status">{vinMessage}</p>}
          {/* A VIN always has 17 characters: say how many are typed, so the user knows why the button is off */}
          {form.vin.trim().length > 0 && form.vin.trim().length !== 17 && (
            <p className="muted">A VIN has 17 characters: you typed {form.vin.trim().length}.</p>
          )}
          <input aria-label="Brand" name="brand" placeholder="Brand *" value={form.brand} onChange={handleChange} required />
          <input aria-label="Model" name="model" placeholder="Model *" value={form.model} onChange={handleChange} required />
          <input aria-label="Year" name="year" type="number" placeholder="Year *" value={form.year} onChange={handleChange} required />
          <input aria-label="Plate number" name="plate_number" placeholder="Plate number (optional)" value={form.plate_number} onChange={handleChange} />
          <div className="form-actions">
            <button type="submit">Add car</button>
            <button type="button" className="btn-light" onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </form>
      )}
      {error && <p className="error">{error}</p>}
    </section>
  );
}
