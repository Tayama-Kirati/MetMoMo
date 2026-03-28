const Product = require("../../../models/productModel");
const catchAsync = require("../../../services/catchAsync");
const fs = require("fs");
const path = require("path");

 
exports.createProduct = catchAsync(async (req, res) => {
  const { productName, productDescription, productPrice, productCategory, productStatus, productQuantity } = req.body;

  if (!productName || !productDescription || !productPrice || !productCategory || !productStatus || !productQuantity) {
    return res.status(400).json({ message: "Please provide all fields: productName, productDescription, productPrice, productCategory, productStatus, productQuantity" });
  }

 
  let productImage = "";
  if (req.file) {
    productImage = `${process.env.BACKEND_URL || "http://localhost:3000"}/uploads/${req.file.filename}`;
  }

  const product = await Product.create({
    productName, productDescription,
    productPrice: Number(productPrice),
    productCategory, productStatus,
    productQuantity: Number(productQuantity),
    productImage,
  });

  return res.status(201).json({ message: "Product created successfully", data: product });
});

exports.deleteProduct = catchAsync(async (req, res) => {
  const { id } = req.params;
  const product = await Product.findByIdAndDelete(id);
  if (!product) return res.status(404).json({ message: "Product not found" });
  return res.status(200).json({ message: "Product deleted successfully" });
});

 
exports.editProduct = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { productName, productDescription, productPrice, productCategory, productStatus, productQuantity } = req.body;

  const oldProduct = await Product.findById(id);
  if (!oldProduct) return res.status(404).json({ message: "Product not found" });

  let productImage = oldProduct.productImage;

  if (req.file) {
    if (oldProduct.productImage) {
      const oldFilename = path.basename(oldProduct.productImage);
      const oldPath = path.join(__dirname, "../../../uploads", oldFilename);
      fs.unlink(oldPath, (err) => { if (err) console.log("Could not delete old image:", err.message) });
    }
    productImage = `${process.env.BACKEND_URL || "http://localhost:3000"}/uploads/${req.file.filename}`;
  }

  const updated = await Product.findByIdAndUpdate(
    id,
    { productName, productDescription, productPrice: Number(productPrice), productCategory, productStatus, productQuantity: Number(productQuantity), productImage },
    { new: true, runValidators: true }
  );

  res.status(200).json({ message: "Product updated successfully", data: updated });
});


// const Product = require("../../../models/productModel");
// const catchAsync = require("../../../services/catchAsync");
// const fs = require("fs");
 
// exports.createProduct = catchAsync(async (req, res) => {
//   const file = req.file;
//   let filePath;
//   if (!file) {
//     filePath = "";
//   } else {
//     filePath = req.file.path;
//   }

//   const {
//     productName,
//     productDescription,
//     productPrice,
//     productCategory,
//     productStatus,
//     productQuantity,
//   } = req.body;

//   if (
//     !productName ||
//     !productDescription ||
//     !productPrice ||
//     !productCategory ||
//     !productStatus ||
//     !productQuantity
//   ) {
//     return res.status(400).json({
//       message:
//         "Please provide all the details of productName, productDescription, productPrice, productCategory, productStatus, productQuantity",
//     });
//   }
//   const product= await Product.create({
//     productName,
//     productDescription,
//     productPrice,
//     productCategory,
//     productStatus,
//     productQuantity,
//     productImage: process.env.BACKEND_URL + filePath,
//   });
//   return res.status(201).json({
//     message: "Product is successfully created",
//     data: product,
//   });
// });

// exports.deleteProduct = catchAsync(async (req, res) => {
//   const { id } = req.params;
//   if (!id) {
//     return res.status(400).json({
//       message: "Please provide product id",
//     });
//   }
//   const product= await Product.findByIdAndDelete(id);
//   if (!product) {
//     return res.status(404).json({
//       message: "Product not found",
//     });
//   }
//   return res.status(200).json({
//     message: "Product deleted successfully",
//   });
// });

// exports.editProduct = catchAsync(async (req, res) => {
//   const { id } = req.params;
//   const {
//     productName,
//     productDescription,
//     productPrice,
//     productCategory,
//     productStatus,
//     productQuantity,
//   } = req.body;

//   if (
//     !productName ||
//     !productDescription ||
//     !productPrice ||
//     !productCategory ||
//     !productStatus ||
//     !productQuantity
//   ) {
//     return res.status(400).json({
//       message: "All fields are required",
//     });
//   }

//   const oldProduct = await Product.findById(id);

//   if (!oldProduct) {
//     return res.status(404).json({
//       message: "Product not found",
//     });
//   }

//   const oldProductImage = oldProduct.productImage;
//   const lengthToCut = process.env.BACKEND_URL.length;
//   const findFilePathAfterCut = oldProductImage.slice(lengthToCut);
//   // If new image uploaded
//   if (req.file && req.file.filename) 
//     {
//     await fs.unlink("/upload"+ findFilePathAfterCut, (err) => {
//       if (err) 
//         {
//           console.log("Image delete error:", err)
//         }
//       else {
//         console.log("Old image deleted successfully");
//       }
//      });
//     };

 

//   const datas = await Product.findByIdAndUpdate(
//     id,
//     {
//       productName,
//       productDescription,
//       productPrice,
//       productCategory,
//       productStatus,
//       productQuantity,
//       productImage: req.file && req.file.filename ? process.env.BACKEND_URL + req.file.filename : oldProductImage
//   },
//     {
//       new: true,
//       runValidators: true,
//     }
//   )
//   res.status(200).json({
//     message: "Product Updated Successfully",
//     datas:[]
//   });
// });

 