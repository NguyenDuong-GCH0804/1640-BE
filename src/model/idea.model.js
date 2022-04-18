import { mongoose } from "mongoose"
import comment from "./comment.model.js"
import { categoryModel } from "./category.model.js"
const Schema = mongoose.Schema

const idea = new Schema(
	{
		content: { type: String, min: 1 },
		file: { type: String },
		private: { type: Boolean, default: false },
		img: { type: String },
		time: [{ type: Schema.Types.ObjectId, ref: "times" }],
		user: { type: Schema.Types.ObjectId, ref: "users" },
		category: { type: Schema.Types.ObjectId, ref: categoryModel },
		like: [{ type: Schema.Types.ObjectId, ref: "users" }],
		disLike: [{ type: Schema.Types.ObjectId, ref: "users" }],
		comment: [{ type: Schema.Types.ObjectId, ref: comment }],
		view: { type: Number, default: 0 },
		popular: { type: Number, default: 0 },
	},
	{
		timestamps: { currentTime: () => Math.floor(Date.now()) },
	}
)

export default mongoose.model("idea", idea)
