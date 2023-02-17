const express=require("express")
const route=require("./routes/route")
const mongoose=require("mongoose")

const app=express()
app.use(express.json())

mongoose.connect("mongodb+srv://Junaid619-DB:oS4jO8pwUnVaE0Fu@cluster0.4ufpuyj.mongodb.net/KKM-Assignment?retryWrites=true&w=majority",{
    useNewUrlParser:true
}
).then(()=>console.log("MongoDb is Connected"))
.catch(err=>console.log(err))

app.use("/",route)


app.listen(process.env.PORT||3000,function(){
    console.log("Express app is running on port" + (process.env.PORT||3000))
})