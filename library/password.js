//密码加密
"use strict"
const mvc      = require('cosjs.mvc');
const crypto   = require('crypto');

function password(str){
    let ps = mvc.config.get("password.secret");
    if(!ps){
        throw new Error('config[password.secret] empty');
    }
    let iv = ps.substring(0,16);
    let secret   = ps.substring(ps.length -16,ps.length);
    let cipher  = crypto.createCipheriv('aes-128-cfb',secret,iv);
    let enc  = cipher.update(str, "utf8", "hex");
    enc += cipher.final("hex");
    return mvc.library("crypto/md5",enc);
}


module.exports = password;
