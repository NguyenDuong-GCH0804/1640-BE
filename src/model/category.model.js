import { mongoose } from "mongoose"
const Schema = mongoose.Schema

const category = new Schema(
	{
		name: {
			type: String,
			unique: true,
			required: true,
		},
		description: { type: String },
		idea: { type: Number, default: 0 },
	},
	{
		timestamps: { currentTime: () => Math.floor(Date.now()) },
	}
)

export const categoryModel = mongoose.model("Category", category)

export function initializeCategory() {
	try {
		categoryModel.estimatedDocumentCount(async (err, count) => {
			if (!err && count == 0) {
				await new categoryModel({
					name: "Notification",
					description: "Notifications used by admin and management",
				}).save()
				console.log("Add Notification category!")
			}
		})
	} catch (err) {
		console.log(err)
	}
}
