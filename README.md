# Laundry OMS

A lightweight order management system for a dry cleaning store. Built in ~6 hours using Node/Express on the backend and React + Vite on the frontend. No database — orders live in memory, which is fine for the scope of this assignment.

---

## Setup

You need Node.js 18+ installed.

```bash
# Clone the repo
git clone https://github.com/YOUR_USERNAME/laundry-oms.git
cd laundry-oms
```

### Start the backend

```bash
cd backend
npm install
npm run dev       # starts on http://localhost:3001
```

### Start the frontend (separate terminal)

```bash
cd frontend
npm install
npm run dev       # starts on http://localhost:3000
```

Open `http://localhost:3000` in your browser. The frontend proxies `/api` to port 3001 automatically (configured in `vite.config.js`).

### Run tests

```bash
cd backend
npm test
```

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Server health check |
| GET | `/api/dashboard` | Totals: orders, revenue, status counts |
| POST | `/api/orders` | Create a new order |
| GET | `/api/orders` | List orders (supports filters) |
| GET | `/api/orders/:id` | Get a single order |
| PATCH | `/api/orders/:id/status` | Update order status |

### Query params for GET /api/orders

- `status` — one of: `RECEIVED`, `PROCESSING`, `READY`, `DELIVERED`
- `search` — matches customer name, phone, or order ID
- `garmentType` — e.g. `saree`, `shirt`

### Create order payload

```json
{
  "customerName": "Priya Sharma",
  "phone": "9876543210",
  "garments": [
    { "type": "shirt", "quantity": 3 },
    { "type": "saree", "quantity": 1 }
  ]
}
```

Valid garment types: `shirt`, `pants`, `saree`, `jacket`, `kurta`, `bedsheet`, `blanket`

### Update status payload

```json
{ "status": "PROCESSING" }
```

Valid values: `RECEIVED` → `PROCESSING` → `READY` → `DELIVERED`

---

## Features Implemented

**Core**
- Create order with customer details and multiple garments
- Auto-calculated bill (per-item pricing × quantity)
- Unique order ID generated on creation (format: `LC-XXXXXXXX`)
- Estimated delivery date (3 days from order creation)
- Status management: RECEIVED, PROCESSING, READY, DELIVERED
- List all orders with filters (status, name/phone/ID search, garment type)
- Dashboard: total orders, revenue (delivered orders only), count per status

**Frontend**
- React + Vite, no external UI library
- Three views: Dashboard, Orders list, Create order
- Inline status update from the orders list
- Form validation with error messages from the API

**Tests**
- Jest + Supertest
- Covers: create, list, filter, status update, dashboard, edge cases

**Postman collection** is in `/docs/LaundryOMS.postman_collection.json`

---

## Project Structure

```
laundry-oms/
├── backend/
│   ├── src/
│   │   ├── app.js                  # Express setup, middleware, error handler
│   │   ├── index.js                # Server boot
│   │   ├── controllers/
│   │   │   └── orderController.js  # All business logic
│   │   ├── models/
│   │   │   └── orderStore.js       # In-memory data layer
│   │   ├── routes/
│   │   │   └── orderRoutes.js
│   │   └── utils/
│   │       └── config.js           # Prices, valid statuses
│   └── tests/
│       └── orders.test.js
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   ├── components/
│   │   │   └── StatusBadge.jsx
│   │   ├── hooks/
│   │   │   └── useOrders.js
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── OrdersList.jsx
│   │   │   └── CreateOrder.jsx
│   │   └── utils/
│   │       └── api.js              # All fetch calls in one place
│   ├── index.html
│   └── vite.config.js
└── docs/
    └── LaundryOMS.postman_collection.json
```

---

## AI Usage Report

### Tools used
- Claude (claude.ai) — primary tool throughout

### What I used AI for

**Scaffolding structure**: Asked Claude to lay out the folder structure and file responsibilities upfront. Saved time on decisions like "should validation live in the route or the controller" — AI suggested controller, I agreed.

**Boilerplate**: The Express app setup, CORS config, and error handler middleware were mostly AI-generated. I kept them as-is because they were clean and I didn't see a reason to rewrite working code.

**Test cases**: Asked Claude to write Jest tests for the order endpoints. The happy-path tests were good. The edge-case coverage (zero quantity, unknown garment type, invalid status filter) was actually solid — I added the dashboard revenue test myself after noticing it was missing.

**Sample prompts I used**
- *"Write an Express controller for creating a dry cleaning order. Validate customerName (min 2 chars), phone (10 digits), garments array. Compute total from a price map."*
- *"Write supertest tests for a PATCH /orders/:id/status endpoint. Cover happy path, 404 for unknown ID, and invalid status value."*
- *"Write a React custom hook useOrders that fetches from /api/orders, accepts a filters object, and exposes loading/error/refresh."*

### What AI got wrong / what I fixed

1. **Config file had a broken function**: The `isValidGarmentType` function in `config.js` returned a function instead of a boolean (a classic closure mistake). I caught it during testing and simplified it.

2. **Revenue calculation**: The first version of the dashboard counted revenue from *all* orders, not just delivered ones. That's wrong — you haven't earned money until the order is picked up. I corrected this.

3. **Test cleanup**: AI-generated tests didn't call `store._clear()` in `beforeEach`, so tests were bleeding state into each other and passing in isolation but failing together. I added the reset.

4. **Validation error format**: AI returned errors as a string. I changed the API to return `errors` as an array so the frontend can iterate and display them individually.

---

## Tradeoffs

**In-memory storage**: Data resets on server restart. Fine for this scope — swapping to MongoDB means changing only `orderStore.js`. I didn't add a DB because the spec said "Database OR in-memory" and I didn't want to spend time on setup that doesn't demonstrate thinking.

**No authentication**: Skipped. The spec listed it as a bonus. Would add JWT middleware on the routes if this were going to production.

**No status transition enforcement**: You can go from RECEIVED directly to DELIVERED. A real system would enforce RECEIVED → PROCESSING → READY → DELIVERED. Skipped to keep the controller simple.

**Estimated delivery is naive**: It's just `today + 3 days`, not business-day-aware. Easy to improve with a utility function.

**Frontend has no client-side validation**: Validation happens on the API and errors bubble back up. Duplication of validation logic in both places is annoying to maintain. Good enough for this scope.

---

## What I'd improve with more time

- Persist to SQLite (zero config, file-based, no server needed)
- Enforce status transitions
- Add a "delivery date override" field for rush orders
- Receipt/invoice print view per order
- Deploy to Railway (backend) + Vercel (frontend) — both have free tiers and take ~10 minutes
