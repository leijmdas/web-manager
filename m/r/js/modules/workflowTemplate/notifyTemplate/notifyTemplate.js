var dataTableHot;
var templateId = 0;
var templateIndex = "";
var dataN = [];
var notifyChannel = 1; //站内通知

var templateData = {
    dataTableHot: [],
    templateId: 0,
    templateIndex: 0,
    dataN: [],//
    notifyChannel: 1, //站内通知
    channelTypes: pConst.cChannelTypes,
    isAdd : false
}
$(function () {
    var t = new Vue({
        el: "#divMax",
        data: {
            url: "/rest/taskLog_task",
            //url: "//localhost/rest/taskLog_task",
            cmdtype_tasklog : "tasklog",
            notifyChannel: 1, //站内通知
            tableList: {},//新增修改
            tableInfo: {},//查看信息
            templateType: 0, //控制通知模板类型
            notifyType: 0, //通知类型
            notifyTypeList: pConst.cNotifyTypeList ,    //通知类型集合
            templateTypelList:pConst.cTemplateTypelList,
            channelTypes: pConst.cChannelTypes
        },
        methods: {
            qryBtn: function (value, row, index) {
                return [
                    '<button type="button" class="viewNotifyTemplate btn btn-primary  btn-sm">查看</button>'
                ].join('');
            },
            ///加载表格信息
            refLoadTable: function (event) {
                //自定义参数
                var reqOp = {
                    url: this.url,
                    cmdtype : this.cmdtype_tasklog,
                    "cmd": "getTemplateNotifyList",
                    "data": {
                        "notifyChannel": notifyChannel
                    }
                };
                reqOp.success = function (data) {
                    for (i = 0, len = data.list.length; i < len; i++) {
                        data.list[i].createTime = U.dateFormatString(data.list[i].createTime);
                    }
                    if(data.list.length>0) {
                        templateId = data.list[0].templateId;
                    }
                    $("#reportTable").bootstrapTable("load", data.list);
                } //失败回调函数
                reqOp.fail = function (retcode, retmsg) {
                    minAlert(retmsg);
                }
                //调用
                $.ajaxPost(reqOp);
            },
            loadTable: function (event) {
                var that = this;
                //自定义参数
                var reqOps = {
                    url: this.url,
                    cmdtype: this.cmdtype_tasklog,
                    cmd: "getTemplateNotifyList",
                    data: {
                        notifyChannel: notifyChannel
                    }
                };
                //成功回调函数
                reqOps.success = function (data) {
                    for (i = 0, len = data.list.length; i < len; i++) {
                        data.list[i].createTime = U.dateFormatString(data.list[i].createTime);
                    }
                    dataN = [];
                    dataN = data.list;

                    if(data.list.length>0) {
                        templateId = data.list[0].templateId;
                    }
                    $('#reportTable').bootstrapTable({
                        cache: false,
                        height: 750,
                        striped: false, //隔行变色
                        pagination: true,
                        pageSize: 20,
                        pageNumber: 1,
                        pageList: [10, 20, 50, 100, 200, 500],
                        search: true,
                        showColumns: true,
                        showRefresh: true,
                        showExport: true,
                        exportTypes: ['csv', 'txt', 'xml'],
                        search: true,
                        clickToSelect: true,
                        toolbar: '#toolbar',
                        showLoading: true,
                        onLoadSuccess: function (data) {
                            for (i = 0, len = data.list.length; i < len; i++) {
                                data.list[i].createTime = U.dateFormatString(data.list[i].createTime);
                            }
                            dataN = data.list;
                        },
                        columns: [{
                            field: "templateId",
                            title: "策略ID",
                            align: "center",
                            valign: "middle",
                            sortable: "true",
                            //color: "#cccccc",
                            visible: true //隐藏
                        },
                            {
                                field: "templateName",
                                title: "模板名称",
                                align: "center",
                                valign: "middle",
                                sortable: "true"
                            },
                            {
                                field: "notifyChannel",
                                title: "通知渠道",
                                align: "center",
                                valign: "middle",
                                sortable: "true",
                                formatter: function (value, row, index) { //对当前字段进行判断，数字转换成中文,0通用 1站内通知  2短消息SMS  3微信公众号   4邮箱
                                    return that.channelTypes[value];
                                }
                            },
                            {
                                field: "notifyType",
                                title: "通知类型",
                                align: "center",
                                valign: "middle",
                                sortable: "true",
                                formatter: function (value, row, index) { //0通用  1任务通知  2交易通知   3 系统通知
                                    return that.notifyTypeList[value];
                                }
                            },
                            {
                                field: "templateType",
                                title: "通知模板类型",
                                align: "center",
                                valign: "middle",
                                sortable: "true",
                                formatter: function (value, row, index) { //0 通用 1提醒   2催促   3警告
                                    return that.templateTypelList[value];
                                }
                            },
                            {
                                field: "template",
                                title: "模板内容",
                                align: "center",
                                valign: "middle",
                                sortable: "true"
                            },
                            {
                                field: "paramCount",
                                title: "参数个数",
                                align: "center",
                                valign: "middle",
                                sortable: "true"
                            },{
                                field: "templateUrl",
                                title: "页面url",
                                align: "center",
                                valign: "middle",
                                sortable: "true"
                            },
                            {
                                field: "createTime",
                                title: "创建时间",
                                align: "center",
                                valign: "middle",
                                sortable: "true"
                            },
                            {
                                title: "操作",
                                align: "center",
                                valign: "middle",
                                sortable: "true",
                                events: "operateEvents",
                                formatter: that.qryBtn
                            }
                        ],
                        data: dataN,
                        onPageChange: function (size, number) {

                        },
                        //点击表格行的事件
                        onClickRow: function (row, $element) {
                            $($element).addClass('warning').siblings("tr").removeClass("warning"); //添加class
                            templateId = row.templateId;

                        },
                        ///	点击刷新按钮后触发。
                        onRefresh: function (event) {
                            that.refLoadTable();
                        },
                        ///表格加载完成后
                        onPostBody: function (event) {
                            $("#reportTable thead tr th").addClass("active"); //表头颜色
                            $("#reportTable tbody tr:first-child").addClass("warning");
                        },
                        formatNoMatches: function () {
                            return '无符合条件的记录';
                        }
                    });
                    $(window).resize(function () {
                        dataTableHot = $('#reportTable').bootstrapTable('resetView');
                    });
                }
                //失败回调函数
                reqOps.fail = function (retcode, retmsg) {
                    minAlert(retmsg);
                }
                //调用
                $.ajaxPost(reqOps);
            },
            //显示新增模态框
            add: function (event) {
                this.isAdd = true ;
                $("#myModalList").text("新增通知模板");
                t.tableList = [{
                    notifyChannel: 0,
                    template: '',
                    "templateType": 0,
                    "createBy": 1,
                    "notifyType": 0,
                    templateName: '',
                    templateID: 0
                }];
                t.templateType = 0; //控制通知模板类型
                t.notifyType = 0; //通知类型
                $("#templateName").val("");//清空模态框名称
                $("#notifyType").find("option:eq(0)").attr("selected", "selected");//清空通知类型
                $("#templateType").find("option:eq(0)").attr("selected", "selected");//清空通知模板类型
                $("#template").val("");//清空模板内容
                $("#aliSmsTemplate").val("");//清空阿里短信模板KEY值
                $("#myModalAdd").modal();

            },
            //显示修改模态框
            edit: function (event) {
                this.isAdd = false;
                $("#myModalList").text("修改通知模板");
                //自定义参数
                var req = {
                    url: this.url,
                    cmdtype: this.cmdtype_tasklog,
                    cmd: "getTemplateNotify",
                    "data": {
                        "templateId": templateId
                    }
                };
                //成功回调函数
                req.success = function (data) {
                    $("#myModalAdd").modal();
                    t.tableList = data.list;
                    t.notifyType = data.list[0].notifyType;
                    t.templateType = data.list[0].templateType;
                }
                //失败回调函数
                req.fail = function (retcode, retmsg) {
                    minAlert(retmsg);
                    $("#myModalAdd").modal("hide"); //隐藏删除框
                }
                //调用
                $.ajaxPost(req);

            },

            ///显示删除框
            del: function (event) {
                $("#text").html("确定删除" + templateId+ "吗？" );
                $("#delModal").modal();
            },
            ///确定删除
            btnDeletePolicy: function (event) {
                var that = this;
                //自定义参数
                var reqOps = {
                    url: this.url,
                    cmdtype: this.cmdtype_tasklog,
                    cmd: "delTemplateNotify",
                    data: {
                        "templateId": templateId
                    }
                };
                //成功回调函数
                reqOps.success = function (data) {

                    $("#delModal").modal("hide"); //隐藏新增模态框
                    that.refLoadTable();
                }
                //失败回调函数
                reqOps.fail = function (retcode, retmsg) {
                    minAlert(retmsg);
                }
                //调用
                $.ajaxPost(reqOps);
            },
            ///新增、修改提交内容
            btnPassThrough: function (event) {
                var that = this;
                var data = {
                    "templateID": templateId,
                    "templateName": $("#templateName").val(),
                    "template": $("#template").val(),
                    "aliSmsTemplate": $("#aliSmsTemplate").val(),
                    "notifyChannel": notifyChannel,
                    "templateType": $("#templateType").find("option:checked").val(),
                    "notifyType": $("#notifyType").find("option:checked").val(),
                    "paramCount": $("#paramCount").val(),
                    "templateUrl": $("#templateUrl").val()
                };

                //自定义参数
                var reqOps = {
                    url: this.url,
                    cmdtype: this.cmdtype_tasklog,
                    cmd: that.isAdd ? "addTemplateNotify" : "modifyTemplateNotify" ,
                    data: data
                };
                //成功回调函数
                reqOps.success = function (data) {
                    $("#myModalAdd").modal("hide"); //隐藏新增模态框
                    that.refLoadTable();
                }
                //失败回调函数
                reqOps.fail = function (retcode, retmsg) {
                    minAlert(retmsg);
                }
                //调用
                $.ajaxPost(reqOps);
            },
            //点击查看模态框内的修改弹出修改框
            btnedit: function (event) {
                var that = this;
                $("#lookModal").modal("hide")
                that.edit()
            },
        },
        mounted: function (event) {
            this.loadTable()
        }
    });

    window.operateEvents = {
        //查看
        'click .viewNotifyTemplate': function (e, value, row, index) {
            $("#lookModal").modal();
            //自定义参数
            var reqOp = {
                url: t.url,
                cmdtype: t.cmdtype_tasklog,
                "cmd": "getTemplateNotify",
                "data": {
                    "templateId": row.templateId
                }
            };
            reqOp.success = function (data) {
                t.tableInfo = data.list;
            }
            reqOp.fail = function (retcode, retmsg) {
                minAlert(retmsg);
            }
            $.ajaxPost(reqOp);
        }
    };
})

