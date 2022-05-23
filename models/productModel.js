const mongoose = require("mongoose");
const slugify = require("slugify");

// for data validation see page 94 in notebook.
// Creating Schema For Products.
const productsSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "A product must have a name"],
      trim: true,
      unique: true,
      maxlength: [
        100,
        "A product name must have less or equal then 100 characters",
      ],
      minlength: [
        10,
        "A product name must have more or equal then 10 characters",
      ],
    },
    slug: String,
    price: {
      type: Number,
      required: [true],
      default: 0,
      // max: [15, "price value can not exceed 15 characters"],
    },
    description: {
      type: String,
      required: [true, "A product must have a description"],
      default: "placeholder",
    },
    ratings: {
      type: Number,
      default: 4.5,
      max: [5, "Ratings cant exceed 5.0"], // maxlength property is only for Strings.
      min: [1, "Ratings must be min 1.0"],
    },
    images: [],
    category: {
      type: String,
      required: [true, "A product must have some category"],
      default: "placeholder",
    },
    seller: {
      type: String,
      required: [true, "A product must have seller Name"],
      default: "placeholder",
    },
    stock: {
      type: Number,
      required: [true, "A product must have number of stock"],
      default: 1,
    },
    numOfReviews: {
      type: String,
      // required:[true,]
      default: 0,
    },
    secretProduct: {
      type: Boolean,
      default: false,
    },
    // reviews: [],
    createAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    // in mongoose.schema we can pass not only objects, but also object for schema options
    // To make virtual properties also show up in JSON and output objects.
    // VIRTUAL PROPERTY The field not stored in the DB, But calculated using some other value.
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

//virtual properties

productsSchema.virtual("priceInDollars").get(function () {
  // assuming the price already in rupees.
  return this.price / 70;
});

// productsSchema.index({ price: 1 });
productsSchema.index({ price: 1, stock: 1 });

productsSchema.virtual("reviews", {
  ref: "Review",
  foreignField: "productId", // productId is the field from reviewModel
  localField: "_id",
});

// Document Middlware
// runs before .save() and .create()
productsSchema.pre("save", function (next) {
  console.log(this);
  this.slug = slugify(this.name, { lower: true });
  next();
});

// can also run multiple middlware
productsSchema.pre("save", function (next) {
  console.log("saving document.....");
  next();
});

productsSchema.post("save", function (doc, next) {
  console.log(doc);
  next();
});

// QUERY MIDDLEWARE

productsSchema.pre(/^find/, function (next) {
  this.find({ secretProduct: { $ne: true } });
  this.start = Date.now();
  next();
});

productsSchema.post(/^find/, function (doc, next) {
  console.log(
    `From QUERY MIDDLEWARE: The query took ${
      Date.now() - this.start
    } milliseconds`
  );
  // console.log(doc);
  next();
});

// AGGREGATION MIDDLEWARE

productsSchema.pre("aggregate", function (next) {
  this.pipeline().unshift({ $match: { secretProduct: { $ne: true } } });
  // console.log(this.pipeline()); below is the value for this.pipeline().
  // [
  //   { '$match': { secretProduct: [Object] } },
  //   { '$match': { price: [Object] } },
  //   {
  //     '$group': {
  //       _id: '$name',
  //       numProd: [Object],
  //       avgRatings: [Object],
  //       avgPrice: [Object],
  //       minPrice: [Object],
  //       maxPrice: [Object]
  //     }
  //   },
  //   { '$sort': { avgPrice: -1 } }
  // ]
  next();
});

// Creating Model from Schema.
const Products = mongoose.model("Products", productsSchema);

// Creating Documents and testing the model.
//   const testproduct = new Products({
//     name: "lg",
//     rating: 4.67,
//     price: 4977,
//   });

//   testproduct
//     .save()
//     .then((doc) => {
//       console.log(doc);
//     })
//     .catch((err) => {
//       console.log(err);
//     });

module.exports = Products;
