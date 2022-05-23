const fs = require("fs");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Products = require("./../models/productModel.js");
// This command will read our variable from file and save them into the nodejs environment variable. And this must happen before reading the app.js.
dotenv.config({ path: "./config.env" });
// const app = require("./app");

const DB = process.env.DATABASE.replace(
  "<PASSWORD>",
  process.env.DATABASE_PASSWORD
);
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then((conn) => {
    // console.log(conn.connections);
    console.log("DB connection successful");
  });

//   Read JSON file

console.log(`${__dirname}/products.json`);
const products_data = JSON.parse(
  fs.readFileSync(`${__dirname}/products.json`, "utf-8")
);

// Immport data into the database
const importdata = async (request, response) => {
  try {
    await Products.create(products_data);
    console.log("Data created in db successfully");
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

// delete data in db.
const deletedata = async () => {
  try {
    await Products.deleteMany();
    console.log("All data deleted successfully");
  } catch (err) {
    console.log(err);
  }
  process.exit();
  a;
};

console.log(process.argv);

if (process.argv[2] === "--import") {
  importdata();
} else if (process.argv[2] === "--delete") {
  deletedata();
}
