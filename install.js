// node install configPath branch
const mvc     = require('cosjs.mvc');
module.exports = function(app){
    return Promise.resolve().then(()=>{
        return createAdmin()
    }).then(()=>{
        return createApp(app);
    }).then(()=>{
        return createIndex(app);
    })
}



function createAdmin(){
    let guid = "root";
    let members = mvc.model.mongo('members');
    return members.exist(guid).then(ret=>{
        if(ret) {
            return console.log(`admin[${guid}] exist,Cancel default account create.`)
        }
        let info = {};
        info['guid'] = guid;
        info['xcode'] = mvc.library('password','109927657');
        info['name'] = guid;
        info['time'] = Date.now();
        info['level'] = 100;
        return members.insert(info).then(()=>{
            console.log(`admin[${guid}] install`)
        })
    })
}

function createApp(app){
    if(!app){
        return console.log(`app empty & nothing to do`);
    }
    console.log(`add app[${app}]`)
    let info = {"_id":app,"name":app}
    mvc.format('apps',info,true)
    let model = mvc.model.mongo("apps");
    return model.insert(info)
}

function createIndex(app) {
    let loader = mvc.model();
    let M = loader._moduleCache;
    let task = mvc.library('multi',Object.keys(M),installIndex.bind(null,loader,app) );
    task.breakOnError = true;
    return task.start();
}





function installIndex(loader,app,name){
    if(name.substr(0,7) !== '/mongo/'){
        return true;
    }

    let mod = loader.require(name);
    if(!mod.indexes){
        return true;
    }
    let mk = name.substr(7);
    let mongo = mvc.model.mongo(mk,app);
    let indexes = mod.indexes;

    return mongo.collection().then(coll=>{
        let task = mvc.library('multi',indexes,function(arr){
            console.log("mongodbIndexes",name,JSON.stringify(arr));
            return coll.createIndex(arr[0],arr[1]);
        })
        task.breakOnError = true;
        return task.start();
    })
}
