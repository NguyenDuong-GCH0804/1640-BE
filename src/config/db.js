import { mongoose } from "mongoose"
import { initializeUser } from "../model/user.model.js"
import { initializeCategory } from "../model/category.model.js"
import "dotenv/config"

async function connect() {
	try {
		await mongoose.connect(process.env.DB_URL)
		console.log("Connected successful !")
		initializeCategory()
		initializeUser()
	} catch (err) {
		console.log(err)
	}
}

export default { connect }
