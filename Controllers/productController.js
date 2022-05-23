const Products = require("./../models/productModel");
const APIFeatures = require("./../utlis/apiFeatures");
const catchAsync = require("./../utlis/catchAsync");
const AppError = require("./../utlis/appError");

const factory = require("./../Controllers/handlerFactory");

// const fs = require("fs");
// const products = JSON.parse(fs.readFileSync("dev-data/products.json"));

// creating our own middleware to check the id, before entering into one of the middleware below.
// exports.checkId = (request, response, next, val) => {
//   // we will recieve the request product id from request.param.id and check that id into the database, if not found send a response back "invalid id".
//   // when we have invalid id,never forget to return the response, so next() function wont be called.
//   console.log("logic not yet implemented");
//   next();
// };

// exports.checkbody = (request, response, next) => {
//   if (!request.body.name || !request.body.price) {
//     return response.status(400).json({
//       status: "fail",
//       message: "missing name or price ",
//     });
//   }
//   next();
// };

exports.aliasTopProducts = (request, response, next) => {
  // console.log(request.query);
  // for top products, we are pre defining the values ourselves, and this values acts like a request , the second middleware (getalloproducts) in ProductRoutes will recieve these values and execute the query.
  request.query.limit = "5";
  // setting value price as lowest (Ascending) here. numOfReviews is sorted first then price.
  request.query.sort = "-numOfReviews,price ";
  next();
};

// exports.getallproducts = async (request, response) => {
//   // response.status(200).json({
//   // data: products,
//   // -----------------------------------------------
//   try {
//     //Execute Query
//     // console.log(Products.find());
//     // console.log(request.query);
//     // const checking = await Products.find();
//     // console.log(checking);
//     const features = new APIFeatures(Products.find(), request.query)
//       .filter()
//       .sort()
//       .limitingFields()
//       .paginate();
//     const products = await features.query;
//     response.status(200).json({
//       status: "success",
//       data: {
//         total: products.length,
//         products,
//       },
//     });
//   } catch (err) {
//     response.status(400).json({
//       status: "fail",
//       message: err,
//     });
//   }
// };

// exports.getallproducts = catchAsync(async (request, response) => {
//   const features = new APIFeatures(Products.find(), request.query)
//     .filter()
//     .sort()
//     .limitingFields()
//     .paginate();
//   const products = await features.query;
//   response.status(200).json({
//     status: "success",
//     data: {
//       total: products.length,
//       products,
//     },
//   });
// });

exports.getallproducts = factory.getAll(Products);

// exports.getproductbyid = async (request, response) => {
//   // console.log(request.params);
//   // const id = request.params.id;
//   // console.log(id, typeof id);
//   // console.log(products);
//   // const product = products.find((el) => el.id === id);
//   // console.log(product);
//   // response.status(200).json({
//   //    product,
//   // });
//   // ---------------------------------------------------------
//   try {
//     const products = await Products.findById(request.params.id);
//     response.status(200).json({
//       status: "success",
//       data: {
//         total: products.length,
//         products,
//       },
//     });
//   } catch (err) {
//     response.status(400).json({
//       status: "fail",
//       message: err,
//     });
//   }
// };

// exports.getproductbyid = catchAsync(async (request, response, next) => {
//   const products = await Products.findById(request.params.id).populate(
//     "reviews"
//   );
//   if (!products) {
//     // only if ID is 24 characters long and its different from the database
//     // 61c145654de925291efd7da2 --success
//     // 61c145654de925291efd7da9 last value changed to number 9  --> message: "No Product found with that ID"
//     // 61c145654de925291efd7dap last value changed to alphabet p --> message: "Cast to ObjectId failed for value \"61c145654de925291efd7dap\" (type string) at path \"_id\" for model \"Products\""

//     // /61c145654de92 characters less than OriginalID --> "Cast to ObjectId failed for value \"61c145654de92\" (type string) at path \"_id\" for model \"Products\""

//     // 61c145654de925291efd7da2werqwerq321234 Characters greater then OriginalID --> "Cast to ObjectId failed for value \"61c145654de925291efd7da2werqwerq321234\" (type string) at path \"_id\" for model \"Products\""
//     return next(new AppError("No Product found with that ID", 404));
//   }
//   response.status(200).json({
//     status: "success",
//     data: {
//       total: products.length,
//       products,
//     },
//   });
// });

exports.getproductbyid = factory.getOne(Products, { path: "reviews" }); // second argumnet needs to be an object. we can also add select field.

// app.post("/", (request, response) => {
//     console.log("you can post to this endpoint");
// });

// exports.createproductbypost = async (request, response) => {
//   // response.send("done");
//   // console.log(request.body);
//   // const newid = Math.random().toFixed(3);
//   // const newProduct = Object.assign({ id: newid }, request.body);
//   // products.push(newProduct);
//   // fs.writeFile(
//   //   `${__dirname}/dev-data/products.json`,
//   //   JSON.stringify(products),
//   //   (err) => {
//   //     response.status(201).json({
//   //       Totalelements: products.length,
//   //       products: products,
//   //     });
//   // ----------------------------------------------------------------
//   try {
//     const newProduct = await Products.create(request.body);
//     response.status(201).json({
//       stauts: "success",
//       data: {
//         product: newProduct,
//       },
//     });
//   } catch (err) {
//     response.status(400).json({
//       status: "fail",
//       message: err,
//     });
//   }
// };

// exports.createproductbypost = catchAsync(async (request, response, next) => {
//   const newProduct = await Products.create(request.body);
//   response.status(201).json({
//     stauts: "success",
//     data: {
//       product: newProduct,
//     },
//   });
// });

exports.createproductbypost = factory.createOne(Products);

// exports.updateproductbyid = async (request, response) => {
//   // response.status(200).json({
//   //   updatedproduct: "just a placeholder, logic is not yet implemented",
//   // });
//   // -----------------------------------------------------
//   try {
//     const product = await Products.findByIdAndUpdate(
//       request.params.id,
//       request.body,
//       {
//         new: true,
//         runValidators: true,
//       }
//     );
//     response.status(201).json({
//       stauts: "success",
//       data: {
//         product,
//       },
//     });
//   } catch (err) {
//     response.status(404).json({
//       status: "fail",
//       message: err,
//     });
//   }
// };

// exports.updateproductbyid = catchAsync(async (request, response) => {
//   const product = await Products.findByIdAndUpdate(
//     request.params.id,
//     request.body,
//     {
//       new: true,
//       runValidators: true,
//     }
//   );
//   response.status(201).json({
//     stauts: "success",
//     data: {
//       product,
//     },
//   });
// });

exports.updateproductbyid = factory.updateOne(Products);

// exports.deleteProduct = async (request, response) => {
//   try {
//     await Products.findByIdAndDelete(request.params.id);
//     response.status(204).json({
//       data: "The Product has benn deleted",
//     });
//   } catch (err) {
//     response.status(404).json({
//       status: "fail",
//       message: err,
//     });
//   }
// };

// exports.deleteProduct = catchAsync(async (request, response) => {
//   await Products.findByIdAndDelete(request.params.id);
//   response.status(204).json({
//     data: "The Product has been deleted",
//   });
// });

exports.deleteProduct = factory.deleteOne(Products);

// AGGREGATION PIPELINE
// after this add a new route in ProductRouter.

// exports.getProductStats = async (request, response) => {
//   try {
//     const stats = await Products.aggregate([
//       {
//         // $match acts like a preliminary stage for the upcoming stages.
//         // $match: { ratings: { $gt: 3.0 } },
//         $match: { price: { $gte: 0.0 } },
//         // $match: { name: "$name" },
//       },
//       {
//         $group: {
//           // _id: null,
//           _id: "$name", // all the below are grouped based on name.
//           // _id: { $toUpper: "$name" },
//           //_id: $difficulty , here difficulty is the field name in data. if the value of the difficulty if easy, medium, hard. so based on the data, the data is grouped.

//           numProd: { $sum: 1 }, // each of the document that goes through this pipeline 1 will be added.
//           avgRatings: { $avg: "$ratings" },
//           avgPrice: { $avg: "$price" },
//           minPrice: { $min: "$price" },
//           maxPrice: { $max: "$price" },
//         },
//       },
//       {
//         $sort: { avgPrice: -1 },
//       },
//       // {
//       //   we can also repeat stages
//       //   $match: {_id: { $ne: "Easy"} , // if id has a property (ex. difficulty : easy,) with field value Easy, that will not be incuded . the _id: $difficulty must be used in above $group, then only we can use here.
//       //     },
//       //   },
//       // },
//       // {
//       //   //we can also repeat stages
//       //   $match: {_id: {$ne: "Apple MacBook Air (13-inch, 8GB RAM, 256GB SSD Storage) - Space Gray"},
//       //   }, // if id has a property (ex. difficulty : easy,) with field value Easy, that will not be incuded . the _id: $difficulty must be used in above $group, then only we can use here.
//       // },
//     ]);
//     response.status(200).json({
//       status: "success",
//       message: stats,
//     });
//   } catch (err) {
//     response.status(404).json({
//       status: "fail",
//       message: err,
//     });
//   }
// };

exports.getProductStats = catchAsync(async (request, response) => {
  const stats = await Products.aggregate([
    {
      // $match acts like a preliminary stage for the upcoming stages.
      // $match: { ratings: { $gt: 3.0 } },
      $match: { price: { $gte: 0.0 } },
      // $match: { name: "$name" },
    },
    {
      $group: {
        // _id: null,
        _id: "$name", // all the below are grouped based on name.
        // _id: { $toUpper: "$name" },
        //_id: $difficulty , here difficulty is the field name in data. if the value of the difficulty if easy, medium, hard. so based on the data, the data is grouped.

        numProd: { $sum: 1 }, // each of the document that goes through this pipeline 1 will be added.
        avgRatings: { $avg: "$ratings" },
        avgPrice: { $avg: "$price" },
        minPrice: { $min: "$price" },
        maxPrice: { $max: "$price" },
      },
    },
    {
      $sort: { avgPrice: -1 },
    },
    // {
    //   we can also repeat stages
    //   $match: {_id: { $ne: "Easy"} , // if id has a property (ex. difficulty : easy,) with field value Easy, that will not be incuded . the _id: $difficulty must be used in above $group, then only we can use here.
    //     },
    //   },
    // },
    // {
    //   //we can also repeat stages
    //   $match: {_id: {$ne: "Apple MacBook Air (13-inch, 8GB RAM, 256GB SSD Storage) - Space Gray"},
    //   }, // if id has a property (ex. difficulty : easy,) with field value Easy, that will not be incuded . the _id: $difficulty must be used in above $group, then only we can use here.
    // },
  ]);
  response.status(200).json({
    status: "success",
    message: stats,
  });
});
// exports.getMonthlyPlan = async (request, response) => {};
