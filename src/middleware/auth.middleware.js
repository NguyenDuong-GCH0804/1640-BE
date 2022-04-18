import jwt from "jsonwebtoken"

const tokenSecret = process.env.TOKEN || ""

export const verifyUser = async (req, res, next) => {
	try {
		const token = req.headers.authorization || ""
		if (!token) {
			return res.status(401).json("Unauthorization")
		}
		//JSON.parse(token) use postman
		const user = jwt.verify(token, tokenSecret)
		req.id = user.id
		req.role = user.role
		next()
	} catch (err) {
		return res.status(401).json("Unauthorization")
	}
}

export const isAdmin = (req, res, next) => {
	if (req.role == "admin") {
		return next()
	}
	return res.status(401).json("Unauthorization")
}

export const isStaff = (req, res, next) => {
	if (req.role == "staff" || req.role == "admin") {
		return next()
	}
	return res.status(401).json("Unauthorization")
}

export const isCoordinator = (req, res, next) => {
	if (req.role == "coordinator" || req.role == "admin") {
		return next()
	}
	return res.status(401).json("Unauthorization")
}

export const isManager = (req, res, next) => {
	if (req.role == "manager" || req.role == "admin") {
		return next()
	}
	return res.status(401).json("Unauthorization")
}
