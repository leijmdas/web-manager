$(function () {
    var t = new Vue({
        el: "#bodydiv1",

        data: {
            //url_tagtable :   "//localhost/rest/tagTableService/manager",
            url_tagtable :   "/rest/tagTableService/manager",
            cmdtype: "thirdParty",
            //metadata_url: "//localhost/rest/sysmetadata",
            metadata_url: "/rest/sysmetadata",
            metadata_cmdtype: "metadata",
            cmd_SelectByTableByLimitOrder : "selectByTableByLimitOrder",
            showCreditGrademsg:false,

            statType: 1,
            statResult: [],
            statList: {},
            table: "ytb_tasklog.tasklog_user",
            metadataName: "tasklog_user",
            metadataSortFields: "oprt_time,oprt_name",
            orderBy: "desc,asc",
            selectRecords: [],
            metadataRecord: {},
            fieldNames: [],

            restList: {}, //列表接口表格初始化
            editRestList: {} //编辑菜单列表 加载信息
        },
        methods: {
            //测试标签函数
            testRefTagTableParam: function (event, item) {
                var self = this;
                var req = {
                    url: this.url_tagtable,
                    cmdtype: "tagTableServiceManager",
                    cmd: "testRefTagTableParam",
                    data: {
                        projectId: 0,
                        documentId: 973,
                        functionId: item.function_id
                    }
                };
                req.success = function (data) {
                    console.log(JSON.stringify(data)) ;
                } ;
                req.fail = function (retcode) {
                    minAlert(retcode);
                };
                $.ajaxPost(req);
            },

            funMetadata: function (cmd, data) {
                var self = this;
                var req = {
                    url: self.metadata_url,
                    cmdtype: self.metadata_cmdtype,
                    cmd: cmd,
                    async : false,
                    data: data
                };
                req.success = function (data) {
                    if (cmd == self.cmd_SelectByTableByLimitOrder) {
                        self.selectRecords = data.list;

                    } else if (cmd == 'getDictTableAndField') {
                        self.metadataRecord = data.list[0];
                        self.fieldNames = self.metadataRecord.field;
                        self.metadataSortFields = self.metadataRecord.metadataSortFields;
                    }
                }
                req.fail = function (retcode) {
                    if (cmd == self.cmd_SelectByTableByLimitOrder) {
                        self.selectRecords = [];

                    } else if (cmd == 'getDictTableAndField') {
                        self.metadataRecord = {};
                        self.fieldNames = [];
                        self.metadataSortFields = "";
                    }
                    minAlert(retcode);
                };
                $.ajaxPost(req);
            },
            loadStatTable: function () {
                self.selectRecords = [];
                self.metadataRecord = {};
                self.fieldNames = [];
                if (this.table) {
                    this.funMetadata("getDictTableAndField", {metadataName: this.metadataName});
                    this.funMetadata(this.cmd_SelectByTableByLimitOrder,
                        {
                            table: this.table,
                            limitFirstIndex: 0,
                            limitpageSize: 200,
                            orderTo: this.metadataSortFields,
                            orderBy: this.orderBy//"desc,asc"
                        });
                }
            },


            clickStatTr: function (event, item) {
                this.table = item.tableView;
                this.metadataName = item.metadataName;
                this.loadStatTable();
                this.clickTr(event,item);
            },

            clickTr: function (event, item) {
                if (event != null && event.target != null) {
                    $(event.target).stopPropagation
                    $(event.target).parent().addClass("bg-blue").siblings("tr").removeClass("bg-blue");
                }
            },
            doStatClick: function (event, item) {
                var self = this;
                var p = JSON.parse(item.params);
                var req = {
                    url: item.script ,
                    cmdtype: p.cmdtype,
                    cmd: p.cmd,
                    data: {}
                };
                req.success = function (data) {
                    self.statResult = data.list;
                    self.clickStatTr(event,item);
                }
                req.fail = function (retcode) {
                    alert(retcode);
                }
                $.ajaxPost(req);
            },

            ///初始化菜单树形图
            loadStatTree: function (event) {

                //自定义参数
                var req = {
                    url: this.url ,
                    cmdtype: this.cmdtype,
                    cmd: "pageGetStatTree",
                    data:{
                        statType:this.statType
                    }
                };
                //成功回调函数
                req.success = function (data) {

                    var setting = {
                        data: {
                            key: {
                                name: "statName",
                                checked: "isSelect"
                            },
                            simpleData: {
                                enable: false,
                                idkey: "statId",
                                pIdKey: "pId",
                                rootPId: null
                            }
                        },
                        callback: {
                            onClick: function () {
                                var treeObj = $.fn.zTree.getZTreeObj("treeDemo1"),
                                    nodes = treeObj.getSelectedNodes(true),
                                    v = "";
                                for (var i = 0; i < nodes.length; i++) {
                                    v += nodes[i].statId;
                                }
                                menuList = v;
                            }
                        }
                    };
                    var zNodes = data.list
                    var zTreeObj = $.fn.zTree.init($("#treeDemo1"), setting, zNodes); //菜单权限
                    var cNode = zTreeObj.getNodeByParam("id", 0);  ///id为树头节点的id
                    zTreeObj.expandNode(cNode, true, false);
                }
                //失败回调函数
                req.fail = function (retcode) {
                    minAlert(retcode);
                }
                //调用
                $.ajaxPost(req);
            },

            ///初始化接口树形图
            loadRestTree: function (event) {
                //自定义参数
                var req = {
                    "cmdtype": "menu",
                    "cmd": "treeRestList",
                    "url": "/rest/sysuser"
                };
                //成功回调函数
                req.success = function (data) {
                    var setting = {
                        data: {
                            key: {
                                name: "restName",
                                checked: "isSelect"
                            },
                            simpleData: {
                                enable: false,
                                idkey: "restId",
                                pIdKey: "parentId",
                                rootPId: null
                            }
                        },
                        callback: {
                            onClick: function () {
                                var treeObj = $.fn.zTree.getZTreeObj("treeDemoRest"),
                                    nodes = treeObj.getSelectedNodes(true),
                                    v = "";
                                for (var i = 0; i < nodes.length; i++) {
                                    v += nodes[i].restId;
                                }
                                restList = v;
                            }
                        }
                    };
                    var zNodes = data.list
                    var zTreeObj = $.fn.zTree.init($("#treeDemoRest"), setting, zNodes); //接口权限
                    var cNode = zTreeObj.getNodeByParam("id", 0);  ///id为树头节点的id
                    zTreeObj.expandNode(cNode, true, false);

                }
                req.fail = function (retcode) {
                    minAlert(retcode);
                }
                $.ajaxPost(req);
            },
            modifyStatus: function (event,account_third_key) {
                var self=this;
                var req = {
                    url: this.url,
                    cmdtype: this.cmdtype,
                    cmd: "modifyStatus",
                    data: {
                        account_third_key: account_third_key
                    }
                };
                req.success = function (data) {
                    self.loadStatTable();
                }
                req.fail = function (retcode) {
                    minAlert(retcode);
                }
                $.ajaxPost(req);
            },
        },

        mounted: function (event) {
            a = U.urlParamObj['table'];
            b = U.urlParamObj['metadataName'];
            this.showCreditGrademsg=U.urlParamObj['showCreditGrademsg'];
            if(a){
                this.table=a;
                this.metadataName=a;
                this.metadataSortFields= "";
                this.orderBy= "";
            }
            if(b){
                this.metadataName=b;
            }

            this.loadStatTable();
        }

    })


})


function minAlert(info) {
    $.minAlert({
        ico: "error",
        delay: 2000,
        content: info
    });
}