const mongoose =require("mongoose")
const Schema = mongoose.Schema

//userId, productId, rating, comment, createdAt
const reviewSchema = new Schema({
   userId :{
    type : Schema.Types.ObjectId,
    ref : "User",
    required : true
   },
   productId :{
    type : Schema.Types.ObjectId,
    ref : "Product",
    required : true
   },
   rating : {
    type : Number,
    required : true,
    default : 3, 
   },
   message : {
    type : String,
    required : true
   },
   ownerReply : {
    text : { type : String },
    at   : { type : Date },
   },
   reports : [{
    user   : { type : Schema.Types.ObjectId, ref : "User" },
    reason : { type : String, default : "" },
    at     : { type : Date, default : Date.now },
   }],
   isHidden : { type : Boolean, default : false },
}, { timestamps : true })

reviewSchema.index({ productId : 1 })
reviewSchema.index({ userId : 1, productId : 1 }, { unique : true })

const Review = mongoose.model("Review", reviewSchema);
module.exports = Review;