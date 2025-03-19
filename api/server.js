const stripe = require('stripe')('sk_test_51Ql16dAgLF2qD5NrppdWyqILJctHV7ejPJOivJNffp89IrVdc1D6k4LZVYpdoUh5oAAQMfs79Y66Ik4pJrtp9xCU00ZGkdmCYQ');

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', 'https://guccijenkins.github.io');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  // Handle OPTIONS request (preflight)
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only proceed for POST requests
  if (req.method === 'POST') {
    try {
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

      res.status(200).json({ url: session.url });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  } else {
    res.setHeader('Allow', 'POST');
    res.status(405).end('Method Not Allowed');
  }
}
