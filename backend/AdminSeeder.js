 
const User = require("./models/userModel");
const bcrypt = require("bcryptjs");

const adminSeeder = async () => {
  const isAdminExists = await User.findOne({ userEmail: "admin@example.com" });
  if (!isAdminExists) {
    //if admin does not exist create one
    await User.create({
      userName: "admin",
      userPhoneNumber: "1234567890",
      userEmail: "admin@example.com",
      userPassword: bcrypt.hashSync("admin", 10),
      userRole: "admin",
    });
    console.log("Admin is successfully created with email");
  } else {
    console.log("Admin already exists");
  }
};

module.exports = adminSeeder;
