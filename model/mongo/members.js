//系统管理成员
"use strict"
const dbase    = require('../dbase');
const ObjectID = require('../ObjectID');



class members extends dbase.mongo {
    constructor(){
        super('members');
        this.ObjectID = ObjectID.bind(this);
    }

    exist(guid){
        let query = {"guid":guid};
        return this.count(query);
    }
    //登录验证
    getFromName(guid,keys){
        let query = this.query(guid,'guid');
        let option = {multi:this.isMulti(guid), fields:this.fields(keys) };
        return this.find(query,option);
    }
}




module.exports =  function(){
    return new members();
}

//索引
module.exports.indexes = [
    [{"guid":1},{}]
]
