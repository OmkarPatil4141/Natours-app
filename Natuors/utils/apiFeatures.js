class APIFeature
{
    constructor(query,queryString)
    {
        this.query = query;
        this.queryString = queryString;
    }

    filter()
    {
        const queryObj = { ...this.queryString }
        const  excludedFields = ['page','sort','limit','fields'];
        excludedFields.forEach(el => delete queryObj[el]);
       
        //  1b)Advance filtering for operators
        let queryStr = JSON.stringify(queryObj);
        //here \b for only exact lt or lte and g for all occurences 
        queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, opert=> `$${opert}`);
        
       this.query = this.query.find(JSON.parse(queryStr));
        return this;  //it simply returns object

    }

    sort()
    {
        if(this.queryString.sort)
       {
            const SortBy = this.queryString.sort.split(',').join(' ');
            // console.log(SortBy);
            // query = query.sort(req.query.sort)
             this.query = this.query.sort(SortBy)
        }
        else
        {
            this.query = this.query.sort('-createdAt')
        }

        return this;

    }

    limitFields()
    {
        if(this.queryString.fields){

            const fields = this.queryString.fields.split(',').join(' ');
    
            this.query = this.query.select(fields);
        }
        else
        {
            this.query = this.query.select('-__v'); // negative sign indicates exclude that field 
        }

        return this;
    }

    paginate()
    {
        //4) pagination
        //limit -> AMOUNT of results per page   
        const page = this.queryString.page * 1 || 1;
        const limit = this.queryString.limit * 1 || 100;
        const skip = (page - 1) * limit;

        //page=2&limit=10 1to10 on page 1, 11to20 on page 2...
        this.query = this.query.skip(skip).limit(limit);
        return this;

       
    }

}

module.exports = APIFeature