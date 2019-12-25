"use strict"
/*
ObjectID
 */

module.exports = function ObjectID(id){
    if(id){
        return id;
    }
    else{
        return parseInt(Date.now() / 1000).toString(32);
    }
}