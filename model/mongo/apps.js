//APP信息
"use strict"
const mvc = require('cosjs.mvc');
const dbase    = mvc.model.require('dbase');
module.exports = function(){
    return new dbase.mongo("apps",false);
}

