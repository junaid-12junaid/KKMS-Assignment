const productModel = require('../Models/productModel')
const userModel=require('../Models/userModel')

const { isValid, keyValid,quantityValid, priceValid, validString} = require('../Validator/validation')


const { isValidObjectId } = require('mongoose')


const createProduct = async function (req, res) {
    try {


        const userId = req.params.userId;

        if (!isValidObjectId(userId))
            return res.status(400).send({ status: false, message: `The given userId: ${userId} is not in proper format` });

        // finding user details
        const findUser = await userModel.findOne({ _id: userId });
        if (!findUser) return res.status(404).send({ status: false, message: `User details not found with this provided userId: ${userId}` });


            if (req.decodedToken != userId)
            return res.status(403).send({ status: false, message: "Error, authorization failed" });


        const data = req.body
       

        if (!keyValid(data)) return res.status(400).send({ status: false, message: "Please Enter data to Create the Product" })

        const { productName, price, quantity} = data

        if (!isValid(productName)) return res.status(400).send({ status: false, message: "productName is mandatory and should have non empty String" })

        if (await productModel.findOne({ productName })) return res.status(400).send({ status: false, message: `This Product Name ${productName} is already present please Give another productName` })

        if (!isValid(price)) return res.status(400).send({ status: false, message: "Price is mandatory and should have non empty Number" })

        if (!priceValid(price)) return res.status(400).send({ status: false, message: "price should be in  valid Formate with Numbers || Decimals" })
        
        if (!isValid(quantity)) return res.status(400).send({ status: false, message: "quantity is mandatory and should have non empty Number" })

        if (!quantityValid(quantity)) return res.status(400).send({ status: false, message: "quantity should be in valid Formate with Numbers" })

        let obj = {
            productName, price, quantity
        }

        const newProduct = await productModel.create(obj)

        return res.status(201).send({ status: true, message: "Product is created successfully", data: newProduct })

    } catch (error) {
        return res.status(500).send({ error: error.message })
    }
}


async function getProducts(req, res) {
    try {
        let filter = req.query;
        let query = { isDeleted: false,active:true };


        if (keyValid(filter)) {
            let { productName, price, quantity } = filter;

            

            if (!validString(productName)) return res.status(400).send({ status: false, message: "If you select name than it should have non empty" })
            if (productName) {
                const regexName = new RegExp(productName, "i");
                query.productName = { $regex: regexName };
            }

            if (!validString(price)) return res.status(400).send({ status: false, message: "If you select price than it should have non empty" })
            if (price) {
                price = JSON.parse(price)

                if (!validString(price.priceGreaterThan)) return res.status(400).send({ status: false, message: "If you select priceGreaterThan than it should have non empty" })
                if (price.priceGreaterThan) {
                    if (!priceValid(price.priceGreaterThan)) { return res.status(400).send({ status: false, messsage: "Enter a valid price in priceGreaterThan" }) }
                    query.price = { '$gt': price.priceGreaterThan }
                }

                if (!validString(price.priceLessThan)) return res.status(400).send({ status: false, message: "If you select priceLessThan than it should have non empty" })
                if (price.priceLessThan) {
                    if (!priceValid(price.priceLessThan)) { return res.status(400).send({ status: false, messsage: "Enter a valid price in priceLessThan" }) }
                    query['price'] = { '$lt': price.priceLessThan }
                }
                if (price.priceLessThan && price.priceGreaterThan) {
                    query.price = { '$lte': price.priceLessThan, '$gte': price.priceGreaterThan }
                }
            }

            if (!validString(quantity)) return res.status(400).send({ status: false, message: "If you select quantity than it should have non empty" })
            if (quantity) {
                if (!quantityValid(quantity)) return res.status(400).send({ status: false, message: "quantity should be in  valid Formate with Numbers" })
                query.quantity=quantity;
            }

        }

        let data = await productModel.find(query).sort({ price: -1 });

        if (data.length == 0) {
            return res.status(404).send({ status: false, message: "No products found with this query" });
        }

        return res.status(200).send({ status: true, message: "Success", "number of products": data.length, data })

    } catch (error) {
        return res.status(500).send({ status: false, message: error.message })
    }
}




const getProductById = async function (req, res) {
    try {
        let productId = req.params.productId

        if (!productId) { return res.status(400).send({ ststus: false, msg: "Please enter Product Id in Path Params" }) }
        if (!isValidObjectId(productId)) { return res.status(400).send({ status: false, msg: "Invalid Product Id" }) }
        const product = await productModel.findOne({ _id: productId, isDeleted: false,active:true })

        if (!product) { return res.status(404).send({ status: false, messgage: `Product is deleted or Not Available` }) }

        return res.status(200).send({ status: true, msg: "Success", data: product })



    } catch (error) {
        return res.status(500).send({ error: error.message })

    }
}

const updateProduct = async function (req, res) {
    try {
        let {userId,productId} = req.params

        let body = req.body

        if (!isValidObjectId(userId))
        return res.status(400).send({ status: false, message: `The given userId: ${userId} is not in proper format` });

    // finding user details
    const findUser = await userModel.findOne({ _id: userId });
    if (!findUser) return res.status(404).send({ status: false, message: `User details not found with this provided userId: ${userId}` });


        if (req.decodedToken != userId)
        return res.status(403).send({ status: false, message: "Error, authorization failed" });

        if (!keyValid(body)) return res.status(400).send({ status: false, message: "Please Enter data to Update the Product" })

        if (!isValidObjectId(productId)) return res.status(400).send({ status: false, message: 'productId is not valid' })

        let product = await productModel.findById(productId)

        if (!product) return res.status(404).send({ status: false, messgage: 'product not found' })

        if (product.isDeleted == true) return res.status(400).send({ status: false, messgage: `Product is deleted` })

        if (product.active == false) return res.status(400).send({ status: false, messgage: `Product is not active` })

        const data = {}

        let { productName, price, quantity,active } = body

        if (!validString(productName)) return res.status(400).send({ status: false, message: "productName can not be empty" })
        if (productName) {
            if (await productModel.findOne({ productName })) return res.status(400).send({ status: false, message: `This productName ${productName} is already present please Give another productName` })
            data.productName = productName
        }

        if (!validString(price)) return res.status(400).send({ status: false, message: "price can not be empty" })
        if (price) {

            if (!priceValid(price)) return res.status(400).send({ status: false, message: "price should be in  valid Formate with Numbers || Decimals" })

            data.price = price
        }

        if (!validString(quantity)) return res.status(400).send({ status: false, message: "price can not be empty" })
        if (quantity) {

            if (!quantityValid(quantity)) return res.status(400).send({ status: false, message: "quantity should be in  valid Formate with Numbers" })

            data.quantity = quantity
        }

        if (!validString(active)) return res.status(400).send({ status: false, message: "price can not be empty" })
        if (active) {
            if(active!==true||active!==false) return res.status(400).send({ status: false, message: "active should be in Boolean" })
            data.active = active
        }

        


        const newProduct = await productModel.findByIdAndUpdate(productId, data, { new: true })

        return res.status(200).send({ status: true, message: "Success", data: newProduct })

    } catch (error) {
        return res.status(500).send({ error: error.message })
    }
}


async function deleteProductById(req, res) {
    try {
        let {userId,productId} = req.params


        if (!isValidObjectId(userId))
        return res.status(400).send({ status: false, message: `The given userId: ${userId} is not in proper format` });

    // finding user details
    const findUser = await userModel.findOne({ _id: userId });
    if (!findUser) return res.status(404).send({ status: false, message: `User details not found with this provided userId: ${userId}` });


        if (req.decodedToken != userId)
        return res.status(403).send({ status: false, message: "Error, authorization failed" });

        if (!isValidObjectId(productId)) return res.status(400).send({ status: false, message: 'productId is not valid' })
        let data = await productModel.findOne({ _id: productId, isDeleted: false })
        if (!data) return res.status(404).send({ status: true, message: "No products found or may be deleted already" });

        await productModel.findByIdAndUpdate(productId, { isDeleted: true })
        return res.status(200).send({ status: true, message: "Deleted Successfully" });

    } catch (error) {
        return res.status(500).send({ status: false, message: error.message })
    }
}

module.exports = { createProduct,getProducts,getProductById,updateProduct,deleteProductById}