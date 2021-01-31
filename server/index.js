const express = require("express");
const cors = require("cors");
const app = express();
const server = require("http").Server(app);
const mongoose = require("mongoose");
const PORT = process.env.PORT || 8000;
mongoose.connect("mongodb://127.0.0.1:27017/api", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on("error", (err) => console.log("DB connection Failed!!", err));
db.on("open", () => {
  console.log("Database connected...");
});
app.use(cors());
app.use(express.json());
app.use(express.urlencoded());

server.listen(PORT, () => {
  console.log(
    "Server has started on PORT ",
    PORT,
    "Click the link below to open in browser:",
    "localhost:3000"
  );
});
const routes = require("./router");
app.use("/", routes);
