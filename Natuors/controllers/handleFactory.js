const catchAsync = require('../utils/catchAsync')
const AppError = require('../utils/appError')
const APIFeature = require('../utils/apiFeatures');



exports.deleteOne = Model =>
    catchAsync(async(req,res,next)=>{
 
        // const del = await Tour.deleteOne(req.params.id)
      const doc =   await Model.findByIdAndDelete(req.params.id);
        //{_id:"666d7cd402379557e484e691"}

        //added 404 error with 
        if(!doc)
        {
            return next(new AppError('No Document found with that id',404))
        }

        res.status(204).json({  //204 -> no content     
            status : "Success",
            data : null
        })
})
 

exports.updateOne = Model => catchAsync (async (req,res,next)=>{
    
    const doc = await Model.findByIdAndUpdate(req.params.id,req.body,{
            new:true,
            runValidators:true
        });
        //added 404 error with 
        if(!doc)
        {
            return next(new AppError('No Document found with that id',404))
        }

        res.status(200).json({
            status:"success",
            data:{
                data:doc
            }
        })
    
})

    
exports.createone = Model => catchAsync(async(req,res,next) =>{
    
    const doc = await Model.create(req.body);
    res.status(200).json({
    status:"success",
    data : {
    data : doc
    }
    })
    })

exports.getone = (Model,popOptions)=>catchAsync(async(req,res,next)=>{

    let query = Model.findById(req.params.id);

    if(popOptions) query = query.populate(popOptions)
   
    const doc = await query;
    // instead by findID we can use findone like
    // doc.findOne({_id:666d7cd402379557e484e691})

    //added 404 error with 
    if(!doc)
    {
        return next(new AppError('No Document found with that id',404))
    }
    res.status(200).json({
        "status":"success",
        data : {
            data:doc
        }  
    })

});

exports.getAll = Model =>
    catchAsync(async(req,res,next)=>{

        //to allow nested GET Reviews on tour
        let filter = {};
        if(req.params.tourId) filter = {tour:req.params.tourId}

  
        //Execute Query
        const features = new APIFeature(Model.find(filter),req.query).filter().sort().limitFields().paginate();
        // const doc = await features.query.explain();
        const doc = await features.query;
            res.status(200).json({
                "status":"success",
                result : doc.length,
                data : {
                    data:doc
                }
            })
        })