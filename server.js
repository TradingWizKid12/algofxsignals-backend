const express = require('express');
const cors = require('cors');
const app = express();
// It's good practice to get fetch if you're using an older Node version,
// but Node 18+ has it built-in. Assuming you have a recent enough version.
// If not, you might need: const fetch = require('node-fetch');
const port = process.env.PORT || 3000; // Use PORT from environment

// Configure CORS to allow requests from your Vercel frontend + other domains
app.use(cors({
  origin: [
    'https://links.algofxsignals.com',
    'https://algofxsignals.com',
    'https://algofx-frontend.vercel.app' // <<< ADD THIS LINE
  ],
  credentials: true,
  optionsSuccessStatus: 200 // <<< ADD THIS for better compatibility
}));

app.use(express.json());

// Proxy endpoint for email subscription
app.post('/api/proxy/subscribe', async (req, res) => {
  try {
    console.log('Received subscription request:', req.body);

    // Ensure email is present
    if (!req.body.email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const googleScriptUrl = 'https://script.google.com/macros/s/AKfycbxsh8YsMocqqG6t9fE376HGFNdubZaFwP9KNbm8dffh-zBzsV3dgpQF6tFbayLdVCZa/exec';

    const response = await fetch(googleScriptUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      // Forward only the necessary data, e.g., just the email
      body: JSON.stringify({ email: req.body.email })
    });

    // Check if the Google Script response indicates success (you might need to adjust this based on what your script returns)
    // Google Scripts often return redirects or specific JSON structures on success/failure
    if (!response.ok && response.status !== 302) { // 302 Found is a common redirect status from Apps Script
        // Try to get error details if possible, but be careful exposing them
        let errorDetails = 'Google Script indicated an issue.';
        try {
            const errorData = await response.text(); // Use text() first in case it's not JSON
            console.error('Error response text from Google Apps Script:', errorData);
            // Attempt to parse as JSON if needed, but handle errors
             try {
               const jsonData = JSON.parse(errorData);
               errorDetails = jsonData.message || jsonData.error || errorDetails;
             } catch(parseError) { /* Ignore if not JSON */ }

        } catch(e) { /* Ignore errors reading body */ }

        // Don't expose raw errors to the client unless intended
        return res.status(response.status).json({ error: 'Failed to subscribe via Google Script.' });
    }

    // If response IS ok or a redirect (assuming redirect means success)
    // It's often better to return your own success message rather than Google's raw response
    console.log('Successful response status from Google Apps Script:', response.status);
    // const data = await response.json(); // Careful, Apps Script might not return valid JSON on success/redirect
    // console.log('Response data from Google Apps Script:', data);
    res.status(200).json({ message: "Subscription request forwarded successfully." }); // Send your own success response

  } catch (error) {
    console.error('Error in proxy:', error);
    // Avoid sending detailed internal errors to the client
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Simple test endpoint
app.get('/', (req, res) => {
  res.json({ message: 'Backend server is running!' });
});

app.listen(port, '0.0.0.0', () => { // Listen on 0.0.0.0 for Render compatibility
  console.log(`Server running on port ${port}`);
});