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