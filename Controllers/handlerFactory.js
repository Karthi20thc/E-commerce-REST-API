const catchAsync = require("./../utlis/catchAsync");
const AppError = require("./../utlis/appError");
const APIFeatures = require("./../utlis/apiFeatures");

exports.deleteOne = (Model) =>
 catchAsync(async (request, response, next) => {
  const document = await Model.findByIdAndDelete(request.params.id);

  if (!document)
   return next(new AppError("No document found with that Id", 404));

  response.status(204).json({
   data: "The document has been deleted",
  });
 });

exports.updateOne = (Model) =>
 catchAsync(async (request, response, next) => {
  const document = await Model.findByIdAndUpdate(
   request.params.id,
   request.body,
   {
    new: true,
    runValidators: true,
   }
  );

  if (!document)
   return next(new AppError("No document found with that Id", 404));

  response.status(201).json({
   stauts: "success",
   data: {
    document,
   },
  });
 });

exports.createOne = (Model) =>
 catchAsync(async (request, response, next) => {
  const newdocument = await Model.create(request.body);
  response.status(201).json({
   stauts: "success",
   data: {
    newdocument,
   },
  });
 });

exports.getOne = (Model, popOptions) =>
 catchAsync(async (request, response, next) => {
  let query;
  query = Model.findById(request.params.id); // do not use await here
  if (popOptions) query = query.populate("reviews");
  const document = await query; // await here.

  // const products = await Products.findById(request.params.id).populate( "reviews");

  if (!document) {
   return next(new AppError("No document found with that ID", 404));
  }
  response.status(200).json({
   status: "success",
   data: {
    total: document.length,
    document,
   },
  });
 });

exports.getAll = (Model) =>
 catchAsync(async (request, response, next) => {
  // To allow Nested GET reviews on Product (small hack)
  let filter;
  if (request.params.productId)
   filter = { productId: request.params.productId };

  const features = new APIFeatures(Model.find(filter), request.query)
   .filter()
   .sort()
   .limitingFields()
   .paginate();
  // const document = await features.query;
  // const document = await features.query.explain();
  const document = await features.query;
  response.status(200).json({
   status: "success",
   data: {
    total: document.length,
    document,
   },
  });
 });
