import Stripe from 'stripe'
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  try {
    const { line_items, customer = {} } = req.body || {}
    const origin = req.headers.origin
    const url = new URL(origin + req.url)
    const lang = url.searchParams.get('lang') || 'auto'
    const currency = (url.searchParams.get('currency') || 'EUR').toUpperCase()
    const country = (url.searchParams.get('country') || 'RO').toUpperCase()

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      locale: lang === 'auto' ? 'auto' : lang,
      currency,
      line_items,
      customer_email: customer.email || undefined,
      billing_address_collection: 'required',
      shipping_address_collection: { allowed_countries: ['RO','FR','DE','PL','HU','ES','IT','DK','CZ','BE'] },
      phone_number_collection: { enabled: true },
      automatic_tax: { enabled: true },
      metadata: {
        market: country,
        lang,
        ns_first_name: customer.first_name || '',
        ns_last_name:  customer.last_name  || '',
        ns_phone:      customer.phone      || ''
      },
      success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}&lang=${lang}`,
      cancel_url: `${origin}/checkout?cancelled=1&lang=${lang}`
    })

    res.status(200).json({ id: session.id, url: session.url })
  } catch (err) {
    console.error('[Stripe checkout] create error', err)
    res.status(500).json({ error: err.message })
  }
}
