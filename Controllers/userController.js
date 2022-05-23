const User = require("./../models/userModal");
const catchAsync = require("./../utlis/catchAsync");
const AppError = require("./../utlis/appError");

const factory = require("./../Controllers/handlerFactory");

// exports.getuser = catchAsync(async (request, response) => {
//   const users = await User.find(); // before this query the query middleware runs.
//   response.status(500).json({
//     status: " success ",
//     message: users,
//   });
// });

exports.getAlluser = factory.getAll(User);

// exports.getuserbyid = catchAsync(async (request, response) => {
//   const user = await User.findById(request.params.id);
//   if (!user) {
//     return next(new AppError("User not found", 404));
//   }
//   response.status(500).json({
//     status: "sucess",
//     message: user,
//   });
// });

exports.getuserbyid = factory.getOne(User);

// exports.createuser = (request, response) => {
//   response.status(500).json({
//     status: "error",
//     message: "This route not yet defined",
//   });
// };

exports.createuser = factory.createOne(User);

// exports.updateuserbyid = (request, response) => {
//   response.status(500).json({
//     status: "error",
//     message: "This route not yet defined",
//   });
// };

exports.updateuserbyid = factory.updateOne(User);
exports.deleteUser = factory.deleteOne(User);

exports.getMe = (request, response, next) => {
  request.params.id = request.user.id;
  next();
};
