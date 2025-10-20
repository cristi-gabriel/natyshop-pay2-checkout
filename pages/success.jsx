import { useEffect, useState } from 'react';

export default function Success() {
  const [session, setSession] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sid = params.get('session_id');
    if (!sid) return;
    fetch('/api/checkout?session_id=' + encodeURIComponent(sid))
      .then(r => r.json())
      .then(data => {
        setSession(data);
        const s = data || {};
        const amount_total = (s.amount_total || 0) / 100;
        const currency = (s.currency || 'ron').toUpperCase();
        const transaction_id = s.payment_intent || s.id || s.client_reference_id;
        const customer_email = s.customer_details?.email || '';
        const phone = s.customer_details?.phone || '';
        const addr = s.customer_details?.address || {};
        const nameParts = (s.customer_details?.name || '').split(' ');
        const first = nameParts.slice(0, -1).join(' ') || nameParts[0] || '';
        const last = nameParts.slice(-1)[0] || '';

        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({
          event: 'purchase',
          user_data: {
            email: customer_email,
            phone_number: phone,
            address: {
              country: addr.country || '',
              city: addr.city || '',
              region: addr.state || '',
              postal_code: addr.postal_code || '',
              street: [addr.line1, addr.line2].filter(Boolean).join(', ')
            },
            first_name: first,
            last_name: last
          },
          eventModel: {
            transaction_id: transaction_id,
            value: amount_total,
            currency: currency,
            items: (s.line_items || []).map((li, idx) => ({
              index: idx,
              item_id: (li.price?.product || li.price?.id || '') + '',
              item_name: (li.description || '') + '',
              item_brand: '',
              item_variant: '',
              price: (li.amount_total || 0) / 100,
              discount: 0,
              quantity: li.quantity || 1
            }))
          }
        });
      })
  }, []);

  return (
    <div className="wrap">
      <div className="card">
        <h1>Plata a reușit ✅</h1>
        <p>Mulțumim! Dacă ai GTM/GA4/Ads, evenimentul <code>purchase</code> a fost trimis acum în <code>dataLayer</code>.</p>
        <pre style={{whiteSpace:'pre-wrap'}}>{JSON.stringify(session, null, 2)}</pre>
      </div>
    </div>
  );
}