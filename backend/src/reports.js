const TIME_ZONE = 'Asia/Jakarta';
function validDate(value) {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)
    && Number(value.slice(0, 4)) >= 1900 && Number(value.slice(0, 4)) <= 9998
    && Number.isFinite(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value;
}
function shiftDate(value, days) { const date = new Date(value); date.setUTCDate(date.getUTCDate() + days); return date.toISOString().slice(0, 10); }
function reportRange(query, now = new Date()) {
  const today = new Intl.DateTimeFormat('en-CA', { timeZone: TIME_ZONE, year: 'numeric', month: '2-digit', day: '2-digit' }).format(now);
  const period = query.period || 'all';
  let start = null, end = shiftDate(today, 1), previousStart = null, bucket = 'day';
  if (period === 'today') start = today;
  else if (period === 'week') start = shiftDate(today, -6);
  else if (period === 'month') start = today.slice(0, 7) + '-01';
  else if (period === 'selectedMonth') {
    if (!/^\d{4}-\d{2}$/.test(query.month || '') || !validDate(query.month + '-01')) throw Object.assign(new Error('Bulan tidak valid.'), { status: 400 });
    start = query.month + '-01';
    const next = new Date(start); next.setUTCMonth(next.getUTCMonth() + 1); end = next.toISOString().slice(0, 10);
    const previous = new Date(start); previous.setUTCMonth(previous.getUTCMonth() - 1); previousStart = previous.toISOString().slice(0, 10);
  } else if (period === 'year') {
    if (!/^\d{4}$/.test(query.year || '') || !validDate(query.year + '-01-01')) throw Object.assign(new Error('Tahun tidak valid.'), { status: 400 });
    start = query.year + '-01-01'; end = `${Number(query.year) + 1}-01-01`; previousStart = `${Number(query.year) - 1}-01-01`; bucket = 'month';
  } else if (period === 'all') bucket = 'month';
  else throw Object.assign(new Error('Periode tidak valid.'), { status: 400 });
  if (start && !previousStart) previousStart = shiftDate(start, -(Date.parse(end) - Date.parse(start)) / 86400000);
  const chartStart = start || `${Number(today.slice(0, 4)) - 1}-${today.slice(5, 7)}-01`;
  return { period, start, end, previousStart, bucket, chartStart, timeZone: TIME_ZONE };
}
async function salesReport(pool, query) {
  const range = reportRange(query);
  const params = [range.start, range.end, range.previousStart];
  const bounds = `t.payment_status = 'paid' AND ($1::date IS NULL OR t.created_at >= ($1::date::timestamp AT TIME ZONE 'Asia/Jakarta')) AND t.created_at < ($2::date::timestamp AT TIME ZONE 'Asia/Jakarta')`;
  const [totals, topProducts, series] = await Promise.all([
    pool.query(`WITH sales AS (
      SELECT t.id, t.created_at, td.subtotal, td.quantity, td.cost_at_transaction,
        ($1::date IS NULL OR t.created_at >= ($1::date::timestamp AT TIME ZONE 'Asia/Jakarta')) AS current
      FROM transactions t JOIN transaction_details td ON td.transaction_id = t.id
      WHERE t.payment_status = 'paid' AND ($3::date IS NULL OR t.created_at >= ($3::date::timestamp AT TIME ZONE 'Asia/Jakarta'))
        AND t.created_at < ($2::date::timestamp AT TIME ZONE 'Asia/Jakarta')
    ) SELECT current, COALESCE(SUM(subtotal),0) AS omset, COALESCE(SUM(quantity * cost_at_transaction),0) AS hpp,
      COALESCE(SUM(subtotal - quantity * cost_at_transaction),0) AS laba_kotor,
      COUNT(DISTINCT id) AS total_orders, COALESCE(SUM(quantity),0) AS units_sold FROM sales GROUP BY current`, params),
    pool.query(`SELECT p.name, SUM(td.quantity)::int AS units_sold, SUM(td.subtotal) AS revenue
      FROM transaction_details td JOIN transactions t ON t.id = td.transaction_id JOIN products p ON p.id = td.product_id
      WHERE ${bounds} GROUP BY p.id, p.name ORDER BY units_sold DESC, p.name LIMIT 5`, params.slice(0,2)),
    pool.query(`WITH daily AS (
      SELECT date_trunc($3, t.created_at AT TIME ZONE 'Asia/Jakarta') AS day, SUM(t.total_amount) AS revenue
      FROM transactions t WHERE t.payment_status = 'paid'
      AND t.created_at >= ($1::date::timestamp AT TIME ZONE 'Asia/Jakarta') AND t.created_at < ($2::date::timestamp AT TIME ZONE 'Asia/Jakarta')
      GROUP BY 1
    ) SELECT to_char(d.day, 'YYYY-MM-DD') AS day, COALESCE(daily.revenue,0) AS revenue
      FROM generate_series($1::date::timestamp, $2::date::timestamp - INTERVAL '1 day', ('1 ' || $3)::interval) d(day)
      LEFT JOIN daily USING(day) ORDER BY d.day`, [range.chartStart, range.end, range.bucket]),
  ]);
  const empty = { omset: 0, hpp: 0, laba_kotor: 0, total_orders: 0, units_sold: 0 };
  return { financials: totals.rows.find(row => row.current) || empty, previous: range.start ? totals.rows.find(row => !row.current) || empty : null, topProducts: topProducts.rows, series: series.rows, range };
}
module.exports = { validDate, reportRange, salesReport };
