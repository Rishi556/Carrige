# Carrige
 
## Set up dev environment

### Pre-requisites

* Install and configure mysql 
  * On MacOS, with homebrew you can install it with `brew install mysql`
 * Start mysql with `mysql.server start`
 * Configure user, password, and other settings with `mysql_secure_installation`
 * Test connection to mysql `mysql -uUser -p`
 * Create a new database `CREATE DATABASE db1;`

* Install php
 * On MacOS, `brew install php`

* Install Node dependencies
 * Clone this repo and cd into the Carrige directory
 * Install Node.JS dependencies with `yarn install` or `npm install`

* Create configuration file
 * Save a copy of config.example.json as config.json
 * Update db_* configuration values to match what you configured for mysql

* Set up the database
 * cd to initialization_scripts
 * Run setUp.js like `node setUp.js`
 * If all goes well you will see a message: `Tables set up.`

### Launching app

* Start up the Node.JS app for the API
 * From, the Carrige directory, run `node app.js`
  * This will start a server listening on port 80

* Start up the PHP server
 * Create a 2nd terminal tab/window
 * cd to Carrige/interface directory
 * launch php server `php -S localhost:3000`

### View your Carriage instance in browser

* Navigate to localhost:3000
 * If it works, you should see the Raven UI
