import { categoryModel } from "../../model/category.model.js"

export const find = async (req, res, next) => {
	try {
		const category = await categoryModel.find({})
		return res.status(200).json(category)
	} catch (error) {
		res.status(404).json("Not found")
		next(error)
	}
}

export const fineOne = async (req, res, next) => {
	try {
		const category = await categoryModel.findOne({ _id: req.query.id })
		return res.status(200).json(category)
	} catch (error) {
		res.status(404).json("Not found")
		next(error)
	}
}

export const create = async (req, res, next) => {
	try {
		const category = await new categoryModel({
			name: req.body.name,
			description: req.body.description,
			idea: 0,
		}).save()
		return res.status(201).json(category)
	} catch (error) {
		res.status(409).json("Create failed")
		next(error)
	}
}

export const search = async (req, res, next) => {
	try {
		const search = req.query.search.trim()
		let category = await categoryModel.findOne({ name: search })
		category = [category]
		if (category[0] == null) {
			const searchMany = new RegExp(search, "i")
			category = await categoryModel.find({ name: searchMany })
		}
		return res.status(200).json(category)
	} catch (error) {
		res.status(404).json("Not found")
		next(error)
	}
}

export const update = async (req, res, next) => {
	try {
		await categoryModel.updateOne({ _id: req.query.id }, req.body)
		return res.status(200).json("Update successful")
	} catch (error) {
		res.status(409).json("Update failed")
		next(error)
	}
}

export const deleteOne = async (req, res, next) => {
	try {
		const category = await categoryModel.findOne({ _id: req.query.id }, "idea")
		if (category.idea == 0) {
			await categoryModel.deleteOne({ _id: req.query.id })
			return res.status(200).json("Delete successful")
		}
		res.status(409).json("Delete failed")
	} catch (error) {
		res.status(409).json("Delete failed")
		next(error)
	}
}
