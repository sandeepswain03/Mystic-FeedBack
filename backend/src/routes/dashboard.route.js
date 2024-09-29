import { Router } from "express";
import {
    getMessages,
    updateMessageAcceptance,
    getMessageAcceptanceStatus,
    deleteMessage,
    deleteAllMessages,
    questionUpdate,
    pdfGenerate,
    createQuestion,
    fetchAllQuestion,
    deleteQuestion
} from "../controllers/dashboard.controller.js";
import checkAuth from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/message-acceptance").get(checkAuth, getMessageAcceptanceStatus);
router.route("/message-acceptance").put(checkAuth, updateMessageAcceptance);
router.route("/messages/:questionId").get(checkAuth, getMessages);
router.route("/messages/:messageId").delete(checkAuth, deleteMessage);
router.route("/deleteAllMessages").delete(checkAuth, deleteAllMessages);
router.route("/question-update").post(checkAuth, questionUpdate);
router.route("/pdf-generate").get(checkAuth, pdfGenerate);
router.route("/createQuestion").post(checkAuth, createQuestion);
router.route("/fetchAllQuestion").get(checkAuth, fetchAllQuestion);
router.route("/deleteQuestion").delete(checkAuth, deleteQuestion);


export default router;
