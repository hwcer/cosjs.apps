//http启动脚本
"use strict";
const mvc       = require('cosjs.mvc');
const cosjs     = require('cosjs');
const express   = require('express');

const session_format = {
    "name":{"type":"string","val":""},
    "level":{"type":"int","val":0}
}

module.exports = function(){
    let app = this;
    let root = mvc.config.get('APPPath');
    let debug = mvc.config.get("debug");
    app.defineHandlePrototype("model",mvc.model);
    app.defineHandlePrototype("config",mvc.config);
    app.defineHandlePrototype("library",mvc.library);
    /////////////////////远程跨域//////////////////////
    app.use(function (req,res,next) { res.set("Access-Control-Allow-Origin","*"); next();})
    ///////////////////////////////////////////
    let session_usr = mvc.config.get("session")||{};
    let session_def = {"key":"_gm_sid","format":session_format, "redis":cosjs.pool.get("cache"),"level":1,"method":'all'};
    let session_val = Object.assign({},session_def,session_usr);
    //管理服务和远程服务器
    let defaultService = ['master'];
    for(let f of defaultService){
        let func = require(root + '/service/' + f);
        func.call(this,session_val,...arguments);
    }
    //插件服务器
    let pluginService = mvc.config.get("service");
    for(let f of pluginService){
        let func = require(f);
        func.call(this,session_val,...arguments);
    }
    ///////////////////////模板配置///////////////////
    app.set('views',mvc.config.get('views'));
    app.set('view engine','ejs');
    app.set('view cache',debug ? false : true);
    //静态服务器
    app.use(express.static(root + '/wwwroot'));
    //默认页面
    let route_default = mvc.config.get("route.default");
    if(route_default){
        app.use('/',function ( req, res, next) {
            res.redirect(route_default);
        })
    }
    //404错误
    app.use('*',function ( req, res, next) {
        res.status(404).json(404);
    })

}
