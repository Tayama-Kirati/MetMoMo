const User = require("./models/userModel");
const bcrypt = require("bcryptjs");

// Creates the first admin from ADMIN_EMAIL / ADMIN_PASSWORD if no admin exists yet.
const adminSeeder = async () => {
  if (await User.exists({ userRole: "admin" })) {
    console.log("Admin already exists");
    return;
  }

  const email = (process.env.ADMIN_EMAIL || "").trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password || password.length < 8) {
    console.warn("No admin account exists. Set ADMIN_EMAIL and ADMIN_PASSWORD (8+ chars) to create one.");
    return;
  }

  await User.create({
    userName: "admin",
    userPhoneNumber: "0000000000",
    userEmail: email,
    userPassword: bcrypt.hashSync(password, 10),
    userRole: "admin",
  });
  console.log(`Admin account created for ${email}`);
};

module.exports = adminSeeder;
