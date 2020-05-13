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

module.exports = {
    getLatestBlock,
    getCommentWithPermlink,
    getUserID,
    getVoteByVoterIdPermlink
}