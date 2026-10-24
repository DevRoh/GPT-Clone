import expresss from "express";
import { login,signup,profile,logout, deleteProfile } from "../controllers/userController.js";
import { isAuth } from "../middleware/isAuth.js";

const userRouter = expresss.Router();

//login, logout, signup, profile

userRouter.post("/signup", signup);
userRouter.post("/login", login);
userRouter.get("/logout", logout);
userRouter.get("/profile", isAuth, profile);
userRouter.delete('/del',isAuth,deleteProfile)

export default userRouter;
