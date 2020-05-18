let moment = require("moment")
let config = require("../config.json")
let handle_comment = require("./handle_comment.js")
let handle_vote = require("./handle_vote.js")
let id = config.custom_json_id

//Handles general block
function parseBlock(block){
    let transactions = block.transactions
    for (i in transactions){
        let operations = transactions[i].operations
        for (j in operations){
            if (operations[j][0] == "custom_json"){
                parseCustomJson(operations[j], moment.utc(block.timestamp).unix())
            }
        }
    }
}

//Handles transactions that are custom_json
function parseCustomJson(customJson, time){
    let operation = customJson[1]
    if (operation.id == id){
        handleTransaction(operation, time)
    }
}

//Handles a transaction that matches id
function handleTransaction(operation, time){
    console.log(operation)
    let user = operation.required_posting_auths[0]
    let json = JSON.parse(operation.json)
    if (json.action == "comment"){
        handle_comment.handleComment(user, time, json)
    }
    if (json.action == "update_comment"){
        handle_comment.handleUpdateComment(user, time, json)
    }
    if (json.action == "delete_comment"){
        handle_comment.deleteComment(user, json)
    }
    if (json.action == "vote"){
        handle_vote.handleVote(user, json)
    }
    if (json.action == "admin_action"){

    }
    if (json.actino == "mod_action"){

    }
}

module.exports = {
    parseBlock
}