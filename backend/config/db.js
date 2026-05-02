import mongoose from 'mongoose';

const connectDb=async(req,res)=>{
    try {
        await mongoose.connect(process.env.MONGO_URI)
    } catch (error) {
        console.log("internal error",error.message)
    }
}

export default connectDb;