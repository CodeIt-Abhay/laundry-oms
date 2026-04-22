const app = require("./app");

const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
  console.log(`Laundry OMS running on http://localhost:${PORT}`);
});
