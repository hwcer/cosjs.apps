"use strict";

module.exports = function(){
    this.view = 'master/main';
    let name = this.config.get('apps.name');
    let multi = this.config.get('apps.multi');
    let index = this.config.get('apps.index');
    let level = this.session.get("level");

    let result = { "name":this.session.get("name"),"level":level,"navbar":{} };
    result['title'] = this.config.get("master.title")||'cosjs master system';
    result['apps'] = {name,multi,index};

    return Promise.resolve().then(()=>{
        let navbar = this.config.get("navbar");
        let routeArr = ['',this.config.get("route.master"),this.app];
        let routeStr = routeArr.join('/');
        let m = this.app == index ? 1 : navbar.length;
        for(let i=0;i<m;i++){
            let v = navbar[i];
            let nav = typeof v === 'function' ? v.call(this) : v;
            for(let k in nav){
                if(!result['navbar'][k]){
                    result['navbar'][k] = nav[k];
                }
                else{
                    result['navbar'][k]['submenu'] = result['navbar'][k]['submenu'].concat(nav[k]['submenu']);
                }
            }
        }
        //深度COPY
        result['navbar'] = JSON.parse(JSON.stringify(result['navbar']));
        //统一包装路由前缀
        for(let k in result['navbar']){
            for(let r of result['navbar'][k]['submenu']){
                r['href'] = [routeStr,r['href']].join('');
            }
        }

    }).then(()=>{
        return result;
    })
}


//选择应用
module.exports.select = function(){
    let name = this.config.get('apps.name');
    let multi = this.config.get('apps.multi');
    let route = this.config.get("route.master");
    let index = this.config.get("apps.index");
    if(this.app && this.app !== index ){
        this.output = 'redirect';
        return ['',route,this.app,'main','' ].join('/');
    }
    this.view = 'master/select';
    let rows = {};
    let result = {name,multi,rows};
    rows[index] = {"_id":index,"name":"Default Select"}
    let appsModel = this.model.mongo("apps");
    return appsModel.get(null,["_id","name"]).then(ret=>{
        rows = Object.assign(rows,ret||{})
        let keys = Object.keys(ret);
        if(keys.length === 1){
            this.output = 'redirect';
            let route = this.config.get("route.master");
            return  `/${route}/${keys[0]}/main/`;
        }
        else{
            return result;
        }
    })
}