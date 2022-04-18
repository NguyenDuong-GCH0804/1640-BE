import timeModel from "../model/time.model.js"
export const checkTime = async (req, res, next) => {
	try {
		const check = new Date()
		check.setDate(check.getDate() - 5)
		req.start = new Date(req.body.start)
		req.end = new Date(req.body.end)
		if (req.start > req.end && req.start > check) {
			res.status(409).json("Create failed")
			return
		}
		next()
	} catch (err) {
		res.status(409).json("Create failed")
		return
	}
}

export const checkIdea = async (req, res, next) => {
	try {
		const times = await timeModel.find({ exit: true }).sort("-createAt")
		let timeArray = []
		const now = new Date()
		times.forEach(async (time) => {
			if (time.start < now && now < time.end) {
				timeArray.push(time.id)
			} else {
				if (now > time.end) {
					await timeModel.updateOne({ id: time.id }, { exist: false })
				}
			}
		})
		if (timeArray.length == 0) {
			res.status(409).json("Create failed")
			return
		}
		req.time = timeArray
		next()
	} catch (err) {
		res.status(409).json("Create failed")
		return
	}
}

export const checkDownload = async (req, res, next) => {
	try {
		const time = await timeModel.findOne({ _id: req.query.id })
		const now = new Date()
		if (!time) {
			res.status(404).json("Not found")
			next(err)
		}
		if (now < time.end) {
			res.status(409).json("Download failed")
			return
		}
		if (time.exist == true) {
			await timeModel.updateOne({ id: time.id }, { exist: false })
		}
		req.time = time
		next()
	} catch (err) {
		res.status(409).json("Download failed")
		return
	}
}
