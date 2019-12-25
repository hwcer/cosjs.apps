"use strict"

module.exports = function(){
    this.view = 'master/login';
}

module.exports.verify = function(){
    this.output = "json";
    let username = this.get('username','string');
    let password = this.get('password','string');
    if ( !username ) {
        return this.error('用户名不能为空');
    }
    if ( !password ) {
        return this.error('密码不能为空');
    }
    let members = this.model.mongo('members');

    let keys = ['_id','xcode','name','level','status'];
    return members.getFromName(username,keys).then(ret=>{
        if(!ret){
            return this.error('username not exist');
        }
        if(ret['status'] < 1){
            return this.error("账号已被禁用");
        }
        let verify_xcode = this.library("password",password);
        if( verify_xcode !== ret['xcode']){
            return this.error('password error');
        }
        return ret;
    }).then(ret=>{
        let _id = ret['_id'],level = ret["level"]||0
        let query = {"name":ret['name'],"level":level};
        return this.session.create(_id,query);
    }).then(id=>{
        return {'k':this.session.opts.key,'v':id,'m':this.session.opts.method}
    })
};
