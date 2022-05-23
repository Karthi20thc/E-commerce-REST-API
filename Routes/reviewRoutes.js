const express = require("express");
const reviewRouter = express.Router({ mergeParams: true }); // mergeParams to get acces to Id from other Router ex --> productRouter in our case.

const reviewController = require("./../Controllers/reviewController");
const authController = require("./../Controllers/authController");

// POST /product/productIdhere/reviews
// GET /product/productIdhere/reviews
// POST /reviews/

reviewRouter.use(authController.protect);

reviewRouter.route("/").get(reviewController.getAllreviews).post(
  // authController.protect,
  authController.restrictTo("user"),
  reviewController.setProductUserIds,
  reviewController.createAReview
);
reviewRouter
  .route("/:id")
  .get(reviewController.getAReview)
  .patch(
    authController.restrictTo("user", "admin"),
    reviewController.updateReview
  )
  .delete(
    authController.restrictTo("user", "admin"),
    reviewController.deleteReview
  );

module.exports = reviewRouter;
