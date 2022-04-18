import chai from "chai"
import chatHttp from "chai-http"
import app from "../src/app.js"
import "dotenv/config"

chai.should()
chai.use(chatHttp)
const url = `http://localhost:${process.env.PORT}`
describe("App", () => {
	beforeEach((done) => {
		done()
	})
	describe("Login", () => {
		it("it should Login", (done) => {
			chai
				.request(url)
				.post("/login")
				.send({
					email: "admin@fpt.edu.vn",
					password: "123456",
				})
				.end((err, res) => {
					res.should.have.status(200)
					res.body.should.be.a("object")
					res.body.should.have.property("token")
					const token = res.body.token
					user(token)
					time(token)
					done()
				})
		})
	})
})

const user = function (token) {
	describe("User", () => {
		it("should create one user", (done) => {
			chai
				.request(url)
				.post("/user")
				.set("Authorization", token)
				.send({
					email: "test@fpt.edu.vn",
					name: "test",
					role: "manager",
					phone: "0999999999",
					address: "Hà Nội",
				})
				.end((err, res) => {
					res.should.have.status(201)
					res.body.should.be.a("object")
					res.body.should.have.property("_id")
					const id = res.body._id
					describe("Delete user", () => {
						it("should delete one user", (done) => {
							chai
								.request(url)
								.delete(`/user?id=${id}`)
								.set("Authorization", token)
								.end((err, res) => {
									res.should.have.status(200)
									res.body.should.be.a("string")
									done()
								})
						})
					})
					done()
				})
		})
		it("should get all users", (done) => {
			chai
				.request(url)
				.get("/user?role=all&page=1")
				.set("Authorization", token)
				.end((err, res) => {
					res.should.have.status(200)
					res.body.should.be.a("object")
					done()
				})
		})
		it("should search users", (done) => {
			chai
				.request(url)
				.get("/user/search?role=all&search=a")
				.set("Authorization", token)
				.end((err, res) => {
					res.should.have.status(200)
					res.body.should.be.a("object")
					done()
				})
		})
		it("should get one user", (done) => {
			chai
				.request(url)
				.get("/user/info")
				.set("Authorization", token)
				.end((err, res) => {
					res.should.have.status(200)
					res.body.should.be.a("object")
					done()
				})
		})
		it("should change password one user", (done) => {
			chai
				.request(url)
				.put("/user/changepassword")
				.set("Authorization", token)
				.send({
					newPassword: "123456789",
					password: "123456",
				})
				.end((err, res) => {
					res.should.have.status(200)
					res.body.should.be.a("string")
					done()
				})
		})
		it("should change password again one user", (done) => {
			chai
				.request("http://localhost:3000")
				.put("/user/changepassword")
				.set("Authorization", token)
				.send({
					newPassword: "123456",
					password: "123456789",
				})
				.end((err, res) => {
					res.should.have.status(200)
					res.body.should.be.a("string")
					done()
				})
		})
		it("should update profile", (done) => {
			chai
				.request("http://localhost:3000")
				.put("/user")
				.set("Authorization", token)
				.send({
					name: "Admin",
					phone: "0373569708",
					address: "Hà Nội",
				})
				.end((err, res) => {
					res.should.have.status(200)
					res.body.should.be.a("string")
					done()
				})
		})
	})
}

const category = function (token) {
	describe("Category", () => {
		it("should get all categories", (done) => {
			chai
				.request(url)
				.get("/category")
				.set("Authorization", token)
				.end((err, res) => {
					res.should.have.status(200)
					res.body.should.be.a("array")
					done()
				})
		})
		it("should get one category", (done) => {
			chai
				.request(url)
				.get("/category/search?search=I")
				.set("Authorization", token)
				.end((err, res) => {
					res.should.have.status(200)
					res.body.should.be.a("array")
					done()
				})
		})
		it("should create one category", (done) => {
			chai
				.request(url)
				.post("/category")
				.set("Authorization", token)
				.send({
					name: "test",
					description: "testing",
				})
				.end((err, res) => {
					res.should.have.status(201)
					res.body.should.be.a("object")
					res.body.should.have.property("_id")
					const id = res.body._id
					idea(token, id)
					done()
				})
		})
	})
}

const idea = function (token, idCategory) {
	describe("Idea", () => {
		it("should get all idea", (done) => {
			chai
				.request(url)
				.get("/idea?page=1")
				.set("Authorization", token)
				.end((err, res) => {
					res.should.have.status(200)
					res.body.should.be.a("object")
					done()
				})
		})
		it("should create one idea ", (done) => {
			chai
				.request(url)
				.post("/idea")
				.set("Authorization", token)
				.send({
					category: idCategory,
					content: "Test",
					private: true,
				})
				.end((err, res) => {
					res.should.have.status(201)
					res.body.should.be.a("object")
					res.body.should.have.property("_id")
					const id = res.body._id
					describe("Edit idea", () => {
						it("should like idea", (done) => {
							chai
								.request(url)
								.put("/idea/like?id=" + id)
								.set("Authorization", token)
								.end((err, res) => {
									res.should.have.status(200)
									res.body.should.be.a("string")
									done()
								})
						})
						it("should dislike idea", (done) => {
							chai
								.request(url)
								.put("/idea/dislike?id=" + id)
								.set("Authorization", token)
								.end((err, res) => {
									res.should.have.status(200)
									res.body.should.be.a("string")
									done()
								})
						})
						it("should view idea", (done) => {
							chai
								.request(url)
								.put("/idea/view?id=" + id)
								.set("Authorization", token)
								.end((err, res) => {
									res.should.have.status(200)
									res.body.should.be.a("string")
									done()
								})
						})
						comment(token, id, idCategory)
						it("should delete idea", (done) => {
							chai
								.request(url)
								.delete("/idea?id=" + id)
								.set("Authorization", token)
								.end((err, res) => {
									res.should.have.status(200)
									res.body.should.be.a("string")
									done()
								})
						})
					})
					done()
				})
		})
	})
}

const time = function (token) {
	describe("Time", () => {
		it("should get all time", (done) => {
			chai
				.request(url)
				.get("/time")
				.set("Authorization", token)
				.end((err, res) => {
					res.should.have.status(200)
					res.body.should.be.a("array")
					done()
				})
		})
		it("should create time", (done) => {
			const start = new Date()
			start.setDate(start.getDate() - 2)
			const end = new Date()
			end.setDate(end.getDate() + 1)
			chai
				.request(url)
				.post("/time")
				.set("Authorization", token)
				.send({
					start: start,
					end: end,
				})
				.end((err, res) => {
					res.should.have.status(200)
					res.body.should.be.a("object")
					res.body.should.have.property("_id")
					const id = res.body._id
					category(token)
					describe("Edit Time", () => {
						it("should get one time", (done) => {
							chai
								.request(url)
								.get("/time/detail?id=" + id)
								.set("Authorization", token)
								.end((err, res) => {
									res.should.have.status(200)
									res.body.should.be.a("object")
									done()
								})
						})
						it("should update time", (done) => {
							const start = new Date()
							start.setDate(start.getDate() - 3)
							const end = new Date()
							end.setDate(end.getDate() - 1)
							chai
								.request(url)
								.put("/time?id=" + id)
								.set("Authorization", token)
								.send({
									start: start,
									end: end,
								})
								.end((err, res) => {
									res.should.have.status(200)
									res.body.should.be.a("string")
									done()
								})
						})
						it("should download xlsx time", (done) => {
							chai
								.request(url)
								.get("/time/downloadxlsx?id=" + id)
								.set("Authorization", token)
								.end((err, res) => {
									res.should.have.status(200)
									done()
								})
						})
						it("should download zip time", (done) => {
							chai
								.request(url)
								.get("/time/downloadzip?id=" + id)
								.set("Authorization", token)
								.end((err, res) => {
									res.should.have.status(200)
									done()
								})
						})
						it("should get idea in time", (done) => {
							chai
								.request(url)
								.get("/time/idea?id=" + id)
								.set("Authorization", token)
								.end((err, res) => {
									res.should.have.status(200)
									res.body.should.be.a("array")
									done()
								})
						})
						it("should delete time", (done) => {
							chai
								.request(url)
								.delete("/time?id=" + id)
								.set("Authorization", token)
								.end((err, res) => {
									res.should.have.status(200)
									res.body.should.be.a("string")
									done()
								})
						})
					})
					done()
				})
		})
	})
}

const comment = function (token, idIdea, idCategory) {
	describe("Comment", () => {
		it("should create a comment", (done) => {
			chai
				.request(url)
				.post("/comment")
				.set("Authorization", token)
				.send({
					content: "test",
					category: idCategory,
					private: false,
					idIdea: idIdea,
				})
				.end((err, res) => {
					res.should.have.status(201)
					res.body.should.be.a("object")
					res.body.should.have.property("_id")
					const id = res.body._id
					describe("Edit comment", () => {
						it("should update comment", (done) => {
							chai
								.request(url)
								.put("/comment?id=" + id)
								.set("Authorization", token)
								.send({
									private: true,
									content: "test",
								})
								.end((err, res) => {
									res.should.have.status(200)
									res.body.should.be.a("string")
									done()
								})
						})
						it("should delete comment", (done) => {
							chai
								.request(url)
								.delete("/comment?id=" + id)
								.set("Authorization", token)
								.end((err, res) => {
									res.should.have.status(200)
									res.body.should.be.a("string")
									done()
								})
						})
					})
					describe("Edit category", () => {
						it("should update one category", (done) => {
							chai
								.request(url)
								.put(`/category?id=${idCategory}`)
								.set("Authorization", token)
								.send({ name: "test" })
								.end((err, res) => {
									res.should.have.status(200)
									res.body.should.be.a("string")
									done()
								})
						})
						it("should delete one category", (done) => {
							chai
								.request(url)
								.delete(`/category?id=${idCategory}`)
								.set("Authorization", token)
								.end((err, res) => {
									res.should.have.status(200)
									res.body.should.be.a("string")
									done()
								})
						})
					})
					done()
				})
		})
	})
}
