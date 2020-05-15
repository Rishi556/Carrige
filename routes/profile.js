let express = require('express')
let db_data = require("../src/db_data.js")
let hive_data = require("../src/hive_data.js")

let router = express.Router()

router.get('/post/:permlink', (req, res) => {
    var permlink = req.params.permlink
    db_data.getCommentWithPermlink(permlink, (cb) => {
        res.json(cb)
    })
})

router.get('/created', (req, res) => {
    db_data.getNewRootComments((cb) => {
        res.json(cb)
    })
})

router.get('/:username/feed', (req, res) => {
    let username = req.params.username
    hive_data.getFollowing(username, "", [], (cb) => { //TODO: will not last. Only for testing, on live ersion following will need to be generated client side(or we reinvent the wheel and make our own folliwng list)
        db_data.getMultiUserId(cb.data, (data) => {
            var ids = []
            for (i in data.data){
                ids.push(data.data[i].ID)
            }
            db_data.generateFeed(ids, (feed) => {
                res.json(feed)
            })
        })
        
    })
})

router.get('/:username', (req, res) => {
    let username = req.params.username
    db_data.getAuthorRootComments(username, (cb) => {
        res.json(cb)
    })
})




module.exports = router