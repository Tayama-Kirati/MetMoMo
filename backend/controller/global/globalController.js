const Product = require("../../models/productModel");
const Review = require("../../models/reviewModel");
const catchAsync = require("../../services/catchAsync");  



exports.getProducts = catchAsync(async (req, res) => {
  // const product = await Product.find().populate({
  //   path :"reviews",
  //   populate: {
  //     path : "userId",
  //     select : "userName userEmail"
  //   }
  // });
  const product = await Product.find();
  if (product.length == 0) {
    return res.status(404).json({
      message: "Product not found",
      product: [],
    });
  }
  return res.status(200).json({
    message: "Products retrieved successfully",
    data: product,
  });
});



exports.getProduct = catchAsync(async (req, res) => {
  const { id } = req.params;
  if (!id) {
    return res.status(400).json({
      message: "Please provide product id",
    });
  }
  const product = await Product.find({ _id: id });
  const productReviews = await Review.find({ productId: id }).populate("userId").populate("productId");

  if (product.length == 0) {
    return res.status(404).json({
      message: "Product not found",
      product: [],
      productReviews: []
    });
  }
  return res.status(200).json({
    message: "Product retrieved successfully",
    data: {product,productReviews}
    
  });
});
