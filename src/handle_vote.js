let db_updater = require("./db_updater.js")
let config = require("../config.json")

function handleVote(user, block, time, json){
    if (checkVoteJsonSchema(json)){
        if (user == json.voter){
            if (json.vote == "upvote" && config.features.upvote){
                //increment vote
            }
            if (json.vote == "downvote" && config.features.downvote){
                //decrement vote
            }
            if (json.vote == "unvote" && config.features.remove_vote){
                //remove vote
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
        console.log(typeof json[i])
        if (json[i] == undefined){
            return false
        }
    }
    return true
}

module.exports = {
    handleVote
}