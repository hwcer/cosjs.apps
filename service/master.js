//http启动脚本
"use strict";
const mvc       = require('cosjs.mvc');
const cookie    = require('cookie-parser');
const express   = require('express');
//开放的接口，不需要登录验证
const pubapi = new Set(['/login/','/logout/','/login/verify','/layui/'] );
const NOAPP = new Set(['/main/','/apps/','/members/']);

module.exports = function(session){
    let app = this;
    ///////////////////////////////////////////
    let urlencoded  = express.urlencoded({ extended: true,limit:"100kb" });
    let jsonencoded = express.json({extended: true,limit:"100kb" });
    /////////////////////管理//////////////////////
    let multi = mvc.config.get("apps.multi");
    let index = mvc.config.get('apps.index');
    let prefix = mvc.config.get("route.master");
    //默认管理页面
    app.get(`/${prefix}/?`,function (req, res, next) {
        res.redirect(`/${prefix}/${index}/login/`);
    })
    //管理页面
    let appid  = multi>=2 ? ':app' : index;
    let master_root = mvc.handle.master();
    let master_route = {"route":`/${prefix}/${appid}/*`,method:'all',output:'view',"subpath":handle_subpath}
    let master_server = app.server(master_root,master_route,cookie(),urlencoded,jsonencoded);
    master_server.on('start',handle_start);
    master_server.on('finish',handle_finish);

    master_server.session = session;
    master_server.session.level = session_level;
}


function handle_subpath(){
    let path = this.req.params[0];
    this.app = this.req.params['app'];
    if(!this.app){
        this.app = this.config.get('apps.index');
    }
    return path ? ['/',path ].join('') : '/login/';
}

function session_level(){
    if( pubapi.has(this.path) ){
        return 0;
    }
    else{
        return 1;
    }
}



function handle_start(){
    //权限检查

    //路由检查
    if(this.session.level < 1){
        return;
    }
    let index = this.config.get('apps.index');
    let multi = this.config.get("apps.multi");
    //超级管理模式,仅仅部分接口可以访问
    if( multi >= 2 && this.app == index  ){
        let flag = false;
        for(let k of NOAPP){
            if(this.path.indexOf(k) == 0){
                flag = true;break;
            }
        }
        if(!flag){
            return this.error("NO APP SELECT","Please select an app");
        }
    }
}


function handle_finish(err,ret){
    let data ={"err":err,"ret":ret};
    let multi = mvc.config.get("apps.multi");
    if( this.output === "view" ){
        data['app'] = this.app;
        data['route'] = mvc.config.get("route.master")||'';
        this.status = 200;
        if(err) this.view = "error";
    }
    else if( this.output === 'json'){
        if(err) this.status = 500;
    }
    return data;
}



