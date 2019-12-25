"use strict"
const mvc = require("cosjs.mvc");
const handle = mvc.library("handle","apps master","apps","apps",mvc.config.get("apps.view")||"master/apps")

exports.index = function(){
    let level = this.session.get("level");
    if(level < 100){
        return this.error("权限不足")
    }
    return handle.index.call(this)
}

exports.page = handle.page;

exports.save = handle.save;