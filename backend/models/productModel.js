const mongoose=require('mongoose');
const Schema=mongoose.Schema;
const {reviewSchema}=require("./nextReviewModel");


const productSchema=new Schema({
    productName: {
        type: String,
       required: [true, 'Product Name must be provided']
    },
    productDescription: {
        type: String,
        required: [true, 'Product Description must be provided']
    },
    productPrice: {
        type: Number,
        required: [true, 'Product Price must be provided']
    },
    productCategory: {
        type: String,
        required: [true, 'Product Category must be provided']
    },
    productStatus: {
        type: String,
        enum: ['available', 'unavailable'],
        default: 'available'
    },
    productQuantity: {
        type: Number,
        required: [true, 'Product Quantity must be provided']
    },
    productImage: String,
    // reviews: [reviewSchema]
    
},{
  timestamps:true
});

const Product=mongoose.model('Product',productSchema);
module.exports = Product;
 
     

 
 
 