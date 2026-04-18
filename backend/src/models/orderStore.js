// Simple in-memory store.
// Using a plain object + array so there's no ORM overhead for a task this size.
// If this grows, swapping to MongoDB/SQLite means changing only this file.

const orders = [];

function getAll() {
  return orders;
}

function getById(id) {
  return orders.find((o) => o.id === id) || null;
}

function insert(order) {
  orders.push(order);
  return order;
}

function update(id, changes) {
  const idx = orders.findIndex((o) => o.id === id);
  if (idx === -1) return null;
  orders[idx] = { ...orders[idx], ...changes };
  return orders[idx];
}

function remove(id) {
  const idx = orders.findIndex((o) => o.id === id);
  if (idx === -1) return false;
  orders.splice(idx, 1);
  return true;
}

// Exposed for test resets only
function _clear() {
  orders.length = 0;
}

module.exports = { getAll, getById, insert, update, remove, _clear };
