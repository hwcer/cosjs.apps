"use strict"
const mvc = require('cosjs.mvc');
//基于jqgrid的分页显示以及增改删

function handle_prototype(title,model,format,view){
    if (!(this instanceof handle_prototype)) {
        return new handle_prototype(title,model,format,view)
    }
    let self = this;
    let arr = model.split('/');
    if(!arr[0]){
        arr.shift();
    }
    if(!arr[arr.length-1]){
        arr.pop();
    }
    let handle = arr.join('/');

    this.view = view || handle;
    this.title = title;
    this.model = model;
    this.format = format || model;
    this.handle = handle
    this.idtype = 'string';
    this.filter  = null;


    this.index = function(filter){
        return handle_index.call(this,self,filter)
    }
    //filter,sort
    this.page = function(filter,sort){
        return handle_page.call(this,self,filter,sort)
    }
    this.save = function(filter){
        return handle_save.call(this,self,filter)
    }
}

module.exports = handle_prototype;


function handle_index(handle,filter){
    this.view = "jqgrid";
    filter = filter||handle.filter;
    let data = {"title":handle.title,"view":handle.view,"handle":handle.handle};
    if(typeof filter === 'function'){
        filter.call(this,'index',data);
    }
    else if(filter){
        Object.assign(data,filter)
    }
    return data;
}
//游戏服务器列表管理
function handle_page(handle,filter){
    this.output = "json";
    filter = filter||handle.filter;

    let $page = this.get('page', 'int') || 1;
    let $size = this.get('size', 'int') || 20;
    let $sort = this.get('sort','string') ;
    let $order = this.get('order') || 'desc';
    let dbsort = arguments[2]||{};
    if ($sort) {
        dbsort[$sort] = $order == 'desc' ? -1 : 1;
    }

    let body = this.req.body;
    let format = mvc.format(handle.format);
    if(!format){
        return this.error(`format[${handle.format}] not exist`)
    }
    let query = this.library.call(this,'jqgrid/query',body,format);
    let option = {"total":this.get('total', 'int') || 0};
    if(typeof filter === 'function'){
        filter.call(this,'page',query);
    }
    else if(filter){
        Object.assign(query,filter)
    }
    let model = get_model_instance.call(this,handle);
    return model.page(query, $page, $size, dbsort, option);
}

function handle_save(handle,filter) {
    this.output = "json";
    filter = filter||handle.filter;

    let act = this.get('act','string');
    if(act == 'del'){
        return del.call(this,handle,filter);
    }
    else if (act=='edit') {
        return edit.call(this,handle,filter);
    }
    else{
        return add.call(this,handle,filter);
    }
}

function del(handle) {
    let id = this.get('id',handle.idtype);
    if ( !id ) {
        return this.error('args[id] empty');
    }
    let model = get_model_instance.call(this,handle);
    return model.del(id);
}

function edit(handle,filter){
    let id = this.get('id',handle.idtype);
    if(!id){
        return this.error('id不能为空');
    }
    let info = {},format = mvc.format(handle.format);
    for (let k in format) {
        if(format[k]['edit']){
            info[k] = this.get(k, format[k]['type'],'post') ;
        }
        if( format[k]['edit'] > 1 && !info[k] ){
            let name = format[k]['name'] || k;
            return this.error(`${name}不能为空`);
        }
    }
    return Promise.resolve().then(()=>{
        if(typeof filter === 'function'){
            return filter.call(this,'edit',info);
        }
        else{
            return info;
        }
    }).then(()=>{
        let model = get_model_instance.call(this,handle);
        return model.set(id,info);
    })
}

function add(handle,filter) {
    let info = {},format = mvc.format(handle.format);
    for (let k in format) {
        if(format[k]['add']){
            info[k] = this.get(k, format[k]['type'],'post') ;
        }
        if( format[k]['add'] > 1 && !info[k] ){
            let name = format[k]['name'] || k;
            return this.error(`${name}不能为空`);
        }
    }
    let mongoModel;
    return Promise.resolve().then(()=>{
        if(typeof filter === 'function'){
            return filter.call(this,'add',info);
        }
        else{
            return info;
        }
    }).then(()=>{
        mongoModel = get_model_instance.call(this,handle);
        if(!info["_id"]){
            info["_id"] = mongoModel.ObjectID();
            return false;
        }else {
            return mongoModel.get(info["_id"],["_id"])
        }
    }).then(ret=>{
        if(ret){
            return this.error(`${handle.model}[${info["_id"]}] exist`);
        }
        else {
            return mongoModel.insert(info);
        }
    })
}


function get_model_instance(handle){
    let arr = [handle.model];
    let multi = this.config.get("apps.multi");
    if(multi > 1){
        arr.push(this.app);
    }
    return  this.model.mongo(...arr);
}