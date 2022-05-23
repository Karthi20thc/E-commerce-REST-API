const mongoose = require("mongoose");
const dotenv = require("dotenv");

process.on("uncaughtException", (error) => {
  console.log("UNCAUGHT EXPCEPTION shutting Down.....");
  console.log(error.name, error.message);
  // When there is an uncaught exception, the entire node process is in unclean state, so we really need to crash our application.
  process.exit(1);
});

// This command will read our variable from file and save them into the nodejs environment variable. And this must happen before reading the app.js.
dotenv.config({ path: "./config.env" });
const app = require("./app");

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
    console.log("DB connection successfull");
  });
// .catch((err) => {
//   console.log(err);
// });
// console.log(app.get("env"));
// console.log(process.env);

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`app is running on the port ${port}`);
});

//  Each time there is an unhandled rejection in our application, the process object will emit an object called 'unhandled rejection' and so we can subscribe to that even. (UNHANDLED REJECTION -- ASYNCHRONOUS CODE)
//  ex - when we input wrong password in for database auth,  we get the following error.
// (node:4924) UnhandledPromiseRejectionWarning: MongoError: bad auth : Authentication failed.

process.on("unhandledRejection", (error) => {
  console.log("UNHANDLED REJECTION  shutting Down.....");
  console.log(error.name, error.message);
  // closing the server and then shutting down the application
  server.close(() => {
    process.exit(1);
  });
});

// for synchronous code - UNCAUGHT EXPRESSIONS -- the code must run before our app.js to catch the uncaught expression.

process.on("uncaughtException", (error) => {
  console.log("UNHANDLED REJECTION  shutting Down.....");
  console.log(error.name, error.message);
  // closing the server and then shutting down the application
  process.exit(1);
});
