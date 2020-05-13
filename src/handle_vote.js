let db_updater = require("./db_updater.js")
let config = require("../config.json")

function handleVote(user, json){
    if (checkVoteJsonSchema(json)){
        if (user == json.voter){
            if (json.vote == "upvote" && config.features.upvote){
                db_updater.saveVote(json.voter, json.permlink, 1)
            }
            if (json.vote == "downvote" && config.features.downvote){
                db_updater.saveVote(json.voter, json.permlink, -1)
            }
            if (json.vote == "unvote" && config.features.remove_vote){
                db_updater.saveVote(json.voter, json.permlink, 0)
            }
        }
    }
}

function checkVoteJsonSchema(json){
    let schema = {
        "action" : String,
        "voter": String,
        "author" : String,
        "permlink" : String,
        "vote" : String
    }
    for (i in schema){
        if (json[i] == undefined){
            return false
        }
    }
    return true
}

module.exports = {
    handleVote
}