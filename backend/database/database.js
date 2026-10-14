const mongoose = require("mongoose");
const adminSeeder = require("../AdminSeeder");

exports.connectDatabase = async (URI) => {
  await mongoose.connect(URI);
  console.log("Database is successfully connected");

  await adminSeeder();
};
