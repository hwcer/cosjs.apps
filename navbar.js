module.exports = function(){
    let appsMulti = this.config.get("apps.multi");
    let appsName = this.config.get("apps.name");
    let submenu = [];
    if(appsMulti > 0){
        submenu.push({"key":"apps","level":100,"name":appsName+'管理',"href":"/apps/index"})
    }
    submenu.push({"key":"members","level":100,"name":"成员管理","href":"/members/index"});
    let navbar = {
        "master":{
            "name":"系统管理","level":100,"sort":9999,"master":1,
            "submenu":submenu
        }
    }
    return navbar;
}

