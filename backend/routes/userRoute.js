import {getAllEmployees,deleteUser} from '../controllers/userControllers.js'
import express from 'express';
import { authMiddleware } from "../middleware/authMiddleWare.js";

const router=express.Router();

router.route("/").get(authMiddleware,getAllEmployees);
// router.route("/resetPassword/:id").patch(authMiddleware,resetPassword);
router.route("delete/:id").delete(authMiddleware,deleteUser);

export default router;