const Subscriber = require('../models/subscriber.model');

async function addSubscriber(req, res) {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });
    const normalized = email.toLowerCase().trim();
    const existing = await Subscriber.findOne({ email: normalized });
    if (existing) return res.status(409).json({ message: 'Email already subscribed' });
    const sub = await Subscriber.create({ email: normalized });
    res.status(201).json({ message: 'Subscribed successfully', subscriber: { email: sub.email } });
  } catch (e) {
    res.status(500).json({ message: 'Failed to subscribe' });
  }
}

module.exports = { addSubscriber };