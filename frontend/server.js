// frontend/server.js
const express = require('express');
const path    = require('path');
const app     = express();
const PORT    = 3000;

// serve all static files (html/css/js/images)
app.use(express.static(path.join(__dirname)));

// fallback to index.html for SPA-like navigation
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () =>
  console.log(`📦 Frontend available at http://localhost:${PORT}`)
);