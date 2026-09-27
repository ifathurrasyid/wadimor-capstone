# UI/UX implementation and team handoff

## Current design

The interface uses forest green navigation, a warm neutral background, white data surfaces, restrained amber stock alerts, and Indonesian copy. Inventory summaries show real catalog counts and units, not invented sales. Status uses text as well as color. Product images are neutral letter placeholders until real photos are available.

Admin sign-in opens a dedicated dashboard with revenue, transaction count, low stock, seven-day sales, a daily table, and top products. Admin inventory has a stock alert, search and category filter, and a stock table. A stock-warning shortcut resets other filters so the relevant items are visible.

Customer catalog: shared search/category controls → product cards with prices and availability → quantity-controlled basket → in-store payment method → printable receipt. Unavailable products cannot be added. Checkout calculates prices on the server and reduces stock atomically. Admin and Customer now have separate sign-in pages and server-enforced roles. Customer registration is available; only local setup can create Admin accounts.

At narrow widths navigation moves above the page, summaries remain compact, the table scrolls horizontally, and the shopping list follows the catalog. Native buttons, labels, select elements, table headers, focus outlines, skip link, error alerts, and loading announcements establish accessibility basics.

## Figma work for the designer

Recreate reusable components rather than six disconnected screens: navigation, page heading, button variants, labeled input/select, KPI card, product row/card, stock badge, empty/error state, quantity selector, and receipt summary. Use 4/8-pixel spacing increments, minimum 16-pixel body copy for longer reading, and readable contrast. Validate the prototype's smaller table metadata at actual screen sizes. Plan at 1440, 768, and 390 pixels wide; test down to 320 pixels.

Design these next flows with the analyst before implementation:

1. Refine the implemented sign-in flows: show password, session-expired message, account recovery, and clear field errors. The role choice selects a sign-in page; it does not assign a role.
2. Admin inventory: add/edit product with field errors, stock adjustment with reason, archived products, confirmation for destructive actions.
3. Customer shopping: empty catalog/cart, unavailable item, quantity limit, price changed at checkout, login required, confirmation and receipt.
4. Cashier POS: quick barcode/search, keyboard-friendly cart, payment amount/change, double-submit prevention, print receipt.
5. History: date range, transaction detail, payment status, empty range, accessible receipt.
6. Extend the implemented analytics with date range, period comparison, and a chosen business timezone. It already has real totals and a table equivalent. Do not show profit until purchase costs exist.

## Tester acceptance checklist

- Admin signs in through /admin/login. Dashboard shows six products, 388 units, one low-stock item, zero transactions, and zero revenue for the original seed data.
- Tango Coklat shows Menipis; a zero-stock test fixture shows Habis and cannot be added.
- Case-insensitive search, category filter, and low-stock checkbox combine correctly; reset restores the list.
- The low-stock shortcut shows the complete low-stock result, regardless of previously selected category/search.
- A stopped/unreachable API displays a retryable error, never a blank page; recovery works after restarting it.
- A successful empty-array response shows an empty inventory message; a malformed payload shows an error.
- Adding a product cannot exceed its current loaded stock; minus reaches zero and removes it; totals match displayed prices.
- Customer signs in through /customer/login or registers. A successful payment clears the basket, creates one transaction, reduces stock once, and displays a receipt. Reload preserves the session but clears an unpaid basket.
- Customer cannot fetch /api/admin/analytics; Admin credentials cannot sign in through the Customer form. Logout revokes the session.
- Tab through sign-in, navigation, filters, refresh, cards, quantity controls. Focus remains visible; inputs and buttons have meaningful names.
- Check 320/390/768/1440-pixel widths. Only the inventory table should scroll horizontally, not the entire page.
- Verify contrast and 200% zoom, long product/category names, large prices, null category, and large stock counts.
- Check supported Chrome/Edge/Firefox and one mobile browser. Record browser, viewport, steps, expected/actual result, screenshot, and pass/fail.

## Team ownership and implementation order

| Owner | Immediate output |
|---|---|
| Coordinator | Milestones: inventory writes → atomic checkout → transaction history/analytics refinement → acceptance/presentation |
| Analyst | Permission matrix, checkout/refund rules, revised ERD and explicit cashier/customer distinction |
| Designer | Component library and complete happy/error/empty states for the flows above |
| Developer | Implement one tested vertical feature at a time; keep SQL migrations versioned |
| Tester/documentation | Run checklist, add role/concurrency cases with new features, capture real screens for slides/brochure |

A useful capstone demonstration is: admin signs in, adds stock with an audit reason, customer browses, cashier checks out, stock decreases once, receipt appears in history, and sales analytics reflect the transaction. Build and test that complete flow before adding cosmetic features.
