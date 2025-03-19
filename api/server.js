const express = require('express');
const cors = require('cors');
const stripe = require('stripe')(process.env.STRIPE_KEY_PK_LIVE);
const shippingRate = (process.env.flatShippingRate);

const app = express();

const corsOptions = {
  origin: ['http://localhost:4242', 'null', 'https://guccijenkins.github.io'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  methods: ['GET', 'POST'],
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

app.use(express.json()); // For parsing JSON request bodies
app.use(express.urlencoded({ extended: true })); // For parsing form data
app.use(express.static('public'));

const YOUR_DOMAIN = 'https://guccijenkins.github.io';

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

     shipping_options: [
        {
          shipping_rate: shippingRate,
        },
      ],

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
    success_url: `${YOUR_DOMAIN}/public/success.html`,
    cancel_url: `${YOUR_DOMAIN}/public/checkout.html`,
    
  });

  res.json({ url: session.url });
});

app.get('/', (req, res) => {
  res.send("Hello")
})

app.listen(4242, () => console.log('Running on port 4242'));
