let mysql = require('mysql')
let config = require("../config.json")

let connection = mysql.createConnection({
  host : config.db_host,
  user : config.db_username,
  password : config.db_password,
  database : config.db_databse,
  multipleStatements: true
})
 
//Connects To MySQL and sets up tables. Meant for first time use only.
connection.connect((err) => {
    if (err){
        console.log(err)
        connection.end()
        return
    }
    let sql = `CREATE TABLE general_stats (last_parsed_block INT);`
    sql += `INSERT INTO general_stats VALUES(-1);`
    sql += `CREATE TABLE users (ID INT PRIMARY KEY, Username VARCHAR(255));`
    sql += `CREATE TABLE comments (Permlink INT AUTO_INCREMENT PRIMARY KEY,ParentID INT, Author INT, Title VARCHAR(255), Body VARCHAR(255), Metadata JSON, PostTime INT);`
    sql += `CREATE TABLE votes (Permlink INT, Voter INT, VoteValue INT);`
    sql += `ALTER TABLE comments ADD FOREIGN KEY (Author) REFERENCES users(ID);`
    sql += `ALTER TABLE votes ADD FOREIGN KEY (Voter) REFERENCES users(ID)`
    
    connection.query(sql, (err, result) => {
        if(err){
            console.log(err)
            connection.end()
            return
        }
        console.log("Tables set up.")
        connection.end()
    })
})