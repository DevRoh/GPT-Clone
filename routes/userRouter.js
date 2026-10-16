import expresss from "express";
import { login,signup,profile,logout } from "../controllers/userController.js";
import { isAuth } from "../middleware/isAuth.js";

const userRouter = expresss.Router();

//login, logout, signup, profile

userRouter.post("/signup", signup);
userRouter.post("/login", login);
userRouter.get("/logout", logout);
userRouter.get("/profile", isAuth, profile);

export default userRouter;
