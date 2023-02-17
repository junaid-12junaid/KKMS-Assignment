const userModel = require("../Models/userModel")
const { isValid, isValidName, isvalidEmail, isValidPassword, keyValid } = require('../Validator/validation')


const bcrypt = require('bcrypt')

const jwt = require('jsonwebtoken')

const createUser = async function (req, res) {
    try {
        const data = req.body
       
        if (!keyValid(data)) return res.status(400).send({ status: false, message: "Please Enter data to Create the User" })
       

        const { fname, lname, email, password } = data

        if (!isValid(fname)) return res.status(400).send({ status: false, message: "fname is mandatory and should have non empty String" })

        if (!isValidName.test(fname)) return res.status(400).send({ status: false, message: "Please Provide fname in valid formate and Should Starts with Capital Letter" })

        if (!isValid(lname)) return res.status(400).send({ status: false, message: "lname is mandatory and should have non empty String" })

        if (!isValidName.test(lname)) return res.status(400).send({ status: false, message: "Please Provide lname in valid formate and Should Starts with Capital Letter" })

        if (!isValid(email)) return res.status(400).send({ status: false, message: "email is mandatory and should have non empty String" })

        if (!isvalidEmail.test(email)) return res.status(400).send({ status: false, message: "email should be in  valid Formate" })

        if (await userModel.findOne({ email })) return res.status(400).send({ status: false, message: "This email is already Registered Please give another Email or Login" })

        if (!isValid(password)) return res.status(400).send({ status: false, message: "Password is mandatory and should have non empty String" })

        if (!isValidPassword(password)) return res.status(400).send({ status: false, message: "please provide Valid password with 1st letter should be Capital letter and contains spcial character with Min length 8 and Max length 15" })

       

        const encyptPassword = await bcrypt.hash(password, 10)

        let obj = {
            fname, lname, email, password: encyptPassword
        }

        const newUser = await userModel.create(obj)

        return res.status(201).send({ status: true, message: "User created successfully", data: newUser })

    } catch (error) {
        return res.status(500).send({ error: error.message })
    }
}

const loginUser = async function (req, res) {
    try {
        let data = req.body
        const { email, password } = data
        //=====================Checking the validation=====================//
        if (!keyValid(data)) return res.status(400).send({ status: false, msg: "Email and Password Required !" })

        //=====================Validation of EmailID=====================//
        if (!email) return res.status(400).send({ status: false, msg: "email is required" })


        //=====================Validation of Password=====================//
        if (!password) return res.status(400).send({ status: false, msg: "password is required" })

        //===================== Checking User exsistance using Email and password=====================//
        const user = await userModel.findOne({ email: email })
        if (!user) return res.status(400).send({ status: false, msg: "Email is Invalid Please try again !!" })

        const verifyPassword = await bcrypt.compare(password, user.password)

        if (!verifyPassword) return res.status(400).send({ status: false, msg: "Password is Invalid Please try again !!" })


        //===================== Creating Token Using JWT =====================//
        const token = jwt.sign({
            userId: user._id.toString()
        }, "KKM Software", { expiresIn: '25h' })

        res.setHeader("x-api-key", token)

        let obj = {
            userId: user._id,
            token: token
        }

        res.status(200).send({ status: true, message: "User login successfull", data: obj })
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message })
    }
}







module.exports = { createUser, loginUser }