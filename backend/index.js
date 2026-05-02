import dotenv from 'dotenv';
dotenv.config();
import cors from 'cors';
import express from 'express';
import connectDb from './config/db';
import authRouter from './routes/authRoute';
import taskRouter from './routes/taskRoute';
import userRouter from './routes/userRoute'

const app=express();

app.use(cors());
app.use(express.json());
app.use("/auth",authRouter);
app.use("/task",taskRouter);
app.use("/user",userRouter);

app.get("/",(req,res)=>{
    res.json({"msg":"This is home page"})
})

const port=process.env.PORT;

connectDb.then(()=>{
app.listen(port,()=>{
    console.log("server running on port",port)
})
})

