import express from "express"
import {
	create,
	deleteOne,
	find,
	update,
	fineOne,
	search,
} from "../../controller/category/index.js"

const router = express.Router()

router.post("/", create)
router.get("/search", search)
router.put("/", update)
router.get("/detail", fineOne)
router.delete("/", deleteOne)
router.get("/", find)

export default router
