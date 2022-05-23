// All functions (middleware) related to authentication goes here.

const User = require("./../models/userModal");
const catchAsync = require("./../utlis/catchAsync");
const jwt = require("jsonwebtoken");
const AppError = require("./../utlis/appError");
const { promisify } = require("util");
const sendEMail = require("./../utlis/email");
const crypto = require("crypto");
//signUp middleware
// exports.signup = catchAsync(async (request, response) => {
//   const newUSer = await User.create(request.body);
//   response.status(201).json({
//     status: "success",
//     data: {
//       user: newUSer,
//     },
//   });
// });

const signToken = (id) => {
  console.log("signToken Executed!");
  return jwt.sign({ id: id }, process.env.JWT_SECRET, {
    // expriesIn: process.env.JWT_EXPRIES_IN, mistake---expriesIn instead of expiresIN
    expiresIn: process.env.JWT_EXPRIES_IN,
  });
};

const createSendToken = (user, statusCode, response) => {
  const token = signToken(user._id);
  const CookieOptionObj = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };
  if (process.env.NODE_ENV === "production") CookieOptionObj.secure = true;

  response.cookie("jwt", token, CookieOptionObj);

  // In our userSchema the password field is set to false, so it doesnt show up when we query for all the users, but in this case, it will show, because we are creating a new document.
  user.password = undefined;

  response.status(statusCode).json({
    status: "success",
    token,
    data: {
      user,
    },
  });
};

exports.signup = catchAsync(async (request, response, next) => {
  console.log("SignUP middleware executed!");
  const newUser = await User.create({
    name: request.body.name,
    email: request.body.email,
    password: request.body.password,
    passwordConfirm: request.body.passwordConfirm,
    role: request.body.role,
  });
  const token = signToken(newUser._id);

  // response.status(201).json({
  //   status: "success",
  //   token,
  //   data: {
  //     user: newUser,
  //   },
  // });

  createSendToken(newUser, 201, response);
});

exports.login = catchAsync(async (request, response, next) => {
  console.log("login middleware executed");
  const { email, password } = request.body;

  // check if email and password exist
  if (!email || !password) {
    return next(new AppError(" Please provide email and password", 400));
  }
  // finding the user by email in our DB.
  const foundUser = await User.findOne({ email }).select("+password");

  // check if the FoundUser exist and password correct
  if (
    !foundUser ||
    !(await foundUser.correctPassword(password, foundUser.password))
  ) {
    return next(new AppError("Incorrect email or password", 401));
  }
  // console.log(foundUser._id);

  // if everything ok send token to the client
  const token = signToken(foundUser._id);
  // console.log(token);
  // response.status(200).json({
  //   status: "success",
  //   token,
  // });
  createSendToken(foundUser, 200, response);
});

exports.protect = catchAsync(async (request, response, next) => {
  // 1. getting token and check if it exists
  console.log("protect middleware executed");
  // console.log(request.headers);
  let tokenFromClient;
  if (
    request.headers.authorization &&
    request.headers.authorization.startsWith("Bearer")
  ) {
    tokenFromClient = request.headers.authorization.split(" ")[1];
    // console.log(tokenFromClient);
  }
  if (!tokenFromClient) {
    return next(
      new AppError("you are not logged in. please log in to get access", 401)
    );
  }

  // 2. if token exists verify

  // const decoded = jwt.verify(tokenFromClient, process.env.JWT_SECRET); // we need secret here to create test signature.

  // verify actually requires 3rd argument as callback function. and this function runs as soon the verification is complete. verify() is an asynchronous function.

  // But we are working with promises all the time. we dont want to break the pattern. so promisify the function, to return promise. so we can use async/await

  // pass jwt.verify into promisify() and call the function promisify(jwt.verify)() and it will return promise so use await and then store the result.
  const decoded = await promisify(jwt.verify)(
    tokenFromClient,
    process.env.JWT_SECRET
  );
  // console.log(decoded);

  // 3.check if user still exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(
      new AppError("The user belonging to this token no longer exists", 401)
    );
  }

  // 4. check if user changed password after the token issued.
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    // .iat is the JWTTimeStamp.
    return next(
      new AppError("User recently changed password, please log in again", 401)
    );
  }

  // Grant Access
  //putting the entire data on the request object. Because the request object is the one which travels from one middleware to other middleware.
  request.user = currentUser;

  next(); //to run other middleware in the productRouter (in our case getallproducts)
});

exports.restrictTo = (...roles) => {
  // the middleware function which we are returning below, will have the acccess to the roles parameter because of CLOSURE.
  console.log("RestrictTo middleware executed!");
  //// roles ['admin', 'lead-guide']. role='user'
  return (request, response, next) => {
    if (!roles.includes(request.user.role)) {
      return next(
        new AppError("You do not have permission to perform this action", 403)
      );
    }
    next();
  };
};

exports.forgetPassword = catchAsync(async (request, response, next) => {
  // 1. Get the user based on the email
  console.log("ForgetPassword middleware executed");
  // console.log(request.body.email);
  const foundUser = await User.findOne({ email: request.body.email });
  // console.log(foundUser);
  if (!foundUser) {
    return next(new AppError("No User found with that email Id", 404));
  }

  //2. Generate Random reset Token as follows.
  const resetToken = foundUser.createPasswordResetToken();
  // saving our new filed into the DB.
  await foundUser.save({ validateBeforeSave: false }); // we are setting validatorBeforeSave to false, because we are not saving the field which are required. so turn off the validator.

  // await foundUser.save(); you will get validation error by using this type of code, instead of above

  // 3. send it to user email
  const resetUrl = `${request.protocol}://${request.get(
    "host"
  )}/api/v1/users/resetpassword/${resetToken}`;

  const message = `Forget your password? submit your new password to ${resetUrl} \n . If you didnt forget your password Just ignore this email`;

  // console.log(message);
  try {
    await sendEMail({
      // sendEmail is an asynchronous function so await.
      email: request.body.email,
      subject: "your password reset token valid for 10 minutes",
      message,
    });

    response.status(200).json({
      status: "success",
      message: "token sent to email successfully",
    });
  } catch (error) {
    // resetting the properties
    (foundUser.passwordResetToken = undefined),
      (foundUser.passwordResetExpires = undefined),
      await foundUser.save({ validateBeforeSave: false });

    return next(
      new AppError(
        "There was an error sending the email, please try again after sometime",
        500
      )
    );
  }
  //  next(); By callling next() here ---> Error [ERR_HTTP_HEADERS_SENT]: Cannot set headers after they are sent to the client.
});

exports.resetPassword = catchAsync(async (request, response, next) => {
  console.log("ResetPassword middleware executed !");
  // 1. Get user based on the incoming token, which we send earlier . we get non-hashed token from the client, converted to hashed form, so that we can match with the DB.
  const hashedtokenClient = crypto
    .createHash("sha256")
    .update(request.params.token)
    .digest("hex");

  // 2. finding the user based on
  const foundUser = await User.findOne({
    passwordResetToken: hashedtokenClient,
    passwordResetExpires: { $gt: Date.now() },
  });

  // 3. If the token has not expired and user exists, see the new password.

  if (!foundUser) {
    return next(new AppError("Token is invalid or expired", 400));
  }
  foundUser.password = request.body.password;
  foundUser.passwordConfirm = request.body.passwordConfirm;
  foundUser.passwordResetToken = undefined;
  foundUser.passwordResetExpires = undefined;
  await foundUser.save();

  // 4. log the user in, send jwt
  const token = signToken(foundUser._id);
  // response.status(200).json({
  //   status: "success",
  //   token,
  // });
  createSendToken(foundUser, 200, response);
});

exports.updatePassword = catchAsync(async (request, response, next) => {
  console.log("Update Password middleware executed!");
  // This middlware is only for Authenticated Users. so we already have current user on request object, i.e coming from protect middleware.

  // we are not using User.findByIdAndUpdate() , because the of two resons.
  // 1. In our schema, in passwordConfirm field, this.password will be set to undefined. The validator is not going to work for update. Mongoose doesnt keep the object in memory.
  // 2. The pre-save middleware will not run for update, So, anything related to password donot use Update.

  // 1. get the user from the collection
  const currentUser = await User.findById(request.user.id).select("+password");

  // 2.check if the posted current password is correct else return error.
  // currentUser() takes in your actual password and verify with DB. so that we can set a new password.
  if (
    !(await currentUser.correctPassword(
      request.body.passwordCurrent,
      currentUser.password
    ))
  ) {
    return next(new AppError("your current password is wrong", 401));
  }

  // 3. If so update the password
  currentUser.password = request.body.password;
  currentUser.passwordConfirm = request.body.passwordConfirm;
  await currentUser.save();

  // response.status(200).json({
  //   status: "success",
  //   data: {
  //     currentUser: currentUser,
  //   },
  // });
  createSendToken(currentUser, 200, response);
});

const filterObj = (obj, ...allowedFields) => {
  // loop through the objects and for each field check if it is one of the alloweded field. And if it is simply add it to the new object.
  // Object.keys(obj) -----> easiest way to loop the object. This returns an array with all the key names
  const newObj = {};
  console.log(Object.keys(obj)); // [ 'email', 'name' ]
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
    // console.log(obj[el]); 1st loop -> jinx@gmail.com  2nd loop --> Jinx
  });
  return newObj;
};
exports.updateMe = catchAsync(async (request, response, next) => {
  console.log("updateMe middleware executed!");
  // 1. create error if user post password data
  if (request.body.password || request.body.passwordConfirm) {
    return next(new AppError("This route is not for passwords", 400));
  }
  // 2. filtering unwanted fileds coming from the client.
  const filteredBody = filterObj(request.body, "name", "email");
  // console.log(filteredBody); { email: 'jinx@gmail.com', name: 'Jinx' }

  // 3 .update the user document and send to client
  // db.collection.findOneAndUpdate( filter, update, options )
  const updatedUser = await User.findByIdAndUpdate(
    request.user.id,
    filteredBody,
    {
      new: true,
      runValidators: true,
    }
  );
  response.status(200).json({
    status: "success",
    user: updatedUser,
  });
});

exports.deleteMe = catchAsync(async (request, response, next) => {
  console.log("DeleteMe Middlware executed");
  await User.findByIdAndUpdate(request.user.id, { active: false });
  response.status(204).json({
    status: "success",
    data: null,
  });
});
