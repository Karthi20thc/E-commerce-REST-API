// 1.Install and require express module

const express = require("express");
const morgan = require("morgan");
const AppError = require("./utlis/appError");

const productRouter = require("./Routes/productRoutes");
const userRouter = require("./Routes/userRoutes");
const reviewRouter = require("./Routes/reviewRoutes");

const GlobalErrorHandler = require("./Controllers/ErrorController");

const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const xssClean = require("xss-clean");
const hpp = require("hpp");

const app = express();
// console.log(x); to test uncaught expression

// GLOBAL MIDDLEWARE MIDDLEWARES --------------------------------

// set security http header.
app.use(helmet());

// Development logging
// console.log(process.env.NODE_ENV);
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// To limit the request coming from the same API.
const limiter = rateLimit({
  max: 100,
  windowms: 60 * 60 * 1000,
  message: "Too many request from this IP, please try again later",
});
// app.use(limiter); could also do like this, but we want to limit on api route
app.use("/api", limiter);

// Body parser and also limit 10kb data.
app.use(express.json({ limit: "10kb" }));

// Data sanitization aganist NOSQL QUERY INJECTION.
app.use(mongoSanitize()); // this will look into request.body , request query string and also request.params and will filter out all the dollar sign and dots.

// Data sanitization aganist xss
app.use(xssClean()); // cleans userInput from malicious html code

// prevent Parameter Pollution
app.use(
  hpp({
    whitelist: ["price", "numOfReviews"], // whitelist is an array of properties which allow duplicates in our query string.
  })
);

//Test middleware.
app.use((request, response, next) => {
  console.log("Hello from the middleware");
  next();
});

// to get access to the headers in express
app.use((request, response, next) => {
  request.requestTime = new Date().toISOString();
  // console.log(request.headers);
  next();
});
// serving static files.
// app.use(express.static(`${__dirname}/folderNamehere`))

// const root = (request, response) => {
//   response
//     .status(200)
//     .json({ message: "hello from the server", app: "my-app" });
// };

//  HANDLE DELETE REQUEST FOR THE CLIENT

// app.delete();

// app.get("/", root);
// app.get("/api/v1/products", getallproducts);
// app.get("/api/v1/products/:id", getproductbyid);
// app.post("/api/v1/products", createproductbypost);
// app.patch("/api/v1/products/:id", updateproduct_by_id_by_patch);

app.use("/api/v1/products", productRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/reviews", reviewRouter);
// if we add a middleware after these routers, it will be only reached if not handled by these and other routers.

app.all("*", (request, response, next) => {
  //   response.status(404).json({
  //     stauts: "fail",
  //     message: `cant find ${request.originalUrl} on this server`,
  //   });
  // creating an error using build in error constructor
  // const err = new Error(`Can't find the ${originalUrl}`); // the Argument(string) that we pass in Error, will be the Error message property.
  // console.log(err);
  // err.status = "fail";
  // err.statusCode = 404;
  // when we pass argument in the next() function, it will skip all other middleware in the stack and goes straight into the global middleware stack. Also express will automatically know there was an error.
  // next(err);
  // -------------------------------------------------------------------------
  // we dont have write these(above code) again and again, so we create our own Error Class.
  next(
    new AppError(`cant find the ${request.originalUrl} in this server`, 404)
  );
});

//  specifying four parameters express automatically knows that the entire function is a error handdling middleware. First argument must be error.
app.use(GlobalErrorHandler); // file moved to controller folder.

module.exports = app;
