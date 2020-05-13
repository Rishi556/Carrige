let db_updater = require("./db_updater.js")
let config = require("../config.json")

function handleComment(user, block, time, json){
    if (checkJsonSchema(json)){
        if (json.author != user){
            return
        }
        let isRoot = false
        if (json["parent-author"] == "" && json["parent-permlink"] == ""){
            isRoot = true
        }
        if (config.features.root_post && isRoot){
            //Save as root. reemebre to give permlink and likes field
            return
        }
        if (config.features.comment && !isRoot){
            //save as comment, ensure both parent-author and parent-permlink aren't blank though otherwise could cause problem.reemebre to give permlink and likes field
            return
        }
    }
}

function checkJsonSchema(json){
    let schema = {
        "action" : String,
        "author": String,
        "parent-author" : String,
        "parent-permlink" : String,
        "title" : String,
        "body" : String,
        "metadata" : String
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
    handleComment
}