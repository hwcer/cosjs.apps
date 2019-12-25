layui.define(['layer', 'cosjs'], function (exports) {
	var $ = layui.jquery,cosjs = layui.cosjs;
	function login(query){
		let index = layer.load(2);
		let  url = GURL('login/verify');
		cosjs.post(url,query).then(ret=>{
			let href = GURL('main/select');
			window.location.href = href;
		}).catch(err=>{
			cosjs.alert(err);
			layer.close(index);
		})
		return false;
	}

	exports('login', login);
})