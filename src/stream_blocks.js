let hive = require("@hivechain/hivejs")
let db_data = require("./db_data.js")
let db_updater = require("./db_updater.js")
let parse_block = require("./parse_block.js")

let lastBockParsed = -1

hive.api.setOptions({ url: 'https://anyx.io' })

//Gets data from a particular block
function getBlock(blockNumber){
    hive.api.getBlock(blockNumber, (errB, resultB) => {
        if (!errB && resultB){
                let bN = blockNumber
                if (bN == lastBockParsed + 1){
                    parseBlock(resultB)
                    db_updater.saveLatestBlock(blockNumber)
                    lastBockParsed = lastBockParsed + 1
                    setTimeout(() => {
                        getBlock(lastBockParsed + 1)
                    }, 0.5 * 1000)
                } else {
                    setTimeout(() => {
                        getBlock(lastBockParsed + 1)
                    }, 3 * 1000)
                }
        } else {
            setTimeout(() => {
                getBlock(blockNumber)
            }, 0.5 * 1000)
        }
    })
}

//Parses the block
function parseBlock(block){
    if (block.transactions.length != 0){
        parse_block.parseBlock(block)
    }
}

//Starts streaming blocks.
function startStreaming(){
    db_data.getLatestBlock((result) => {
        if (result.success && result.data[0] && result.data[0].last_parsed_block > 0){
            lastBockParsed = result.data[0].last_parsed_block - 1
            getBlock(result.data[0].last_parsed_block)
        } else {
            hive.api.getDynamicGlobalProperties(function(err, result) {
                if (err){
                    console.log(err)
                    return
                }
                let latestBlock = result.last_irreversible_block_num
                lastBockParsed = latestBlock - 1
                getBlock(latestBlock)
            })
        }
    })
}

module.exports = {
    startStreaming
}