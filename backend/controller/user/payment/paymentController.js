// // mern day 31
// const {default : axios} = require("axios")
 

// exports.initiateKhaltiPayment = async(req,res)=>{
//      const {orderId, amount} = req.body
//     //  if(!orderId || !amount){
//     //     return res.status(400).json({
//     //         message : "Please provide orderId and amount"
//     //     })
//     //   }

//      const data ={
//       return_url : "http://localhost:3000/api/payment/success",
//       purchase_order_id : orderId || 23,
//       amount : amount || 2300,
//       website_url : "http://localhost:3000/",
//       purchase_order_name : "orderName_"+ orderId
    
//      }
//  const response = await axios.post("https://khalti.com/api/v2/epayment/initiate/", data ,{
//         headers : {
//             "Authorization " : "Key 4bb70e7db68c4c56b4fb5f84f253fa03"
//         }
//      })
//      console.log(response.data)
//      res.redirect(response.data.payment_url)
//     }

//     exports.verifyPidx = async(req,res)=>{
//       const pidx = req.query.pidx
//       const response =await axios.post("https://khalti.com/api/v2/epayment/lookup/",{pidx})
//       res.send(response)
//     }