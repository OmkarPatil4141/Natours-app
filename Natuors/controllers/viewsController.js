const Tour = require('../Models/tourModel')
const catchAsync = require('../utils/catchAsync')

exports.getOverview = catchAsync(async (req,res)=>{

    //1) Get tour data from colection
    const tours = await Tour.find();


    //2) build template

    //3) Render that template using tour data from 1)
    res.status(200).render('overview',{
        title:'All the tours',
        tours:tours
       
    });
});

exports.getTour = catchAsync(async(req,res)=>{
    //1) Get the data , for requested tour (including reviews and guides)
    
    const tour =  await Tour.findOne({slug:req.params.slug}).populate({
        path:'reviews',
        fields:'review rating user'
    })

    //2) build template

    //3) Render that template using tour data from 1)
    res.status(200).render('tour',{
        title:'The Forest Hiker tour',
        tour
    })
})