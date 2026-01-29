const {createServer} = require("http")
const app = require("./app")
const dotenv = require("dotenv")

dotenv.config()


const PORT = process.env.PORT || 8000
const server = createServer(app)


server.listen(PORT, () => {
    console.log("Server is running on port ", PORT)
})