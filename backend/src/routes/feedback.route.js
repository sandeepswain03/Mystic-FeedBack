import { Router } from "express";
import {
    getQuestion,
    getUserName,
    sendMessage
} from "../controllers/feedback.controller.js";

const router = Router();

router.route("/getQuestion").get(getQuestion);
router.route("/getUserName").get(getUserName);
router.route("/send-message").post(sendMessage)

export default router;