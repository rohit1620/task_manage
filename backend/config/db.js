

import mongoose from 'mongoose';

const connectDb=async(req,res)=>{
    try {
        await mongoose.connect(process.env.MONGO_URI)
        console.log("connected to mongodb")
    } catch (error) {
        console.log("internal error",error.message)
    }
}

export default connectDb;