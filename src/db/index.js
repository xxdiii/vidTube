import mongoose, { mongo } from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async () =>{
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
        console.log("\nMongoDB Connected✅");
        
    } catch (error) {
        console.error("MongoDb connection error❌",error);
        process.exit(1) 
    }
}

export default connectDB;