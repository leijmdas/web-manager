$(function () {
    var t = new Vue({
        el: "#projConfigBody",
        data: {
            url: "/rest/template",
            url_projType:  "/rest/template",
            cmdType: "projConfig",

            projConfigList: [],
            projectType: 0,
            configType: 1,//1-全局，2-项目分类
            projectTypesName:{},

            isAdd: false,
            addRecordIni: {
                name: "",
                scene: "",
                remark: "",
                projectType:this.projectType
            },
            editRecord: {},
            configItems: pConst.porjectConfigItems,
            configCodes: pConst.porjectConfigItemsCode
        },
        methods: {
            btnAddConfig: function () {
                this.isAdd = true;
                this.editRecord = $.extend({}, this.addRecordIni);
                this.editRecord.projectType = this.projectType;
                $("#editModal").modal("show");
            },
            btnEditConfig: function (event, item) {
                this.isAdd = false;
                this.editRecord = $.extend({}, item);
                $("#editModal").modal("show");
            },
            btnEditConfigSave: function () {
                var that = this;
                that.editRecord.code=that.configCodes[that.editRecord.valueType];
                that.editRecord.name=that.configItems[that.editRecord.valueType];
                var reqOps = {
                    url: that.url,
                    cmdtype: that.cmdType,
                    cmd: that.isAdd ? "addProjConfig" : "modifyProjConfig",
                    data: that.editRecord
                };
                reqOps.success = function (data) {
                    that.loadTable();
                    $("#editModal").modal("hide")
                }
                reqOps.fail = function (retcode) {
                    minAlert(retcode)
                }
                $.ajaxPost(reqOps);
            },
            delModal: function (event, item) {
                this.editRecord = $.extend({}, item);
                $("#text").html("确定删除吗? " + item.configId);
                $("#delModal").modal()
            },
            btnDeleteConfirm : function (event) { //刪除功能
                var that=this;
                var reqOps = {
                    url: this.url,
                    cmdtype: this.cmdType,
                    cmd: "delProjConfig",
                    data: {
                        configId: this.editRecord.configId
                    }
                };
                reqOps.success = function (data) {
                    $("#delModal").modal("hide");
                    that.loadTable();
                }
                reqOps.fail = function (retcode) {
                    minAlert(retcode)
                }
                $.ajaxPost(reqOps);
            },

            loadTree: function (event) {
                var self = this;
                var req = {
                    url: self.url_projType,
                    cmdtype: "projType",
                    cmd: "selectTree",
                    data: {}
                };
                reload = function (nodes) {
                    self.projectType = 0;
                    if (nodes.length > 0) {
                        self.projectType = nodes[0].projectTypeId;
                    }
                    self.loadTable();
                };
                req.success = function (data) {
                    reload(data.list);
                    self.projectTypesName = {};
                    for (var i = 0; i < data.list.length; i++) {
                        self.projectTypesName[data.list[i].projectTypeId] = data.list[i].title;
                         for (var j = 0; j < data.list[i].children.length; j++) {
                            self.projectTypesName[data.list[i].children[j].projectTypeId] = data.list[i].children[j].title;
                         }
                    }

                    var setting = {
                        data: {
                            key: {
                                name: "title",
                                checked: "isSelect"
                            },
                            simpleData: {
                                enable: false,
                                idkey: "projectTypeId",
                                pIdKey: "parentId",
                                rootPId: null
                            }
                        },
                        callback: {
                            onClick: function () {
                                var treeObj = $.fn.zTree.getZTreeObj("projTree");
                                nodes = treeObj.getSelectedNodes(true);
                                reload(nodes);
                            }
                        }
                    };
                    var zNodes = data.list
                    console.log(data.list);
                    var zTreeObj = $.fn.zTree.init($("#projTree" ), setting, zNodes); //菜单权限
                    var cNode = zTreeObj.getNodeByParam("id", 0);  ///id为树头节点的id
                    zTreeObj.expandNode(cNode, true, false);
                }
                req.fail = function (retcode) {
                    minAlert(retcode);
                }
                $.ajaxPost(req);
            },
            loadTable: function () {
                var that = this;
                var reqOps = {
                    url: this.url,
                    cmdtype: this.cmdType,
                    cmd: "selectProjConfig",
                    data: {
                        projectType: that.projectType
                    }
                };
                reqOps.success = function (data) {
                    if(that.configType==1){
                        that.projectTypesName=$.extend({},{'0':"全局通用"});
                    }
                    that.projConfigList = data.list;
                }
                reqOps.fail = function (retcode) {
                    minAlert(retcode)
                }
                $.ajaxPost(reqOps);
            },
            clickTabTitle: function (event, configType) {
                this.configType = configType;
                this.projectType = this.configType == 1 ? 0 : -1;
                this.configType == 1 ? this.loadTable() : this.loadTree();
            },

            clickTr: function (event) {  //$(event.target).stopPropagation
                $(event.target).parent().addClass("bg-blue").siblings("tr").removeClass("bg-blue");
            },

            stabActive: function (event) {
                this.configType = parseInt(U.urlParamObj['s']);
                $('#s1').attr({'class': ""});
                $('#s2').attr({'class': ""});
                var e = this.configType == 1 ? $('#s1') : $('#s2');
                e.attr({'class': "active"});
                this.clickTabTitle(event,this.configType);
            }
        },

        mounted: function (event) {
            this.stabActive(event);
        }
    });

})