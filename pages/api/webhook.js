import Stripe from 'stripe'
import { buffer } from 'micro'

// IMPORTANT: Next API route must allow raw body for Stripe signature verification
export const config = { api: { bodyParser: false } }

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  let event
  try {
    const sig = req.headers['stripe-signature']
    const buf = await buffer(req)
    event = stripe.webhooks.constructEvent(buf, sig, process.env.STRIPE_WEBHOOK_SECRET)
  } catch (err) {
    console.error('[Stripe webhook] signature error', err.message)
    return res.status(400).send(`Webhook Error: ${err.message}`)
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object
    // TODO (opțional): creează comanda în Shopify prin Admin API folosind session.id / client_reference_id
    // console.log('Paid session:', session.id)
  }

  res.json({ received: true })
}
