const express = require('express');
const stripeRoutes = require('./routes/stripe');
const billingService = require('./services/billing');

const app = express();
app.use(express.json());

app.use('/api/stripe', stripeRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Demo app listening on port ${PORT}`);
});
