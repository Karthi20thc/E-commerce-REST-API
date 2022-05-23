const catchAsync = (fn) => {
 // console.log("CatchAsync function executed!");
 // returning anonymous function
 return (request, response, next) => {
  // fn is just a async function coming as a argument, we need call here to execute.
  fn(request, response, next).catch(next);
  // fn.catch(next);     wrong
  // fn().catch(next);   wrong
 };
};

module.exports = catchAsync;
