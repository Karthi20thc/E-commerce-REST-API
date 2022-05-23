const Review = require("./../models/reviewModel");
// const APIFeatures = require("./../utlis/apiFeatures");
const catchAsync = require("./../utlis/catchAsync");
// const AppError = require("./../utlis/appError");

const factory = require("./../Controllers/handlerFactory");

// exports.getAllreviews = catchAsync(async (request, response, next) => {
//   console.log("Get All Reviews middleware executed");
//   // const allReview = await Review.find();

//   let filter;
//   if (request.params.productId)
//     filter = { productId: request.params.productId };
//   // filter = { product_Id: request.params.productId }; doesnt make sense to use new field name Product_Id , becuase find() will match based on the field name and value and returns the entire document (i,e object)
//   const allReviewOnProductId = await Review.find(filter);

//   response.status(200).json({
//     status: "suceess",
//     allReviewOnProductId,
//   });
// });

exports.getAllreviews = factory.getAll(Review);

// exports.createReview = catchAsync(async (request, response, next) => {
//   console.log("create Review middleware executed");

//   // Defining ProductID and UserId, when they are not specified in request.body , for Nested ROute
//   if (!request.body.product) request.body.productId = request.params.productId;
//   // request.params.productId ----> here productId is the name given in productRouter.route("/:productId/reviews").post(.....);
//   // request.body.productId  -----> here productId is the field Name given in review Model.

//   if (!request.body.user) request.body.userId = request.user.id; //request.user coming from protect middleware.
//   //  request.body.userId  -----> here userId is the field Name given in review Model.

//   const newReview = await Review.create(request.body);

//   response.status(200).json({
//     status: "success",
//     newReview,
//   });
// });

exports.setProductUserIds = (request, response, next) => {
  // Defining ProductID and UserId, when they are not specified in request.body , for Nested ROute
  if (!request.body.product) request.body.productId = request.params.productId;
  // request.params.productId ----> here productId is the name given in productRouter.route("/:productId/reviews").post(.....);
  // request.body.productId  -----> here productId is the field Name given in review Model.

  if (!request.body.user) request.body.userId = request.user.id; //request.user coming from protect middleware.
  //  request.body.userId  -----> here userId is the field Name given in review Model.

  next();
};

// exports.createReview = catchAsync(async (request, response, next) => {
//   console.log("create Review middleware executed");
//   const newReview = await Review.create(request.body);

//   response.status(200).json({
//     status: "success",
//     newReview,
//   });
// });
exports.createAReview = factory.createOne(Review);

exports.updateReview = factory.updateOne(Review);
exports.deleteReview = factory.deleteOne(Review);
exports.getAReview = factory.getOne(Review);
