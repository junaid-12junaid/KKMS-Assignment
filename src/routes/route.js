let express=require('express')
let router=express.Router()

let {authentication}=require('../MiddleWare/auth')

let {loginUser,createUser}=require('../Controllers/userController')

let {createProduct,getProducts,getProductById,updateProduct,deleteProductById}=require("../Controllers/productController")



//users routes =============================> 

router.post("/user/register",createUser)

router.post("/user/login",loginUser)


//product routes =============================> 

router.post("/product/:userId",authentication,createProduct)
router.get("/product",getProducts)
router.get("/product/:productId",getProductById)
router.put("/product/:productId/:userId",authentication,updateProduct)
router.delete("/product/:productId/:userId",authentication,deleteProductById)








module.exports=router