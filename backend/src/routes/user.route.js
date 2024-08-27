import { Router } from "express";
import {
    registerUser,
    loginUser,
    logoutUser,
    getMessages,
    updateMessageAcceptance,
    getMessageAcceptanceStatus,
    deleteMessage,
    sendMessage,
    refreshAccessToken,
    getCurrentUser
} from "../controllers/user.controller.js";
import verifyJWT from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register").post(registerUser);
router.route("/login").post(loginUser);
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/messages").get(verifyJWT, getMessages);
router.route("/message-acceptance").put(verifyJWT, updateMessageAcceptance);
router.route("/message-acceptance").get(verifyJWT, getMessageAcceptanceStatus);
router.route("/messages/:messageId").delete(verifyJWT, deleteMessage);
router.route("/send-message").post(sendMessage);
router.route("/refresh-token").post(refreshAccessToken);
router.route("/current-user").get(verifyJWT, getCurrentUser);

export default router;
