/**
 * Sends an order or waiter-call alert to all configured WhatsApp numbers.
 *
 * Uses website_endpoint POST if configured (truly silent server-side delivery
 * to all numbers). Otherwise opens wa.me deep links via window.open — the most
 * reliable browser method that actually delivers messages. The first number
 * opens immediately (user gesture); subsequent numbers open with a slight delay
 * to work around popup-blocker restrictions.
 */
export function sendSilently(restaurant, message, payload) {
  if (restaurant?.order_routing_mode === 'website' && restaurant?.website_endpoint) {
    fetch(restaurant.website_endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).catch(() => {});
  } else if (restaurant?.whatsapp_numbers?.length) {
    const encoded = encodeURIComponent(message);
    restaurant.whatsapp_numbers.forEach((num, i) => {
      const cleanNum = num.replace(/\D/g, '');
      const url = `https://wa.me/${cleanNum}?text=${encoded}`;
      if (i === 0) {
        window.open(url, '_blank', 'noopener,noreferrer');
      } else {
      setTimeout(() => window.open(url, '_blank', 'noopener,noreferrer'), i * 300);
      }
    });
  }
}