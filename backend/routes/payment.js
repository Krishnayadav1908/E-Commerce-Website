const express = require('express');
const router = express.Router();

router.post('/create-payment-intent', async (req, res) => {
  const { amount } = req.body;
  // Fake payment success response
  res.send({ clientSecret: 'fake_client_secret', success: true });
});

module.exports = router;