let db_updater = require("./db_updater.js")
let config = require("../config.json")

function handleComment(user, time, json){
    if (checkCommentJsonSchema(json)){
        if (json.author != user){
            return
        }
        let isRoot = false
        if (json["parent-author"] == ""){
            isRoot = true
        }
        if (config.features.root_post && isRoot){
            //Save as root.
            return
        }
        if (config.features.comment && !isRoot){
            //save as comment, ensure both parent-author and parent-permlink aren't blank though otherwise could cause problem.
            return
        }
    }
}

function checkCommentJsonSchema(json){
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

function handleUpdateComment(user, time, json){
    if (checkUpdateCommentJsonSchema(json)){
        //SQL, UPDATE WHERE AUTHOR = USER AND PERMLINK=PERMLINK ONLY ALLOWED TO CHANGE BODY, TITLE METADATA
        if (json.author != user || !config.features.update_comment){
            return
        }
    }
}

function checkUpdateCommentJsonSchema(json){
    let schema = {
        "action" : String,
        "author": String,
        "permlink" : String,
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

function deleteComment(user, time, json){
    if (checkDeleteCommentJsonSchema(json)){
        if (json.author != user || !config.features.delete_comment){
            return
        }
        //DELETE COMMENT
    }
}

function checkDeleteCommentJsonSchema(json){
    let schema = {
        "action" : String,
        "author": String,
        "permlink" : String
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
    handleComment,
    handleUpdateComment,
    deleteComment
}