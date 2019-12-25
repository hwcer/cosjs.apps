
cosjs.jqgrid = {}

cosjs.jqgrid.timeMask = function(e){
    return $(e).mask('9999-99-99 99:99:99');
}

cosjs.jqgrid.timeFormat = function(t){
    if(!t){
        return '0';
    }
	return cosjs.timeFormat(t);
}



cosjs.jqgrid.create = function(id,pager,option,navGrid) {
    var grid_selector = id || "#grid-table";
    var pager_selector = pager ||"#grid-pager";
    var options = $.extend({
        url: '',
        datatype: "json",
        mtype: "POST",
        height: "auto",
        autowidth:true,
        //colModel: [],
        jsonReader:{
            root: "ret.rows",
            page: "ret.page",
            total: "ret.total",
            records: "ret.records",
            repeatitems: true,
        },
        prmNames : {
            page:"page",        // 表示请求页码的参数名称
            rows:"size",        // 表示请求行数的参数名称
            sort: "sort",       // 表示用于排序的列名的参数名称
            order: "order",     // 表示采用的排序方式的参数名称
            id:"id",             // 表示当在编辑数据模块中发送数据时，使用的id的名称
            oper:"act",         // operation参数名称
            editoper:"edit",         // 当在edit模式中提交数据时，操作的名称
            addoper:"add",            // 当在add模式中提交数据时，操作的名称
            deloper:"del",            // 当在delete模式中提交数据时，操作的名称
            totalrows:"totalrows"    // 表示需从Server得到总共多少行数据的参数名称，参见jqGrid选项中的rowTotal
        },
        loadError:function(xhr,status,error){
            var msg= errorTextFormat(xhr,status,error);
            cosjs.alert(msg)
        },
        loadComplete : function(d){
            if(d && typeof d==='object' && d['err']){
                cosjs.alert(d);
            }
        },
        viewrecords : true,
        rowNum:15,
        rowList:[15,20,50,100],
        pager : pager_selector,
        altRows: true,
        //sortname:'sid',
        //toppager: true,
        multiselect: false,
        //multikey: "ctrlKey",
        multiboxonly: true,
        editurl: "",//nothing is saved


        afterShowAddForm : null,

        afterShowEditForm : null,

        caption: false //"jqGrid with inline editing"

    },option||{});

    jQuery(grid_selector).jqGrid(options);
    $(window).triggerHandler('resize.jqGrid');//trigger window resize to make the grid get the correct size
    $(grid_selector).closest(".ui-jqgrid-bdiv").css({ "overflow-x" : "hidden" });
    $(grid_selector).closest(".ui-jqgrid-bdiv").css({ "overflow-y" : "hidden" });
    var default_navGrid = { edit: true, add: true, del: true, search: true, refresh: true, view: true, position: "left", cloneToTop: false }
    $(grid_selector).navGrid(pager_selector,
        // the buttons to appear on the toolbar of the grid
        $.extend({},default_navGrid,navGrid||{}),
        // options for the Edit Dialog
        {
            width: 800,
            //editCaption: "The Edit Dialog",
            recreateForm: true,
            viewPagerButtons:false,
            //checkOnUpdate : true,
            //checkOnSubmit : true,
            closeAfterEdit: true,
            errorTextFormat: function (data) {
                return 'Error: ' + data.responseText
            },
            afterShowForm:function(){
                $("#tr__id").hide()
                if(typeof options['afterShowEditForm'] === "function") options['afterShowEditForm']();
            }
        },
        // options for the Add Dialog
        {
            width: 800,
            closeAfterAdd: true,
            recreateForm: true,
            viewPagerButtons:false,
            errorTextFormat: function (data) {
                return 'Error: ' + data.responseText
            },
            afterShowForm:function(){
                if(typeof options['afterShowAddForm'] === "function") options['afterShowAddForm']();
            }
        },
        // options for the Delete Dailog
        {
            errorTextFormat: function (data) {
                return 'Error: ' + data.responseText
            }
        },
        {
            sopt:['eq','ne','lt','gt','le','ge'],
            multipleSearch: options["multipleSearch"]||false,
            showQuery: false
        }
    );


};


function errorTextFormat(xhr,status,error){
    if( xhr['responseJSON'] ){
        var msg = xhr['responseJSON']['err'];
        if(msg === "error"){
            msg = xhr['responseJSON']['ret'] || msg;
        }
        else if(xhr['responseJSON']['ret']){
            msg += ' :'+ xhr['responseJSON']['ret'];
        }
    }
    else{
        var msg = xhr.responseText||error;
    }
    return msg;
}
