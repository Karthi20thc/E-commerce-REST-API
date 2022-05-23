const mongoose = require("mongoose");
const Product = require("./../models/productModel");

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, " Review can not be empty"],
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: [true, "A rating can not be empty"],
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    // PARENT REFERENCING.

    // Here parent Product, child Review.
    productId: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "Products",
        required: [true, "Review must belong to the product"],
      },
    ],
    userId: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: [true, "Review must belong to a user"],
      },
    ],
  },
  {
    // in mongoose.schema we can pass not only objects, but also object for schema options
    // To make virtual properties also show up in JSON and output objects.
    // VIRTUAL PROPERTY The field not stored in the DB, But calculated using some other value.
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// To avoid duplicate Review. Two review from same user is considered as duplicate Review.
// we need the combination of userId and productId needs to be unique. use index().
reviewSchema.index({ productId: 1, userId: 1 }, { unique: true });

// populating  Reviews -- Use query middleware
// Both product and the user will be automatically populated when ever there is a query for the review

// reviewSchema.pre(/^find/, function (next) {
//   console.log("Pre /^find/  Query Middleware executed From ReviewSchema");
//   this.populate({
//     path: "productId ",
//     select: "name", // we want only product name to show, nothing else.
//   }).populate({
//     path: "userId ",
//     select: "name  ",
//   });
//   next();
// });

reviewSchema.pre(/^find/, function (next) {
  console.log("Pre /^find/  Query Middleware executed From ReviewSchema");
  this.populate({
    path: "userId ",
    select: "name  ",
  });
  next();
});

reviewSchema.statics.calcAverageRatings = async function (productId) {
  console.log("calcAverageRatings function executed");
  // console.log(this);
  const stats = await this.aggregate([
    // In static method this keyword points to the current Model, aggregate returns a promise so await.
    {
      $match: { productId: productId }, // select all the reviews for the current productId, that was passed in as argument
    },
    {
      $group: {
        _id: "$productId",
        numOfRatings: { $sum: 1 }, // Adding 1 for each Review document for the current product
        avgRating: { $avg: "$rating" },
      },
    },
  ]);
  // we need to call this method,
  // console.log(stats); // [ { _id: [ 61d7fa19d5441a2ec873aad8 ], numOfRatings: 1, avgRating: 5 }]

  // Find the current product (so require it) and update the field ratings in product Model.

  if (stats.length > 0) {
    await Product.findByIdAndUpdate(productId, {
      numOfReviews: stats[0].numOfRatings, // numOfReviews is the field name from Product Model
      ratings: stats[0].avgRating, // ratings is the field name from Product Model
    });
  } else {
    Product.findByIdAndUpdate(productId, {
      numOfReviews: stats[0].numOfRatings, // numOfReviews is the field name from Product Model
      ratings: stats[1].avgRating, // ratings is the field name from Product Model
    });
  }
};

// After saving the document(review) calculate the stats, So, run POST MIDDLEWARE.
reviewSchema.post("save", function () {
  // this keyword point to the current document (review) that being saved

  // Review.calcAverageRatings(this.productId) // cant use because the Review Model is not Defined yet.

  // console.log(this.productId);
  // console.log(this.constructor); // Model { Review }
  this.constructor.calcAverageRatings(this.productId);
  // next(); POST middleware dont have access to next();
});

// when a user updates or delete a Review, calculate and update the stats.

// For findByIdAndUpdate and findByIdAndDelete we dont have document middleware only query middleware, we need to access the current review document from there we can extract the productId and calculate the statistics from there.

// for these events findByIdAndUpdate and findByIdAndDelete run a pre query middleware.
reviewSchema.pre(/^findOneAnd/, async function (next) {
  this.r = await this.findOne(); // this.findOne(), Here this keyword is the current Query, we can execute the query and that will give us the document that currently being processed.                 this.r , Here this is the current Document(review) using this code we passed the data from pre query middleware to post query middleware

  // console.log(this.r); // this.r is equivalent to "this" in POST SAVE MIDDLEWARE.
  next();
});

reviewSchema.post(/^findOneAnd/, async function () {
  // await this.findOne(); does NOT work here, query has already executed
  await this.r.constructor.calcAverageRatings(this.r.productId); // this.r is the Review document
});

const Review = mongoose.model("Review", reviewSchema);
module.exports = Review;

// To be very quick, instead of using the above code, you can use the below code and it works the same.

// reviewSchema.post(/^findOneAnd/, async function (docs) {
//   await docs.constructor.calcAverageRatings(docs.tour);
// });
// Explanation:

// In post query middleware, we get "docs" parameter which is nothing but the executed document. Since we have the document, we can use constructor on that to get the model ie docs.constructor . Now since we have model, we know that we can directly call statics method on that. That is what I have done.
