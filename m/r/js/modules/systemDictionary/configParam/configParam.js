$(function() {
	var t = new Vue({
		el: "#body",
		data: {
            //url1: "//localhost/rest/configCenter",
            url : "/rest/configCenter",
            getLeftLists: {},
			editmyModalDic: {} //修改加载内容
		},
		methods: {
			btnDeletePolicy: function(event) { //刪除功能

			},
			delModal: function(event) { //弹出删除框

			},
			btnEditDicSave: function() { //数据字典 -修改

			},
			editDic: function(event) { //显示修改模态框

			},
			loadTable: function() {
				var reqOps = {
                    url: this.url,
					cmdtype: "configCenter",
                    cmd: "selectDictConfig"
                };
                reqOps.success = function (data) {
                	Dictionary = data.list;
                    t.getLeftLists = data.list;
                }
                reqOps.fail = function(retcode) {
					minAlert(retcode)
				}
				$.ajaxPost(reqOps); //调用
			},
			addDic: function() { //显示新增模态框
		 	},
			btnAddDicSave: function() { //确定新增

			},
			clickTr: function(event) {
                $(event.target).stopPropagation
                 $(event.target).parent().addClass("bg-blue").siblings("tr").removeClass("bg-blue"); //当前行高亮显示，

            }
		},
		mounted: function(event) {
			this.loadTable();
		}
	});

})