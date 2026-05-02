import {addTask,getAllTask,updateStatus,deleteTask,updateTask} from "../controllers/taskControllers.js";
import express from 'express';
import { authMiddleware } from "../middleware/authMiddleWare.js";

const router=express.Router();

router.route("/").get(authMiddleware,getAllTask)
router.route("/addTask").post(authMiddleware,addTask)
router.route("/updateStatus/:id").patch(authMiddleware,updateStatus)
// router.route("/updateTask/:id").patch(authMiddleware,updateTask)
router.route("/deleteTask/:id").delete(authMiddleware,deleteTask)

export default router;