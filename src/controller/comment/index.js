import commentModel from "../../model/comment.model.js"
import ideaModel from "../../model/idea.model.js"
import nodemailer from "nodemailer"

export const createOne = async (req, res, next) => {
	try {
		const comment = await new commentModel({
			content: req.body.content,
			category: req.body.category,
			user: req.id,
			private: req.body.private,
			idea: req.body.idea,
		}).save()
		await ideaModel.findByIdAndUpdate(req.body.idea, {
			$push: { comment: comment },
		})
		res.status(201).json(comment)
		const idea = await ideaModel
			.findOne({ id: req.body.idea })
			.populate({ path: "user", select: "email" })
		comment.populate({ path: "user", select: "name email" })
		const transport = nodemailer.createTransport({
			service: "gmail",
			auth: {
				user: process.env.Email,
				pass: process.env.PasswordEmail,
			},
		})
		const mailOptions = {
			from: process.env.Email,
			to: idea.user.email,
			subject: `New Comment`,
			html: `<h1>${idea.user.name}</h1>
                    <h2> ${idea.content}</h2>
                    <h1>${comment.user.name}</h1>
                    <h2>${comment.user.name}</h2>
                    <h1>${comment.content}</h1>`,
		}
		return await transport.sendMail(mailOptions)
	} catch (err) {
		res.status(409).json("Create failed")
		next(err)
	}
}

export const updateOne = async (req, res, next) => {
	try {
		await commentModel.updateOne(
			{ _id: req.body.id },
			{
				private: req.body.private,
				content: req.body.content,
			}
		)
		res.status(200).json("Update successful")
	} catch (err) {
		res.status(409).json("Update failed")
		next(err)
	}
}

export const deleteOne = async (req, res, next) => {
	try {
		await commentModel.deleteOne({ _id: req.body.id })
		await ideaModel.findByIdAndUpdate(req.body.idea, {
			$pull: { comment: req.body.id },
		})
		res.status(200).json("Delete successful")
		return
	} catch (err) {
		res.status(409).json("Delete failed")
		next(err)
	}
}
