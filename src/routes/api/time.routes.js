import express from "express"
import {
	create,
	getAll,
	getOne,
	deleteOne,
	update,
	downloadXlsx,
	downloadZip,
	getIdea,
} from "../../controller/time/index.js"
import { checkTime, checkDownload } from "../../middleware/time.middleware.js"

const router = express.Router()

router.get("/idea", getIdea)
router.get("/downloadzip", checkDownload, downloadZip)
router.get("/downloadxlsx", checkDownload, downloadXlsx)
router.put("/", checkTime, update)
router.delete("/", checkTime, deleteOne)
router.get("/detail", getOne)
router.post("/", checkTime, create)
router.get("/", getAll)

export default router
