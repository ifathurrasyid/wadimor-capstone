function pageOptions(query) {
  const page = Number(query.page ?? 1);
  const pageSize = Number(query.pageSize ?? 20);
  if (!Number.isSafeInteger(page) || page < 1 || !Number.isInteger(pageSize) || pageSize < 1 || pageSize > 100) {
    throw Object.assign(new Error('Halaman tidak valid; ukuran halaman harus 1-100.'), { status: 400 });
  }
  return { page, pageSize };
}
async function paginatedQuery(pool, query, from, params, select, order) {
  const { page: requested, pageSize } = pageOptions(query);
  const count = await pool.query(`SELECT COUNT(*)::int AS total ${from}`, params);
  const total = count.rows[0].total;
  const page = Math.min(requested, Math.max(1, Math.ceil(total / pageSize)));
  const result = await pool.query(`SELECT ${select} ${from} ORDER BY ${order} LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
    [...params, pageSize, (page - 1) * pageSize]);
  return { items: result.rows, total, page, pageSize };
}
module.exports = { paginatedQuery };
