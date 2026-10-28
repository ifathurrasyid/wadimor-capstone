const paths = {
  dashboard: 'M3 3h7v7H3z M14 3h7v7h-7z M3 14h7v7H3z M14 14h7v7h-7z',
  inventory: 'M4 4h16v16H4z M4 9h16 M9 9v11 M15 9v11 M9 4v5 M15 4v5',
  orders: 'M7 3h10v18l-3-2-2 2-2-2-3 2z M10 7h4 M10 11h4 M10 15h3',
  reports: 'M4 3v17h17 M9 15v-4 M14 15V6 M19 15V9',
  warning: 'M12 3 2 21h20z M12 9v5 M12 17h.01',
  users: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2 M9 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8 M17 4a4 4 0 0 1 0 8 M22 21v-2a4 4 0 0 0-3-3.87',
  settings: 'M4 7h9 M17 7h3 M4 17h3 M11 17h9 M13 4v6 M7 14v6',
  store: 'M3 10h18l-2-7H5z M4 10v11h16V10 M9 21v-7h6v7',
  cashier: 'M5 3h14v8H5z M3 11h18v10H3z M7 16h4 M16 16h1 M16 18h1 M8 7h8',
  key: 'M15 3a6 6 0 1 0 0 12 6 6 0 0 0 0-12 M11 13 3 21 M3 21v-4 M3 21h4 M16 7h.01',
  trash: 'M3 6h18 M9 6V3h6v3 M5 6l1 15h12l1-15 M10 10v7 M14 10v7',
  moon: 'M21 13a9 9 0 0 1-10-10 9 9 0 1 0 10 10z',
  sun: 'M16 12a4 4 0 1 0-8 0 4 4 0 0 0 8 0 M12 2v2 M12 20v2 M2 12h2 M20 12h2 M5 5l1.5 1.5 M17.5 17.5 19 19 M5 19l1.5-1.5 M17.5 6.5 19 5',
  refresh: 'M20 7a9 9 0 0 0-15-1L2 9 M2 3v6h6 M4 17a9 9 0 0 0 15 1l3-3 M22 21v-6h-6',
  menu: 'M4 6h16 M4 12h16 M4 18h16',
  close: 'm6 6 12 12 M18 6 6 18',
  logout: 'M10 4H4v16h6 M9 12h12 M16 7l5 5-5 5',
  chevronLeft: 'm14 6-6 6 6 6',
  chevronRight: 'm10 6 6 6-6 6',
}

const navigation = { admin: 'dashboard', inventory: 'inventory', adminCashier: 'cashier', adminOrders: 'orders', adminReports: 'reports', lowStock: 'warning', staff: 'users', cashier: 'cashier', cashierOrders: 'orders', customer: 'store', myOrders: 'orders' }

export default function Icon({ name }) {
  const glyph = navigation[name] || (name.endsWith('Settings') ? 'settings' : name)
  return <svg className="icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false"><path d={paths[glyph] || paths.orders} /></svg>
}
