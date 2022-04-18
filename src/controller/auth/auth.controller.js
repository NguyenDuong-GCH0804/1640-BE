import bcrypt from "bcryptjs"
import { userModel } from "../../model/user.model.js"
import jwt from "jsonwebtoken"

const tokenSecret = process.env.TOKEN || ""
const tokenExpired = process.env.TOKEN_EXPIRED || ""

export const login = async (req, res, next) => {
	try {
		const user = await userModel.findOne({ email: req.body.email })
		if (!user || !bcrypt.compareSync(req.body.password, user.password)) {
			return res.status(401).json("Login failed")
		}
		const token = jwt.sign({ id: user.id, role: user.role }, tokenSecret, {
			expiresIn: tokenExpired,
		})
		return res.status(200).json({ token, user })
	} catch (e) {
		res.status(401).json("Login failed")
		next(e)
	}
}
