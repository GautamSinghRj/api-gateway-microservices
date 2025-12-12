import { Router } from "express";
import { registerUser,loginUser,healthCheck } from "../controller/userController";

const router=Router();

router.get("/health",healthCheck);
router.post("/register",registerUser);
router.post("/login",loginUser);

export default router;