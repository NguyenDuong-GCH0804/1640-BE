import { mongoose } from "mongoose"
import { categoryModel } from "./category.model.js"
const Schema = mongoose.Schema
import bcrypt from "bcryptjs"
import * as fs from "fs"
const salt = bcrypt.genSaltSync(10)
let passwordHash = bcrypt.hashSync("123456", salt)

const user = new Schema(
	{
		name: { type: String, min: 1, max: 50 },
		email: { type: String, min: 1, max: 100, unique: true },
		password: { type: String, min: 1, default: passwordHash },
		category: {
			type: Schema.Types.ObjectId,
			ref: "category",
		},
		phone: { type: String, min: 9 },
		covert: { type: Boolean },
		address: { type: String, min: 1, max: 255 },
		avatar: { type: String, default: "public/avatar/avatar.png" },
		role: { type: String, min: 1 },
	},
	{
		timestamps: { currentTime: () => Math.floor(Date.now()) },
	}
)

export const userModel = mongoose.model("users", user)

export function initializeUser() {
	try {
		userModel.estimatedDocumentCount(async (err, count) => {
			if (!err && count == 0) {
				const category = await categoryModel.findOne(
					{ name: "Notification" },
					"_id"
				)
				const admin = await new userModel({
					name: "admin",
					email: "admin@fpt.edu.vn",
					phone: "0123456789",
					address: "Hà Nội",
					role: "admin",
					category: category._id,
				}).save()
				fs.mkdirSync(`./public/idea/${admin.id}`, { recursive: true })
				fs.mkdirSync(`./public/avatar/${admin.id}`, { recursive: true })
				console.log("Add admin user!")
			}
		})
	} catch (err) {
		console.log(err)
	}
}
