const serverless = require('serverless-http');
require('dotenv').config();
const connectDB = require('../backend/config/db');
const app = require('../backend/app');

let handler;

module.exports = async (req, res) => {
  if (!handler) {
    await connectDB();
    handler = serverless(app);
  }

  return handler(req, res);
};
