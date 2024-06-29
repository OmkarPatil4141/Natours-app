const User = require('./../Models/userModel');
const catchAsync = require('./../utils/catchAsync')



/////////////////////////////////////////////////////
// Route handlers
/////////////////////////////////////////////////////

  exports.getAllUsers = catchAsync(async(req,res,next)=>{

    const users = await User.find();

    //send rs
    res.status(200).json({
      status:"success",
      results:users.length,
      data : {
        users
      }  
  });
});

  exports.getUser = (req,res)=>{
    res.status(500).json({
        status : "fail",
        message : "This route is not yet iplemented"
    })
}

  exports.createUser = (req,res)=>{
    res.status(500).json({
        status : "fail",
        message : "This route is not yet iplemented"
    })
}

  exports.updateUser = (req,res)=>{
    res.status(500).json({
        status : "fail",
        message : "This route is not yet iplemented"
    })
}

  exports.delteUser = (req,res)=>{
    res.status(500).json({
        status : "fail",
        message : "This route is not yet iplemented"
    })
}