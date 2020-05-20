let mysql = require("mysql")
let config = require("../config.json")

let db_config = {
    host : config.db_host,
    user : config.db_username,
    password : config.db_password,
    database : config.db_databse,
    multipleStatements: true
}

let connection;
handleDisconnect()
function handleDisconnect() {
  connection = mysql.createConnection(db_config)
  connection.connect(function(err) {             
    if(err) {                                     
      console.log('error when connecting to db:', err);
      setTimeout(handleDisconnect, 2000); 
    }                                     
  })                                                                     
  connection.on('error', function(err) {
    if(err.code === 'PROTOCOL_CONNECTION_LOST') { 
      handleDisconnect();                         
    } else {                                      
        console.log(err)
    }
  })
}

function getLatestBlock(callback){
  connection.query(`SELECT last_parsed_block FROM general_stats;`, (err, result) => {
    if (err){
        callback({success : false, error: err})
        return
    }
    callback({success : true, data: result})
  })
}

function getUserID(user, callback){
  connection.query(`SELECT * FROM users WHERE Username="${user}";`, (err, result) => {
    if (err){
      callback({success : false, error: err})
      return
      }
      callback({success : true, data: result})
  })
}

function getVoteByVoterIdPermlink(voterId, permlink, callback){
  connection.query(`SELECT * FROM votes WHERE VoterID=${voterId} AND Permlink=${permlink};`, (err, result) => {
    if (err){
      callback({success : false, error: err})
      return
      }
      callback({success : true, data: result})
  })
}

function getAuthorRootComments(author, callback){
  getUserID(author, (authorID) => {
    if (authorID.success && authorID.data.length){
      let id = authorID.data[0].ID
      connection.query(`SELECT comments.Permlink, comments.ParentID, comments.AuthorID, users.Username AS Author, comments.Title, comments.Body, comments.Metadata, comments.PostTime, (SELECT JSON_ARRAYAGG(JSON_OBJECT("ParentID", com.ParentID, "Permlink", com.Permlink, "AuthorID", com.AuthorID, "Username", (SELECT Username FROM users LEFT JOIN deleted_comments AS del ON comments.Permlink = del.Permlink WHERE users.ID = com.AuthorID AND del.Permlink IS NULL), "Title", com.Title, "Body", com.Body, "Metadata", com.Metadata, "PostTime", com.PostTime)) FROM comments AS com WHERE com.ParentID = comments.Permlink) AS Children, (SELECT JSON_ARRAYAGG(JSON_OBJECT("VoterID", votes.VoterID, "VoteValue", votes.VoteValue, "Username", (SELECT users.username FROM users WHERE users.ID = votes.VoterID) )) FROM votes WHERE comments.Permlink = votes.Permlink) AS Votes FROM comments LEFT JOIN deleted_comments ON comments.Permlink = deleted_comments.Permlink JOIN users ON users.id = comments.AuthorID WHERE comments.AuthorID = ${id} AND comments.ParentID IS NULL AND deleted_comments.Permlink IS NULL ORDER BY comments.PostTime DESC;`, (err, result) => {
        if (err){
          callback({success : false, error: err})
          return
        }
        callback({success : true, data: result})
      })
    } else {
      callback({success : false, error: authorID.data.err || "Author not found."})
    }
  })
}

function getMultiUserId(users, callback){
  connection.query(`SELECT * FROM users WHERE (Username) IN ("${users.join(`","`)}")`, (err, result) => {
    if (err){
      callback({success : false, error: err})
      return
    }
    callback({success : true, data: result})
  })
}

function generateFeed(following, callback){
  connection.query(`SELECT comments.Permlink, comments.ParentID, comments.AuthorID, users.Username AS Author, comments.Title, comments.Body, comments.Metadata, comments.PostTime, (SELECT JSON_ARRAYAGG(JSON_OBJECT("ParentID", com.ParentID, "Permlink", com.Permlink, "AuthorID", com.AuthorID, "Author", (SELECT Username FROM users LEFT JOIN deleted_comments AS del ON comments.Permlink = deleted_comments.Permlink WHERE users.ID = com.AuthorID AND del.Permlink IS NULL), "Title", com.Title, "Body", com.Body, "Metadata", com.Metadata, "PostTime", com.PostTime)) FROM comments AS com WHERE com.ParentID = comments.Permlink) AS Children, (SELECT JSON_ARRAYAGG(JSON_OBJECT("VoterID", votes.VoterID, "VoteValue", votes.VoteValue, "Voter", (SELECT users.Username FROM users WHERE users.ID = votes.VoterID) )) FROM votes WHERE comments.Permlink = votes.Permlink) AS Votes FROM comments LEFT JOIN deleted_comments ON comments.Permlink = deleted_comments.Permlink JOIN users ON users.id = comments.AuthorID WHERE (comments.AuthorID) IN ("${following.join(`", "`)}") AND comments.ParentID IS NULL AND deleted_comments.Permlink IS NULL ORDER BY comments.PostTime DESC;`, (err, result) => {
    if (err){
      callback({success : false, error: err})
      return
    }
    callback({success : true, data: result})
  })
}

function getNewRootComments(callback){
  connection.query(`SELECT comments.Permlink, comments.ParentID, comments.AuthorID, users.Username AS Author, comments.Title, comments.Body, comments.Metadata, comments.PostTime, (SELECT JSON_ARRAYAGG(JSON_OBJECT("ParentID", com.ParentID, "Permlink", com.Permlink, "AuthorID", com.AuthorID, "Author", (SELECT Username FROM users WHERE users.ID = com.AuthorID), "Title", com.Title, "Body", com.Body, "Metadata", com.Metadata, "PostTime", com.PostTime)) FROM comments AS com LEFT JOIN deleted_comments AS del ON comments.Permlink = del.Permlink WHERE com.ParentID = comments.Permlink AND del.Permlink IS NULL) AS Children, (SELECT JSON_ARRAYAGG(JSON_OBJECT("VoterID", votes.VoterID, "VoteValue", votes.VoteValue, "Voter", (SELECT users.Username FROM users WHERE users.ID = votes.VoterID) )) FROM votes WHERE comments.Permlink = votes.Permlink) AS Votes FROM comments LEFT JOIN deleted_comments ON comments.Permlink = deleted_comments.Permlink JOIN users ON users.id = comments.AuthorID WHERE comments.ParentID IS NULL AND deleted_comments.Permlink IS NULL ORDER BY comments.PostTime DESC;`, (err, result) => {
    if (err){
      callback({success : false, error: err})
      return
    }
    callback({success : true, data: result})
  })
}

function getCommentDetails(permlink, callback){
  connection.query(`SELECT comments.Permlink, comments.ParentID, comments.AuthorID, users.Username AS Author, comments.Title, comments.Body, comments.Metadata, comments.PostTime, (SELECT JSON_ARRAYAGG(JSON_OBJECT("Permlink", com.Permlink, "AuthorID", com.AuthorID, "Author", (SELECT Username FROM users LEFT JOIN deleted_comments AS d ON com.Permlink = d.Permlink WHERE users.ID = com.AuthorID), "Title", com.Title, "Body", com.Body, "Metadata", com.Metadata, "PostTime", com.PostTime, "Votes", (SELECT JSON_ARRAYAGG(JSON_OBJECT("VoterID", votes.VoterID, "VoteValue", votes.VoteValue, "Voter", (SELECT users.Username FROM users WHERE users.ID = votes.VoterID) )) FROM votes WHERE com.Permlink = votes.Permlink), "Children", (SELECT JSON_ARRAYAGG(JSON_OBJECT("Permlink", subcomment.Permlink, "AuthorID", subcomment.AuthorID, "Author", (SELECT Username FROM users WHERE users.ID = subcomment.AuthorID), "Title", subcomment.Title, "Body", subcomment.Body, "Metadata", subcomment.Metadata, "PostTime", subcomment.PostTime)) FROM comments AS subcomment LEFT JOIN deleted_comments AS del ON subcomment.Permlink = del.Permlink WHERE subcomment.ParentID = com.Permlink AND del.Permlink IS NULL) )) FROM comments AS com WHERE com.ParentID = comments.Permlink) AS Children, (SELECT JSON_ARRAYAGG(JSON_OBJECT("VoterID", votes.VoterID, "VoteValue", votes.VoteValue, "Voter", (SELECT users.Username FROM users WHERE users.ID = votes.VoterID) )) FROM votes WHERE comments.Permlink = votes.Permlink) AS Votes FROM comments LEFT JOIN deleted_comments ON comments.Permlink = deleted_comments.Permlink JOIN users ON users.id = comments.AuthorID WHERE comments.Permlink = ${permlink} AND deleted_comments.Permlink IS NULL;`, (err, result) => {
    if (err){
      callback({success : false, error: err})
      return
    }
    callback({success : true, data: result})
  })
}

function getAllMods(callback){
  connection.query(`SELECT users.ID, users.Username FROM mods JOIN users ON mods.ModID = users.ID;`, (err, result) => {
    if (err){
      callback({success : false, error: err})
      return
    }
    callback({success : true, data: result})
  })  
}

function getModByUsername(username, callback){
  getUserID(username, (id) => {
    if (id.success && id.data.length){
      let ID = id.data[0].ID
      connection.query(`SELECT users.ID, users.Username FROM mods JOIN users ON mods.ModID = users.ID WHERE users.ID = ${ID};`, (err, result) => {
        if (err){
          callback({success : false, error: err})
          return
        }
        callback({success : true, data: result})
      })  
    } else {
      callback({success : false, error: id.error})
    }
  }) 
}

function getAllAdmins(callback){
  connection.query(`SELECT users.ID, users.Username FROM admins JOIN users ON admins.AdminID = users.ID WHERE admins.SuperAdmin = 0;`, (err, result) => {
    if (err){
      callback({success : false, error: err})
      return
    }
    callback({success : true, data: result})
  })  
}

function getAdminByUsername(username, callback){
  getUserID(username, (id) => {
    if (id.success && id.data.length){
      let ID = id.data[0].ID
      connection.query(`SELECT users.ID, users.Username FROM admins JOIN users ON admins.AdminID = users.ID WHERE users.ID = ${ID} AND admins.SuperAdmin = 0;`, (err, result) => {
        if (err){
          callback({success : false, error: err})
          return
        }
        callback({success : true, data: result})
      })  
    } else {
      callback({success : false, error: id.error})
    }
  }) 
}

function getAllSuperAdmins(callback){
  connection.query(`SELECT users.ID, users.Username FROM admins JOIN users ON admins.AdminID = users.ID WHERE admins.SuperAdmin = 1;`, (err, result) => {
    if (err){
      callback({success : false, error: err})
      return
    }
    callback({success : true, data: result})
  })  
}

function getSuperAdminByUsername(username, callback){
  getUserID(username, (id) => {
    if (id.success && id.data.length){
      let ID = id.data[0].ID
      connection.query(`SELECT users.ID, users.Username FROM admins JOIN users ON admins.AdminID = users.ID WHERE users.ID = ${ID} AND admins.SuperAdmin = 1;`, (err, result) => {
        if (err){
          callback({success : false, error: err})
          return
        }
        callback({success : true, data: result})
      })  
    } else {
      callback({success : false, error: id.error})
    }
  }) 
}

module.exports = {
    getLatestBlock,
    getUserID,
    getVoteByVoterIdPermlink,
    getAuthorRootComments,
    getMultiUserId,
    generateFeed,
    getNewRootComments,
    getCommentDetails,
    getAllMods,
    getModByUsername,
    getAllAdmins,
    getAdminByUsername,
    getAllSuperAdmins,
    getSuperAdminByUsername
}
