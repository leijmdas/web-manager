$(function () {
    var t = new Vue({
        el: "#body",
        data: {
            getLeftLists: {},
            editmyModalDic: {} //修改加载内容
        },
        methods: {
            btnDeletePolicy: function (event) { //刪除功能
                var id = $("#text").attr("name"); //元数字典ID
                var reqOps = {
                    "cmdtype": "metadata",
                    "cmd": "deleteDictDataTypeById",
                    "url": "/rest/sysmetadata",
                    "data": {
                        'dataInnerId': parseInt(id)
                    }
                };
                //成功回调函数
                reqOps.success = function (data) {
                    var index = $("#delModal").attr("A"); //获取该行的下标
                    $("#delModal").modal("hide");
                    t.getLeftLists.splice(index, 1)
                }
                //失败回调函数
                reqOps.fail = function (retcode) {
                    minAlert(retcode)
                }
                //调用
                $.ajaxPost(reqOps);
            },
            delModal: function (event) { //弹出删除框
                var AText = $(event.target).attr("a"); //获取行的下标
                var name = $(event.target).name; //获取按钮的name
                $("#text").empty();
                $("#text").attr("name", $(event.target).parent().siblings("td").eq(7).text()); //用户id
                $("#text").html("确定删除吗");
                $("#delModal").attr("name", name);
                $("#delModal").attr("A", AText)
                $("#delModal").modal()
            },
            btnEditDicSave: function () { //数据字典 -修改
                var that = this;
                var d = {};
                var t = $('#dicForm').serializeArray();
                $.each(t, function () { //获取表单内容
                    d[this.name] = this.value;
                });
                var reqOps = {
                    "cmdtype": "metadata",
                    "cmd": "updateDictDataTypeById",
                    "url": "/rest/sysmetadata",
                    "data": d
                };
                //成功回调函数
                reqOps.success = function (data) {
                    that.loadTable();
                    $("#EditmyModalDic").modal("hide") //隐藏修改模态框
                }
                //失败回调函数
                reqOps.fail = function (retcode) {
                    minAlert(retcode)
                }
                //调用
                $.ajaxPost(reqOps);
            },
            editDic: function (event) { //显示修改模态框
                var id = $(event.target).parent().siblings("td").eq(7).text(); //字典ID
                $("#EditmyModalDic").modal("show");
                var reqOps = {
                    "cmdtype": "configCenter",
                    "cmd": "getDictErrorCode",
                    "url": "/rest/configCenter",
                    "data": {
                        'dataInnerId': parseInt(id)
                    }
                };
                //成功回调函数
                reqOps.success = function (data) {
                    console.log(data)
                    $("#dataInnerId").val(id);
                    $("#typeId").val(data.list[0].typeId);
                    $("#typeName").val(data.list[0].typeName);
                    $("#dataId").val(data.list[0].dataId);
                    $("#dataName").val(data.list[0].dataName);
                    $("#remark").val(data.list[0].remark);
                    $("#createBy").val(data.list[0].createBy);
                    $("#createTime").val(U.timeFormatString(data.list[0].createTime));

                }
                //失败回调函数
                reqOps.fail = function (retcode) {
                    minAlert(retcode)
                }
                //调用
                $.ajaxPost(reqOps);
            },
            loadTable: function () { ///页面加载之后初始化表格内容
                var reqOps = { //自定义参数
                    "cmdtype": "configCenter",
                    "cmd": "getDictErrorCode",
                    "url": "/rest/configCenter"
                };
                reqOps.success = function (data) { //成功回调函数
                    // for (i = 0, len = data.list.length; i < len; i++) {
                    //     data.list[i].createTime = U.timeFormatString(data.list[i].createTime);
                    // }
                    Dictionary = data.list;
                    t.getLeftLists = data.list;
                }
                reqOps.fail = function (retcode) { //失败回调函数
                    minAlert(retcode)
                }
                $.ajaxPost(reqOps); //调用
            },
            addDic: function () { //显示新增模态框
                $("#AddmyModalDic").modal("show")
            },
            btnAddDicSave: function () { //确定新增
                var that = this;
                var d = {
                    "TypeId": parseInt($("#AddTypeId").val()),
                    "TypeName": $("#AddTypeName").val(),
                    "DataName": $("#AddDataName").val(),
                    "DataId": parseInt($("#AddDateId").val()),
                    "CreateBy": parseInt($("#AddCreateBy").val()),
                    "remark": $("#AddRemark").val()
                };
                var reqOps = {
                    "cmdtype": "metadata",
                    "cmd": "addDictDataType",
                    "url": "/rest/sysmetadata",
                    "data": d
                };
                //成功回调函数
                reqOps.success = function (data) {
                    that.loadTable();
                    $("#AddmyModalDic").modal("hide")
                }
                //失败回调函数
                reqOps.fail = function (retcode) {
                    minAlert(retcode)
                }
                //调用
                $.ajaxPost(reqOps);
            },
            clickTr: function(event) {
                $(event.target).stopPropagation
                var that = this;
                $(event.target).parent().addClass("bg-blue").siblings("tr").removeClass("bg-blue"); //当前行高亮显示，
                //RoleId = $(event.target).parent().attr("name"); //获取id
                //that.loadRole();
            }
        },
        mounted: function (event) { ///页面加载之后初始化表格内容
            this.$options.methods.loadTable();
        }
    });

})