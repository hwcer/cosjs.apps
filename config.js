"use strict";
var root = __dirname;

var config = {

    debug   : 2,
    multi   : true,                                        //多应用共享后台模式,每个应用独立库名,不适合做平台
    dbname  : 'cosjs',
    APPPath : root,
    session : {"key":"_cos_id","prefix":"_cos_cookie","secret":"DcNS8VMvFkYH6gCbxoVlEFHvDGk0KouRf5x4MVjG5j"},
}

module.exports = config;


config.dbase = {
    cache   : {'host':'centos.hwc.com','port':6379,'password':'szmzbzbzlp@109927657.com'},
    mongodb : {'host':'centos.hwc.com','port':27017},
}


config.remote = {
    fnum     : 1,
    name     : "remote",
    shell    : root+'/process/remote',
}