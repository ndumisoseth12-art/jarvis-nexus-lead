// api/payfast-subscribe.js
// Jarvis Nexus — PayFast recurring subscription handler
// Deploy path: api/payfast-subscribe.js in your GitHub repo root
// Vercel auto-exposes this as /api/payfast-subscribe

const crypto = require('crypto');

module.exports = function handler(req, res) {

  // 1. Read tier + email from query string
  const tier  = (req.query.tier  || 'starter').toLowerCase().trim();
  const email = (req.query.email || '').trim();

  // 2. Tier to amount mapping (ZAR)
  const AMOUNTS = {
    starter:  '1990.00',
    operator: '3990.00',
  };

  if (!AMOUNTS[tier]) {
    res.status(400).send('Invalid tier: ' + tier);
    return;
  }

  const amount   = AMOUNTS[tier];
  const itemName = 'Jarvis Nexus ' + tier.charAt(0).toUpperCase() + tier.slice(1);

  // 3. Credentials
  const MERCHANT_ID  = '34985035';
  const MERCHANT_KEY = 'wzhdqeeo1ndjn';
  const PASSPHRASE   = 'LoveGod120304';

  // 4. URLs
  const BASE       = 'https://jarvis-nexus-lead-jkon.vercel.app';
  const RETURN_URL = BASE + '/thank-you';
  const CANCEL_URL = BASE + '/#pricing';
  const NOTIFY_URL = 'https://n8n-production-71d9.up.railway.app/webhook/payfast-ipn';

  // 5. Build payment data (order matters for PayFast signature)
  const today = new Date().toISOString().split('T')[0];

  const data = {
    merchant_id:       MERCHANT_ID,
    merchant_key:      MERCHANT_KEY,
    return_url:        RETURN_URL,
    cancel_url:        CANCEL_URL,
    notify_url:        NOTIFY_URL,
    email_address:     email,
    amount:            amount,
    item_name:         itemName,
    subscription_type: '1',
    billing_date:      today,
    recurring_amount:  amount,
    frequency:         '3',
    cycles:            '0',
  };

  // 6. Generate MD5 signature
  const paramString = Object.keys(data)
    .map(function (k) {
      return k + '=' + encodeURIComponent(data[k]).replace(/%20/g, '+');
    })
    .join('&')
    + '&passphrase=' + encodeURIComponent(PASSPHRASE).replace(/%20/g, '+');

  const signature = crypto
    .createHash('md5')
    .update(paramString)
    .digest('hex');

  data.signature = signature;

  // 7. Build PayFast redirect URL
  const queryString = Object.keys(data)
    .map(function (k) {
      return encodeURIComponent(k) + '=' + encodeURIComponent(data[k]);
    })
    .join('&');

  const PAYFAST_URL = 'https://www.payfast.co.za/eng/process?' + queryString;

  // 8. Redirect to PayFast
  res.writeHead(302, { Location: PAYFAST_URL });
  res.end();
};
