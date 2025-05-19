import e from "express";


const router = e.Router();
import { signup,login } from "../Controllers/AuthController.js";
import { signupvalidation,loginvalidation } from "../Middlewares/AuthValidation.js";
router.post('/signup',signupvalidation,signup)
router.post('/login',loginvalidation,login)

export default router