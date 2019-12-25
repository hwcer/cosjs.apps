

//批量执行多任务，依赖于eventEmitter
function multi(handle,worker){
    if (!(this instanceof multi)) {
        return new multi(handle,worker);
    }
    this.error  = [];                             //错误列表
    this.handle = Array.from(handle);             //待执行队列
    this.worker = worker;                         //具体处理队列的方法

    this.emitter = new emitter();                //进度监控，每执行脚本一次分别调用schedule('start',k),
    this.interval = 0;                             //延时
    this.breakOnError = false;                     //队列出现错误时是否立即退出循环

    this._maxNum   = 0;
    this._curNum   = 0;
}

multi.prototype.on = function(){
    return this.emitter.on.apply(this.emitter, arguments);
}

multi.prototype.emit = function(){
    return this.emitter.emit.apply(this.emitter, arguments);
}
//顺序执行
multi.prototype.start = function(){
    let num = arguments[0]||0;
    if(num > 0){
        this._maxNum = Math.min(this.handle.length,num);
    }
    else{
        this._maxNum = this.handle.length;
    }
    if(this._maxNum<1){
        return Promise.resolve(0);
    }
    this.error = [];
    return new Promise((resolve,reject)=>{
        this._worker_resolve = multi.resolve.bind(this,resolve,reject);
        multi.begin.call(this);
    })
}


multi.resolve = function(resolve,reject){
    let error = this.error.length;
    this.emitter.emit('finish',error);
    resolve(error);
}

multi.begin = function(){
    if( this.handle.length < 1){
        return this._worker_resolve();
    }
    let key = this.handle.shift();
    this.emit("begin",key);
    Promise.resolve(1).then(()=>{
        return this.worker(key);
    }).then(ret=>{
        multi.result.call(this,key,null,ret);
    }).catch(err=>{
        multi.result.call(this,key,err);
    })
}

multi.result = function(key,err,ret){
    this.emit("result",key,err,ret);
    this._curNum ++;
    if(err){
        this.error.push({'err':err,'ret':ret});
    }
    if( err && this.breakOnError){
        return this._worker_resolve();
    }

    if(this._curNum >= this._maxNum){
        return this._worker_resolve();
    }
    setTimeout(multi.begin.bind(this),this.interval);
}