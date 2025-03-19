// This is your test secret API key.
const express = require('express');
const cors = require('cors');
const stripe = require('stripe')('sk_test_51Ql16dAgLF2qD5NrppdWyqILJctHV7ejPJOivJNffp89IrVdc1D6k4LZVYpdoUh5oAAQMfs79Y66Ik4pJrtp9xCU00ZGkdmCYQ');

const app = express();

app.use((req, res, next) => {
  console.log('Incoming request from:', req.headers.origin); // Log origin
  res.setHeader('Access-Control-Allow-Origin', 'https://guccijenkins.github.io/public'); // Allow only your frontend
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS'); // Allowed methods
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type'); // Allowed headers
  res.setHeader('Access-Control-Allow-Credentials', 'true'); // Allow credentials
  next();
});

const corsOptions = {
  origin: 'https://guccijenkins.github.io/public',
  methods: ['GET', 'POST'],
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // FIXED: Handle preflight requests

app.use(express.json()); // For parsing JSON request bodies
app.use(express.urlencoded({ extended: true })); // For parsing form data

app.post('/create-checkout-session', async (req, res) => {


    // Extract priceIds from the request body
    const priceIds = req.body.priceIds || [];
    
    // Check if we have any price IDs
    if (!priceIds.length) {
      return res.status(400).json({ error: 'No price IDs provided' });
    }

  const taxRate = await stripe.taxRates.create({
    display_name: 'US Sales Tax',
    inclusive: false,
    percentage: 7.25,
    country: 'US',
    
  });

  const session = await stripe.checkout.sessions.create({
    billing_address_collection: 'auto',
    shipping_address_collection: {
      allowed_countries: ['US', 'CA'],
    },

    line_items: priceIds.map(priceId => ({
      price: priceId,
      quantity: 1,
      tax_rates: [taxRate.id],
      adjustable_quantity: {
        enabled: true,
        minimum: 1,
        maximum: 99,
      },
    })),

    mode: 'payment',
    success_url: `https://guccijenkins.github.io/success.html`,
    cancel_url: `https://guccijenkins.github.io/cancel.html`,
  });

  res.json({ url: session.url });
});

app.listen(4242, () => console.log('Running on port 4242'));
