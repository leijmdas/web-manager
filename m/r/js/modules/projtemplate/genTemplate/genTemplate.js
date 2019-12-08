$(function () {
    var genTemplate = new Vue({
        el: "#genTemplateBody",
        data: {
            url : "/rest/template",
            //url : "//localhost/rest/template",
            testTemplateId: -1,
            user: pConst.cUser,
            prjSubType: pConst.cPrjSubTypeStop,
            projectPhase: pConst.cPrjPhase,

            docStatus: pConst.cDocStatus,
            cPrjPhase: pConst.cPrjPhase,
            cDocStatusChng:pConst.cDocStatusChng,
            docType: pConst.DOCTYPE_TERM,
            docTypes: pConst.cDocType,
            docBtn: pConst.cDocBtn,
            isDelAct: false,
            isQry: false,
            actionList: [],
            actionRecordIni: {
                templateId: 0,
                stop:true,
                cPhase: 1,
                stopQ: 0,
            },
            actionRecord: {},
            templateList: [],
            templateList_backup: [],
            isAddTemplate: false,
            templateRecordList: [],
            templateRecord: {},
            templateRecordIni: $.extend({},pConst.TemplateRecordIni),


        },
        methods: {
            btnPulishClick: function (event, item) {
                this.templateRecord = item;

                var that = this;
                var data = {}
                data.repositoryId = 0;
                data.workJobId = 0;
                data.docType = item.docType;
                data.templateId = item.templateId;
                data.state = that.cDocStatusChng[item.state] ;
                var reqOps = {
                    url: that.url,
                    cmdtype: "repository",
                    cmd: "modifyDocTemplateState",
                    data: data
                };
                reqOps.success = function(data) {
                    that.loadTable();
                }
                reqOps.fail = function(retcode) {
                    minAlert(retcode)
                }
                $.ajaxPost(reqOps);
            },
            btnDeleteConfirm: function (event) {
                if(this.isDelAct){
                    this.delModalActConfirm(event);
                    return;
                }
                var that = this;
                $("#delModal").modal()
                var reqOps = {
                    url: "/rest/template",
                    cmdtype: "repository",
                    cmd: "removeDoctemplate",
                    data: {
                        templateId: that.templateRecord.templateId
                    }
                };
                reqOps.success = function(data) {
                    $("#delModal").modal("hide");  //genTemplate.templateList.splice(index, 1)
                    that.loadTable();
                }
                reqOps.fail = function(retcode) {
                    minAlert(retcode)
                }
                $.ajaxPost(reqOps);
            },

            btnExpTable: function (event,item) {
                var that = this;
                var reqOps = {
                    url: "/rest/tagTableService/manager",
                    cmdtype: "tagTableServiceManager",
                    cmd: "exportAllTables",
                    data: {
                        projectId: 0,
                        documentId: item.docNew
                    }
                };
                reqOps.success = function (data) {
                    $("#delModal").modal("hide");
                    //genTemplate.templateList.splice(index, 1)
                    that.loadTable();
                    alert("导表成功!");
                }
                reqOps.fail = function (retcode) {
                    minAlert(retcode)
                }
                $.ajaxPost(reqOps);
            },
            delModal: function (event, item) { //弹出删除框
                this.isDelAct = false;
                this.templateRecord = item;
                $("#text").html("确定删除" + item.title + "吗？" + item.templateId);
                $("#delModal").modal();
            },
            btnAddTemplateClick: function () {
                this.isAddTemplate = true;
                this.templateRecord = $.extend({},this.templateRecordIni);
                this.templateRecord.docType = this.docType;
                this.templateRecordList = [this.templateRecord];
                $("#addAndEditTemplate").modal("show")
            },
            btnEditTemplateClick: function (event, item) {
                this.isAddTemplate = false;
                this.templateRecord = $.extend({}, item);
                this.templateRecordList = [this.templateRecord];
                $("#addAndEditTemplate").modal("show");
            },

            btnSaveTemplate: function () { //确定新增
                var that = this;
                var reqOps = {
                    url: that.url,
                    cmdtype: "repository",
                    cmd: that.isAddTemplate ? "addDocTemplate" : "modifyDoctemplate",
                    data: that.templateRecord
                };
                reqOps.success = function(data) {
                    $("#addAndEditTemplate").modal("hide")
                    that.loadTable();
                }
                reqOps.fail = function(retcode) {
                    minAlert(retcode)
                }
                $.ajaxPost(reqOps);
            },
            btnAddActClick: function () { //显示新增模态框
                this.isAddTemplate = true;
                this.actionRecord = $.extend({},this.actionRecordIni);
                this.actionRecord.templateId = this.templateRecord.templateId;
                $("#editActionDialog").modal("show")
            },
            btnEditActClick: function (event,item) { //显示新增模态框
                this.isAddTemplate = false;
                this.actionRecord = $.extend({},item);
                $("#editActionDialog").modal("show")
            },
            btnDelActClick: function (event, item) { //弹出删除框
                this.actionRecord = item;
                this.isDelAct=true;
                $("#text").html("确定删除" + item.cPhase + "吗？" + item.actionId);
                $("#delModal").modal();
            },
            delModalActConfirm: function (event) { //显示新增模态框
                var that = this;
                var reqOps = {
                    url: that.url,
                    cmdtype: "templateDocument",
                    cmd: "delStopAction",
                    data: {
                        actionId: this.actionRecord.actionId
                    }
                };
                reqOps.success = function(data) {
                    $("#delModal").modal("hide")
                    that.loadStopAction(that.templateRecord);
                }
                reqOps.fail = function(retcode) {
                    minAlert(retcode)
                }
                $.ajaxPost(reqOps);

            },

            btnSaveAct: function () { //确定新增
                var that = this;
                var reqOps = {
                    url: that.url,
                    cmdtype: "templateDocument",
                    cmd: that.isAddTemplate ? "addStopAction" : "modifyStopAction",
                    data: that.actionRecord
                };
                reqOps.success = function(data) {
                    $("#editActionDialog").modal("hide")
                    that.loadStopAction(that.templateRecord);
                }
                reqOps.fail = function(retcode) {
                    minAlert(retcode)
                }
                $.ajaxPost(reqOps);
            },
            btnImportClick: function (event, item) {
                var params = '?templateId=' + item.templateId;
                layer.open({
                    type: 2,
                    content: U.rootPath + '/m/v/modules/projtemplate/doctemplate/import.html' + params,
                    area: ['768px', '500px']
                })
                //this.loadTable();
            },
            btnExportClick: function (event, value, row) {
                event.stopPropagation();
                var data = row;
                if (data.docXls > 0) {
                    var reqOpt = {
                        url: '/rest/template/download',
                        cmdtype: 'templateDocument',
                        cmd: 'download',
                        data: {
                            documentId: data.docXls
                        }
                    };
                    window.open($.getFileDownloadUrl(reqOpt));
                } else {
                    layer.alert('请先导入excel！', function (index) {
                        layer.close(index);
                    });
                }
            },

            btnEditClick: function (event, item) {

                var params = ['?templateId=' + item.templateId, 'workJobId=0'].join('&');
                layer.open({
                    type: 2,
                    content: U.rootPath + '/m/v/modules/projtemplate/doctemplate/edit.html' + params,
                    maxmin: true,
                    area: ['1200px', '800px']
                })
            },
            btnParseClick: function (event, item) {

                layer.confirm('确认转换模板吗？', function () {
                    layer.load(2);
                    $.ajaxPost({
                        url: U.rootPath + '/rest/template',
                        cmdtype: 'projType',
                        cmd: 'parseDocTemplate',
                        data: {
                            templateId: item.templateId
                        },
                        success: function () {
                            layer.closeAll();
                            layer.alert('转换成功!');
                        },
                    });
                });
            },
            loadTable: function () {
                var self = this;
                var reqOps = {
                    url: self.url,
                    cmdtype: "templateDocument",
                    cmd: "getDocTemplate_gen",
                    data: {
                        docType: self.docType
                    }
                };
                reqOps.success = function (data) {
                    self.templateList = data.list;
                    self.templateList_backup = data.list;
                    $("#genTemplateTable").find("tr").eq(0).addClass("bg-blue").siblings("tr").removeClass("bg-blue");

                    if (self.templateList.length > 0) {
                        self.templateRecord = self.templateList[0];
                        if (self.docType == 904) {
                            self.loadStopAction(self.templateRecord);
                        }
                    } else {
                        self.templateRecord = {};
                        self.actionList = [];
                    }

                }
                reqOps.fail = function(retcode) {
                    minAlert(retcode)
                }
                $.ajaxPost(reqOps);
            },
            clickTr: function(event) {
                //$(event.target).stopPropagation  ;
                $(event.target).parent().siblings("tr").removeClass("bg-blue");
                $(event.target).parent().addClass("bg-blue");

            },

            clickTrStop: function (event, item) {
                $(event.target).parent().siblings("tr").removeClass("bg-blue");
                $(event.target).parent().addClass("bg-blue");
                if (this.docType == 904) {
                    this.templateRecord = $.extend({}, item);
                    this.loadStopAction(item);
                }
            },
            loadStopAction: function (item) { ///页面加载之后初始化表格内容
                var self = this;
                var reqOps = {
                    url: self.url,
                    cmdtype: "templateDocument",
                    cmd: "getListStopAction",
                    data: {
                        templateId: item.templateId
                    }
                };
                reqOps.success = function (data) {
                    self.actionList = data.list;
                    $("#genActTable").find("tr").eq(0).addClass("bg-blue").siblings("tr").removeClass("bg-blue");

                }
                reqOps.fail = function(retcode) {
                    minAlert(retcode)
                }
                $.ajaxPost(reqOps);
            },
            btnQryClick: function (event, docType, state, subType, phase) {
                //alert(phase);

                this.isQry = true;
                this.templateList = [];
                for (var i = 0; i < this.templateList_backup.length; i++) {
                    var item = this.templateList_backup[i];
                    var isState = (state == -1 || item.state == state);
                    var isDocType = (docType == 0 || item.docType == docType);
                    var isSubType = (subType == 0 || item.subType == subType);
                    var isPhase = (phase == 0 || item.phase == phase);
                    //alert(item.phase );
                    if (isSubType && isDocType && isState && isPhase) {
                        this.templateList.push(item);
                    }
                }
            },
            btnCancelQryClick: function () {
                this.isQry = false;
                this.templateList = this.templateList_backup;//$.extend(true, this.templateList_backup);
            },

            showTable: function (event, docType) {
                this.docType = docType;
                if (docType == pConst.DOCTYPE_CHNG) {
                    this.prjSubType = pConst.cPrjSubTypeChng;
                }
                if (docType == pConst.DOCTYPE_TERM) {
                    this.prjSubType = pConst.cPrjSubTypeStop;
                }
                this.loadTable();
            }
        },
        mounted: function (event) {
            if (!this.isQry) {
                this.loadTable();
            }
        }
    });
})