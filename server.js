const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });
const cron = require("node-cron");
const app = require("./app");

const DB = process.env.DATABASE.replace(
  "<password>",
  process.env.DATABASE_PASSWORD
);
// DB = "mongodb://localhost:27017/bankingSystem";
// DB = "mongodb://localhost:27017/bankingSystem";

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("DB connection successful!"))
  .catch((err) => {
    console.log(err);
  });

const port = process.env.PORT || 4500;
const server = app.listen(port, () => {
  console.log(
    `App is running in "${process.env.NODE_ENV}" environment on port "${port}"`
  );
});
