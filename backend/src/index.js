const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', time: new Date(), app: 'Alfjr Academy API' });
});

// Routes
app.use('/api/auth',           require('./routes/auth'));
app.use('/api/dashboard',      require('./routes/dashboard'));
app.use('/api/parents',        require('./routes/parents'));
app.use('/api/students',       require('./routes/students'));
app.use('/api/teachers',       require('./routes/teachers'));
app.use('/api/supervisors',    require('./routes/supervisors'));
app.use('/api/assignments',    require('./routes/assignments'));
app.use('/api/sessions',       require('./routes/sessions'));
app.use('/api/invoices',       require('./routes/invoices'));
app.use('/api/payments',       require('./routes/payments'));
app.use('/api/payroll',        require('./routes/payroll'));
app.use('/api/exchange-rates', require('./routes/exchangeRates'));
app.use('/api/leads',          require('./routes/leads'));
app.use('/api/notifications',  require('./routes/notifications'));
app.use('/api/reports',        require('./routes/reports'));

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`✅ Alfjr Academy API running on port ${PORT}`);
});

module.exports = app;
