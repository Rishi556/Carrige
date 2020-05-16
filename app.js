let stream_blocks = require("./src/stream_blocks.js")
let express = require('express')
let bodyParser = require('body-parser')
let cors = require("cors")

stream_blocks.startStreaming()

let app = express()

app.use(cors())

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}))

let profile = require("./routes/profile.js")
app.use("/", profile)

app.listen(80)