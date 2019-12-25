if(!cosjs) { var cosjs = {};}
cosjs.item = {};
cosjs.item.types = {
    '1':{'name': '道具',  'key':'item'},
    "2":{'name': '英雄',  'key':'hero'},
    "5":{'name': '装备',  'key':'equip'},
    "9":{'name': '物品组','key':'igroup'},
}

cosjs.item.config = function(t,id){
    if( !cosjs.item.types[t] ){
        return null;
    }
    var k = cosjs.item.types[t]['key'];
    if(!cosjs.config[k]){
        return null;
    }
    var item = cosjs.config[k][id]||{};
    return item['name']||id;
}

cosjs.item.formatter = function(cellvalue, options, rowObject){
    var itemShow = "";
    if(cellvalue){
        var itemArr = [];
        var arr = Array.isArray(cellvalue) ?cellvalue : cellvalue.split(",");
        for(var i=0;i<arr.length;i+=3){
            var t = arr[i], id = arr[i+1],num=arr[i+2],tn;
            if(cosjs.item.types[t]){
                tn = cosjs.item.types[t]['name'];
            }
            else{
                tn = '未知';
            }
            var name = cosjs.item.config(t,id) || id;
            itemArr.push( "["+tn+"]" +name +" × " + num);
        }
        itemShow = itemArr.join(" ; ");
    }
    return "<span data='"+cellvalue+"'>"+itemShow+"</span>";
}
cosjs.item.unformat = function(cellvalue, options, cell){
    return $(cell).children("span").attr("data");
}


function selectItem(dom,type){
    this.dom = dom;
    this.index = 0;
    this.form = $('<form></form>');
    this.table = $('<table></table>');
    this.form.append(this.table);
    if(!type){
        this.types = Object.keys(cosjs.item.types);
    }
    else{
        this.types = Array.isArray(type) ? type : [type];
    }

    create.call(this);
}

cosjs.item.select = selectItem;






selectItem.prototype.enable = function(k){
    for(var k in arguments){
        var v = arguments[k];
        if( cosjs.item.types[v]  && this.types.indexOf(v) < 0 ){
            this.types.push(v);
        }
    }
    return this;
}
selectItem.prototype.disable = function(k){
    for(var k in arguments){
        var v = arguments[k];
        var i = this.types.indexOf(v);
        if(cosjs.item.types[v] && i>=0){
            this.types.splice(i);
        }
    }
    return this;
}
selectItem.prototype.empty = function(){
    this.index=0;
    $(this.table).empty();
}


selectItem.prototype.add=function(value){
    var self = this;
    if(!value){
        value = [1,0,0];
    }
    var curr = self.index ++;
    var tr = $('<tr></tr>');
    var td = $('<td></td>');
    var type = $(' <select name="t'+curr+'" ></select>');
    var key = $(' <select name="k'+curr+'" ></select>');
    var num = $(' <input name="n'+curr+'" type="text" value="" style="width: 50px; height: 30px" />');
    tr.append(td);
    td.append(type).append(key).append(num);
    $(self.table).append(tr);
    $(key).chosen({ inherit_select_classes:true,width:"220px"});
    //
    if(curr>0) {
        var href =  $(' <button style="height: 30px">删除</button>');
        href.click(function(){
            $(tr).remove();
            return false;
        });
    }
    else{
        var href = $(' <button style="height: 30px">添加</button>');
        href.click(function(){
            self.add();
            return false;
        });
    }
    td.append(href);

    for(var k of self.types){
        var v = cosjs.item.types[k];
        if( k == value[0]){
            var selected = 'selected="selected"';
        }
        else{
            var selected = '';
        }
        var op='<option value="'+ k +'" '+selected+'>'+ v['name']+'</option>';
        type.append(op);
    }
    $(type).change(function(){
        var t = $(this).val();
        getSelectData.call(self,t,key,0,true);
    });
    $(num).val(value[2]||0);

    getSelectData.call(self,value[0],key,value[1]);

}


var create = function(){
    var self = this;
    $(self.dom).attr('readonly',true);
    $(self.dom).on("click",function(){
        self.empty();
        var value = $(self.dom).val();
        if(!value){
            self.add();
        }
        else{
            var arr = value.split(',');
            var len = arr.length;
            var k = 0;
            while(k < len){
                var arrVal = arr.slice(k,k+3);
                self.add(arrVal);
                k += 3;
            }
        }

        bootbox.dialog({
            title:'物品选择',
            message:self.form,
            closeButton:false,
            buttons:{
                1: { label: '确认',  callback: setValues.bind(self)},
                2: { label: '取消',  callback: function(){}},
                3: { label: '清空',  callback: function(){ self.empty();  $(self.dom).val(''); }},
            }
        });
    })
}



function getSelectData(type,key,val){
    $(key).empty();
    var t = parseInt(type)||1;
    var ck = cosjs.item.types[t]['key'];
    var ret = cosjs.option(ck);
    if(!ret){
        return cosjs.alert("错误","game_config_"+ck+" not exist");
    }
    for(var k in ret){
        var v = ret[k];
        var html = $('<option value="'+k+'">'+v+'['+k+']</option>');
        $(key).append(html);
    }
    $(key).val(val);
    $(key).trigger('chosen:updated');
}




function setValues(){
    var val = {};
    var data = $(this.form).serializeArray();
    var ik = {t:0,k:1,n:2}
    data.forEach(function(a){
        var name = a.name;
        var t = name.substr(0,1);
        var k = name.substr(1);
        var v = parseInt(a.value);
        if(!val[k]){
            val[k] = [0,0,0];
        }
        var i = ik[t];
        val[k][i] = v;
    });
    var arr = [];
    for(var k in val){
        if(val[k][0] && val[k][1] &&val[k][2] ){
            arr = arr.concat(val[k]);
        }
    }
    $(this.dom).val(arr.join(','));
}


