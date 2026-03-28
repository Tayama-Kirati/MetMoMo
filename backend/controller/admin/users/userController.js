const User = require('../../../models/userModel');

exports.getUsers = async(req, res) => {
  const userId= req.params.id;
    const users = await User.find({_id: {$ne: userId}});
    if (users.length >1){
    return res.status(200).json({
        message: "Users retrieved successfully",
            data: users
        })  
        }
         res.status(404).json({
            message: "No users found in the database",
            data: []
          })
      }

//delete exports.getUsers;
exports.deleteUser = async(req, res) => {
  const userId = req.params.id
  if(!userId){
    return res.status(400).json({
      message: "Please provide user id"
    })
  }
  //CHECK IF USER EXISTS OR NOT
  const user = await User.findById(userId)
  if(!user){
    res.status(404).json({
      message: "User not found with the userid"
    })
  }
  else{
    await User.findByIdAndDelete(userId)
    res.status(200).json({
      message: "User deleted successfully"
    })
  }
}


