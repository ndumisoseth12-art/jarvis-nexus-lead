// api/payfast-subscribe.js
const crypto = require('crypto');

module.exports = function handler(req, res) {

  // 1. Read tier + email from the URL query string
  const tier  = req.query.tier  || 'starter';
  const email = req.query.email || '';

  // 2. Map tier to amount
  const amounts = {
    starter:  '1990.00',
    operator: '3990.00',
  };
  const amount = amounts[tier] || '1990.00';

  // 3. Your PayFast credentials (I'll fill these from what you paste)
  const MERCHANT_ID  = 'YOUR_MERCHANT_ID';
  const MERCHANT_KEY = 'YOUR_MERCHANT_KEY';
  const PASSPHRASE   = 'YOUR_PASSPHRASE'; // delete this line if you have no passphrase

  // 4. Build the payment data object
  const data = {
    merchant_id:   MERCHANT_ID,
    merchant_key:  MERCHANT_KEY,
    return_url:    'https://jarvis-nexus-lead-jkon.vercel.app/thank-you',
    cancel_url:    'https://jarvis-nexus-lead-jkon.vercel.app/#pricing',
    notify_url:    'https://n8n-production-71d9.up.railway.app/webhook/payfast-ipn',
    email_address: email,
    amount:        amount,
    item_name:     'Jarvis Nexus ' + tier.charAt(0).toUpperCase() + tier.slice(1),
    subscription_type: '1',      // recurring
    billing_date:  new Date().toISOString().split('T')[0], // today
    recurring_amount: amount,
    frequency:     '3',          // monthly
    cycles:        '0',          // indefinite
  };

  // 5. Generate MD5 signature
  const paramString = Object.keys(data)
    .map(k => k + '=' + encodeURIComponent(data[k]).replace(/%20/g, '+'))
    .join('&')
    + (PASSPHRASE ? '&passphrase=' + encodeURIComponent(PASSPHRASE) : '');

  data.signature = crypto
    .createHash('md5')
    .update(paramString)
    .digest('hex');

  // 6. Build PayFast URL and redirect
  const query = Object.keys(data)
    .map(k => k + '=' + encodeURIComponent(data[k]))
    .join('&');

  res.redirect(302, 'https://www.payfast.co.za/eng/process?' + query);
};
