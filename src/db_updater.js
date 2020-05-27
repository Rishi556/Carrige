let mysql = require("mysql")
let config = require("../config.json")
let hive = require("@hivechain/hivejs")
let db_data = require("./db_data.js")

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

function saveHiveUserID(user, callback){
  hive.api.getAccounts([user], (errHive, resultHive) => {
    if (errHive){
      if (callback){
        callback({success : false, error: errHive})
      }
      return
    }
    let id = resultHive[0].id
    connection.query(`INSERT INTO users (ID, Username) VALUES(${id}, "${user}");`, (errTwo, resultTwo) => {
      if (errTwo){
        if (callback){
          callback({success : false, error: errTwo})
        }
        return
      } else {
        if (callback){
          callback({success : true, data : {id : id}})
        }
      }
    })
  })
}

function saveLatestBlock(blockNumber){
    connection.query(`UPDATE general_stats Set last_parsed_block = ${blockNumber};`, (err, result) => {
        if(err){
            console.log(`Error saving lastet block: ${blockNumber} to database.`)
        }
    })
}

function saveNewComment(parentPermlink, author, title, body, metadata, postTime){
  connection.query(`SELECT * FROM users WHERE Username="${author}";`, (err, result) => {
    if (err || !result.length){
      saveHiveUserID(author, (hiveID) => {
        if (hiveID.success){
          let id = hiveID.data.id
          connection.query(`INSERT INTO comments (ParentID, AuthorID, Title, Body, Metadata, PostTime) VALUES(${parentPermlink}, ${id}, "${title}", "${body}", "${JSON.stringify(metadata)}", ${postTime});`, (errThree, resultThree) => {
            //Error handling goes here
          })
        }
      })
    } else {
      let id = result[0].ID
      connection.query(`INSERT INTO comments (ParentID, AuthorID, Title, Body, Metadata, PostTime) VALUES(${parentPermlink}, ${id}, "${title}", "${body}", "${JSON.stringify(metadata)}", ${postTime});`, (errTwo, resultTwo) => {
        //Error handling goes here
      })
    }
  })
}

function saveNewRootComment(author, title, body, metadata, postTime){
  saveNewComment(null, author, title, body, metadata, postTime)
}

function saveNewPostComment(parentPermlink, author, title, body, metadata, postTime){
  connection.query(`SELECT * FROM comments WHERE Permlink="${parentPermlink}";`, (err, result) => {
    if (!err && result.length){
      saveNewComment(parentPermlink, author, title, body, metadata, postTime)
    }
  })
}

function deleteComment(permlink, author){
  connection.query(`SELECT * FROM users WHERE Username="${author}";`, (err, result) => {
    if (!err && result.length){
      let id = result[0].ID
      connection.query(`SELECT * FROM comments WHERE Permlink=${permlink} AND AuthorID=${id};`, (errTwo, resultTwo) => {
        if(!errTwo && resultTwo.length){
          let comment = resultTwo[0]
          connection.query(`INSERT INTO deleted_comments (Permlink) VALUES(${comment.Permlink});`, (errThree, resultThree) => {
            //error hanlding goes here
          })
        }
      })
    }
  })
}

function updateComment(permlink, author, title, body, metadata, postTime){
  connection.query(`SELECT * FROM users WHERE Username="${author}";`, (err, result) => {
    console.log(err, result)
    if (!err && result.length){
      let id = result[0].ID
      connection.query(`SELECT * FROM comments WHERE AuthorID=${id} AND Permlink=${permlink};`, (errTwo, resultTwo) => {
        if (!errTwo && resultTwo.length){
          let parentID = resultTwo[0].ParentID
          connection.query(`REPLACE INTO comments (Permlink, ParentID, AuthorID, Title, Body, Metadata, PostTime) VALUES(${permlink}, ${parentID}, ${id}, "${title}", "${body}", "${JSON.stringify(metadata)}", ${postTime});`, (errThree, resultThree) => {
            //Error handling goes here
          })
        }
      })
    }
  })
}

function saveVote(voter, permlink, voteValue) {
  db_data.getCommentDetails(permlink, (comment) => {
    if (comment.success && comment.data.length) {
      db_data.getUserID(voter, userID => {
        if (userID.success && userID.data.length) {
          let id = userID.data[0].ID
          db_data.getVoteByVoterIdPermlink(id, permlink, (existingVote) => {
            if (existingVote.success && existingVote.data.length){
              connection.query(`UPDATE users WHERE VoterID=${id} AND Permlink=${permlink} SET VoteValue=${voteValue};`, (err, result) => {
                //handle error
              })
            } else {
              connection.query(`INSERT INTO votes (Permlink, VoterID, VoteValue) VALUES(${permlink}, ${id}, ${voteValue});`, (err, result) => {
                //handle error
              })
            }
          })
        } else {
          saveHiveUserID(voter, (hiveID) => {
            if (hiveID.success) {
              let id = hiveID.data.id
              db_data.getVoteByVoterIdPermlink(id, permlink, (existingVote) => {
                if (existingVote.success && existingVote.data.length){
                  connection.query(`UPDATE users WHERE VoterID=${id} AND Permlink=${permlink} SET VoteValue=${voteValue};`, (err, result) => {
                    //handle error
                  })
                } else {
                  connection.query(`INSERT INTO votes (Permlink, VoterID, VoteValue) VALUES(${permlink}, ${id}, ${voteValue});`, (err, result) => {
                    //handle error
                  })
                }
              })
            }
          })
        }
      })
    }
  })
}

function restoreComment(permlink){
  db_data.getDeletedCommentWitPermlink(permlink, (comment) => {
    if (comment.success && comment.data.length){
      connection.query(`DELETE FROM deleted_comments WHERE Permlink=${permlink};`, (err, result) => {
        //handle error
      })
    }
  })
}

function addNewMod(username){
  db_data.getUserID(username, (id) => {
    if (id.success && id.data.length){
      let ID = id.data[0].ID
      connection.query(`REPLACE INTO mods (ModID) VALUES(${ID});`, (err, result) => {
        //handle error
      })
    }
  })
}

module.exports = {
    saveLatestBlock,
    saveNewRootComment,
    saveNewPostComment,
    deleteComment,
    updateComment,
    saveVote,
    restoreComment,
    addNewMod
}