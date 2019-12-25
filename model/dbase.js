"use strict";
const mvc = require('cosjs.mvc');
const cosjs = require('cosjs');

const _redis      = require('cosjs.redis');
const _mongo      = require('cosjs.mongo');

//用户锁
exports.locks = class locks extends _redis.locks {
    constructor(name,expire){
        let redis = cosjs.pool.get("cache");
        if(!redis){
            throw new Error("redis cache empty")
        }
        let prefix = ['L',name].join('-');
        super(redis,prefix,expire);
    }
}
//缓存
exports.cache = class cache extends _redis.struct {
    constructor(name,format){
        let redis = cosjs.pool.get("cache");
        if(!redis){
            throw new Error("redis cache empty")
        }
        let prefix = ['C',name].join('');
        let formatOpt = format ? mvc.format(format) : null;
        super(redis,prefix,formatOpt);
    }
}


exports.mongo = class mongo extends _mongo {
    constructor(name,upsert){
        let mongo = cosjs.pool.get("mongodb");
        if(!mongo){
            throw new Error("mongodb empty")
        }
        let dbname = mvc.config.get("dbname")||'cosjs';
        super(mongo,dbname,name,upsert);
    }
}