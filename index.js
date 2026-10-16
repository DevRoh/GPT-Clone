import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import userRouter from "./routes/userRouter.js";
import messageRouter from "./routes/messageRouter.js";
import cookieParser from "cookie-parser";

dotenv.config();

const PORT = process.env.PORT || 4000;

const app = express();
app.use(express.json());
app.use(cookieParser());

app.use("/user", userRouter);
app.use("/msg", messageRouter);

const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Server is listening at port ${PORT}`);
    });
  } catch (error) {
    console.log("Error at connecting db");
    console.log(error.message);
  }
};

startServer();
