let express = require('express')
let db_data = require("../src/db_data.js")

let router = express.Router()

router.get('/:username', (req, res) => {
    let author = req.params.username
    db_data.getAuthorRootComments(author, (cb) => {
        callback({success: true, data: cb})
    })
})




module.exports = router