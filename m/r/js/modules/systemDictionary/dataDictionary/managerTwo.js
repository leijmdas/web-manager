$(function () {
    var t = new Vue({
        el: "#dataTypeBody",
        data: {
            url: "/rest/sysmetadata",

            value: 0, //查询条件 分类编号或者名称
            getLeftLists: {},
            dataTypelist: [],  //分组类型
            addRecordIni :{},
            editRecord : {},

            isAdd : false
        },
        methods: {
            btnDelModal: function (event, item) { //弹出删除框
                this.editRecord = $.extend({}, item)
                $("#text").html("确定删除吗?" + item.dataInnerId);
                $("#delModal").modal()
            },
            btnDeleteConfirm: function (event) {
                var that = this;
                var reqOps = {
                    url: this.url,
                    cmdtype: "metadata",
                    cmd: "deleteDictDataTypeById",
                    data: {
                        dataInnerId: this.editRecord.dataInnerId
                    }
                };
                reqOps.success = function (data) {
                    that.loadTable();
                    $("#delModal").modal("hide");
                }
                reqOps.fail = function (retcode) {
                    minAlert(retcode)
                }
                $.ajaxPost(reqOps);
            },

            btnAddDic: function() {
                this.isAdd=true;
                this.editRecord = $.extend({}, this.addRecordIni);
                $("#editModal").modal("show")
            },
			btnEditDic: function(event,item) { //显示修改模态框
                this.isAdd=false;
                this.editRecord = $.extend({}, item);
                $("#editModal").modal("show");
            },

            btnSave: function (event) { //数据字典 -修改
                var that = this;
                var reqOps = {
                    url: that.url,
                    cmdtype: "metadata",
                    cmd: that.isAdd ? "addDictDataType" : "updateDictDataTypeById",
                    data: that.editRecord
                };
                reqOps.success = function(data) {
                    that.loadTable();
                    $("#editModal").modal("hide") //隐藏修改模态框
                }
                reqOps.fail = function(retcode) {
                    minAlert(retcode)
                }
                $.ajaxPost(reqOps);
            },
            loadTableDatatype: function () { ///页面加载之后初始化表格内容
                var self = this;
                var reqOps = {
                    url: self.url,
                    cmdtype: "metadata",
                    cmd: "selectDatatype",
                    data: {}
                };
                reqOps.success = function (data) {
                    self.dataTypelist = data.list;
                }
                reqOps.fail = function (retcode) {
                    minAlert(retcode)
                }
                $.ajaxPost(reqOps);
            },
			loadTable: function() {
				var self = this;
                var reqOps = {
                    url: self.url,
                    cmdtype: "metadata",
                    cmd: "getDictDataTypeList",
                    data: {
                        typeId: this.value == 0 ? "" : this.value
                    }
                };
                reqOps.success = function (data) {
                    for (i = 0, len = data.list.length; i < len; i++) {
                        data.list[i].createTime = U.dateFormatString(data.list[i].createTime);
                    }
                    Dictionary = data.list;
                    t.getLeftLists = data.list;
                 	U.sortByTitle(t.getLeftLists);

                }
                reqOps.fail = function(retcode) { //失败回调函数
					minAlert(retcode)
				}
                $.ajaxPost(reqOps); //调用
            },
            qryDic: function (event, typeId) {
                this.value = typeId;
                this.loadTable();
            },
            qryDicRestore: function () {
                this.value = "";
                this.loadTable();
            },


			clickTr: function(event) {
                //$(event.target).stopPropagation
                $(event.target).parent().addClass("bg-blue").siblings("tr").removeClass("bg-blue");
            },
            clickSort: function(event,sortF){
                U.clickTitleSort(event,sortF);
                this.loadTable();
            }
		},
		mounted: function(event) {
            this.loadTableDatatype();
            this.loadTable();
		}
	});

})