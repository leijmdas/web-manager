var requestUrl="";
var zNodes =[
    /*{ id:1, pId:0, name:"中国", open:true},
    { id:11, pId:1, name:"叶子节点 1-1"},
    { id:12, pId:1, name:"叶子节点 1-2"},
    { id:13, pId:1, name:"叶子节点 1-3"},*/
];
var setting = {
    view: {
        addHoverDom: addHoverDom,
        removeHoverDom: removeHoverDom,
        selectedMulti: false
    },
    edit: {
        enable: true,
        editNameSelectAll: true,
        showRemoveBtn: showRemoveBtn,
        showRenameBtn: showRenameBtn
    },
    data: {
        simpleData: {
            enable: true
        }
    },
    callback: {
        beforeDrag: beforeDrag,
        beforeEditName: beforeEditName,
        beforeRemove: beforeRemove,
        beforeRename: beforeRename,
        onRemove: onRemove,
        onRename: onRename,
        onClick: zTreeOnClick
    }
};

var log, className = "dark";
function beforeDrag(treeId, treeNodes) {
    return false;
}
function beforeEditName(treeId, treeNode) {
    className = (className === "dark" ? "":"dark");
    showLog("[ "+getTime()+" beforeEditName ]&nbsp;&nbsp;&nbsp;&nbsp; " + treeNode.name);
    var zTree = $.fn.zTree.getZTreeObj("treeDemo");
    zTree.selectNode(treeNode);
    $("#newAddArea").modal(); //新增
    $('.minimum').show();
    $('.radio-contrl').show();
    $('.selectArea').hide();
    $("#saveArea").attr('winType','3'); //新增地区最低工资
    $('#areaId').val(treeNode.areaId);
//                setTimeout(function() {
//                    if (confirm("进入节点 -- " + treeNode.name + " 的编辑状态吗？")) {
//                        setTimeout(function() {
//                            zTree.editName(treeNode);
//                        }, 0);
//                    }
//                }, 0);
    return false;
}
function beforeRemove(treeId, treeNode) {
    className = (className === "dark" ? "":"dark");
    showLog("[ "+getTime()+" beforeRemove ]&nbsp;&nbsp;&nbsp;&nbsp; " + treeNode.name);
    var zTree = $.fn.zTree.getZTreeObj("treeDemo");
    zTree.selectNode(treeNode);
    return confirm("确认删除地区 : " + treeNode.name + " 吗？");
}
function onRemove(e, treeId, treeNode) {
    showLog("[ "+getTime()+" onRemove ]&nbsp;&nbsp;&nbsp;&nbsp; " + treeNode.name);
    var reqOps = {
        "cmdtype": "DistArea",
        "cmd": "deleteDistArea",
        "url": requestUrl+"/rest/charges",
        "data":{
            areaId:treeNode.areaId,
        }
    };
    reqOps.success = function(data) { //成功回调函数
        console.log(data);
    }
    reqOps.fail = function(retcode) { //失败回调函数
        alert(retcode)
    }
    $.ajaxPost(reqOps); //调用
}
function beforeRename(treeId, treeNode, newName, isCancel) {
    className = (className === "dark" ? "":"dark");
    showLog((isCancel ? "<span style='color:red'>":"") + "[ "+getTime()+" beforeRename ]&nbsp;&nbsp;&nbsp;&nbsp; " + treeNode.name + (isCancel ? "</span>":""));
    if (newName.length == 0) {
        setTimeout(function() {
            var zTree = $.fn.zTree.getZTreeObj("treeDemo");
            zTree.cancelEditName();
            alert("节点名称不能为空.");
        }, 0);
        return false;
    }
    return true;
}
function onRename(e, treeId, treeNode, isCancel) {
    showLog((isCancel ? "<span style='color:red'>":"") + "[ "+getTime()+" onRename ]&nbsp;&nbsp;&nbsp;&nbsp; " + treeNode.name + (isCancel ? "</span>":""));
}
function showRemoveBtn(treeId, treeNode) {
    return treeNode;
}
function showRenameBtn(treeId, treeNode) {
    return treeNode;
}
function showLog(str) {
    if (!log) log = $("#log");
    log.append("<li class='"+className+"'>"+str+"</li>");
    if(log.children("li").length > 8) {
        log.get(0).removeChild(log.children("li")[0]);
    }
}
function getTime() {
    var now= new Date(),
        h=now.getHours(),
        m=now.getMinutes(),
        s=now.getSeconds(),
        ms=now.getMilliseconds();
    return (h+":"+m+":"+s+ " " +ms);
}
var newCount = 1;
var parentId;
var showId;
function addHoverDom(treeId, treeNode) {

    var sObj = $("#" + treeNode.tId + "_span");
    if (treeNode.editNameFlag || $("#addBtn_"+treeNode.tId).length>0) return;
    var addStr = "<span class='button add' id='addBtn_" + treeNode.tId
        + "' title='add node' onfocus='this.blur();'></span>";

    sObj.after(addStr);
    var btn = $("#addBtn_"+treeNode.tId);
    if (btn) btn.bind("click", function(){
        $('.radio-contrl').hide();
        $('.minimum').hide();
        $('.selectArea').show();
        $('#myModalLabel').text('新增')
        console.log(treeNode.getParentNode());
        parentId=treeNode.areaId;
        showId = treeNode.areaId;
        $("#newAddArea").modal(); //新增
        $("#saveArea").attr('winType','1'); //新增地区
        var level = $(this).parent().attr('class');
        if(level == 'level0'||level == 'level0 curSelectedNode'){
            $('.address1').show();
            $('.address2').hide();
            $('.address3').hide();
            $("#distpicker").distpicker('destroy');
            $("#distpicker").distpicker({
                province: '',
                city: '',
                district: ''
            });
            $('#saveArea').attr('areatype','1');
        }else if(level == 'level1'||level == 'level1 curSelectedNode'){
            $('.address1').hide();
            $('.address2').show();
            $('.address3').hide();
            $("#distpicker").distpicker('destroy');
            $("#distpicker").distpicker({
                province: treeNode.name,
                city: '',
                district: ''
            });
            $('#saveArea').attr('areatype','2');
        }else if(level == 'level2'||level == 'level2 curSelectedNode'){
            $('.address1').hide();
            $('.address2').hide();
            $('.address3').show();
            $("#distpicker").distpicker('destroy');
            $("#distpicker").distpicker({
                province: treeNode.getParentNode().name,
                city: treeNode.name,
                district: ''
            });
            $('#saveArea').attr('areatype','3');
        }
        var zTree = $.fn.zTree.getZTreeObj("treeDemo");
//                    zTree.addNodes(treeNode, {areaId:(100 + newCount), parentId:treeNode.id, name:"new node" + (newCount++)});
        return false;
    });
};
function removeHoverDom(treeId, treeNode) {
    $("#addBtn_"+treeNode.tId).unbind().remove();
};
function selectAll() {
    var zTree = $.fn.zTree.getZTreeObj("treeDemo");
    zTree.setting.edit.editNameSelectAll =  $("#selectAll").attr("checked");
}
function loadarea(showId) {
    var reqOps = {
        "cmdtype": "DistArea",
        "cmd": "getDistArea",
        "url": "/rest/charges",
        "data":{}
    };
    reqOps.success = function(data) { //成功回调函数
        zNodes=data.list;
        console.log(zNodes);
        var result = [],i,node;
        var m = [];

        for(i=0; i<zNodes.length; i++){
            node = zNodes[i];
            m[node.areaId] = node;
            if(node.parentId>0){
                if(m[node.parentId].children){
                    m[node.parentId].children.push(node);
                }else{
                    m[node.parentId].children = [node];
                }
            }else{
                result.push(node);
            }
        }
        console.log(result);

        $.fn.zTree.init($("#treeDemo"), setting, result);
        $("#selectAll").bind("click", selectAll);
        var treeObj = $.fn.zTree.getZTreeObj("treeDemo");
        var nodes = treeObj.getNodes();
        // for (var i = 0; i < nodes.length; i++) { //设置节点展开
        //     treeObj.expandNode(nodes[i], true, false, false);
        // }
        /*定位节点*/
        var node = treeObj.getNodeByParam("areaId",showId);
        treeObj.selectNode(node,true);
        treeObj.expandNode(node, true, false);
    }
    reqOps.fail = function(retcode) { //失败回调函数
        alert(retcode)
    }
    $.ajaxPost(reqOps); //调用
}
function zTreeOnClick(event, treeId, treeNode) {
    console.log(treeNode);
    vm.loaddata(treeNode.areaId);
//               $('.ztree .curSelectedNode .button')
};
$(document).ready(function(){
    loadarea();
});



// U.isTest=true;
// U.testToken="d588ba62851b404284eeca7607201540";
    var vm= new Vue({
        el: "#tabelMain",
        data: {
            requestUrl:"",
            areaData:[],
            type:'',
        },
        created: function () {
        },
        filters: {
            formatDate: function (value) {//日期转换器
                var date = new Date(value);
                var y = date.getFullYear();
                var MM = date.getMonth() + 1;
                MM = MM < 10 ? ('0' + MM) : MM;
                var d = date.getDate();
                d = d < 10 ? ('0' + d) : d;
                var h = date.getHours();
                h = h < 10 ? ('0' + h) : h;
                var m = date.getMinutes();
                m = m < 10 ? ('0' + m) : m;
                var s = date.getSeconds();
                s = s < 10 ? ('0' + s) : s;
                return y + '-' + MM + '-' + d + ' ' + h + ':' + m + ':' + s;
            }
        },
        methods:{
            loadLayui:function (data,areaId) {
                var self  = this;
                var count = data.list.totalCount;
                layui.use(['laypage'], function(){
                    var laypage = layui.laypage
                    //完整功能
                    laypage.render({
                        elem: 'paging'
                        ,count: count
                        ,layout: ['count', 'prev', 'page', 'next', 'limit', 'refresh', 'skip']
                        ,jump: function(obj){
                            console.log(obj);
                            var reqOps = {
                                "cmdtype": "DistAreaSalary",
                                "cmd": "getDistAreaSalaryPage",
                                "url":  self.requestUrl+"/rest/charges",
                                "data":{
                                    "areaId":areaId,
                                    "currPage": obj.curr,
                                    "pageSize": obj.limit,
                                    orderBy:'asc',
                                    toOrder:'salary_id'
                                }
                            };
                            reqOps.success = function(data) { //成功回调函数
                                // console.log(data.list)
                                // self.items=data.list.list;
                                Vue.set(vm,'areaData', data.list.list)//赋值的方法
                                // console.log(self.items);

                            }
                            reqOps.fail = function(retcode) { //失败回调函数
                                alert(retcode)
                            }
                            $.ajaxPost(reqOps); //调用
                        }
                    });
                });
            },
                loaddata:function (areaId) {
                var self = this;
                var reqOps = {
                    "cmdtype": "DistAreaSalary",
                    "cmd": "getDistAreaSalaryPage",
                    "url": self.requestUrl+"/rest/charges",
                    "data":{
                        areaId:areaId,
                        pageSize:10,
                        currPage:1,
                        orderBy:'asc',
                        toOrder:'salary_id'
                    }
                };
                reqOps.success = function(data) { //成功回调函数
                Vue.set(vm,'areaData', data.list.list)//动态赋值的方法
                    self.loadLayui(data,areaId);
                }
                reqOps.fail = function(retcode) { //失败回调函数
                    alert(retcode)
                }
                $.ajaxPost(reqOps); //调用
            },

            saveArea:function () {
                var self = this;
                var winType=$("#saveArea").attr('winType');
                var status = $("input[name='optionsRadios']:checked").val();
                var depthType = $('#saveArea').attr('areatype');
                var name=$('.selectArea select:visible').val();
                if (name==''){
                    alert('新增地区名称不能为空值或与已有的相同!')
                    return;
                }
                if (winType ==1){//新增地区
                    var reqOps = {
                        "cmdtype": "DistArea",
                        "cmd": "insertDistArea",
                        "url": self.requestUrl+"/rest/charges",
                        "data":{
                            depthType:depthType,
                            name:name,
                            code:'',
                            parentId:parentId
                        }
                    };
                    reqOps.success = function(data) { //成功回调函数
                        console.log(data);
                        $("#newAddArea").modal('hide');
                        layer.msg('新增成功!');
                        loadarea(showId);
                    }
                    reqOps.fail = function(retcode) { //失败回调函数
                        alert('地区名称不能为空或相同!')
                    }
                    $.ajaxPost(reqOps); //调用
                }else if (winType ==2){//修改地区信息
                    var reqOps = {
                        "cmdtype": "DistAreaSalary",
                        "cmd": "updateDistAreaSalary",
                        "url": self.requestUrl+"/rest/charges",
                        "data":{
                            salaryId:$("#areaId").attr('salaryId'),
                            status:status,
                            salary:$('#salary').val()

                }
                    };
                    reqOps.success = function(data) { //成功回调函数
                        console.log(data);
                        $("#newAddArea").modal('hide');
                        layer.msg('修改成功!');
                        self.loaddata()

                    }
                    reqOps.fail = function(retcode) { //失败回调函数
                        alert(retcode)
                    }
                    $.ajaxPost(reqOps); //调用
                }else if (winType ==3){//新增地区最低工资
                    var reqOps = {
                        "cmdtype": "DistAreaSalary",
                        "cmd": "insertDistAreaSalary",
                        "url": self.requestUrl+"/rest/charges",
                        "data":{
                            areaId:$('#areaId').val(),
                            status:status,
                            salary:$('#salary').val()

                        }
                    };
                    reqOps.success = function(data) { //成功回调函数
                        console.log(data);
                        $("#newAddArea").modal('hide');
                        layer.msg('新增成功!');
                        self.loaddata()
                    }
                    reqOps.fail = function(retcode) { //失败回调函数
                        alert(retcode)
                    }
                    $.ajaxPost(reqOps); //调用
                }

            },
            changeAreaData:function(item){
                var self = this;
                $("#newAddArea").modal();
                $('.minimum').show();
                $('.radio-contrl').show();
                $('.selectArea').hide();
                console.log(item.dictArea)
                $('#salary').val(item.salary);
                self.type=item.status;
                $("#saveArea").attr('winType','2'); //修改
                $('#areaId').val(item.areaId);
                $("#areaId").attr('salaryId',item.salaryId);

                $('#myModalLabel').text('修改')
            },
            delAreaData:function(item) {
                var self = this;
                $('#areaId').val(item.areaId);
                $("#areaId").attr('salaryId',item.salaryId);
                layer.confirm('确认删除？', {
                    btn: ['确认', '取消'] //按钮
                }, function() {
                    var reqOps = {
                        "cmdtype": "DistAreaSalary",
                        "cmd": "deleteDistAreaSalary",
                        "url": self.requestUrl+"/rest/charges",
                        "data":{
                            salaryId:$("#areaId").attr('salaryId'),
                        }
                    };
                    reqOps.success = function(data) {//成功回调函数
                        self.loaddata()
                        layer.closeAll();
                        layer.msg('删除成功!');
                    }
                    reqOps.fail = function(retcode) { //失败回调函数
                        alert(retcode)
                    }
                    $.ajaxPost(reqOps); //调用
                }, function() {
                    layer.msg('取消成功', {
                        time: 20000, //20s后自动关闭
                        btn: ['ok']
                    });
                });
            },
            searchArea:function () {
              var name=$('#searchArea').val();
                var self = this;
                var reqOps = {
                    "cmdtype": "DistAreaSalary",
                    "cmd": "getDistAreaSalaryByName",
                    "url": self.requestUrl+"/rest/charges",
                    "data":{
                        pageSize:10,
                        currPage:1,
                        orderBy:'asc',
                        toOrder:'name',
                        name:name
                    }
                };
                reqOps.success = function(data) { //成功回调函数
                    console.log(data);
                    Vue.set(vm,'areaData', data.list.list)//动态赋值的方法
                    console.log(self.areaData)
                }
                reqOps.fail = function(retcode) { //失败回调函数
                    alert(retcode)
                }
                $.ajaxPost(reqOps); //调用
            },
                judgeStatus:function (v) {
                switch (v) {
                    case 1:
                        return '草稿';
                    case 2:
                        return '启用';
                    case 3:
                        return '禁用';
                }
            },
        },
        mounted:function(){
            this.loaddata();
        }
    })


