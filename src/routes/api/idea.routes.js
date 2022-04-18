import express from "express"
import {
	createOne,
	find,
	like,
	disLike,
	deleteOne,
	view,
	dashboard,
} from "../../controller/idea/index.js"
import upload from "../../middleware/upload.middleware.js"
import { checkIdea } from "../../middleware/time.middleware.js"
import { isStaff } from "../../middleware/auth.middleware.js"

const router = express.Router()

router.delete("/", isStaff, deleteOne)
router.put("/dislike", disLike)
router.put("/like", like)
router.put("/view", view)
router.post(
	"/",
	isStaff,
	checkIdea,
	upload.fields([{ name: "file" }, { name: "img" }]),
	createOne
)
router.get("/dashboard", dashboard)
router.get("/", find)
export default router
