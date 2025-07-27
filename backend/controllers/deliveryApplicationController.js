const { createDeliveryApplication } = require('../models/deliveryApplication');

async function submitApplication(req, res) {
  try {
    const { name, phone, email, vehicle, username, password } = req.body;
    if (!name || !phone || !email || !vehicle || !username || !password) {
      return res.status(400).json({ error: 'All fields are required.' });
    }
    const application = await createDeliveryApplication({ name, phone, email, vehicle, username, password });
    res.status(201).json(application);
  } catch (err) {
    console.error('Error submitting application:', err);
    res.status(500).json({ error: 'Failed to submit application.', details: err.message });
  }
}

module.exports = { submitApplication }; 