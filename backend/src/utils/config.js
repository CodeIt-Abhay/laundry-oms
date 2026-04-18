// Prices in INR. Keeping this separate so the store owner
// can ask us to change rates without digging through business logic.

const ITEM_PRICES = {
  shirt: 80,
  pants: 100,
  saree: 200,
  jacket: 250,
  kurta: 120,
  bedsheet: 150,
  blanket: 300,
};

const VALID_STATUSES = ["RECEIVED", "PROCESSING", "READY", "DELIVERED"];

function getPrice(itemType) {
  return ITEM_PRICES[itemType.toLowerCase()] ?? null;
}

function isValidStatus(status) {
  return VALID_STATUSES.includes(status);
}

function isValidGarmentType(type) {
  return itemType => Object.keys(ITEM_PRICES).includes(itemType.toLowerCase());
}

module.exports = { ITEM_PRICES, VALID_STATUSES, getPrice, isValidStatus };
