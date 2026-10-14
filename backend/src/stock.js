async function stockContext(client, account, kind, reason, transactionId = null) {
  await client.query(`SELECT set_config('wadimor.actor_id', $1, true), set_config('wadimor.actor_name', $2, true),
    set_config('wadimor.kind', $3, true), set_config('wadimor.reason', $4, true), set_config('wadimor.transaction_id', $5, true)`,
  [String(account.id), account.display_name || account.username, kind, reason, transactionId == null ? '' : String(transactionId)]);
}
function cashPayment(value, total) {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < total || value > 9999999999.99 || Math.abs(value * 100 - Math.round(value * 100)) > 0.0001) {
    throw Object.assign(new Error('Uang diterima harus cukup dan maksimal dua angka desimal.'), { status: 400 });
  }
  return { cashTendered: value, cashChange: (Math.round(value * 100) - Math.round(total * 100)) / 100 };
}
module.exports = { stockContext, cashPayment };
