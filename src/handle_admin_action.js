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
                        deleteComment(modAction)
                    }
                    if (modAction.action == "restore_comment" && config.features.mod_action.restore_comment){
                        restoreComment(modAction)
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

function deleteComment(modAction){
    if(checkDeleteCommentJsonSchema(modAction)){
        db_updater.deleteComment(modAction.permlink, modAction.author)
    }
}

function checkDeleteCommentJsonSchema(json){
    let schema = {
        "action" : String,
        "author" : String,
        "permlink" : String
    }
    for (i in schema){
        if (json[i] == undefined){
            return false
        }
    }
    return true
}

function restoreComment(modAction){
    if(checkRestoreCommentJsonSchema(modAction)){
        db_updater.restoreComment(modAction.permlink)
    }
}

function checkRestoreCommentJsonSchema(json){
    let schema = {
        "action" : String,
        "author" : String
    }
    for (i in schema){
        if (json[i] == undefined){
            return false
        }
    }
    return true
}

function handleAdminAction(user, json){
    db_data.getAdminByUsername(user, (adminDetails) => {
        if (adminDetails.success && adminDetails.data.length){
            if (checkAdminActionJsonSchema(json)){
                try {
                    var adminAction = JSON.parse(json.admin_action)
                    if (adminAction.action == "ban_user" && config.features.admin_action.ban_user){

                    }
                    if (adminAction.action == "unban_user" && config.features.admin_action.unban_user){
                        
                    }
                    if (adminAction.action == "add_new_mod" && config.features.admin_action.add_new_mod){
                        addNewMod(admin_action)
                    }
                    if (adminAction.action == "remove_mod" && config.features.admin_action.remove_mod){
                        removeMod(admin_action)
                    }
                } catch (e) {

                }
            }
        }
    })
}

function checkAdminActionJsonSchema(json){
    let schema = {
        "action" : String,
        "admin_action" : String
    }
    for (i in schema){
        if (json[i] == undefined){
            return false
        }
    }
    return true
}

function addNewMod(adminAction){
    if (checkAddNewModJsonSchema(adminAction)){
        db_updater.addNewMod(adminAction.username)
    }
}

function checkAddNewModJsonSchema(json){
    let schema = {
        "action" : String,
        "username" : String
    }
    for (i in schema){
        if (json[i] == undefined){
            return false
        }
    }
    return true
}

function removeMod(adminAction){
    if (checkRemoveModJsonSchema(adminAction)){
        db_updater.removeMod(adminAction.username)
    }
}

function checkRemoveModJsonSchema(json){
    let schema = {
        "action" : String,
        "username" : String
    }
    for (i in schema){
        if (json[i] == undefined){
            return false
        }
    }
    return true
}

function handleSuperAdminAction(user, json){
    db_data.getSuperAdminByUsername(user, (superAdminDetails) => {
        if (superAdminDetails.success && superAdminDetails.data.length){
            if (checkSuperAdminActionJsonSchema(json)){
                try {
                    var superAdminAction = JSON.parse(json.super_admin_action)
                    if (superAdminAction.action == "add_new_admin" && config.features.super_admin.add_new_admin){
                        addNewAdmin(superAdminAction)
                    }
                    if (superAdminAction.action == "add_new_super_admin" && config.features.super_admin.add_new_super_admin){
                        addNewSuperAdmin(superAdminAction)
                    }
                    if (superAdminAction.action == "remove_admin" && config.features.super_admin.add_new_admin){
                        removeAdmin(superAdminAction)
                    }
                } catch (e) {

                }
            }
        }
    })
}

function checkSuperAdminActionJsonSchema(json){
    let schema = {
        "action" : String,
        "super_admin_action" : String
    }
    for (i in schema){
        if (json[i] == undefined){
            return false
        }
    }
    return true
}

function addNewAdmin(superAdminSchema){

}

function checkAddNewAdminJsonSchema(json){
    let schema = {
        "action" : String,
        "username" : String
    }
    for (i in schema){
        if (json[i] == undefined){
            return false
        }
    }
    return true
}

function addNewSuperAdmin(superAdminSchema){

}

function checkAddNewSuperAdminJsonSchema(json){
    let schema = {
        "action" : String,
        "username" : String
    }
    for (i in schema){
        if (json[i] == undefined){
            return false
        }
    }
    return true
}

function removeAdmin(superAdminSchema){

}

function checkRemoveAdminJsonSchema(json){
    let schema = {
        "action" : String,
        "username" : String
    }
    for (i in schema){
        if (json[i] == undefined){
            return false
        }
    }
    return true
}

module.exports = {
    handleModAction,
    handleAdminAction,
    handleSuperAdminAction
}