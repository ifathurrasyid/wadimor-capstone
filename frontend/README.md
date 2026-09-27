# WADIMOR frontend

React + Vite with Tailwind CSS v4. See [project setup](../README.md), [audit](../docs/AUDIT.md), and [UI/UX handoff](../docs/UI-UX.md).

Run `npm.cmd run dev` from this directory, or `npm.cmd --prefix frontend run dev` from the project root. The API must run on port 5000. Admin and Customer have separate sign-in pages and protected views. The Admin dashboard uses transaction and inventory data from PostgreSQL. Customers can build a basket, complete an in-store payment, view a printable receipt, and review receipt history. Delivery is outside the project scope.
