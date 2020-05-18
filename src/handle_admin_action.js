let db_updater = require("./db_updater.js")
let db_data = require("./db_data.js")
let config = require("../config.json")

function handleModAction(user, json){
    db_data.getModByUsername(user, (modDetails) => {
        if (modDetails.success && modDetails.data.length){
            if (checkModActionJsonSchema(json)){
                try {
                    var modAction = JSON.parse(json.mod_action)
                    if (modAction.action == "delete_comment" && config.features.mod_action.delete_comment){
                        db_updater.deleteComment(modAction.permlink, modAction.author)
                    }
                } catch (e) {

                }
            }
        }
    })
}

function checkModActionJsonSchema(json){
    let schema = {
        "action" : String,
        "mod_action" : String
    }
    for (i in schema){
        if (json[i] == undefined){
            return false
        }
    }
    return true
}

module.exports = {
    handleModAction
}