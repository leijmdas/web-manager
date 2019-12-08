var menuList = ""; //菜单权限编号
var restList = ""; //选中权限编号集合
$(function() {

	var t = new Vue({
		el: "#maxDiv",
		data: {
            url: "/rest/sysuser",
            //url : "//localhost/rest/sysuser",
			roleName : "",
            getLeftLists: {},
			editList: {},

			isAdd : false ,
			addRecordIni:{},
			editRecord: {},
			roleId : 0
		},


		methods: {
            loadTable: function (event) {
                var that = this;
                var reqOps = {
                    "url": that.url,
                    cmdtype: "role",
                    "cmd": "getRoleList",
                    data: {
                        roleName: that.roleName
                    }
                };
				//成功回调函数
                reqOps.success = function (data) {
                    t.getLeftLists = data.list;
                    if (data.list.length > 0) {
                        that.roleId = t.getLeftLists[0].roleId;
                        that.editRecord = t.getLeftLists[0];
                    }
                    that.loadRoleRight();
                }
				reqOps.fail = function(retcode) {
					minAlert(retcode);
				}
				$.ajaxPost(reqOps);

			},
			del: function(event,item) {
			 	this.editRecord=$.extend({},item)
                $("#text").text("确定删除角色吗"+this.editRecord.roleId);
                $("#delModal").modal();
            },
			btnDeleteConfirm: function (event) {
            	var that=this;
                var reqOps = {
                    url: this.url,
                    cmdtype: "role",
                    cmd: "deleteRoleById",
                    data: {
                        roleId: this.editRecord.roleId
                    }
                };
				reqOps.success = function(data) {
                    that.loadTable();
                    $("#delModal").modal("hide")
				}
				reqOps.fail = function(retcode) {
					minAlert(retcode);
				}
                $.ajaxPost(reqOps);
            },
            //显示编辑模态框
            edit: function (event, item) {
                this.editRecord = $.extend({}, item);
                $("#EditRoleModal").modal();
            },
            ///确定编辑信息
            btnEditSave: function (event) {
                var that = this
				var reqOps = {
                    url: "/rest/sysuser",
                    "cmdtype": "role",
					"cmd": "updateRoleInfo",
					"data": this.editRecord
                };
				reqOps.success = function(data) {
					that.loadTable();
					$("#EditRoleModal").modal("hide");
				}
				reqOps.fail = function(retcode) {
					minAlert(retcode)
				}
				$.ajaxPost(reqOps);
			},
			///普通查询
			searchInfo: function(event,isSearch) {
                this.roleName = isSearch ? this.roleName : "";
                //自定义参数
                var reqOps = {
                    url : "/rest/sysuser",
                    "cmdtype": "role",
					"cmd": "getRoleList",
					"data": {
						 roleName : this.roleName
					}
				};
				//成功回调函数
				reqOps.success = function(data) {
					t.getLeftLists = data.list

				}
				//失败回调函数
				reqOps.fail = function(retcode) {
					minAlert(retcode)
				}
				//调用
				$.ajaxPost(reqOps);
			},
			///显示新增模态框
			userAdd: function(event) {
				$("#myModalUser").modal("show")
			},
			///保存新增信息
			btnSaveUserMgr: function(event) {
				var that = this;
				var d = {};
				var t = $("#addForm").serializeArray(); //表单序列化
				$.each(t, function() {
					d[this.name] = this.value;
				});
				//自定义参数
				var reqOps = {
                    "url": "/rest/sysuser",
                    "cmdtype": "role",
					"cmd": "addRole",
					"data": d
				};
				//成功回调函数
				reqOps.success = function(data) {
					$("#myModalUser").modal("hide"); //隐藏新增框
					that.loadTable(); //刷新表格
					$("#addForm div").each(function(){///2018-9-29添加
						$(this).find("input").val("");
					})
				}
				//失败回调函数
				reqOps.fail = function(retcode) {
					minAlert(retcode)
				}
				//调用
				$.ajaxPost(reqOps);
			},
			///显示相应的权限
			loadRoleRight: function(event) {

				var req = {
                    "url": "/rest/sysuser",
                    "cmdtype": "menu",
					"cmd": "getMenuToRole",
					"data": {
						roleId: this.roleId
					}
				};
				//成功回调函数
				req.success = function(data) {
					var setting = {
						check: {
							enable: true
						},
						data: {
							key: {
								name: "menuName",
								checked: "isSelect"
							},
							simpleData: {
								enable: false,
								idkey: "menuId",
								pIdKey: "parentId",
								rootPId: null
							}
						},
						callback: {
							onCheck: function() {
								var treeObj = $.fn.zTree.getZTreeObj("treeDemo1"),
									nodes = treeObj.getCheckedNodes(true),
									v = "";
								for(var i = 0; i < nodes.length; i++) {
									v += nodes[i].menuId + ",";
								}
								menuList = v;
							}
						}
					};
					var zNodes = data.list
					var zTreeObj = $.fn.zTree.init($("#treeDemo1"), setting, zNodes); //菜单权限
				}
				//失败回调函数
				req.fail = function(retcode) {
					minAlert(retcode);
				}
				//调用
				$.ajaxPost(req);
				//自定义参数
				var reqOps = {
                    url : "/rest/sysuser",
                    "cmdtype": "menu",
					"cmd": "getRestToRole",
					"data": {
						 roleId :this.roleId
					}
				};
				//成功回调函数
				reqOps.success = function(data) {
					var settingR = {
						check: {
							enable: true
						},
						data: {
							key: {
								name: "nameRemark",
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
							onCheck: function() {
								var treeObj = $.fn.zTree.getZTreeObj("treeDemo2"),
									nodes = treeObj.getCheckedNodes(true),
									v = "";
								for(var i = 0; i < nodes.length; i++) {
									v += nodes[i].restId + ",";
								}
								restList = v;
							}
						}
					};
					var zNodesRest = data.list
					var zTreeRest = $.fn.zTree.init($("#treeDemo2"), settingR, zNodesRest); //菜单权限
				}
				//失败回调函数
				reqOps.fail = function(retcode) {
					minAlert(retcode);
				}
				//调用
				$.ajaxPost(reqOps);
			},
			// 点击表格行显示相应的权限图形
			tableclike: function(event) {},
			//点击表格行
			clickTr: function(event,item) {
				$(event.target).stopPropagation
                var that = this;
                $(event.target).parent().addClass("bg-blue").siblings("tr").removeClass("bg-blue"); //当前行高亮显示，
                RoleId = $(event.target).parent().attr("name"); //获取id
                that.roleId = item.roleId;
                that.editRecord=$.extend({},item);
                that.loadRoleRight();
            },
            editTreeDemoT: function(event) {
				var reqOps = {
                    "url": "/rest/sysuser",
                    "cmdtype": "menu",
					"cmd": "saveRoleMenuOrRest",
					"data": {
						"menuId": restList,
						"roleId": RoleId,
						"type": 2
					}
				};
				reqOps.success = function(data) {
					minAlert("修改成功");
				}
				reqOps.fail = function(retcode) {
					minAlert(retcode);
				}
				//调用
				$.ajaxPost(reqOps);
			},
			///保存菜单权限
			editTreeDemoO: function(event) {
				var that = this;
				var reqOps = {
					"cmdtype": "menu",
					"cmd": "saveRoleMenuOrRest",
					"url": "/rest/sysuser",
					"data": {
						"menuId": menuList,
						"roleId": RoleId,
						"type": 1
					}
				};
				//成功回调函数
				reqOps.success = function(data) {
					minAlert("修改成功");
				}
				reqOps.fail = function(retcode) {
					minAlert(retcode);
				}
				$.ajaxPost(reqOps);
			},
		},
		mounted: function(event) {
			//this.loadTable();
			 this.$nextTick(this.loadTable);
    
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
