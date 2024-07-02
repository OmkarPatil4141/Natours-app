const User = require('./../Models/userModel');
const catchAsync = require('./../utils/catchAsync')
const AppError = require('./../utils/appError')



const filterObj = (obj, ...allowedFields)=>{
  const newObj = {};
  Object.keys(obj).forEach(el=>{
    if(allowedFields.includes(el)) newObj[el] = obj[el];
  })
    return newObj;
}
/////////////////////////////////////////////////////
// Route handlers
/////////////////////////////////////////////////////

//delete user itself
exports.deleteMe = catchAsync( async (req,res,next)=>{

   await User.findByIdAndUpdate(req.user.id, {active: false})

   res.status(204).json({ 
    status:"success",
    data:null
   });
})


//update user data
exports.updateMe = catchAsync(async(req,res,next)=>{

  // 1) create errro if user posts Password data
  if(req.body.password ||req.body.passwordConfirm)
      return next(new AppError('This route is not for Password update . Please use /updateMyPassword!!',400));


  // 2) Fitered out unwanted fields names there are not allowed to updated 

  const filteredBody = filterObj(req.body,'name','email');

  //  3) update user document
    const updatedUser = await User.findByIdAndUpdate(req.user.id,filteredBody,{
      new:true,
      runValidators:true
    });
    


  res.status(200).json({
    status:"success",
    data:{
      user:updatedUser
    }
  });
})


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
        message : "This route is not yet implemented"
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