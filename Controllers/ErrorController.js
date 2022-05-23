const AppError = require("./../utlis/appError");

// const GlobalErrorHandler = (error, request, response, next) => {
//   // console.log(error.stack); it gives us the error and also where it has happened.
//   error.statusCode = error.statusCode || 500;
//   error.status = error.status || "Error";
//   response.status(error.statusCode).json({
//     status: error.status,
//     message: error.message,
//   });
// };
// module.exports = GlobalErrorHandler;

const handleCastErrorDB = (err) => {
  console.log("handleCastErrorDB executed");
  const messsage = `Invalid ${err.path} : ${err.value}`;
  return new AppError(messsage, 400);
};

const handleDuplicateFieldDB = (err) => {
  console.log("handleDuplicateFieldDB executed");
  const value = err.message.match(/(["'])(\\?.)*?\1/)[0];
  // regular expression match between quotes
  // [
  //   '"test 2"',
  //   '"',
  //   '2',
  //   index: 89,
  //   input: 'E11000 duplicate key error collection: ecommerce.products index: name_1 dup key: { name: "test 2" }',
  //   groups: undefined
  // ]

  // console.log(value);
  const message = ` Duplicate field Value: ${value} . please use another value`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid Input data ${errors.join(". ")}`;
  return new AppError(message, 400);
};
const sendErrorDev = (response, error) => {
  response.status(error.statusCode).json({
    status: error.status,
    message: error.message,
    stack: error.stack,
    error: error,
  });
};
const sendErrorProd = (response, error) => {
  // console.log(error);
  if (error.isOperational) {
    // if (isOperational) wrong
    response.status(error.statusCode).json({
      status: error.status,
      statusCode: error.statusCode,
      message: error.message,
      // stack: error.stack, // do not leak error details
      // error: error,
    });
  } else {
    // console.error("Error", error);
    // if not operational , (programming or other unknown error)
    response.status(500).json({
      stauts: "error",
      message: "something went wrong",
    });
  }
};

const handleJwtError = () => {
  console.log("handleJwtError Executed");
  return new AppError("Invalid Token, please login in agian to continue", 401);
};
const handleJwtExpiredError = () => {
  console.log("handleJwtExpiredError Executed");
  return new AppError(
    "your token has expired, please login in agian to continue",
    401
  );
};

const GlobalErrorHandler = (error, request, response, next) => {
  // console.log(error.stack); it gives us the error and also where it has happened.
  error.statusCode = error.statusCode || 500;
  error.status = error.status || "Error";
  if (process.env.NODE_ENV === "development") {
    // if (error.name === "CastError") err = handleCastErrorDB(error);
    sendErrorDev(response, error);
  } else if (process.env.NODE_ENV === "production") {
    // let er = { ...error }; // creating hardcopy of error object.
    let er = Object.assign(error);
    if (er.name === "CastError") er = handleCastErrorDB(er); // pass the entire err object into the function and the function returns new error object
    if (er.code === 11000) er = handleDuplicateFieldDB(er);
    if (er.name === "ValidationError") er = handleValidationErrorDB(er);
    if (er.name === "JsonWebTokenError") er = handleJwtError(er);
    if (er.name === "TokenExpiredError") er = handleJwtExpiredError(er);

    sendErrorProd(response, er);
  }
};
module.exports = GlobalErrorHandler;
