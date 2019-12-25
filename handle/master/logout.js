"use strict"

module.exports = function(){
    this.output = 'redirect';
    let route = this.config.get("route.master");
    let url = `/${route}/`
    return this.session.del().then(()=>{
        return url;
    }).catch(err=>{
        return url;
    })
}
