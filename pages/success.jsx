import Stripe from 'stripe'
import { useEffect } from 'react'

export async function getServerSideProps(ctx) {
  const { session_id } = ctx.query
  if (!session_id) return { notFound: true }
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
  const session = await stripe.checkout.sessions.retrieve(session_id, {
    expand: ['line_items', 'payment_intent']
  })
  return { props: { session } }
}

export default function Success({ session }) {
  useEffect(() => {
    if (!session) return
    const cd = session.customer_details || {}
    const addr = cd.address || {}
    const items = (session.line_items?.data || []).map((it, idx) => ({
      index: idx,
      item_id: it.price?.product || '',
      item_name: it.description || it.price?.nickname || 'Item',
      item_brand: 'Naty Shop',
      item_variant: '',
      price: (it.amount_total || 0) / 100,
      discount: 0,
      quantity: it.quantity || 1
    }))

    try {
      window.dataLayer = window.dataLayer || []
      window.dataLayer.push({
        event: 'purchase',
        user_data: {
          email: cd.email || '',
          phone_number: cd.phone || '',
          address: {
            country: addr.country || '',
            city: addr.city || '',
            region: addr.state || '',
            postal_code: addr.postal_code || '',
            street: addr.line1 || ''
          },
          first_name: session.metadata?.ns_first_name || (cd.name || '').split(' ')[0] || '',
          last_name:  session.metadata?.ns_last_name  || (cd.name || '').split(' ').slice(1).join(' ') || ''
        },
        eventModel: {
          transaction_id: session.payment_intent?.id || session.id,
          value: (session.amount_total || 0) / 100,
          currency: (session.currency || 'EUR').toUpperCase(),
          shipping: ((session.shipping_cost?.amount_total) || 0) / 100,
          items
        }
      })
    } catch {}

    const to = process.env.NEXT_PUBLIC_SUCCESS_REDIRECT_URL || 'https://natyshop.com/thank-you'
    const delayMs = Number(process.env.NEXT_PUBLIC_SUCCESS_REDIRECT_DELAY_MS || 1500)
    const t = setTimeout(() => { window.location.href = to }, delayMs)
    return () => clearTimeout(t)
  }, [session])

  return (
    <main style={{ padding: 24 }}>
      <h1>Plata a reușit ✅</h1>
      <p>Mulțumim! Vei fi redirecționat în câteva secunde…</p>
    </main>
  )
}
