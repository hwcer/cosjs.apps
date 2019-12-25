//初始化环境
const mvc       = require('cosjs.mvc');
const path      = require('path');
const cosjs     = require('cosjs');
const plugin    = require('cosjs.plugin');

const setting   = require("./config");
//============================启动进程=================================//
let root = path.dirname(process.argv[1]);
let file = path.resolve(root, process.argv[2]||'config');
let config = require(file);
let options = Object.assign({},setting);
//合并应用配置
for(let k in config){
    if(typeof config[k] === 'object' && !Array.isArray(config[k]) ){
        options[k] = Object.assign(options[k]||{},config[k]||{});
    }
    else{
        options[k] = config[k];
    }
}

//环境配置
process.env.NODE_ENV = options.debug ? 'development' : 'production';
mvc.config.set(options);
//初始化MODEL
mvc.model.namespace("mongo","redis");
mvc.handle.namespace("master");

mvc.config.set('apps.view','');
mvc.config.set('apps.name','apps');

mvc.config.set('apps.multi',2);      //0:单应用,1:多应用平台模式,2:多应用后台版数据库隔离
mvc.config.set('apps.shard',0);     //多应用模式，应用数据库是否独立
mvc.config.set('apps.index','x');  //默认APP,占位符
mvc.config.set('apps.secret','7aaeea839db189ce900d0012db4da549');  //单应用默认秘钥,apps.multi>0时无需配置
//模板,菜单，服务进程
mvc.config.set("views",[]);
mvc.config.set("navbar",[]);
mvc.config.set("service",[]);
//路由设置
mvc.config.set('route.default','');      //默认地址
mvc.config.set("route.master",'m');     //管理接口
//20-32位字符串，账号密码加密使用的secret，中途修改会导致所有账号无法登陆
mvc.config.set("password.secret",'Gk0KoMgCbxoVlEFHvFuRf5x4DcNS8VkYH6vDMVjG5j');
//默认菜单
mvc.config.push("navbar",require("./navbar"));
//管理页面标题
mvc.config.set("master.title",'OPENAPP MASTER')
//mvc.config.push("views",setting['APPPath']+'/views');

exports.start = function(){
    cosjs.http(mvc.config.get('remote'));
    return cosjs.start(server_start);
}

//脚本模式调试
exports.debug = function(){
    return server_start('debug');
}

//创建新应用，node index config install appname
exports.install = function(){
    let app = process.argv[4]||null;
    let shard = mvc.config.get("apps.shard");
    if(shard && !app){
        return Promise.reject("app empty");
    }

    return server_start('install').then(()=>{
        return require('./install')(app);
    }).then(()=>{
        console.log("app install success");
    }).catch(err=>{
        console.log('app install fail:',err)
    }).finally(()=>{
        process.exit();
    })
}



function server_start() {
    return Promise.resolve(1).then(()=>{
        return mvc.addPath(root);
    }).then(()=>{
        return mvc.addPath(setting['APPPath']);
    }).then(()=>{
        return cosjs.pool.redis( 'cache',options.dbase.cache);
    }).then(()=>{
        return cosjs.pool.mongodb( 'mongodb',options.dbase.mongodb);
    }).then(()=>{
        let p = mvc.config.get('plugin');
        if(Array.isArray(p)){
            plugin(p);
        }
    }).then(()=>{
        mvc.config.push("views",setting['APPPath']+'/views');  //最后加载默认模板便于覆盖
    })
}

