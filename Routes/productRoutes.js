const express = require("express");
const productRouter = express.Router();

const productController = require("./../Controllers/productController");
const authController = require("./../Controllers/authController");
const reviewController = require("./../Controllers/reviewController");

const ReviewRouter = require("./../Routes/reviewRoutes");
// param middleware -- This middleware only runs for the Product Routes. Each router is kind of mini sub-application

productRouter.param("id", (request, response, next, val) => {
  console.log(`The product id is : ${val}`);
  next();
});

// productRouter.param("id", productController.checkId);

//127.0.0.1:9000/api/v1/products//Top5CheapProducts
productRouter
  .route("/Top5CheapProducts")
  .get(productController.aliasTopProducts, productController.getallproducts);

productRouter.route("/product-stats").get(productController.getProductStats);

// productRouter
//   .route("/")
//   .get(authController.protect, productController.getallproducts)
//   .post(productController.createproductbypost);

productRouter
  .route("/")
  .get(productController.getallproducts)
  .post(
    authController.protect,
    authController.restrictTo("admin"),
    productController.createproductbypost
  );

productRouter
  .route("/:id")
  .get(productController.getproductbyid)
  .patch(
    authController.protect,
    authController.restrictTo("admin"),
    productController.updateproductbyid
  )
  .delete(
    authController.protect,
    authController.restrictTo("admin"), // the roles we pass through this only have the access to delete.
    productController.deleteProduct
  );

// Nested Route, but we have a problem of using reviewController in ProductRoutes, TO avoid it redirect to reviewRouter to control the reviewController. i,e step 2

// ex --> https://127.0.0.1:9000/api/v1/products/productIdhere/reviews

// productRouter
//   .route("/:productId/reviews")
//   .post(
//     authController.protect,
//     authController.restrictTo("user"),
//     reviewController.createReview
//   );

// How Nested Route Works

// step 1 app.use("/api/v1/products", productRouter); from app.js
// step 2 productRouter.use("/:productId/reviews", ReviewRouter);
productRouter.use("/:productId/reviews", ReviewRouter); // but the ReviewRouter doesnt have acess to the productID parameter, so go to ReviewRouter and pass in an object mergeParams set to true.

// step 3 const reviewRouter = express.Router({mergeParams:true});

module.exports = productRouter;
