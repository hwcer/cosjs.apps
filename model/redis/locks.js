//redis 并发锁
const dbase = require("../dbase")


module.exports = function(name,expire){
    return new dbase.locks(name,expire);
}