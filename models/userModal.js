const Mongoose = require("mongoose");
// require validator for quick validation.
const validator = require("validator");

const bcrypt = require("bcryptjs");
const crypto = require("crypto"); //build in node module.

const UserSchema = new Mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please provide a name"],
  },

  photo: {
    type: String,
  },
  email: {
    type: String,
    required: [true, "Please provide your email"],
    lowerCase: true,
    unique: true,
    validate: [validator.isEmail, "please provide valid email"],
  },
  password: {
    type: String,
    required: [true, "please provide your password"],
    minlength: 8,
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, "please confirm your password"],
    validate: {
      // only works on the create and save.
      validator: function (el) {
        return el === this.password;
      },
      message: "your password are not same ",
    },
  },
  role: {
    type: String,
    enum: ["user", "admin", "guide"],
    default: "user",
    // required: [true, "please specify a role"],
  },
  passwordResetToken: String,
  passwordResetExpires: Date,
  passwordChangeAt: Date, // most of the user will not have this data.
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
});

UserSchema.pre("save", async function (next) {
  // only encrypt the password if the password field has been updated. In other words, if password field is not modified then simply return to next middleware. otherwise encrypt the password using bycrypt.
  console.log("Pre-save middleware executed From UserSchema - 1");
  if (!this.isModified("password")) {
    return next();
  }
  // encrypting the password and update the previous password field.
  this.password = await bcrypt.hash(this.password, 12);

  //
  this.passwordConfirm = undefined;
  next();
});

// correctPassword is a method that will compare hased and nonhased password and return true or false.
// correct password is called in the AuthController.js
// this method will be avaliable on all the doucments, so we can access the property on that object(this).
UserSchema.methods.correctPassword = async (
  // this.password ,here password not avaliable because it is set to false.
  nonHasedPasswordFromUser,
  hasedPassword
) => {
  return await bcrypt.compare(nonHasedPasswordFromUser, hasedPassword);
};

// changedpasswordAfter is called in protect middleware
UserSchema.methods.changedPasswordAfter = function (JwtTimeStamp) {
  console.log("changedPasswordAfter method executed on current doucment.");
  if (this.passwordChangeAt) {
    console.log(this.passwordChangeAt);
    const changedTimeStamp = parseInt(
      this.passwordChangeAt.getTime() / 1000,
      10
    );
    return JwtTimeStamp < changedTimeStamp; // 10.00 < 12.00 , that means the user changed password after the token was issued. so it will return true.
  }
  return false; // false means user has not changed the password  after token the token was issued.
};

UserSchema.methods.createPasswordResetToken = function () {
  // password reset Token should be a random string, it doesnt need to be cryptographically strong as password hash. so use randomBytes() form crypto module.
  console.log("createPasswordResetToken executed on the current document");

  const resetToken = crypto.randomBytes(32).toString("hex");

  // hashing the resetToken before storing in the DB.
  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  // console.log({ resetToken }, this.passwordResetToken);

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken; // This plain TextToken is the one we will send in email.
};

UserSchema.pre("save", function (next) {
  // Before saving,if the doucumet password is not modified and the document isNew, just reutn to next() middleware. do nothing.
  console.log("Pre-save middleware executed From UserSchema - 2");
  if (!this.isModified("password") || this.isNew) {
    return next();
  }
  this.passwordChangeAt = Date.now() - 1000; // making PasswordChangeAT 1 SEC in past, will ensure the token is always created, after the password has been changed.
  next();
});

// we want only to run this query middleware, to find the  documents which have the active property set to true. otherWords , we dont want to show inactive users when we make a get request on all the users in userController.js

UserSchema.pre(/^find/, function (next) {
  console.log("Pre /^find/ middleware executed from UserSchema");
  this.find({ active: { $ne: false } }); // Not equal to false --> true.
  next();
});

// must be at last of this  document
const User = Mongoose.model("User", UserSchema);
module.exports = User;
