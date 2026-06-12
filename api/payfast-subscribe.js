const crypto = require('crypto');

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

  const amount   = AMOUNTS[tier];
  const itemName = 'Jarvis Nexus ' + tier.charAt(0).toUpperCase() + tier.slice(1);

  const MERCHANT_ID  = '34985035';
  const MERCHANT_KEY = 'wzhdqeeo1ndjn';
  const PASSPHRASE   = 'LoveGod120304';

  const BASE       = 'https://jarvis-nexus-lead-jkon.vercel.app';
  const RETURN_URL = BASE + '/thank-you';
  const CANCEL_URL = BASE + '/#pricing';
  const NOTIFY_URL = 'https://n8n-production-71d9.up.railway.app/webhook/payfast-ipn';

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
