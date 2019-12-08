$(function () {
    var companyType = new Vue(
        {
            el: '#companyTypeBody',
            data: {
                url: U.admin_domain + "/rest/pfUser/dictCompanyType",
                //url: "//localhost/rest/pfUser/dictCompanyType",
                cmdtype: "dictCompanyType",
                companyType: 0,
                companyTypePID: 0,
                isAdd : false,
                tagList : [],
                tagRecord : {},
                tagRecordIni: {

                    remark : "",
                    parentId : 0
                }
            },
            methods: {
                btnAddClick: function (event) {
                    this.isAdd = true;
                    this.tagRecord = $.extend({}, this.tagRecordIni);
                    this.tagRecord.parentId = $("#isFirstTag").is(":checked")? 0 : this.companyTypePID;

                    $("#editModal").modal("show")
                },
                btnEditClick: function (event, item) {
                    this.isAdd = false;
                    this.tagRecord = $.extend({},item);
                    $("#editModal").modal("show");
                },
                btnDeleteClick: function (event, item) { //弹出删除框
                    this.tagRecord = item;
                    $("#text").html("确定删除" + item.remark + "吗？" + item.companyType);
                    $("#delModal").modal();
                },
                btnDeleteConfirmClick: function (event) {
                    var that = this;
                    $("#delModal").modal()
                    var reqOps = {
                        url: that.url,
                        cmdtype: that.cmdtype,
                        cmd: "deleteDictCompanyType",
                        data: {
                            companyType: that.tagRecord.companyType
                        }
                    };
                    //成功回调函数
                    reqOps.success = function(data) {
                        $("#delModal").modal("hide");
                        that.loadTree(event, "treeDemo1");
                    }
                    reqOps.fail = function(retcode) {
                        minAlert(retcode)
                    }
                    //调用
                    $.ajaxPost(reqOps);
                },
                btnSave: function () {
                    var that = this;
                    var reqOps = {
                        url: that.url,
                        cmdtype: that.cmdtype,
                        cmd: that.isAdd ? "insertDictCompanyType" : "updateDictCompanyType",
                        data: that.tagRecord
                    };
                    reqOps.success = function (data) {
                        $("#editModal").modal("hide")
                        that.loadTree(event, "treeDemo1");
                    }
                    reqOps.fail = function (retcode) {
                        minAlert(retcode)
                    }
                    $.ajaxPost(reqOps);
                },
                loadTagListByID: function () {
                    var self = this;
                    var req = {
                        url: self.url,
                        cmdtype: self.cmdtype,
                        cmd: "getDictCompanyTypeListByID",
                        data: {
                            companyType: self.companyType
                        }
                    };
                    req.success = function (data) {
                        self.tagList = data.list;
                        if(self.tagList.length>0){
                            self.tagRecord = $.extend({},self.tagList[0]);
                        }

                    };
                    req.fail = function (retcode) {
                        minAlert(retcode);
                    };
                    $.ajaxPost(req);
                },
                loadTree: function (event,treename) {

                    var self = this;
                    var req = {
                        url: self.url,
                        cmdtype: self.cmdtype,
                        cmd: "getDictCompanyTypeTree",
                        data: {
                            //companyType: self.companyType
                        }
                    };
                    reload = function (nodes) {
                        self.companyType = 0;
                        if (nodes.length > 0) {
                            self.companyType = nodes[0].companyType;
                            self.companyTypePID = nodes[0].parentId;
                            if (self.companyTypePID == 0) {
                                self.companyTypePID = self.companyType;
                            }
                        }
                        self.loadTagListByID();
                    };

                    req.success = function (data) {
                        reload(data.list);
                        var setting = {
                            data: {
                                key: {
                                    name: "remark",
                                    checked: "isSelect"
                                },
                                simpleData: {
                                    enable: false,
                                    idkey: "companyType",
                                    pIdKey: "parentId",
                                    rootPId: null
                                }
                            },
                            callback: {
                                onClick: function () {
                                    var treeObj = $.fn.zTree.getZTreeObj(treename);
                                    nodes = treeObj.getSelectedNodes(true);
                                    reload(nodes);
                                }
                            }
                        };
                        var zNodes = data.list
                        console.log(data.list);
                        var zTreeObj = $.fn.zTree.init($("#" + treename), setting, zNodes);
                        var cNode = zTreeObj.getNodeByParam("id", 0);  ///id为树头节点的id
                        zTreeObj.expandNode(cNode, true, false);
                    }
                    req.fail = function (retcode) {
                        minAlert(retcode);
                    }
                    $.ajaxPost(req);
                },
                loadTree1: function () {
                    this.loadTree(event, "treeDemo1");
                },

                clickTr: function (event) {
                    $(event.target).parent().siblings("tr").removeClass("bg-blue");
                    $(event.target).parent().addClass("bg-blue");
                }
            },

            mounted: function (event) {
                this.loadTree(event, "treeDemo1");
            }
        })
})
