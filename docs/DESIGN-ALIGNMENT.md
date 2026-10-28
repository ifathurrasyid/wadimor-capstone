# Prototype implementation checklist

Reference: [BEBE / WADIMOR public prototype](https://www.figma.com/proto/iNvq1h0CQovUysYPS7O8zC/BEBE?node-id=27-4&scaling=contain&content-scaling=fixed&page-id=0%3A1). Reviewed all six public frames. Colors were sampled from the rendered prototype; editable Figma source tokens and original photo exports were not available.

| Frame | Implemented behavior |
| --- | --- |
| Login (`8-8`) | Blue grocery artwork panel, rounded form, remember username, password recovery instructions, registration, and username login for all roles, as agreed by the team. Passwords are never remembered in local storage. |
| Dashboard (`27-4`) | Four colored totals, selectable 7/14/30-day sales line/area chart, top products with photos/units/revenue, inventory shortcut. |
| Inventory (`139-77`) | Search/category filter, product photos, prices/cost/stock/minimum/status, create/edit/delete, numbered pagination. Team-requested stock corrections and audit history remain available. |
| Cashier (`169-2`) | Owner and Cashier access, product search/category tabs, product quantities, cart, removal, totals, checkout, cash/change, receipt. |
| Transactions (`189-2`) | From/to date search, cashier name, item count, amount, transaction details, numbered pages. Payment status filters and pending payment processing remain available. |
| Sales reports (`190-245`) | Four colored sales/transaction/profit/units cards, percentage comparisons, month/year selection, bar chart, summary including historical cost of goods, top products. Quick Today/7 Days/This Month/All Time filters remain available. |

Palette: sidebar `#5686c6` to `#11429b`, page `#bfcff7`, cards blue `#86b1f2`, green `#86d7ae`, yellow `#e1d860`, violet `#b6b7f5`. Shared tokens and navigation apply to Owner, Cashier, and Customer, with a dark theme variant.

The prototype's net-income wording is displayed as **gross profit**, because this system does not record operating expenses. Metrics use real paid transactions and historical item costs, not the prototype's illustrative values. Product photos come from each product's uploaded image or image URL; products without a photo retain their initial placeholder. The existing grocery artwork is used on login because original Figma photo exports were not available.

Date filters include the entire selected start/end dates in **Asia/Jakarta (WIB)**. The seven-day range includes today and the previous six days. A selected month compares with the preceding calendar month; a selected year compares with the preceding calendar year. Quick today/week/month-to-date filters compare with the immediately preceding span of the same number of days. When previous sales are zero, the UI shows no comparison instead of an undefined percentage. All-time totals include all paid history through today; its chart shows the most recent 13 calendar months and has no percentage comparison.

The collapsed desktop sidebar is consistently 80 px wide, with the logo and toggle stacked and badges positioned separately from icons. At 760 px and below, navigation becomes a drawer with full labels, Escape/backdrop close, focus containment, and automatic close on navigation. Short desktop windows allow sidebar scrolling. Cards wrap according to available space; wide data tables scroll inside their own labeled areas, while chart bars and labels adapt to the available width. Report chart values also have an expandable table for keyboard and assistive-technology access.

Validation includes PostgreSQL integration tests for date boundaries, frontend lint/build, and browser checks across 320–1920 px for all owner routes, both sidebar states, phone navigation, cashier/customer layouts, and dark mode.
