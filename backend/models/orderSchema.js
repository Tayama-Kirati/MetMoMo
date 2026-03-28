const mongoose = require ("mongoose");

const Schema = mongoose.Schema;

const orderSchema = new Schema({
  user: {type : mongoose.SchemaTypes.ObjectId, ref: "User"},
  items : [{
    quantity : {type:Number, required :true},
    product : {type:mongoose.Schema.Types.ObjectId, ref : "Product"}
  }],
  totalAmount : {type : Number, required:true},
  shippingAddress :{type :String, required:true},
  orderStatus :{
    type:String,
    enum : ["pending", "delivered", "cancelled","ontheway","preparation"],
    default : "pending"
  },
  paymentDetails : {
    method : {type:String, enum: ["COD","khalti"]},
    status : { type :String,enum :["paid","unpaid",'Pending']}
  }
},{
  timestamps :true
})

const Order = mongoose.model("Order", orderSchema)
module.exports = Order