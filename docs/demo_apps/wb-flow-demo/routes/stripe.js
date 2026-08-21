const express = require('express');
const router = express.Router();

// Fake Stripe endpoint to be implemented by the demo plan
router.post('/checkout', (req, res) => {
  res.status(200).json({ url: 'https://checkout.stripe.fake' });
});

module.exports = router;
