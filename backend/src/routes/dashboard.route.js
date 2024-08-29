import { Router } from "express";
import {
    getMessages,
    updateMessageAcceptance,
    getMessageAcceptanceStatus,
    deleteMessage,
} from "../controllers/dashboard.controller.js";
import verifyJWT from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/message-acceptance").get(verifyJWT, getMessageAcceptanceStatus);
router.route("/message-acceptance").put(verifyJWT, updateMessageAcceptance);
router.route("/messages").get(verifyJWT, getMessages);
router.route("/messages/:messageId").delete(verifyJWT, deleteMessage);

export default router;
