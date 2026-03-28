const mongoose = require("mongoose");
const User = require("../models/userModel");
const AdminSeeder =  require("../adminSeeder"); 

exports.connectDatabase = async (URI) => {
  await mongoose.connect(URI);
  console.log("Database is successfully connected");

  await AdminSeeder();
};
