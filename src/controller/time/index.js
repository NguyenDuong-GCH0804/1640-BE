import ideaModel from "../../model/idea.model.js"
import xl from "excel4node"
import * as fs from "fs"
import JSZip from "jszip"
import timeModel from "../../model/time.model.js"

export const create = async (req, res, next) => {
	try {
		const time = await new timeModel({
			start: req.start,
			end: req.end,
			exit: true,
		}).save()
		res.status(200).json(time)
	} catch (err) {
		res.status(409).json("Create failed")
		next(err)
	}
}

export const getAll = async (req, res, next) => {
	try {
		const times = await timeModel.find({})
		res.status(200).json(times)
	} catch (err) {
		res.status(404).json("Not found")
		next(err)
	}
}

export const getOne = async (req, res, next) => {
	try {
		const time = await timeModel.findOne({ _id: req.query.id })
		if (!time) {
			return res.status(404).json("Not found")
		}
		return res.status(200).json(time)
	} catch (err) {
		res.status(404).json("Not found")
		next(err)
	}
}

export const update = async (req, res, next) => {
	try {
		await timeModel.findByIdAndUpdate(req.query.id, req.body)
		res.status(200).json("Update successful")
	} catch (err) {
		res.status(404).json("Error to update")
		next(err)
	}
}

export const deleteOne = async (req, res, next) => {
	try {
		const time = await timeModel.findOne({ _id: req.query.id })
		await timeModel.deleteOne({ _id: req.query.id })
		if (time.zip) {
			fs.rmSync(time.zip, { recursive: true })
		}
		if (time.xlsx) {
			fs.rmSync(time.xlsx, { recursive: true })
		}
		return res.status(200).json("Delete successful")
	} catch (err) {
		res.status(409).json("Delete failed")
		next(err)
	}
}

export const getIdea = async (req, res, next) => {
	try {
		const page = req.query.page ? req.query.page - 1 : 0
		const ideas = await ideaModel
			.find({ time: { $in: [req.query.id] } }, "content user")
			.populate({
				path: "user",
				select: "name",
			})
			.sort("-createdAt")
			.limit(5)
			.skip(page * 5)
		let count = await ideaModel.count({ time: { $in: [req.query.id] } })
		count = Math.ceil(count / 5)
		let data = ideas.map((idea) => {
			return {
				id: idea.id,
				content: idea.content,
				user: {
					name: idea.user.name,
				},
			}
		})
		return res.status(200).json({ data, count })
	} catch (err) {
		res.status(404).json("Not found")
		next(err)
	}
}

export const downloadXlsx = async (req, res, next) => {
	try {
		const time = req.time
		if (time.xlsx) {
			res.status(200).json({ urlFile: time.xlsx })
			return
		}
		// time: {"$in":[req.query.id]}
		const ideas = await ideaModel
			.find({ time: { $in: [req.query.id] } })
			.populate({
				path: "user",
				select: "email",
			})
			.populate({
				path: "category",
				select: "name",
			})
			.sort("-createdAt")
		const wb = new xl.Workbook()
		const ws = wb.addWorksheet(req.query.id)
		const styleTitle = wb.createStyle({
			font: {
				bold: true,
				color: "#FF0800",
				size: 12,
			},
			alignment: {
				horizontal: "center",
			},
		})
		const style = wb.createStyle({
			font: {
				color: "#121111",
				size: 12,
			},
			alignment: {
				horizontal: "center",
			},
		})
		ws.cell(1, 1).string("ID").style(styleTitle)
		ws.cell(1, 2).string("PostBy").style(styleTitle)
		ws.cell(1, 3).string("Category").style(styleTitle)
		ws.cell(1, 4).string("Content").style(styleTitle)
		ws.cell(1, 5).string("Like").style(styleTitle)
		ws.cell(1, 6).string("DisLike").style(styleTitle)
		ws.cell(1, 7).string("Comment").style(styleTitle)
		ws.cell(1, 8).string("Date").style(styleTitle)
		ws.cell(1, 9).string("Link").style(styleTitle)
		if (ideas.length > 0) {
			for (let i = 0; i < ideas.length; i++) {
				ws.cell(i + 2, 1)
					.string(ideas[i].id)
					.style(style)
				ws.cell(i + 2, 2)
					.string(ideas[i].user.email)
					.style(style)
				ws.cell(i + 2, 3)
					.string(ideas[i].category.name)
					.style(style)
				ws.cell(i + 2, 4)
					.string(ideas[i].content)
					.style(style)
				ws.cell(i + 2, 5)
					.number(ideas[i].like.length || 0)
					.style(style)
				ws.cell(i + 2, 6)
					.number(ideas[i].disLike.length || 0)
					.style(style)
				ws.cell(i + 2, 7)
					.number(ideas[i].comment.length || 0)
					.style(style)
				ws.cell(i + 2, 8)
					.string(
						ideas[i].createdAt.toLocaleString("es-CL", {
							year: "numeric",
							month: "numeric",
							day: "numeric",
						})
					)
					.style(style)
				ws.cell(i + 2, 9)
					.string("")
					.style(style)
			}
		}
		ws.column(1).setWidth(30)
		ws.column(2).setWidth(25)
		ws.column(4).setWidth(40)
		const urlFile = `public/xlsx/${time.start.toLocaleString("es-CL", {
			year: "numeric",
			month: "numeric",
			day: "numeric",
		})}_${time.end.toLocaleString("es-CL", {
			year: "numeric",
			month: "numeric",
			day: "numeric",
		})}.xlsx`
		const buffer = await wb.writeToBuffer()
		fs.writeFileSync(urlFile, buffer, function (err) {
			if (err) {
				throw err
			}
		})
		await timeModel.updateOne({ _id: time.id }, { xlsx: urlFile })
		res.status(200).json({ urlFile })
		return
	} catch (err) {
		res.status(404).json("Not found")
		next(err)
	}
}

export const downloadZip = async (req, res, next) => {
	try {
		const time = req.time
		if (!time) {
			res.status(404).json("Not found")
			next(err)
		}
		if (time.zip) {
			res.status(200).json({ urlFile: time.zip })
			return
		}
		const zip = new JSZip()
		//time: {"$in":[req.query.id]}
		const ideas = await ideaModel
			.find({ time: { $in: [req.query.id] } }, "file img id")
			.sort("-createdAt")
		ideas.forEach((idea) => {
			zip.folder(`${idea.id}`)
			if (idea.img != null) {
				const slug = idea.img.split(".")
				const nameFile = "img." + slug[slug.length - 1]
				zip.file(`${idea.id}/${nameFile}`, fs.readFileSync(idea.img))
			}
			if (idea.file != null) {
				const slug = idea.file.split(".")
				const nameFile = "file." + slug[slug.length - 1]
				zip.file(`${idea.id}/${nameFile}`, fs.readFileSync(idea.file))
			}
		})
		const urlFile = `public/zip/${time.start.toLocaleString("es-CL", {
			year: "numeric",
			month: "numeric",
			day: "numeric",
		})}_${time.end.toLocaleString("es-CL", {
			year: "numeric",
			month: "numeric",
			day: "numeric",
		})}.zip`
		zip
			.generateNodeStream({ type: "nodebuffer", streamFiles: true })
			.pipe(fs.createWriteStream(urlFile))
			.on("finish", () => {
				res.status(200).json({ urlFile })
				return
			})
		await timeModel.updateOne({ _id: time.id }, { zip: urlFile })
		res.status(200).json({ urlFile })
		return
	} catch (err) {
		res.status(404).json("Not found")
		next(err)
	}
}
