import { userModel } from "../../model/user.model.js"
import bcrypt from "bcryptjs"
import { categoryModel } from "../../model/category.model.js"
import * as fs from "fs"
import ideaModel from "../../model/idea.model.js"

export const getUser = async (req, res, next) => {
	try {
		const page = req.query.page ? req.query.page - 1 : 0
		const role = req.query.role ? req.query.role : "all"
		let users
		let count
		if (role == "all") {
			count = await userModel.count({})
			users = await userModel
				.find({}, "name email avatar _id phone address category")
				.limit(3)
				.skip(page * 3)
		} else {
			count = await userModel.count({ role: role })
			users = await userModel
				.find({ role: role }, "name email avatar _id phone address category")
				.limit(3)
				.skip(page * 3)
		}
		count = Math.ceil(count / 3)
		return res.status(200).json({
			users,
			count,
		})
	} catch (err) {
		res.status(404).json("Not found")
		next(err)
	}
}

export const getOne = async (req, res, next) => {
	try {
		const user = await userModel.findOne(
			{ _id: req.id },
			"name email avatar _id phone address like disLike category role"
		)
		if (!user) {
			return res.status(404).json("Not found")
		}
		res.status(200).json(user)
	} catch (err) {
		res.status(404).json("Not found")
		next(err)
	}
}

export const searchUser = async (req, res, next) => {
	try {
		const search = req.query.search.trim()
		const role = req.query.role ? req.query.role : "all"
		let user
		if (role == "all") {
			user = await userModel.findOne(
				{ email: search },
				"name email avatar _id phone address category"
			)
			user = [user]
			if (user[0] == null) {
				user = await userModel.find(
					{ name: search },
					"name email avatar _id phone address category"
				)
				if (user[0] == null) {
					const searchMany = new RegExp(search, "i")
					user = await userModel.find(
						{ name: searchMany },
						"name email avatar _id phone address category"
					)
				}
			}
		} else {
			user = await userModel.findOne(
				{ $and: [{ role: role }, { email: search }] },
				"name email avatar _id phone address category"
			)
			user = [user]
			if (user[0] == null) {
				user = await userModel.find(
					{ $and: [{ role: role }, { name: search }] },
					"name email avatar _id phone address"
				)
				if (user[0] == null) {
					const searchMany = new RegExp(search, "i")
					user = await userModel.find(
						{ $and: [{ role: role }, { name: searchMany }] },
						"name email avatar _id phone address category"
					)
				}
			}
		}
		return res.status(200).json({
			user,
		})
	} catch (err) {
		res.status(404).json("Not found")
		next(err)
	}
}

export const createOne = async (req, res, next) => {
	try {
		const userExist = await userModel.findOne({ email: req.body.email })
		const role = req.body.role
		if (
			userExist ||
			!(role === "manager" || role === "staff" || role === "coordinator")
		) {
			return res.status(409).json("Create failed")
		}
		let user
		if (role == "coordinator" || role == "staff") {
			user = new userModel({
				name: req.body.name,
				email: req.body.email,
				role,
				address: req.body.address,
				phone: req.body.phone,
				category: req.body.category,
			})
		} else {
			const category = await categoryModel.findOne(
				{ name: "Notification" },
				"_id"
			)
			user = new userModel({
				name: req.body.name,
				email: req.body.email,
				address: req.body.address,
				role,
				category: category._id,
				phone: req.body.phone,
			})
		}
		await user.save()
		fs.mkdirSync(`./public/avatar/${user.id}`, { recursive: true })
		if (user.role == "staff") {
			fs.mkdirSync(`./public/idea/${user.id}`, { recursive: true })
		}
		res.status(201).json(user)
	} catch (err) {
		res.status(409).json("Create failed")
		next(err)
	}
}

export const updateOne = async (req, res, next) => {
	try {
		let user
		if (req.file) {
			const avatar = req.file.path
			user = await userModel.findOneAndUpdate(
				{ _id: req.id },
				{
					name: req.body.name,
					phone: req.body.phone,
					address: req.body.address,
					avatar: avatar,
				},
				{
					new: true,
				}
			)
		} else {
			user = await userModel.findOneAndUpdate(
				{ _id: req.id },
				{
					name: req.body.name,
					phone: req.body.phone,
					address: req.body.address,
				},
				{
					new: true,
				}
			)
		}
		res.status(200).json(user)
	} catch (err) {
		res.status(409).json("Update failed")
		next(err)
	}
}

export const deleteOne = async (req, res, next) => {
	try {
		await userModel.deleteOne({ _id: req.query.id })
		fs.rmSync(`./public/avatar/${req.query.id}`, { recursive: true })
		await ideaModel.updateMany({ user: req.query.id }, { private: true })
		res.status(200).json("Delete successful")
	} catch (err) {
		res.status(409).json("Delete failed")
		next(err)
	}
}

export const changePassword = async (req, res, next) => {
	try {
		const newPasswordLength = req.body.newPassword.length
		const user = await userModel.findOne({ _id: req.id })
		if (
			!user ||
			!bcrypt.compareSync(req.body.password, user.password) ||
			req.body.newPassword == req.body.password ||
			newPasswordLength < 6
		) {
			return res.status(400).json("Password or user invaild")
		}
		const salt = bcrypt.genSaltSync(10)
		let passwordHash = bcrypt.hashSync(req.body.newPassword, salt)
		await userModel.updateOne({ _id: req.id }, { password: passwordHash })
		return res.status(200).json("Change password successful")
	} catch (err) {
		res.status(400).json("Password or user invaild")
		next(err)
	}
}
