class APIFeatures {
  constructor(query, reqQueryString) {
    this.query = query;
    this.reqQueryString = reqQueryString;
  }
  filter() {
    const queryobj = { ...this.reqQueryString };
    // console.log(queryobj);
    // 1a.Filtering
    // console.log(request.query);
    // deleting fields in our query object other than filter
    const excludedFields = ["sort", "page", "limit", "fields"];
    excludedFields.forEach((el) => {
      delete queryobj[el];
    });

    // 1b. Advanced Filtering :
    // console.log(request.query);  { stock: { gt: '50' } } , postman --127.0.0.1:9000/api/v1/products?stock[gt]=50
    // console.log(queryobj);
    let queryStr = JSON.stringify(queryobj);

    // just adding dollar sign before gte,gt,lte,lt
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
    console.log(JSON.parse(queryStr)); //{ stock: { '$gt': '50' } }
    // console.log(queryString);
    // As we chain methods to the query, then only by the end await the query, so that it can execute.
    // let query = Products.find(JSON.parse(queryString));
    this.query = this.query.find(JSON.parse(queryStr));
    // console.log(query);
    return this;
  }

  sort() {
    // 2. Sorting
    // console.log(request.query);
    if (this.reqQueryString.sort) {
      // sorting by only one field
      // query = query.sort(request.query.sort);

      // sorting by multiple fields    console.log(request.query)---->{ sort: 'price,stock' }
      const sortby = this.reqQueryString.sort.split(",").join(" ");
      console.log(sortby); // price stock
      this.query = this.query.sort(sortby);
    } else {
      //else here is for default. In case user doesnt specify any sort filed.
      // query = request.query.sort("-createAt"); mistake --> used request.query but it should be just query.
      this.query = this.query.sort("-createAt"); // chaining the query from filter
    }
    return this;
  }
  // 3 limitingFields
  limitingFields() {
    if (this.reqQueryString.fields) {
      console.log(this.reqQueryString.fields);
      const fields = this.reqQueryString.fields.split(",").join(" ");
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select("-__v");
    }
    return this;
  }

  paginate() {
    // 4. Pagination
    // skip ---> Amout of results should be skipped before querying data.
    // 127.0.0.1:9000/api/v1/products?page=2&limit=10
    // ex query = query.skip(10).limit.(10) so, for page 2,we need to skip 10 results, and limit 10     results for page 2.
    // setting default values and getting values from the query string

    const page = this.reqQueryString.page * 1 || 1;
    console.log(page);
    const limit = this.reqQueryString.limit * 1 || 100;
    const skip = (page - 1) * limit;
    this.query = this.query.skip(skip).limit(limit);

    // Throw an error each time the user selects the page that does not exist. This only happens when there is a page field on the query.
    // if (this.reqQueryString.page) {
    //   console.log(this.reqQueryString);
    //   //some problem with this code below, didnt work.
    //   // const NumOfProd = await Products.countDoucments();
    //   // console.log(NumOfProd);

    //   // if (skip >= NumOfProd) {
    //   //   throw new Error("This page does not exist");
    //   // }
    // }
    return this;
  }
}
module.exports = APIFeatures;
