import { mongoose } from "mongoose"
const Schema = mongoose.Schema

const check = new Date()
check.setDate(check.getDate() - 5)
const time = new Schema(
	{
		start: { type: Date, min: check },
		end: { type: Date, min: Date.now() },
		exit: { type: Boolean, default: true },
		user: { type: Schema.Types.ObjectId, ref: "users" },
		zip: { type: String },
		xlsx: { type: String },
		exist: Boolean,
	},
	{
		timestamps: { currentTime: () => Math.floor(Date.now()) },
	}
)

export default mongoose.model("time", time)
