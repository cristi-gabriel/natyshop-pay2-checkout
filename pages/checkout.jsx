import { useRouter } from 'next/router'
import { useState } from 'react'

const ALLOW_COUNTRIES = ['RO','FR','DE','PL','HU','ES','IT','DK','CZ','BE']

export default function Checkout() {
  const { query } = useRouter()
  const lang = String(query.lang || 'auto')
  const currency = String(query.currency || 'EUR').toUpperCase()
  const country = String(query.country || 'RO').toUpperCase()

  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')

  const canShip = ALLOW_COUNTRIES.includes(country)

  async function onSubmit(e) {
    e.preventDefault()
    setErr('')
    setBusy(true)

    const fd = new FormData(e.currentTarget)
    const payload = {
      customer: {
        email: fd.get('email'),
        first_name: fd.get('first_name'),
        last_name: fd.get('last_name'),
        phone: fd.get('phone'),
        address: {
          line1: fd.get('address1'),
          city: fd.get('city'),
          postal_code: fd.get('postal_code'),
          country
        }
      },
      // TODO: înlocuiește cu items reale din coș (Storefront API / localStorage)
      line_items: [
        {
          price_data: {
            currency,
            unit_amount: 500, // 5.00 în moneda curentă (minor units)
            product_data: { name: 'Test product' }
          },
          quantity: 1
        }
      ]
    }

    // begin_checkout → GTM
    try {
      window.dataLayer = window.dataLayer || []
      window.dataLayer.push({ event: 'begin_checkout', user_data: { email: payload.customer.email } })
    } catch {}

    try {
      const qs = `?lang=${encodeURIComponent(lang)}&currency=${encodeURIComponent(currency)}&country=${encodeURIComponent(country)}`
      const res = await fetch(`/api/checkout${qs}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      const out = await res.json()
      if (out.url) location.href = out.url
      else {
        setErr(out.error || 'Eroare creare sesiune')
        setBusy(false)
      }
    } catch (e) {
      setErr(e.message || 'Eroare rețea')
      setBusy(false)
    }
  }

  return (
    <main className="mx-auto max-w-md p-4">
      <h1 className="text-2xl font-semibold mb-2">Checkout</h1>
      <p className="text-sm opacity-70 mb-4">Context: lang={lang}, currency={currency}, country={country}</p>

      {!canShip && (
        <div className="p-3 rounded bg-yellow-50 border border-yellow-200 text-sm mb-4">
          Momentan nu livrăm în {country}. Alege altă țară.
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-3">
        <input name="email" type="email" required placeholder="Email" className="w-full border p-3 rounded" />
        <div className="grid grid-cols-2 gap-3">
          <input name="first_name" required placeholder="Prenume" className="border p-3 rounded" />
          <input name="last_name" required placeholder="Nume" className="border p-3 rounded" />
        </div>
        <input name="phone" type="tel" required placeholder="Telefon" className="w-full border p-3 rounded" />
        <input name="address1" required placeholder="Adresă" className="w-full border p-3 rounded" />
        <div className="grid grid-cols-2 gap-3">
          <input name="city" required placeholder="Oraș" className="border p-3 rounded" />
          <input name="postal_code" required placeholder="Cod poștal" className="border p-3 rounded" />
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" required /> Accept termenii & condițiile
        </label>
        {err && <div className="text-sm text-red-600">{err}</div>}
        <button disabled=
