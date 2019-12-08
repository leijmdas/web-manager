$(function () {
    var userTag = new Vue(
        {
            el: '#userTagBody',
            data: {
                tagTypes: pConst.cTagType,
                //当前选择tagID
                tagId: 0,
                tagPId: 0,
                tagType: 1,
                isAdd : false,

                tagList : [],
                tagRecord : {},
                tagRecordIni: {
                    tagName: "",
                    createBy: 0
                }
            },
            methods: {
                btnAddClick: function (event) {
                    this.isAdd = true;
                    this.tagRecord = $.extend({}, this.tagRecordIni);
                    this.tagRecord.parentId = $("#isFirstTag").is(":checked")? 0 : this.tagPId;
                    this.tagRecord.tagType = this.tagType;
                    $("#editModal").modal("show")
                },
                btnEditClick: function (event, item) {
                    this.isAdd = false;
                    this.tagRecord = $.extend({},item);
                    $("#editModal").modal("show");
                },
                btnDeleteClick: function (event, item) { //弹出删除框
                    this.tagRecord = item;
                    $("#text").html("确定删除" + item.tagName + "吗？" + item.tagId);
                    $("#delModal").modal();
                },
                btnDeleteConfirmClick: function (event) {
                    var that = this;
                    $("#delModal").modal()
                    var reqOps = {
                        url: U.admin_domain + "/rest/pfUser/dictTag",
                        //url: "//localhost/rest/pfUser/dictTag",
                        cmdtype: "dictTag",
                        cmd: "deleteDictTag",
                        data: {
                            tagId: that.tagRecord.tagId
                        }
                    };
                    reqOps.success = function(data) {
                        $("#delModal").modal("hide");
                        that.loadTree(event, "treeDemo1");
                    }
                    reqOps.fail = function(retcode) {
                        minAlert(retcode)
                    }
                    $.ajaxPost(reqOps);
                },
                btnSave: function () {
                    var that = this;
                    that.tagRecord.tagId = $("#tagId").val();
                    that.tagRecord.tagName = $("#tagNameKey").val();
                    //that.tagRecord.tagType = $("#tagType").val();
                    that.tagRecord.parentId = $("#parentId").val();
                    that.tagRecord.createBy = $("#createBy").val();
                    var reqOps = {
                        url: U.admin_domain + "/rest/pfUser/dictTag",
                        //url: "//localhost/rest/pfUser/dictTag",
                        cmdtype: "dictTag",
                        cmd: that.isAdd ? "insertDictTag" : "updateDictTag",
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
                loadTagListByID : function (tagType) {
                    var self = this;
                    var req = {
                        url: U.admin_domain + "/rest/pfUser/dictTag",
                        cmdtype: "dictTag",
                        cmd: "getDictTagListByID",
                        data: {
                            tagType:  tagType,
                            tagId: self.tagId
                        }
                    };
                    //成功回调函数
                    req.success = function (data) {
                        self.tagList = data.list;
                        if(self.tagList.length>0){
                            self.tagRecord = $.extend({},self.tagList[0]);
                        }

                    };
                    //失败回调函数
                    req.fail = function (retcode) {
                        minAlert(retcode);
                    };
                    //调用
                    $.ajaxPost(req);
                },
                loadTree: function (event,treename) {
                    this.tagRecordIni.createBy=U.getLogSso("userId");
                    var self = this;
                    var req = {
                        url: U.admin_domain + "/rest/pfUser/dictTag",
                        cmdtype: "dictTag",
                        cmd: "getDictTagTree",
                        data: {
                            tagType: self.tagType
                        }
                    };
                    reload = function (nodes) {
                        self.tagId = 0;
                        self.tagList = [];
                        if (nodes.length > 0) {
                            self.tagId = nodes[0].tagId;
                            self.tagPId = nodes[0].parentId;
                            if (self.tagPId == 0) {
                                self.tagPId = self.tagId;
                            }
                        }
                        self.loadTagListByID(self.tagType);
                    };

                    //成功回调函数
                    req.success = function (data) {
                        reload(data.list);
                        var setting = {
                            data: {
                                key: {
                                    name: "tagName",
                                    checked: "isSelect"
                                },
                                simpleData: {
                                    enable: false,
                                    idkey: "tagId",
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
                        var zTreeObj = $.fn.zTree.init($("#" + treename), setting, zNodes); //菜单权限
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
                loadTree1: function () {
                     this.tagType = 1;
                     this.loadTree(event, "treeDemo1");

                },
                loadTree2: function () {
                    this.tagType = 2;
                    this.loadTree(event, "treeDemo1");

                },
                loadTree3: function () {
                    this.tagType = 3;
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
