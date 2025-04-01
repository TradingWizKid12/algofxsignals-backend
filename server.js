const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000;

// Configure CORS to allow requests from your domain
app.use(cors({
  origin: ['https://links.algofxsignals.com', 'https://algofxsignals.com'],
  credentials: true
}));

app.use(express.json());

// Proxy endpoint for email subscription
app.post('/api/proxy/subscribe', async (req, res) => {
  try {
    console.log('Received subscription request:', req.body);
    
    const response = await fetch('https://script.google.com/macros/s/AKfycbxsh8YsMocqqG6t9fE376HGFNdubZaFwP9KNbm8dffh-zBzsV3dgpQF6tFbayLdVCZa/exec', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(req.body)
    });
    
    const data = await response.json();
    console.log('Response from Google Apps Script:', data);
    res.json(data);
  } catch (error) {
    console.error('Error in proxy:', error);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
});

// Simple test endpoint
app.get('/', (req, res) => {
  res.json({ message: 'Backend server is running!' });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});