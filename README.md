# NatyShop – pay2.natyshop.com (Stripe Checkout + GTM/GA4/Ads)

## 1) Deploy (Vercel)
- Creează proiectul în Vercel (Next.js).
- Setează Environment Variables:
  - STRIPE_SECRET_KEY
  - STRIPE_WEBHOOK_SECRET
  - NEXT_PUBLIC_GTM_ID (GTM-WPM8BGTB)
  - NEXT_PUBLIC_STAPE_URL (https://stape1.natyshop.com)
  - (opțional) SHOPIFY_ADMIN_API_BASE / SHOPIFY_ADMIN_ACCESS_TOKEN
- Deploy (vei primi un *.vercel.app).

## 2) Domeniu (Namecheap → Vercel)
- Namecheap DNS → CNAME:
  Host: pay2
  Value: cname.vercel-dns.com
- În Vercel → Project → Settings → Domains → Add `pay2.natyshop.com`

## 3) Stripe
- Dashboard → Developers → API keys → STRIPE_SECRET_KEY
- Webhooks → Add endpoint: https://pay2.natyshop.com/api/webhook
  → select „checkout.session.completed”
  → STRIPE_WEBHOOK_SECRET în Vercel env

## 4) Test
- Accesează https://pay2.natyshop.com
- Click „Plătește cu Stripe” → finalizează o plată de test
- /success?session_id=... → face push în dataLayer:
  event: 'purchase' + user_data + items

## 5) GTM / GA4 / Ads
- GTM injectat prin NEXT_PUBLIC_GTM_ID
- Success page împinge 'purchase' (user_data + eventModel).
- În GTM Web, setează transport_url = NEXT_PUBLIC_STAPE_URL pentru GA4 server-side.

## 6) Shopify (opțional)
- /api/webhook.js: exemplu comentat de creare comandă.