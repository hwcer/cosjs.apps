if(!cosjs) { var cosjs = {};}

const cosjs_promise_callback = (resolve, reject) =>function(err, ret) { if(err){ reject({'err':err,'ret':ret});  }  else {  resolve(ret); } }

function cosjs_net_error(callback, XMLHttpRequest, textStatus, errorThrown){
    var err;
    if( XMLHttpRequest['responseJSON'] ){
        err = XMLHttpRequest['responseJSON']['err'];
        if(XMLHttpRequest['responseJSON']['ret']) {
            err += "\r\n"+ XMLHttpRequest['responseJSON']['ret'];
        }
    }
    else{
        err = XMLHttpRequest.responseText||'未知错误';
    }
    return callback(err);
}

function cosjs_net_success(callback, ret){
    callback(null,ret);
}

function cosjs_uri_encode(args){
    if(typeof args != 'object'){
        return args;
    }
    let arr = [];
    for(let k in args){
        arr.push(k+'='+encodeURIComponent(args[k]));
    }
    return arr.join('&');
}
cosjs.get = function(url,data){
    let opts = arguments[2]||{};
    opts['method'] = 'GET';
    return cosjs.request(url,data,opts);
}
cosjs.post = function(url,data){
    let opts = arguments[2]||{};
    opts['method'] = 'POST';
    return cosjs.request(url,data,opts);
}
cosjs.alert = function(err){
    let txt;
    if(typeof err === 'object' && err.err){
        let arr = [err.ret];
        if(err.err !== 'error'){
            arr.unshift(err.err)
        }
        txt = arr.join('</br>')
    }
    else if(typeof err === 'object' ){
        txt = err.toString();
    }
    else{
        txt = String(err);
    }
    layer.alert(txt);
}


//封装错误信息
cosjs.error = function(err){
    let result;
    if(typeof err === 'string'){
        result = {"err":err,"ret":""}
    }
    else if(err instanceof Error){
        result =  {"err":err.message,"ret":err.stack}
    }
    else if( err.err ){
        result =  {"err":err.err,"ret":err.ret||''}
    }
    else{
        result =  {"err":'error',"ret":err||''}
    }
    return Promise.reject(result);
}
//网络请求
cosjs.request = function(url,data){
    let opts = arguments[2]||{};
    return cosjs.promise(cosjs.ajax,url,data,opts).then(ret=>{
        if( ret && typeof ret === 'object' && ret['err']){
            return cosjs.error(ret);
        }
        else{
            return ret;
        }
    })
}

cosjs.promise = function(name,...args) {
    let fun;
    if(typeof name === 'function'){
        fun = name;
    }
    else if(this && typeof this[name] ==='function'){
        fun = this[name];
    }
    if(!fun ){
        throw new Error(`library.promise[${name}] not function`);
    }
    return new Promise((resolve,reject)=>{
        let handler = cosjs_promise_callback(resolve,reject);
        args.push(handler);
        try {
            fun.apply(this,args);
        } catch (e) {
            handler(e);
        }
    })
}
//以kv模式返回配置
cosjs.option = function(name){
    let ret = {};
    let c = arguments[1]||'config';
    if(!cosjs[c] || !cosjs[c][name]){
        return ret;
    }
    for(let k in cosjs[c][name]){
        ret[k] = cosjs[c][name][k]['name'];
    }
    return ret;
}


cosjs.reload = function(url){
    window.location.href=url;
}


cosjs.url = function(url,args,hash){
    let arr = [url];
    args = args ||{};
    if(Object.keys(args).length >0) {
        if (url.indexOf('?') < 0) {
            arr.push('?');
        }
        else {
            arr.push('&');
        }
        arr.push(cosjs_uri_encode(args));
    }
    if(hash){
        arr.push('#'+hash);
    }
    return arr.join('');
}


//jsonp,callback
cosjs.ajax = function(url,args){
    let next = 2,opts,callback;
    if(typeof arguments[next] ==='object'){
        opts = arguments[next]; next ++;
    }
    callback = arguments[next];

    let option = Object.assign({},opts||{},{"method":"POST","dataType":"json"})
    option['method']  = option['method'].toUpperCase();
    option['error']   = cosjs_net_error.bind(null,callback);
    option['success'] = cosjs_net_success.bind(null,callback);

    let ajaxurl = cosjs.url(url,option['method'] === 'GET' ? args :null );
    if(option['method'] == 'POST'){
        option['data'] = typeof args ==="object" ? args : $(args).serialize();
    }
    $.ajax(ajaxurl,option);
}

cosjs.roll = function () {
    let min,max;
    if (arguments.length > 1) {
        min = arguments[0];max = arguments[1];
    }
    else {
        min = 1;max = arguments[0];
    }
    if (min >= max) {
        return max;
    }
    let key = max - min + 1;
    let val = min + Math.floor(Math.random() * key);
    return val;
}

//format,time;
cosjs.timeFormat = function(time,format){
    format = format || 'yyyy-MM-dd hh:mm:ss';
    var date;
    if(!time ){
        date = new Date(0);
    }
    else if(typeof time =='object'){
        date = time;
    }
    else{
        date = new Date(time);
    }
    var o = {
        "M+": date.getMonth() + 1, //月份
        "d+": date.getDate(), //日
        "h+": date.getHours(), //小时
        "m+": date.getMinutes(), //分
        "s+": date.getSeconds(), //秒
        //"q+": Math.floor((date.getMonth() + 3) / 3), //季度
        //"S": date.getMilliseconds() //毫秒
    };
    if (/(y+)/.test(format)) {
        format = format.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
    }
    for (var k in o) {
        if (new RegExp("(" + k + ")").test(format)) {
            format = format.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
        }
    }
    return format;
}

cosjs.layer = {};
/*弹出层*/
/*
	参数解释：
	title	标题
	url		请求的url
	id		需要操作的数据id
	w		弹出层宽度（缺省调默认值）
	h		弹出层高度（缺省调默认值）
*/
cosjs.layer.show = function(title,url,w,h){
    w = w || 800,h = h || 600;
    var opts = { type: 2, area: [w+'px', h +'px'], fix: false,  maxmin: true, shade:0.4,
        title: title||false,
        content: url||'about:blank'
    }
    return layer.open(opts);
}
/*关闭弹出框口*/
cosjs.layer.close = function(){
    var index = parent.layer.getFrameIndex(window.name);
    parent.layer.close(index);
}
