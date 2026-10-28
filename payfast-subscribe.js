const crypto = require('crypto');

// Secrets live in Vercel → Project → Settings → Environment Variables.
// Never paste them into this file: the repo and site are publicly readable.
//   PAYFAST_MERCHANT_ID   (optional, defaults to the account ID below)
//   PAYFAST_MERCHANT_KEY  (required)
//   PAYFAST_PASSPHRASE    (required)
//   PAYFAST_NOTIFY_URL    (optional, defaults to the B13 PayFast Listener webhook)

module.exports = function handler(req, res) {

  const tier  = (req.query.tier  || 'starter').toLowerCase().trim();
  const email = (req.query.email || '').trim();

  const AMOUNTS = {
    starter:  '1990.00',
    operator: '3990.00',
  };

  if (!AMOUNTS[tier]) {
    res.status(400).send('Invalid tier: ' + tier);
    return;
  }

  const MERCHANT_ID  = process.env.PAYFAST_MERCHANT_ID || '34985035';
  const MERCHANT_KEY = process.env.PAYFAST_MERCHANT_KEY;
  const PASSPHRASE   = process.env.PAYFAST_PASSPHRASE;

  if (!MERCHANT_KEY || !PASSPHRASE) {
    res.status(500).send('Checkout is not configured yet. Please book a call instead: https://cal.com/seth-mokone-limbt0/30min');
    return;
  }

  const amount   = AMOUNTS[tier];
  const itemName = 'NSM ' + tier.charAt(0).toUpperCase() + tier.slice(1);

  const BASE       = 'https://jarvis-nexus-lead-jkon.vercel.app';
  const RETURN_URL = BASE + '/thank-you';
  const CANCEL_URL = BASE + '/#pricing';
  // B13 PayFast Listener listens on /webhook/payfast-itn
  const NOTIFY_URL = process.env.PAYFAST_NOTIFY_URL || 'https://n8n-production-71d9.up.railway.app/webhook/payfast-itn';

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
    recurring_amount:  amount,
    frequency:         '3',
    cycles:            '0',
  };

  var sigString = Object.keys(data)
    .map(function(k) {
      return k + '=' + encodeURIComponent(data[k].trim()).replace(/%20/g, '+');
    })
    .join('&')
    + '&passphrase=' + encodeURIComponent(PASSPHRASE.trim()).replace(/%20/g, '+');

  var signature = crypto.createHash('md5').update(sigString).digest('hex');

  var allParams = Object.assign({}, data, { signature: signature });

  var queryString = Object.keys(allParams)
    .map(function(k) {
      return encodeURIComponent(k) + '=' + encodeURIComponent(allParams[k]);
    })
    .join('&');

  res.writeHead(302, {
    Location: 'https://www.payfast.co.za/eng/process?' + queryString
  });
  res.end();
};
