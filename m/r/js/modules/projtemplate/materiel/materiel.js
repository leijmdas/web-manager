$(function () {
    var companyType = new Vue(
        {
            el: '#companyTypeBody',
            data: {
                //url: U.admin_domain + "/rest/pfUser/dictCompanyType",
                url: "/rest/sysmetadata",
                cmdtype: "metadata",
                metadataName: "electric_mat",
                table: "ytb_project.electric_mat",
                companyType: 0,
                companyTypePID: 0,
                isAdd: false,
                metadataRecord: {},
                fieldNames :[],
                records: [],
                record: {},
                recordIni: {
                    remark: "",
                    parentId: 0
                }
            },
            methods: {
                btnAddClick: function (event) {
                    this.isAdd = true;
                    this.record = $.extend({}, this.recordIni);
                    this.record.parentId = $("#isFirstTag").is(":checked") ? 0 : this.companyTypePID;

                    $("#editModal").modal("show")
                },
                btnEditClick: function (event, item) {
                    this.isAdd = false;
                    this.tagRecord = $.extend({}, item);
                    $("#editModal").modal("show");
                },
                btnDeleteClick: function (event, item) { //弹出删除框
                    this.record = item;
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
                    reqOps.success = function (data) {
                        $("#delModal").modal("hide");
                        that.loadTree(event, "treeDemo1");
                    }
                    reqOps.fail = function (retcode) {
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
                        data: that.record
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
                funMetadata: function (cmd, data) {
                    var self = this;
                    var req = {
                        url: self.url,
                        cmdtype: self.cmdtype,
                        cmd: cmd,
                        data: data
                    };
                    req.success = function (data) {
                        if (cmd == 'selectByTable') {
                            self.records = data.list;
                            if (self.records.length > 0) {
                                self.record = $.extend({}, self.records[0]);
                            }
                        } else if (cmd == 'getDictTableAndField') {

                            self.metadataRecord = data.list[0];
                            self.fieldNames = self.metadataRecord.field;
                        }
                    }
                    req.fail = function (retcode) {
                        minAlert(retcode);
                    };
                    $.ajaxPost(req);
                },
                loadTable: function () {
                    this.funMetadata("selectByTable", {table: this.table});
                    this.funMetadata("getDictTableAndField", {metadataName: this.metadataName});
                },
                loadTree: function (event, treename) {

                    var self = this;
                    var req = {
                        url: self.url,
                        cmdtype: self.cmdtype,
                        cmd: "getDictCompanyTypeTree",
                        data: {}
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
                        self.loadTable();
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
                }
                ,
                loadTree1: function () {
                    this.loadTree(event, "treeDemo1");
                }
                ,

                clickTr: function (event) {
                    $(event.target).parent().siblings("tr").removeClass("bg-blue");
                    $(event.target).parent().addClass("bg-blue");
                }
            },

            mounted: function (event) {
                //this.loadTree(event, "treeDemo1");
                this.loadTable();
                //alert(sessionStorage.api_KeyModel);
            }
        })
})
