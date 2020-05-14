let db_updater = require("./db_updater.js")
let config = require("../config.json")

function handleComment(user, time, json){
    if (checkCommentJsonSchema(json)){
        if (json.author != user){
            return
        }
        let isRoot = false
        if (json["parent-permlink"] == ""){
            isRoot = true
        }
        if (config.features.root_post && isRoot){
            try {
                let metadata = JSON.parse(json.metadata)
                db_updater.saveNewRootComment(json.author, json.title, json.body, metadata, time)
            } catch (e){

            }
        }
        if (config.features.comment && !isRoot){
            try {
                let metadata = JSON.parse(json.metadata)
                db_updater.saveNewPostComment(json["parent-permlink"], json.author, json.title, json.body, metadata, time)
            } catch (e){

            }
        }
    }
}

function checkCommentJsonSchema(json){
    let schema = {
        "action" : String,
        "author": String,
        "parent-permlink" : String,
        "title" : String,
        "body" : String,
        "metadata" : String
    }
    for (i in schema){
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
        try {
            let metadata = JSON.parse(json.metadata)
            db_updater.updateComment(json.permlink, json.author, json.title, json.body, metadata, time)
        } catch (e){

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
        if (json[i] == undefined){
            return false
        }
    }
    return true
}

function deleteComment(user, json){
    if (checkDeleteCommentJsonSchema(json)){
        if (json.author != user || !config.features.delete_comment){
            return
        }
        db_updater.deleteComment(json.permlink, json.author)
    }
}

function checkDeleteCommentJsonSchema(json){
    let schema = {
        "action" : String,
        "author": String,
        "permlink" : String
    }
    for (i in schema){
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