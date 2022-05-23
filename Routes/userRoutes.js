const express = require("express");
const { response } = require("../app");
const userController = require("./../Controllers/userController");
const authController = require("./../Controllers/authController");
const userRouter = express.Router();

// app.route("/").get(root);

// userRouter.route("/signup").post(authController.signUp);
userRouter.post("/signup", authController.signup);
userRouter.post("/login", authController.login);

userRouter.post("/forgetPassword", authController.forgetPassword);
userRouter.patch("/resetpassword/:token", authController.resetPassword);

// After this line, all the routes are authenticated. Remember all the middleware runs in a sequence, so we can use
userRouter.use(authController.protect); // because of this code we can remove all the authController.protect in the codes down below.

userRouter.patch(
  "/updateMyPassword",
  // authController.protect,
  authController.updatePassword
);

// userRouter.delete("/deleteMe", authController.protect, authController.deleteMe);
// userRouter.patch("/updateMe", authController.protect, authController.updateMe);

userRouter.delete("/deleteMe", authController.deleteMe);
userRouter.patch("/updateMe", authController.updateMe);

userRouter.get(
  "/Me",
  // authController.protect,
  userController.getMe,
  userController.getuserbyid
);

userRouter.use(authController.restrictTo("admin")); // By using this code, only admin are allowed to access the route below. from this point on all the routes are not only protected but also restricted to only admin

userRouter
  .route("/")
  .get(userController.getAlluser)
  .post(userController.createuser);

userRouter
  .route("/:id")
  .get(userController.getuserbyid)
  .patch(userController.updateuserbyid)
  .delete(userController.deleteUser);

// export default userRouter; //wrong

module.exports = userRouter;
