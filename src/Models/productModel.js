let mongoose=require("mongoose")

const productSchema=new mongoose.Schema({
    productName:{
        type:String,
        required:true,
        trim:true
    },

    price:{
        type:Number,
        required:true,
        trim:true
    },

    quantity:{
        type:Number,
        default:1,
        trim:true
    },

    active:{
        type:Boolean,
        default:true
    },
    
    isDeleted:{
    type:Boolean,
    default:false
    }
},{timestamps:true})


module.exports=mongoose.model('products',productSchema)
