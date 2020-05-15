let hive = require("@hivechain/hivejs")

//need to add error handling to thi
function getFollowing(user, start, following, callback) {
  hive.api.getFollowing(user, start, "blog", 1000, (err, result) => {
    if (!err) {
      for (i in result) {
        following.push(result[i].following)
      }
      if (result.length == 1000) {
        var newStart = following.pop()
        getFollowing(user, newStart, following, callback)
      } else {
        callback({success: true, data: following})
      }
    } else {
      setTimeout(() => {
        getFollowing(user, start, following, callback)
      }, 10 * 1 * 1000)
    }
  })
}


module.exports = {
  getFollowing
}