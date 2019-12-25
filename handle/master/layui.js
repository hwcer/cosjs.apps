"use strict"
const fs = require('fs');
const path = require('path');

//将普通JS文件导出成layui文件
//文件必须放在wwwroot/assets下面
module.exports = function(){
    this.output = 'js';
    let name = this.get("name","string");

    let root = this.config.get('APPPath');

    let realpath = [root,'wwwroot/assets',name].join('/');
    let options = {"encoding":"utf8"};
    return this.library.call(fs,"promise",'readFile',realpath, options).then(ret=>{
        let data = ret.toString();
        return js_to_layui(name,data);
    });
};




function js_to_layui(p,d){
    let name = path.basename(p, '.js');
    let arr= [];
    arr.push("layui.define(['layer', 'element'], function (exports) {");
    arr.push("var layer = layui.layer ,$ = layui.jquery;");
    arr.push(d);
    arr.push(`exports('${name}', ${name});`)
    arr.push("})");
    return arr.join("\r\n")
}