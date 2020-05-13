let config = require("../config.json")
let handle_comment = require("./handle_comment.js")
let id = config.custom_json_id

//Handles general block
function parseBlock(block){
    let transactions = block.transactions
    for (i in transactions){
        let operations = transactions[i].operations
        if (operations[0][0] == "custom_json"){
            parseCustomJson(transactions[i], block.timestamp)
        }
    }
}
//Handles transactions that are custom_json
function parseCustomJson(customJson, time){
    let operation = customJson.operations[0][1]
    if (operation.id == id){
        handleTransaction(customJson, time)
    }
}

//Handles a transaction that matches id
function handleTransaction(transaction, time){
    let operation = transaction.operations[0][1]
    let user = operation.required_posting_auths[0]
    let block = transaction.block_num
    let json = JSON.parse(operation.json)
    if (json.action == "comment"){
        handle_comment.handleComment(user, block, time, json)
    }
}

module.exports = {
    parseBlock
}