const express = require('express');

const PORT = process.env.PORT || 8080;

const app = express();

app.use(express.json());

app.get('/', (req, res) => {
  res.status(200).send("Welcome to our server!!!");
});

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}\nPress Ctrl+C to quit.`);
});

module.exports = app;
