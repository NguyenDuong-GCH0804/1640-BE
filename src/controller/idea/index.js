import * as fs from "fs"
import nodemailer from "nodemailer"
import { categoryModel } from "../../model/category.model.js"
import ideaModel from "../../model/idea.model.js"
import { userModel } from "../../model/user.model.js"

export const createOne = async (req, res, next) => {
	try {
		let file = null
		let img = null
		if (req.files) {
			if (req.files.file) {
				file = req.files.file[0].path
			}
			if (req.files.img) {
				img = req.files.img[0].path
			}
		}
		const idea = await new ideaModel({
			content: req.body.content,
			private: req.body.private,
			file: file,
			img: img,
			category: req.body.category,
			user: req.id,
			time: req.time,
		}).save()
		const category = await categoryModel.findOne(
			{ _id: req.body.category },
			"idea"
		)
		await categoryModel.findByIdAndUpdate(req.body.category, {
			idea: category.idea + 1,
		})
		res.status(201).json(idea)
		await idea.populate({
			path: "user",
			select: "name avatar",
		})
		const coordinator = await userModel.find(
			{ $and: [{ role: "coordinator" }, { category: req.body.category }] },
			"email"
		)
		let emailC = ""
		for (let i = 0; i < coordinator.length; i++) {
			emailC += coordinator[i].email
			if (i != coordinator.length - 1) {
				emailC += ","
			}
		}
		const transport = nodemailer.createTransport({
			service: "gmail",
			auth: {
				user: process.env.Email,
				pass: process.env.PasswordEmail,
			},
		})
		const mailOptions = {
			from: process.env.Email,
			to: emailC,
			subject: `New Idea`,
			html: `<h1>${idea.user.name}</h1>
                    <h2> ${idea.content}</h2>
                    <img src = "cid:img"  alt="Header Image" width="100" height="100"/>`,
			attachments: [
				{
					filename: "file-1bpx3wwl19hoil0-test.jpg",
					path: "public/idea/6240831d9c7ecc9220c3fb41/file-1bpx3wwl19hoil0-test.jpg",
					cid: "img",
				},
			],
		}
		return await transport.sendMail(mailOptions)
	} catch (err) {
		res.status(409).json("Create failed")
		next(err)
	}
}

export const find = async (req, res, next) => {
	try {
		const page = req.query.page - 1
		let sort = "-createdAt"
		if (req.query.option == "popular") {
			sort = "-popular -_id"
		}
		if (req.query.option == "view") {
			sort = "-view -_id"
		}
		let ideas = await ideaModel
			.find({})
			.populate({
				path: "user",
				select: "name avatar",
			})
			.populate({
				path: "like",
				select: "name avatar",
			})
			.populate({
				path: "disLike",
				select: "name avatar",
			})
			.populate({
				path: "comment",
				select: "user content private id createdAt",
				options: { sort: { createdAt: -1 } },
			})
			.sort(sort)
			.limit(5)
			.skip(page * 5)
		let count = await ideaModel.count({})
		count = Math.ceil(count / 5)
		ideas = await userModel.populate(ideas, {
			path: "comment.user",
			select: "name avatar address role",
		})
		const data = ideas.map((idea) => {
			let isLiked = false
			idea.like.forEach((user) => {
				if (user.id == req.id.toString()) {
					isLiked = true
					return
				}
			})
			let isDisLiked = false
			if (!isLiked) {
				idea.disLike.forEach((user) => {
					if (user.id == req.id.toString()) {
						isDisLiked = true
						return
					}
				})
			}
			const user = {
				name: idea.private ? "Anonymouse" : idea.user.name,
				avatar: idea.private
					? "public/avatar/anonymouse.png"
					: idea.user.avatar,
			}
			let comment = []
			if (idea.comment.length > 0) {
				comment = idea.comment.map((comment) => {
					return {
						content: comment.content,
						private: comment.private,
						_id: comment._id,
						user: {
							name: comment.private ? "Anonymouse" : comment.user.name,
							avatar: comment.private
								? "public/avatar/anonymouse.png"
								: comment.user.avatar,
							address: comment.user.address,
							role: comment.user.role,
						},
						time: timeDifference(Date.now(), comment.createdAt),
					}
				})
			}
			const time = timeDifference(Date.now(), idea.createdAt)
			return {
				id: idea.id,
				content: idea.content,
				file: idea.file,
				img: idea.img,
				user: user,
				category: idea.category,
				like: idea.like,
				dislike: idea.disLike,
				comment: comment,
				time: time,
				isLiked,
				isDisLiked,
			}
		})
		res.status(200).json({ count, data })
		return
	} catch (err) {
		res.status(404).json("Not found")
		next(err)
	}
}

export const view = async (req, res, next) => {
	try {
		const id = req.query.id
		const idea = await ideaModel.findOne({ id: id }, "view")
		await ideaModel.findByIdAndUpdate(id, { view: idea.view + 1 })
		res.status(200).json("Views successful")
	} catch (err) {
		res.status(409).json("Not found")
		next(err)
	}
}

export const like = async (req, res, next) => {
	try {
		const ideaId = req.query.id
		const idea = await ideaModel.findOne(
			{ _id: ideaId },
			"like disLike popular"
		)
		const isLike = idea.like.includes(req.id.toString())
		const isDisLike = idea.disLike.includes(req.id.toString())
		const option = isLike ? "$pull" : "$push"
		const popular = isLike ? idea.popular - 1 : idea.popular + 1
		await ideaModel.findByIdAndUpdate(ideaId, {
			[option]: { like: req.id },
			popular: popular,
		})
		if (isDisLike == true) {
			await ideaModel.findByIdAndUpdate(ideaId, {
				$pull: { disLike: req.id },
				popular: popular + 1,
			})
		}
		res.status(200).json("Like Successful")
	} catch (err) {
		res.status(501).json("Error Like")
		next(err)
	}
}

export const disLike = async (req, res, next) => {
	try {
		const ideaId = req.query.id
		const idea = await ideaModel.findOne(
			{ _id: ideaId },
			"like disLike popular"
		)
		const isLike = idea.like.includes(req.id.toString())
		const isDisLike = idea.disLike.includes(req.id.toString())
		const option = isDisLike ? "$pull" : "$push"
		const popular = isDisLike ? idea.popular + 1 : idea.popular - 1
		await ideaModel.findByIdAndUpdate(ideaId, {
			[option]: { disLike: req.id },
			popular: popular,
		})
		if (isLike == true) {
			await ideaModel.findByIdAndUpdate(ideaId, {
				$pull: { like: req.id },
				popular: popular - 1,
			})
		}
		res.status(200).json("Dislike Successful")
	} catch (err) {
		res.status(501).json("Error Like")
		next(err)
	}
}

export const deleteOne = async (req, res, next) => {
	try {
		const id = req.query.id
		const idea = await ideaModel
			.findOne({ _id: id }, "img file")
			.populate("category", "id idea")
		await categoryModel.findByIdAndUpdate(idea.category.id, {
			idea: idea.category.idea - 1,
		})
		if (idea) {
			if (idea.img) {
				fs.unlinkSync(idea.img)
			}
			if (idea.file) {
				fs.unlinkSync(`${idea.file}`)
			}
			await ideaModel.deleteOne({ _id: id })
			res.status(200).json("Delete successful")
			return
		}
		res.status(404).json("Not found idea")
		return
	} catch (err) {
		res.status(409).json("Delete failed")
		next(err)
	}
}

export const dashboard = async (req, res, next) => {
	try {
		const ideas = await ideaModel
			.find({}, "like disLike view content")
			.populate({
				path: "user",
				select: "name",
			})
		const arrayLike = await ideaModel
			.find({}, "like disLike view content")
			.populate({
				path: "user",
				select: "name",
			})
			.sort("-like")
			.limit(3)
		const arrayDisLike = await ideaModel
			.find({}, "like disLike view content")
			.populate({
				path: "user",
				select: "name",
			})
			.sort("-disLike")
			.limit(3)
		const arrayView = await ideaModel
			.find({}, "like disLike view content")
			.populate({
				path: "user",
				select: "name",
			})
			.sort("-view")
			.limit(3)
		let totalLike = 0
		let totalDisLike = 0
		let totalView = 0
		ideas.forEach((idea) => {
			totalView += idea.view
			totalDisLike += idea.disLike.length
			totalLike += idea.like.length
		})
		res.status(200).json({
			dashboard1: {
				like: totalLike,
				dislike: totalDisLike,
				view: totalView,
			},
			dashboard2: {
				like: arrayLike,
				dislike: arrayDisLike,
				view: arrayView,
			},
		})
		return
	} catch (err) {
		res.status(500).json("Get dashboard failed")
		next(err)
	}
}

function timeDifference(current, previous) {
	const msPerMinute = 60 * 1000
	const msPerHour = msPerMinute * 60
	const msPerDay = msPerHour * 24
	const msPerMonth = msPerDay * 30
	const msPerYear = msPerDay * 365

	const elapsed = current - previous

	if (elapsed < msPerMinute) {
		if (elapsed / 1000 < 30) return "Just now"
		return `${Math.round(elapsed / 1000)} seconds ago`
	} else if (elapsed < msPerHour) {
		return `${Math.round(elapsed / msPerMinute)}  minutes ago`
	} else if (elapsed < msPerDay) {
		return `${Math.round(elapsed / msPerHour)}  hours ago`
	} else if (elapsed < msPerMonth) {
		return `${Math.round(elapsed / msPerDay)}  days ago`
	} else if (elapsed < msPerYear) {
		return `${Math.round(elapsed / msPerMonth)}  months ago`
	} else {
		return `${Math.round(elapsed / msPerYear)}  years ago`
	}
}
