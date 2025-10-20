import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-06-20',
});

export default async function handler(req, res) {
  try {
    if (req.method === 'POST') {
      const { items = [], customer = {} } = req.body || {};
      const line_items = items.map(i => ({
        price_data: {
          currency: (i.currency || 'ron').toLowerCase(),
          unit_amount: Math.round(i.amount),
          product_data: { name: i.name || 'Produs' }
        },
        quantity: i.quantity || 1
      }));

      const session = await stripe.checkout.sessions.create({
        mode: 'payment',
        line_items,
        customer_email: customer.email || undefined,
        success_url: `${req.headers.origin}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${req.headers.origin}/`,
        metadata: {
          ns_customer_phone: customer.phone || '',
          ns_first_name: customer.first_name || '',
          ns_last_name: customer.last_name || ''
        }
      });
      return res.status(200).json({ id: session.id, url: session.url });
    }
    if (req.method === 'GET') {
      const sid = req.query.session_id;
      if (!sid) return res.status(400).json({ error: 'missing session_id' });
      const session = await stripe.checkout.sessions.retrieve(sid, {
        expand: ['line_items.data.price.product']
      });
      return res.status(200).json({
        id: session.id,
        amount_total: session.amount_total,
        currency: session.currency,
        customer_details: session.customer_details,
        payment_intent: session.payment_intent,
        line_items: (session.line_items?.data || []).map(li => ({
          quantity: li.quantity,
          description: li.description,
          amount_total: li.amount_total,
          price: { id: li.price?.id, product: li.price?.product?.id }
        }))
      });
    }
    return res.status(405).json({ error: 'method not allowed' });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'server error' });
  }
}