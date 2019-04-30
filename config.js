const mongoose = require('mongoose');

// Configure database
const mongoUrl = process.env.MONGO_URL || "mongodb://localhost:27017/";
var connection = mongoose.connect(mongoUrl);

module.exports = connection;