// /api/vin/:vin  -> fills brand, model and year from a VIN, using a free public API:
// NHTSA vPIC (U.S. government): https://vpic.nhtsa.dot.gov/api/  (no key, no sign-up)
// The frontend calls OUR route, and our server calls NHTSA with fetch.
import express from 'express';

const router = express.Router();

// "TOYOTA" -> "Toyota", but short brands stay in capitals: "BMW", "KIA"
const nice = (text) =>
  text.length <= 3 ? text.toUpperCase() : text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();

// GET /api/vin/JT2BF22K1W0123456  -> { brand, model, year }
router.get('/:vin', async (req, res) => {
  const vin = req.params.vin.trim().toUpperCase();
  if (vin.length !== 17) {
    return res.status(400).json({ error: 'VIN must be exactly 17 characters' });
  }

  let data;
  try {
    const url = `https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVinValues/${vin}?format=json`;
    const response = await fetch(url, { signal: AbortSignal.timeout(5000) }); // give up after 5 s
    data = await response.json();
  } catch {
    return res.status(502).json({ error: 'The VIN service is not reachable. Fill in the fields by hand.' });
  }

  // The answer looks like: { Results: [ { Make: "TOYOTA", Model: "Corolla", ModelYear: "2018", ... } ] }
  const car = data.Results?.[0];
  if (!car || !car.Make) {
    // NHTSA is a U.S. database: it knows most cars sold in America, but not every European model
    return res.status(404).json({ error: 'This VIN is not in the free VIN database (it mostly knows cars sold in the USA). Fill in the fields by hand.' });
  }

  res.json({
    brand: nice(car.Make),
    model: car.Model || '',
    year: Number(car.ModelYear) || null
  });
});

export default router;
