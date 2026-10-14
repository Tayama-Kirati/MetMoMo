const http = require("http");
const app  = require("./app");
const socket = require("./services/socket");
const { connectDatabase } = require("./database/database");

const required = ["MONGO_URI", "SECRET_KEY"];
const missing = required.filter(k => !process.env[k]);
if (missing.length) {
  console.error(`Missing required environment variables: ${missing.join(", ")}`);
  process.exit(1);
}

const server = http.createServer(app);
socket.init(server, app.corsOrigins);

const PORT = process.env.PORT || 4000;
connectDatabase(process.env.MONGO_URI).then(() => {
  server.listen(PORT, () => console.log(`Server running → http://localhost:${PORT}`));
}).catch((err) => {
  console.error("Could not connect to MongoDB:", err.message);
  process.exit(1);
});
