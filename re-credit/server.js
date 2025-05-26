// server.js
const express = require('express');
const next = require('next');
const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

const server = express();
app.prepare().then(() => {

    // Express.js routes and middleware go here
  
  
    server.listen(3000, (err) => {
  
      if (err) throw err;
  
      console.log('> Ready on http://localhost:3000');
  
    });
  
  });