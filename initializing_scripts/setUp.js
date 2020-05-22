let mysql = require('mysql')
let hive = require("@hivechain/hivejs")
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
    sql += `CREATE TABLE users (ID INT PRIMARY KEY, Username VARCHAR(255) UNIQUE);`
    sql += `CREATE TABLE banned_users (UserID INT PRIMARY KEY);`
    sql += `CREATE TABLE comments (Permlink INT AUTO_INCREMENT PRIMARY KEY,ParentID INT, AuthorID INT, Title TEXT, Body TEXT, Metadata JSON, PostTime INT);`
    sql += `CREATE TABLE votes (Permlink INT, VoterID INT, VoteValue INT);`
    sql += `CREATE TABLE deleted_comments (Permlink INT PRIMARY KEY);`
    sql += `CREATE TABLE admins (AdminID INT PRIMARY KEY, SuperAdmin BIT(1));`
    sql += `CREATE TABLE mods (ModID INT PRIMARY KEY);`
    sql += `ALTER TABLE comments ADD FOREIGN KEY (AuthorID) REFERENCES users(ID);`
    sql += `ALTER TABLE votes ADD FOREIGN KEY (VoterID) REFERENCES users(ID);`
    sql += `ALTER TABLE admins ADD FOREIGN KEY (AdminID) REFERENCES users(ID);`
    sql += `ALTER TABLE mods ADD FOREIGN KEY (ModID) REFERENCES users(ID);`;
    sql += `ALTER TABLE banned_users ADD FOREIGN KEY (UserID) REFERENCES users(ID);`;

    if (config.features.super_admin.initial_super_admin != ""){
        hive.api.getAccounts([config.features.super_admin.initial_super_admin], (errHive, resultHive) => {
            if (!errHive && resultHive){
                let id = resultHive[0].id
                sql += `INSERT INTO users (ID, Username) VALUES(${id}, "${config.features.super_admin.initial_super_admin}");`
                sql += `INSERT INTO admins (AdminID, SuperAdmin) VALUES(${id}, 1);`
                sql += `INSERT INTO mods (ModID) VALUES(${id});`
                connection.query(sql, (err, result) => {
                    if(err){
                        console.log(err)
                        connection.end()
                        return
                    }
                    console.log(`Tables set up. The initial super admin is ${config.features.super_admin.initial_super_admin}.`)
                    connection.end()
                })
            } else {
                console.log("There was an error getting the hive user id. Please manually check it out and save it.")
                return
            }
        })
    } else {
        connection.query(sql, (err, result) => {
            if(err){
                console.log(err)
                connection.end()
                return
            }
            console.log("Tables set up.")
            connection.end()
        })
    }
})