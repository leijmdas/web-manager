
$(function () {
    var t = new Vue({
        el: "#metadataBody",
        data: {
            url: "/rest/sysmetadata",
            //url: "//localhost/rest/sysmetadata",
            cmdtype: "metadata",
            table: "dict_area",
            metadataName: "", //元数据名称
            metadataSortFields: "",
            metadataType: 1, //元数据名称
            selectRecords: [],
            fieldNames: [],
            selectTab: 1,
            metadataRecord: {},
            msgTitleModal:"",
            msgPromptModal:"",

            isAdd: false,
            modalFlag: 0, //0 create 1 delete master 2 delete subfield
            subsysId: 1,
            subsysDbNames: pConst.subsysDbNames,
            typeId: 1,
            metadataId: 0,
            newId : 0 ,
            getSortSubList: [],

            addRecordMasterIni: {
                metadataDb: "ytb_manager",
                subsysId: 1,
                metadataType: 1,
                metadataParentid: 0,
                isCached: false,
                metadataAutocreate: false,
                metadataOrder: 0,
                metadataReadOnly : false,
                metadataAddDel : true
            },
            editMetadataMaster: {},
            addRecordSubIni: {
                field_id: 0,
                fieldOrder: 0,
                fieldType: "VARCHAR",
                fieldSize: 4,
                fieldVisible: true,
                fieldDisplaysize: 4,
                fieldReadonly: false,
                fieldPk: false,
                fieldAuto: false,
                fieldIsnull: false,
                fieldIscal: false,
                fieldDefault: 0,
                fieldSrc: 0,
                fieldFormat: 0,
                fieldComponent: 0,
                refPool: '0'
            },
            editMetadataSub: {},

            getMetadatRef: {}, //左侧对应子系统数据
            curMetadataR: {}, //左侧对应子系统数据
            getTreeList: [], //左侧对应子系统数据
            getMasterList: [],
            getSubList: [],

            selectList: [], //下拉菜单内容 子系统
            selectSubsysLst: [],
            dbNameList: [],
            fieldDatatypeList: [],
            mdSrcMap: {
                0: "0--none",
                1: "1--REST接口"
            },
            mdFieldControl_map:{
                0:"0--默认",
                1:"1--选任务面板",
                2:"2--选人员面板",
                100:"100--测试标签函数"
            },
            metadataTypes: {
                1: "表",
                2: "视图",
                3: "SP",
                4: "标签库",
                5: "接口",
                6: "标签表",
                7: "标签视图",
            },
            fieldSrcMap: {
                0: "0--none",
                1: "1--pool",
                2: "2--表REST接口",
                3: "3--数据字典DD",
                4: "4--标签表",
                5: "5--字段REST接口",
                6: "6--引用表格字段",
                7: "7--引用REST计算",
                8: "8--表格列引用标题-文件内引用",
                9: "9--表格列引用标题-文件外引用"
            },
            fieldComponentMap: {
                0: "0--默认",
                1: "1--按扭",
                2: "2--下拉框",
                3: "3--多选框",
                4: "4--单选框"
            },
            fieldFormats: { //显示格式
                0: "0--默认",
                1: "1--金额￥",
                2: "2--百分比%",
                3: "3--序号"
            }
        },
        methods: {
            loadTable: function (event) {
                var that = this;
                var req = {
                    url: t.url,
                    cmdtype: t.cmdtype,
                    cmd: "getDictListAndField",
                    data: {
                        metadataId:that.newId>0 ? that.newId : that.metadataId
                    }
                };
                var reqOps = req;
                reqOps.success = function (data) {
                    that.getMasterList = [];
                    that.getSubList = [];
                    that.metadataRecord = {};
                    that.metadataId = 0;
                    if (data.list.length > 0) {
                        that.getMasterList = data.list[0];
                        that.metadataRecord = data.list[0];
                        that.getSubList = that.getMasterList[0].field;
                        that.metadataId = that.newId>0 ? that.newId :that.getMasterList[0].metadataId;
                        that.metadataName = that.getMasterList[0].metadataName;
                        that.metadataType = that.getMasterList[0].metadataType;

                        that.table = that.getMasterList[0].metadataDb + "." + that.metadataName;
                        that.loadTableRecord(event, that.selectTab);
                    }
                }
                reqOps.fail = function (retcode) {
                    minAlert(retcode)
                }
                $.ajaxPost(reqOps);

            },
            ///初始左侧内容
            loadTree: function (event) {
                var that = this;
                var reqOps = {
                    url: t.url,
                    cmdtype: "metadata",
                    cmd: "getDictList",
                    data: {
                        subsysId: that.subsysId,
                        "metadataType": that.typeId,
                       // "orderTo": 'desc',
                    }
                };
                reqOps.success = function (data) {
                    t.getTreeList = data.list;
                    t.getMasterList = [];
                    t.getSubList = [];
                    if (data.list.length > 0) {
                        t.metadataId = data.list[0].metadataId;
                        that.loadTable(event);
                        if (t.newId > 0) {
                            t.metadataId = t.newId;
                        }
                    } else {
                        t.metadataId = 0;
                    }

                    t.loadMetadataRef();
                }
                reqOps.fail = function (retcode) {
                    minAlert(retcode);
                }
                $.ajaxPost(reqOps);
            },
            loadMetadataRef: function (event) {
                var that = this;
                var reqOps = {
                    url: t.url,
                    cmdtype: "metadata",
                    cmd: "getDictList",
                    data: {
                        subsysId: that.subsysId
                    }
                };
                reqOps.success = function (data) {
                    that.getMetadatRef = {0: "无关联"};
                    var lst = data.list;
                    // lst.sort(function (a, b) {
                    //     return a.metadataName.localeCompare(b.metadataName);
                    // });
                    for (var i = 0; i < lst.length; i++) {
                        that.getMetadatRef[lst[i].metadataId] = lst[i].metadataName;
                    }
                }
                reqOps.fail = function (retcode) {
                    minAlert(retcode);
                }
                $.ajaxPost(reqOps);
            },
            ///点击左侧绑定单击事件
            clickLeft: function (event, item) {
                this.metadataId = item.metadataId;
                this.newId = 0;
                this.loadTable(event);
                $(event.target).addClass("text-danger").siblings().removeClass("text-danger");

            },

            /// 初始化下拉框内容
            loadSelect: function (event) {
                var that = this;
                var reqOps = {
                    url: that.url,
                    "cmdtype": "metadata",
                    "cmd": "getSubSysDictList"
                };
                //成功回调函数
                reqOps.success = function (data) {
                    that.selectList = data.list;
                    that.selectSubsysLst = {}
                    that.selectList.sort(function (a, b) {
                        return a.subsysId - b.subsysId;
                    })
                    for (var i = 0; i < that.selectList.length; i++) {
                        that.selectSubsysLst[that.selectList[i].subsysId] = that.selectList[i].subsysName;
                    }
                    that.loadTree();
                }
                //失败回调函数
                reqOps.fail = function (retcode) {
                    minAlert(retcode);
                }
                //调用
                $.ajaxPost(reqOps);
            },
            loatWat: function (event) {
                var that = this;
                $(event.target).addClass("btn-primary").removeClass("active").siblings("button").removeClass("btn-primary").addClass("active");
                $("#selectId").removeClass("btn-primary");
                that.loadTree();
            },
            watchTable: function (event, typeId) {
                var that = this;
                this.typeId = typeId;
                this.metadataType = typeId;
                this.addRecordMasterIni.subsysId = this.subsysId;
                this.addRecordMasterIni.metadataType = typeId;
                this.addRecordMasterIni.metadataDb = this.subsysDbNames[this.subsysId];

                that.loatWat(event);
            },

            btnCopyMaster: function (event) {
                this.modalFlag = 99;
                this.msgTitleModal = "copy字典";
                this.msgPromptModal = "确定拷贝吗？" + this.metadataName;
                $("#delModal").modal();
            },
            // 主表创建
            btnDpMaster: function (event, record) {
                this.modalFlag = 100;
                this.editMetadataMaster = $.extend({}, record);
                this.msgTitleModal="删除表";
                this.msgPromptModal="确定删除表吗？" + this.editMetadataMaster.metadataName;
                $("#delModal").modal();
            },
            // 主表创建
            btnCreateMaster: function (event, record) {
                this.modalFlag = 0;
                this.editMetadataMaster = $.extend({}, record);
                this.msgTitleModal="建表";
                this.msgPromptModal="确定创建吗？" + this.editMetadataMaster.metadataName;
                $("#delModal").modal();
            },
            //主表删除
            btnDelMaster: function (event, record) {
                this.modalFlag = 1;
                this.editMetadataMaster = $.extend({}, record);
                this.msgTitleModal = "删除";
                this.msgPromptModal = "确定删除？" + this.editMetadataMaster.metadataName;

                $("#delModal").modal();
            },

            ///子表删除
            btnDelSub: function (event, record) {
                this.modalFlag = 2;
                this.editMetadataSub = $.extend({}, record);
                this.newId=this.metadataId;
                this.msgTitleModal = "删除";
                this.msgPromptModal = "确定删除字段？" + this.editMetadataSub.fieldName;
                $("#delModal").modal();
            },

            /// 确定删除主表、子表的信息、主表创建
            btnDeleteConfirm: function (event, modalFlag) {
                var that = this;

                if (modalFlag == 99) {
                    that.btnCopyMasterConfirm(event);
                    $("#delModal").modal("hide");
                }
                else if (modalFlag == 100) {
                    var reqOps = {
                        url: that.url,
                        cmdtype: "metadata",
                        cmd: "dpMaster",
                        data: {
                            metadataId: t.metadataId
                        }
                    };
                    reqOps.success = function (data) {
                        $("#delModal").modal("hide");
                        var req = {
                            url: that.url,
                            cmdtype: "metadata",
                            cmd: "getDictList"
                        };
                        //that.loadTree();
                        that.loadTable(event);
                    }
                    reqOps.fail = function (retcode) {
                        minAlert(retcode);
                        $("#delModal").modal("hide");
                    }
                    $.ajaxPost(reqOps);

                }else if (this.modalFlag == 1) {
                    var reqOps = {
                        url: that.url,
                        cmdtype: "metadata",
                        cmd: "dictDeleteByKey",
                        data: {
                            metadataId: t.metadataId
                        }
                    };
                    reqOps.success = function (data) {
                        $("#delModal").modal("hide");
                        var req = {
                            url: that.url,
                            cmdtype: "metadata",
                            cmd: "getDictList"
                        };
                        that.loadSelect();
                        that.loadTree();
                        that.loadTable(event);
                        that.loatWat();
                    }
                    reqOps.fail = function (retcode) {
                        minAlert(retcode);
                        $("#delModal").modal("hide");
                    }
                    $.ajaxPost(reqOps);

                } else if (this.modalFlag == 2) {
                    var reqOps = {
                        url: t.url,
                        cmdtype: "metadata",
                        cmd: "fieldByDeleteByKey",
                        data: {
                            fieldId: this.editMetadataSub.fieldId
                        }
                    };
                    reqOps.success = function (data) {
                        $("#delModal").modal("hide");
                        that.loadTree();
                    }
                    //失败回调函数
                    reqOps.fail = function (retcode) {
                        minAlert(retcode)
                    }
                    //调用
                    $.ajaxPost(reqOps);
                } else if (this.modalFlag == 0) {
                    var id = $("#text").attr("name"); //元数据标识号
                    var reqOps = {
                        "url": t.url,
                        "cmdtype": "metadata",
                        "cmd": "makeTableByDictId",
                        "data": {
                            metadataId: parseInt(t.metadataId)
                        }
                    };
                    reqOps.success = function (data) {
                        $("#delModal").modal("hide");
                        that.loadTable(event);
                    }
                    reqOps.fail = function (retcode) {
                        minAlert(retcode);
                    }
                    $.ajaxPost(reqOps);
                }
            },
            ///显示新增主表模态框
            btnAddMaster: function (event) {
                t.isAdd = true;
                this.addRecordMasterIni.subsysId=this.subsysId;

                this.editMetadataMaster = $.extend({}, this.addRecordMasterIni)
                $("#UserModalLabel").html("新增");
                $("#myModalMaster").modal();
                $("#hide_metaData").hide();
            },
            btnCopyMasterConfirm: function (event) {
                var that=this;
                var reqOps = {
                    url: that.url,
                    cmdtype: "metadata",
                    cmd: "copyMaster",
                    data: {
                        metadataId: that.metadataId
                    }
                };
                reqOps.success = function (data) {
                    that.newId = data.id;                    //$("#delModal").modal("hide");
                    that.loadTree(event);
                }
                reqOps.fail = function (retcode) {
                    minAlert(retcode);
                }
                $.ajaxPost(reqOps);
            },
            ///显示修改主表弹框
            btnEditMaster: function (event, item) {
                t.isAdd = false;
                this.loadTable(event);
                this.editMetadataMaster = $.extend({}, item)
                $("#UserModalLabel").html("修改");                //$("#hide_metaData").show();
                $("#myModalMaster").modal(); //显示表信息-修改-显示模态框
            },

            // 子表新增弹框
            btnAddDicField: function (event) {
                var that = this;
                that.isAdd = true;
                that.editMetadataSub = $.extend({}, that.addRecordSubIni)
                that.editMetadataSub.metadataId = that.metadataId;
                that.editMetadataSub.metadataName = metadataName;
                $("#EditModal").html("新增");
                $("#AddmyModalDic").modal("show");
            },
            btnDelDicFields: function (event) {
                var that = this;

            },
            // 子表修改弹框 editMetadatField
            btnEditDicField: function (event, item) {
                var that = this;
                that.isAdd = false;
                this.editMetadataSub = $.extend({}, item)
                $("#EditModal").html("修改");
                $("#AddmyModalDic").modal();
            },

            // 保存子表新增、修改信息
            btnSaveSub: function (event) {
                var that = this;
                var reqOps = {
                    url: that.url,
                    cmdtype: "metadata",
                    cmd: that.isAdd ? "fieldByInsertSelective" : "fieldByUpdateByKey",
                    data: that.editMetadataSub
                };

                reqOps.success = function (data) {
                    that.loadTable(event);
                    $("#AddmyModalDic").modal("hide");
                }
                reqOps.fail = function (retcode) {
                    minAlert(retcode)
                }
                $.ajaxPost(reqOps);
            },


            btnSaveMaster: function (event) {
                var that = this;
                that.editMetadataMaster.subsysId = that.subsysId;
                that.editMetadataMaster.metadataType = that.typeId;
                that.newId = that.metadataId ;
                var reqOps = {
                    url: that.url,
                    cmdtype: "metadata",
                    cmd: that.isAdd ? "dictByInsertSelective" : "dictByUpdateByKey",
                    data: that.editMetadataMaster
                };
                reqOps.success = function (data) {
                    that.newId = data.id;
                    that.loadTable(event);
                    that.loadTree();
                    $("#myModalMaster").modal("hide");
                };
                reqOps.fail = function (retcode) {
                    minAlert(retcode)
                };
                $.ajaxPost(reqOps);
            },

            clickSelect: function (event) {
                var that = this;
                that.loatWat(event);
                that.loadTable(event);
            },
            clickTr: function (event) {
                $(event.target).parent().addClass("bg-blue").siblings("tr").removeClass("bg-blue"); //当前行高亮显示，
            },
            loadDbNameList: function () {
                var reqOps = { //自定义参数
                    url: this.url,
                    cmdtype: "metadata",
                    cmd: "getDictDataTypeList",
                    data: {
                        typeId: 3
                    }
                };
                reqOps.success = function (data) { //成功回调函数
                    t.dbNameList = data.list;
                }
                reqOps.fail = function (retcode) { //失败回调函数
                    minAlert(retcode)
                }
                $.ajaxPost(reqOps); //调用
            },
            loadFieldDatatypeList: function () {
                var reqOps = {
                    url: this.url,
                    cmdtype: "metadata",
                    cmd: "getDictDataTypeList",
                    data: {
                        typeId: 2
                    }
                };
                reqOps.success = function (data) {
                    t.fieldDatatypeList = data.list;
                }
                reqOps.fail = function (retcode) {
                    minAlert(retcode)
                }
                $.ajaxPost(reqOps);
            },
            btnSortDisplayField: function (event) {
                var that = this;
                that.getSortSubList = $.extend({}, that.getSubList)
                $("#sortModal").modal();
            },
            bntUpDownClick: function (event, isup) {
                if (null == $('#selectSortField').val()) {
                    alert('请选择一项');
                    return false;
                }
                var len = $('#selectSortField')[0].options.length;
                var oind = $('#selectSortField').get(0).selectedIndex;
                if (isup && oind > 0) {
                    $('#selectSortField option:selected').insertBefore($('#selectSortField option:selected').prev('option'));
                }
                if (!isup && oind < len - 1) {
                    $('#selectSortField option:selected').insertAfter($('#selectSortField option:selected').next('option'));
                }
            },
            bntUpDownClickTop: function (event) {
                if (null == $('#selectSortField').val()) {
                    alert('请选择一项');
                    return false;
                }
                var oind = $('#selectSortField').get(0).selectedIndex;
                while (oind > 0) {
                    $('#selectSortField option:selected').insertBefore($('#selectSortField option:selected').prev('option'));
                    oind = $('#selectSortField').get(0).selectedIndex;
                }
            },
            bntUpDownClickEnd: function (event) {
                if (null == $('#selectSortField').val()) {
                    alert('请选择一项');
                    return false;
                }
                var len = $('#selectSortField')[0].options.length;
                var oind = $('#selectSortField').get(0).selectedIndex;
                while (oind < len - 1) {
                    $('#selectSortField option:selected').insertAfter($('#selectSortField option:selected').next('option'));
                    oind = $('#selectSortField').get(0).selectedIndex;
                }
            },
            btnSaveFieldsOrder: function () {

                var checkValue = $('#selectSortField').val();
                var fieldIds = [];
                var options = $('#selectSortField')[0].options;
                for (var i = 0; i < options.length; i++) {
                    fieldIds.push(options[i].id);
                }
                var that = this;
                var reqOps = {
                    url: this.url,
                    cmdtype: "metadata",
                    cmd: "updateFieldOrder",
                    data: {
                        fieldIds: fieldIds.join(",")
                    }
                };
                reqOps.success = function (data) {
                    that.loadTable(event);
                    $("#sortModal").modal("hide");
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
                    async : false,
                    data: data
                };
                req.success = function (data) {
                    if (cmd == 'selectByTableByLimitOrder') {
                        self.selectRecords = data.list;

                    } else if (cmd == 'getDictTableAndField') {
                        self.metadataRecord = data.list[0];
                        self.fieldNames = self.metadataRecord.field;
                        self.metadataSortFields = self.metadataRecord.metadataSortFields;
                    }
                }
                req.fail = function (retcode) {
                    if (cmd == 'selectByTableByLimitOrder') {
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
            checkDict: function (metadataId) {
                var self = this;
                var req = {
                    url: self.url,
                    cmdtype: self.cmdtype,
                    cmd: "checkDict",
                    async : false,
                    data: {
                        metadataId: metadataId

                    }
                };
                req.success = function (data) {
                    self.selectRecords = [];
                    self.metadataRecord = {};
                    self.fieldNames = [];
                    if (self.metadataName
                        && self.metadataType != 3
                        && self.metadataType != 4
                        && self.metadataType != 5) {
                        self.funMetadata("getDictTableAndField",  {metadataName: "metadata_check"});
                        self.funMetadata("selectByTableByLimitOrder",
                            {
                                table: "metadata_check",
                                limitFirstIndex: 0,
                                limitpageSize: 200,
                                sWhere : "metadata_name='"+self.metadataName+"'"
                            });
                    }
                };
                req.fail = function (retcode) {
                    minAlert(retcode);
                };
                $.ajaxPost(req);
            },
            loadTableRecord: function (event, selectTab) {
                this.selectTab = selectTab;
                if (this.selectTab == 2) {
                    this.selectRecords = [];
                    this.metadataRecord = {};
                    this.fieldNames = [];
                    if (this.metadataName
                        && this.metadataType != 3
                        && this.metadataType != 4
                        && this.metadataType != 5) {
                        this.funMetadata("getDictTableAndField",  {metadataName: this.metadataName});
                        if (this.metadataRecord.metadataParentid > 0) {
                            this.funMetadata("getDictTableAndField",
                                {
                                    metadataName:this.getMetadatRef[this.metadataRecord.metadataParentid]
                                }
                            );
                        }
                        this.funMetadata("selectByTableByLimitOrder",
                            {
                                table: this.table,
                                limitFirstIndex: 0,
                                limitpageSize: 200,
                            });
                    }
                } else
                if (this.selectTab == 3) {
                    this.checkDict(this.metadataId);
                }
            },
        },
        mounted: function () {
            this.loadSelect();
            this.loadDbNameList();
            this.loadFieldDatatypeList();
        }

    })


})

function onCheck(e, treeId, treeNode) {
    var treeObj = $.fn.zTree.getZTreeObj("treeDemo"),
        nodes = treeObj.getCheckedNodes(true),
        v = "";
    for (var i = 0; i < nodes.length; i++) {
        v += nodes[i].name + ",";  //alert(nodes[i].id) 获取选中节点的值
    }

}