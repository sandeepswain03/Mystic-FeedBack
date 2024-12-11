import { Router } from "express";
import {
    registerUser,
    loginUser,
    logoutUser,
    getCurrentUser,
    sendOtp
} from "../controllers/user.controller.js";
import checkAuth from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register").post(registerUser);
router.route("/login").post(loginUser);
router.route("/logout").post(checkAuth, logoutUser);
router.route("/current-user").get(checkAuth, getCurrentUser);
router.route("/send-otp").get(sendOtp);


export default router;
