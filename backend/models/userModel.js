const mongoose=require('mongoose');
const Schema=mongoose.Schema;

const userSchema=new Schema({
    userEmail: {
        type: String,
       required: [true, 'Email must be provided']
    },
    userName: {
        type: String,
        required: [true, 'Name must be provided']
    },
    userPhoneNumber: {
        type: Number,
        required: [true, 'PhoneNumber must be provided']
    },
    userPassword: {
        type: String,
        required: [true, 'Password must be provided'],
    },
    userRole: {
        type: String,
        enum: ['customer', 'admin'],
        default: 'customer'
    },
    otp: {
        type: 'number',
        select : false
    },
    otpIsVerified : {
        type: Boolean,
        default: false,
        select : false
    },
    cart : [{type : Schema.Types.ObjectId, ref : "Product"}]
    
    },{
    timestamps:true
}
);

const User=mongoose.model('User',userSchema);
module.exports = User;
