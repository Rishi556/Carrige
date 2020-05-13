let mysql = require("mysql")
let config = require("../config.json")
let hive = require("@hivechain/hivejs")

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
      hive.api.getAccounts([author], (errHive, resultHive) => {
        if (errHive){
          setTimeout(() => {
            saveNewRootPost(author, title, body, metadata, postTime)
          }, 1000 * 0.5)
          return
        }
        let id = resultHive[0].id
        connection.query(`INSERT INTO users (ID, Username) VALUES(${id}, "${author}");`, (errTwo, resultTwo) => {
          if (errTwo){
            setTimeout(() => {
              saveNewRootPost(author, title, body, metadata, postTime)
            }, 1000 * 0.5)
          } else {
            connection.query(`INSERT INTO comments (ParentID, AuthorID, Title, Body, Metadata, PostTime) VALUES(${parentPermlink}, ${id}, "${title}", "${body}", "${JSON.stringify(metadata)}", ${postTime});`, (errThree, resultThree) => {
              //Error handling goes here
            })
          }
        })
      })
    } else {
      let id = result[0].ID
      connection.query(`INSERT INTO comments (ParentID, AuthorID, Title, Body, Metadata, PostTime) VALUES(${parentPermlink}, ${id}, "${title}", "${body}", "${JSON.stringify(metadata)}", ${postTime});`, (errTwo, resultTwo) => {
        //Error handling goes here
      })
    }
  })
}

function saveNewRootPost(author, title, body, metadata, postTime){
  saveNewComment(null, author, title, body, metadata, postTime)
}

function saveNewPostComment(parentPermlink, author, title, body, metadata, postTime){
  connection.query(`SELECT * FROM comments WHERE ParentID="${parentPermlink}";`, (err, result) => {
    if (!err || result.length){
      saveNewComment(parentPermlink, author, title, body, metadata, postTime)
    }
  })
}

function deleteComment(permlink, author){
  connection.query(`SELECT * FROM users WHERE Username="${author}";`, (err, result) => {
    if (!err && result.length){
      let id = reslut[0].ID
      connection.query(`DELETE FROM comments WHERE Permlink=${permlink} AND AuthorID=${id};`, (errTwo, resultTwo) => {
        //Error handling goes here
      })
    }
  })
}

function updateComment(permlink, author, title, body, metadata, postTime){
  connection.query(`SELECT * FROM users WHERE Username="${author}";`, (err, result) => {
    if (!err && result.length){
      let id = reslut[0].ID
      connection.query(`SELECT * FROM comments WHERE AuthorID=${id} AND Permlink=${permlink};`, (errTwo, resultTwo) => {
        if (!errTwo && resultTwo.length){
          connection.query(`REPLACE INTO comments (Permlink, Title, Body, Metadata, PostTime) VALUES(${permlink}, "${title}", "${body}", "${JSON.stringify(metadata)}", ${postTime});`, (errThree, resultThree) => {
            //Error handling goes here
          })
        }
      })
    }
  })
}

module.exports = {
    saveLatestBlock,
    saveNewRootPost,
    saveNewPostComment,
    deleteComment,
    updateComment
}