import { useState } from 'react';

export default function Home() {
  const [loading, setLoading] = useState(false);

  async function startCheckout(e) {
    e.preventDefault();
    setLoading(true);
    const payload = {
      items: [
        { name: 'Test product', amount: 500, currency: 'ron', quantity: 1 }
      ],
      customer: {
        email: 'client@example.com',
        phone: '+40700111222',
        address: {
          country: 'RO', city: 'Suceava', region: 'SV',
          postal_code: '720001', street: 'Str. Vasile Alecsandri 1'
        },
        first_name: 'Prenume', last_name: 'Nume'
      }
    };
    const res = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (data?.url) {
      window.location.href = data.url;
    } else {
      alert('Checkout session error.');
      setLoading(false);
    }
  }

  return (
    <div className="wrap">
      <div className="card">
        <h1>NatyShop – Demo Checkout (Stripe)</h1>
        <p>Acesta este un exemplu simplu. În producție, transmite coșul și datele clientului din Shopify → această pagină.</p>
        <button onClick={startCheckout} className="btn" disabled={loading}>
          {loading ? 'Se pregătește...' : 'Plătește cu Stripe'}
        </button>
        <hr/>
        <small>După plată, vei reveni pe <code>/success?session_id=...</code> unde GTM va primi dataLayer purchase.</small>
      </div>
    </div>
  );
}