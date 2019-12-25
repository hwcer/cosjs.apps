"use strict"
const mvc = require("cosjs.mvc");
const handle = mvc.library("handle","成员管理","members","members","master/members")

exports.index = function(){
    let data = {};
    return handle.index.call(this,data);
}
//游戏服务器列表管理
exports.page = function (){
    let query = {};
    return handle.page.call(this,query);
};

exports.save = function () {
    this.output = "json";
    let act = this.get('act');
    return Promise.resolve().then(()=>{
        if(act==='del'){
            return verify_save_del.call(this);
        }
        else if(act==='add'){
            return verify_save_add.call(this);
        }
        else if(act==='edit'){
            return verify_save_edit.call(this);
        }
        else{
            return this.error('unknown act type',act)
        }
    }).then(()=>{
        return handle.save.call(this,save_member_filter);
    })
}

function verify_save_del() {
    let id = this.get("id",'string');
    if (!id) {
        return this.error('args[id] empty');
    }
    if(id === this.session.uid){
        return this.error("身体发肤,受之父母,不敢毁伤,孝之始也。");
    }
    let keys = ["level"];
    let membersModel = this.model.mongo('members');
    return membersModel.get(id,keys).then(ret=>{
        if(!ret){
            return this.error("members not exist",id);
        }
        let level = this.session.get("level")||0;
        if(ret['level'] >= level){
            return this.error(`你不能删除权限大于等于自身权限${level}的用户`);
        }
    })
}

function verify_save_add() {
    let level = this.session.get("level")||0;
    let saveLevel = this.get("level",'int');
    if(!saveLevel){
        return this.error(`用户权限不能为空`);
    }
    else if(saveLevel >=level){
        return this.error(`你不能添加权限大于等于自身权限${level}的用户`);
    }
}

function verify_save_edit() {
    let id = this.get("id",'string');
    if ( !id ) {
        return this.error('args[id] empty');
    }
    if(id === this.session.uid){
        return ;
    }
    let keys = ["level"];
    let membersModel = this.model.mongo('members');
    return membersModel.get(id,keys).then(ret=>{
        if(!ret){
            return this.error("members not exist",id);
        }
        let level = this.session.get("level")||0;
        if(ret['level'] >= level){
            return this.error(`你不能编辑权限大于等于自身权限${level}的用户`);
        }
    })
}





function save_member_filter(t,d){
    if(t=='add'){
        return save_member_add.call(this,d)
    }
    else if(t=="edit"){
        return save_member_edit.call(this,d)
    }
}


function save_member_add(info) {
    let xcode = info['xcode']|| (Date.now()).toString('32')
    info['xcode'] = this.library('password',xcode);

    let level = this.session.get("level")||0;
    if( !info['app'] || level < 100){
        info['app'] = [this.app];
    }
}

function save_member_edit(info){
    if(!info['xcode']){
        delete info['xcode'];
    }
    else{
        info['xcode'] = this.library('password',info['xcode']);
    }

    let id = this.get('id','string');
    //编辑自己账号
    if(id === this.session.uid ){
        delete info['level'];
        delete info['status'];
    }
}






