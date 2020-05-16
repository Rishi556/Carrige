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

function getCommentWithPermlink(permlink, callback){
  connection.query(`SELECT * from comments WHERE Permlink=${permlink};`, (err, result) => {
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
      connection.query(`SELECT comments.Permlink, comments.ParentID, comments.AuthorID, users.Username AS Author, comments.Title, comments.Body, comments.Metadata, comments.PostTime,(SELECT JSON_ARRAYAGG(JSON_OBJECT("ParentID", com.ParentID, "Permlink", com.Permlink, "AuthorID", com.AuthorID, "Username", (SELECT Username from users where users.ID=com.AuthorID), "Title", com.Title, "Body", com.Body, "Metadata", com.Metadata, "PostTime", com.PostTime)) from comments as com WHERE com.ParentID = comments.Permlink) as Children, (SELECT JSON_ARRAYAGG(JSON_OBJECT("VoterID",votes.VoterID,"VoteValue",votes.VoteValue,"Username",(SELECT users.username FROM users WHERE users.ID = votes.VoterID))) FROM votes WHERE comments.Permlink = votes.Permlink) as Votes FROM comments LEFT JOIN deleted_comments ON comments.Permlink = deleted_comments.Permlink JOIN users ON users.id = comments.AuthorID WHERE comments.AuthorID = ${id} AND comments.ParentID IS NULL AND deleted_comments.Permlink IS NULL ORDER BY comments.PostTime DESC;`, (err, result) => {
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
  connection.query(`SELECT comments.Permlink, comments.ParentID, comments.AuthorID, users.Username AS Author, comments.Title, comments.Body, comments.Metadata, comments.PostTime,(SELECT JSON_ARRAYAGG(JSON_OBJECT("ParentID", com.ParentID, "Permlink", com.Permlink, "AuthorID", com.AuthorID, "Username", (SELECT Username from users where users.ID=com.AuthorID), "Title", com.Title, "Body", com.Body, "Metadata", com.Metadata, "PostTime", com.PostTime)) from comments as com WHERE com.ParentID = comments.Permlink) as Children, (SELECT JSON_ARRAYAGG(JSON_OBJECT("VoterID",votes.VoterID,"VoteValue",votes.VoteValue,"Username",(SELECT users.username FROM users WHERE users.ID = votes.VoterID))) FROM votes WHERE comments.Permlink = votes.Permlink) as Votes FROM comments LEFT JOIN deleted_comments ON comments.Permlink = deleted_comments.Permlink JOIN users ON users.id = comments.AuthorID WHERE (comments.AuthorID) IN ("${following.join(`","`)}") AND comments.ParentID IS NULL AND deleted_comments.Permlink IS NULL ORDER BY comments.PostTime DESC;`, (err, result) => {
    if (err){
      callback({success : false, error: err})
      return
    }
    callback({success : true, data: result})
  })
}

function getNewRootComments(callback){
  connection.query(`SELECT comments.Permlink, comments.ParentID, comments.AuthorID, users.Username AS Author, comments.Title, comments.Body, comments.Metadata, comments.PostTime,(SELECT JSON_ARRAYAGG(JSON_OBJECT("ParentID", com.ParentID, "Permlink", com.Permlink, "AuthorID", com.AuthorID, "Username", (SELECT Username from users where users.ID=com.AuthorID), "Title", com.Title, "Body", com.Body, "Metadata", com.Metadata, "PostTime", com.PostTime)) from comments as com WHERE com.ParentID = comments.Permlink) as Children, (SELECT JSON_ARRAYAGG(JSON_OBJECT("VoterID",votes.VoterID,"VoteValue",votes.VoteValue,"Username",(SELECT users.username FROM users WHERE users.ID = votes.VoterID))) FROM votes WHERE comments.Permlink = votes.Permlink) as Votes FROM comments LEFT JOIN deleted_comments ON comments.Permlink = deleted_comments.Permlink JOIN users ON users.id = comments.AuthorID WHERE comments.ParentID IS NULL AND deleted_comments.Permlink IS NULL ORDER BY comments.PostTime DESC;`, (err, result) => {
    if (err){
      callback({success : false, error: err})
      return
    }
    callback({success : true, data: result})
  })
}

function getCommentDetails(permlink, callback){ // THIS IS WRONG, SAME AS getCommentWithPermlink(EXCEPT THIS HAS MORE DETAILS SO WE KEEPING THIS ONE) UPDATE WHERE getCommentWithPermlink IS USED AFTER THE HACKATHON
 connection.query(`SELECT comments.Permlink, comments.ParentID, comments.AuthorID,  users.Username AS Author, comments.Title, comments.Body, comments.Metadata, comments.PostTime, (SELECT JSON_ARRAYAGG(JSON_OBJECT("Permlink", com.Permlink, "AuthorID", com.AuthorID, "Author", (SELECT Username from users where users.ID=com.AuthorID), "Title", com.Title, "Body", com.Body, "Metadata", com.Metadata, "PostTime", com.PostTime,"Votes",(SELECT JSON_ARRAYAGG(JSON_OBJECT("VoterID",votes.VoterID,"VoteValue",votes.VoteValue,"voter_name",(SELECT users.username FROM users WHERE users.ID = votes.VoterID))) FROM votes WHERE com.Permlink = votes.Permlink), "Children", (SELECT JSON_ARRAYAGG(JSON_OBJECT("Permlink", subcomment.Permlink, "AuthorID", subcomment.AuthorID, "Author", (SELECT Username from users where users.ID=subcomment.AuthorID), "Title", subcomment.Title, "Body", subcomment.Body, "Metadata", subcomment.Metadata, "PostTime", subcomment.PostTime)) from comments as subcomment WHERE com.ParentID = subcomment.Permlink))) from comments as com WHERE com.ParentID = comments.Permlink) as Children, (SELECT JSON_ARRAYAGG(JSON_OBJECT("VoterID",votes.VoterID,"VoteValue",votes.VoteValue,"Voter",(SELECT users.username FROM users WHERE users.ID = votes.VoterID))) FROM votes WHERE comments.Permlink = votes.Permlink) as vote_data FROM comments LEFT JOIN deleted_comments ON comments.Permlink = deleted_comments.Permlink JOIN users ON users.id = comments.AuthorID WHERE comments.Permlink = ${permlink} AND comments.ParentID IS NULL AND deleted_comments.Permlink IS NULL`, (err, result) => {
  if (err){
    callback({success : false, error: err})
    return
  }
  callback({success : true, data: result})
})

}


module.exports = {
    getLatestBlock,
    getCommentWithPermlink,
    getUserID,
    getVoteByVoterIdPermlink,
    getAuthorRootComments,
    getMultiUserId,
    generateFeed,
    getNewRootComments,
    getCommentDetails
}
