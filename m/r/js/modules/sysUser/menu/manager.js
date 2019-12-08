var menuList = ""; //菜单接口编号
var roleIdM = "";
var restList = "";
$(function() {
	var t = new Vue({
		el: "#maxdiv",
		data: {
			restList: {}, //列表接口表格初始化
			editRestList: {} //编辑菜单列表 加载信息
		},
		methods: {
			///初始化
			loadTable: function(event) {
				var that = this;
				that.loadMenuTree(); //菜单接口树形图
				that.loadRestTree(); //接口列表树形图
				menuList = "0";
				restList = "0";
			},
			///显示删除弹框
			deleMenuManagement: function(event) {
				$("#delModal").modal();
				$("#text").text("确定删除菜单列表吗");
			},
			///确定删除指定菜单列表
			btnDeletePolicy: function(event) {
				var that = this;
				if($("#text").text() == "确定删除菜单列表吗") {
					//自定义参数
					var reqOps = {
						"cmdtype": "menu",
						"cmd": "deleteMenuById",
						"url": "/rest/sysuser",
						"data": {
							"menuId": parseInt(menuList)
						}
					};
					//成功回调函数
					reqOps.success = function(data) {
						minAlert("删除成功");
						that.loadMenuTree(); //菜单接口树形图
						$("#delModal").modal("hide"); //隐藏删除框
					}
					//失败回调函数
					reqOps.fail = function(retcode, retmsg) {
						minAlert(retmsg);
						$("#delModal").modal("hide"); //隐藏删除框
					}
					//调用
					$.ajaxPost(reqOps);
				} else if($("#text").text() == "确定删除接口列表吗") {
					//自定义参数
					var req = {
						"cmdtype": "menu",
						"cmd": "deleteRestListById",
						"url": "/rest/sysuser",
						"data": {
							"restListId": parseInt(restList)
						}
					};
					//成功回调函数
					req.success = function(data) {
						minAlert("删除成功");
						that.loadRestTree(); //刷新接口树形图
						$("#delModal").modal("hide"); //隐藏删除框
					}
					//失败回调函数
					req.fail = function(retcode, retmsg) {
						minAlert(retmsg);
						$("#delModal").modal("hide"); //隐藏删除框
					}
					//调用
					$.ajaxPost(req);
				}
			},
			///显示菜单列表新增弹框
			AddMenuManagement: function() {
				$("#managerRa div").each(function() {
					$(this).find("input").val("")
				});
				$("#nextmenu").val(parseInt(menuList)); //添加该编号的子集
				$("#myModalMenuMana").modal(); //显示菜单管理 新增 模态框
			},
			///确定菜单列表 新增
			btnSaveMenuMgr: function(event) {
				var that = this;
			 	$.validator.setDefaults( {
			    submitHandler: function () {
					var d = {};
						var t = $("#managerRa").serializeArray(); //表单序列化
						$.each(t, function() {
							d[this.name] = this.value;
						});
						//自定义参数
						var reqOps = {
							"cmdtype": "menu",
							"cmd": "addMenu",
							"url": "/rest/sysuser",
							"data": d
						};
						//成功回调函数
						reqOps.success = function(data) {
							$("#myModalMenuMana").modal("hide"); //隐藏新增框
							that.loadMenuTree(); //刷新菜单列表 树形图
						}
						//失败回调函数
						reqOps.fail = function(retcode) {
							minAlert(retcode)
						}
						//调用
						$.ajaxPost(reqOps);
				
			}});
				//表单验证
				$("#managerRa").validate({
				 rules:{
						menuname: "required",
						nextmenu: {
							required:true,
							digits: true
						},
						menuRouter: {
							required: true,
							url: true
						},
						sortnumber: {
							required: true,
							digits: true,
							min: 0
						}

					},
					 messages: {
						menuname: "请输入菜单名称",
						nextmenu: {
							email: "请输入上级菜单",
							digits: "只能输入数字"
						},
						menuRouter: {
							required: "请输入菜单URL",
							url: "请输入正确的url格式"
						},
						sortnumber: {
							digits: "请输入整数",
							min: "输入大于0的整数"
						}
					},
					errorElement: "em",
					errorPlacement: function(error, element) {
						// Add the `help-block` class to the error element
						error.addClass("help-block");
						// Add `has-feedback` class to the parent div.form-group
						// in order to add icons to inputs
						element.parents(".col-sm-8").addClass("has-feedback");
				
						if(element.prop("type") === "checkbox") {
							error.insertAfter(element.parent("label"));
						} else {
							error.insertAfter(element);
						}
						// Add the span element, if doesn't exists, and apply the icon classes to it.
						if(!element.next("span")[0]) {
							$("<span class='glyphicon glyphicon-remove form-control-feedback'></span>").insertAfter(element);
						}
					},
					success: function(label, element) {
						// Add the span element, if doesn't exists, and apply the icon classes to it.
						if(!$(element).next("span")[0]) {
							$("<span class='glyphicon glyphicon-ok form-control-feedback'></span>").insertAfter($(element));
						}
					},
					highlight: function(element, errorClass, validClass) {
						$(element).parents(".col-sm-8").addClass("has-error").removeClass("has-success");
						$(element).next("span").addClass("glyphicon-remove").removeClass("glyphicon-ok");
					},
					unhighlight: function(element, errorClass, validClass) {
						$(element).parents(".col-sm-8").addClass("has-success").removeClass("has-error");
						$(element).next("span").addClass("glyphicon-ok").removeClass("glyphicon-remove");
					}
				})

			},
			///显示菜单列表 编辑框
			editMenuManagement: function(event) {
				$("#EditmyModal").modal();
				//自定义参数
				var req = {
					"cmdtype": "menu",
					"cmd": "getMenuInfoById",
					"url": "/rest/sysuser",
					"data": {
						"menuId": menuList
					}
				};
				//成功回调函数
				req.success = function(data) {
					t.editRestList = data.list
					$("#editmenuId").val(data.list.menuId);
					$("#editmenuName").val(data.list.menuName);
					$("#editmenuUrl").val(data.list.menuUrl);
					$("#editmenuCode").val(data.list.menuCode);
					$("#editorderNum").val(data.list.orderNum);

				}
				//失败回调函数
				req.fail = function(retcode) {}
				//调用
				$.ajaxPost(req);
			},
			///保存菜单列表 编辑信息
			btnEditSave: function(event) {
				var that = this;
				var d = {};
				var t = $("#editMenuForm").serializeArray();
				$.each(t, function() {
					d[this.name] = this.value;
				});
				//自定义参数
				var req = {
					"cmdtype": "menu",
					"cmd": "updateMenu",
					"url": "/rest/sysuser",
					"data": d
				};
				//成功回调函数
				req.success = function(data) {
					$("#EditmyModal").modal("hide");
					that.loadMenuTree(); //刷新树形图
				}
				//失败回调函数
				req.fail = function(retcode) {
					minAlert(retcode);
				}
				//调用
				$.ajaxPost(req);
			},
			///显示接口列表 新增
			Addlist: function(event) {
				$("#AddRestForm div").each(function() {
					$(this).find("input").val("")
				})
				$("#ins_id").val(parseInt(parseInt(restList))); //添加该编号的子集
				$("#myModalList").modal(); //显示菜单管理 列表接口  新增 模态框
			},
			///保存接口列表新增信息
			btnSaveRestMgr: function(event) {
				var that = this;
				var d = {};
				var t = $("#AddRestForm").serializeArray();
				$.each(t, function() {
					if(this.name == "parentId" || this.name == "orderNum") {
						d[this.name] = parseInt(this.value);
					} else {
						d[this.name] = this.value;
					}
				});
				//自定义参数
				var req = {
					"cmdtype": "menu",
					"cmd": "addRestList",
					"url": "/rest/sysuser",
					"data": d
				};
				//成功回调函数
				req.success = function(data) {
					$("#myModalList").modal("hide");
					that.loadRestTree(); //刷新树形图
				}
				//失败回调函数
				req.fail = function(retcode) {
					minAlert(retcode);
				}
				//调用
				$.ajaxPost(req);
			},
			///显示接口列表 编辑
			editRestManagement: function(event) {
				$("#EditInterModal").modal();
				//自定义参数
				var req = {
					"cmdtype": "menu",
					"cmd": "getRestListInfoById",
					"url": "/rest/sysuser",
					"data": {
						"restId": parseInt(restList)
					}
				};
				//成功回调函数
				req.success = function(data) {
					t.editRestList = data.list;
					$("#list_input_id").val(data.list.restId);
					$("#list_input_name").val(data.list.restName);
					$("#list_input_url").val(data.list.url);
                    $("#list_input_cmdType").val(data.list.cmdType);
                    $("#list_input_cmd").val(data.list.cmd);
                    $("#list_input_orderNum").val(data.list.orderNum);
                    $("#list_input_systemType").val(data.list.systemType)
                    $("#list_input_memo").val(data.list.memo)
                }
				//失败回调函数
				req.fail = function(retcode) {}
				//调用
				$.ajaxPost(req);
			},
			/////保存接口列表编辑内容
			btnEditRestList: function(event) {
				var that = this;
				var d = {};
				var t = $("#editRestFrom").serializeArray();
				$.each(t, function() {
					if(this.name == "restId" || this.name == "orderNum") {
						d[this.name] = parseInt(this.value);
					} else {
						d[this.name] = this.value;
					}
				});
				//自定义参数
				var req = {
					"cmdtype": "menu",
					"cmd": "updateRestList",
					"url": "/rest/sysuser",
					"data": d
				};
				//成功回调函数
				req.success = function(data) {
					$("#EditInterModal").modal("hide");
					that.loadRestTree();
				}
				//失败回调函数
				req.fail = function(retcode) {}
				//调用
				$.ajaxPost(req);
			},
			///显示接口列表 删除
			deleRestManagement: function(event) {
				$("#text").html("确定删除接口列表吗");
				$("#delModal").modal();
			},
			///初始化菜单树形图
			loadMenuTree: function(event) {

				//自定义参数
				var req = {
					"cmdtype": "menu",
					"cmd": "treeMenuList",
					"url": "/rest/sysuser"
				};
				//成功回调函数
				req.success = function(data) {
					var setting = {
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
							onClick: function() {
								var treeObj = $.fn.zTree.getZTreeObj("treeDemo1"),
									nodes = treeObj.getSelectedNodes(true),
									v = "";
								for(var i = 0; i < nodes.length; i++) {
									v += nodes[i].menuId ;
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
			},
			///初始化接口树形图
			loadRestTree: function(event) {
				//自定义参数
				var req = {
					"cmdtype": "menu",
					"cmd": "treeRestList",
					"url": "/rest/sysuser"
				};
				//成功回调函数
				req.success = function(data) {
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
							onClick: function() {
								var treeObj = $.fn.zTree.getZTreeObj("treeDemoRest"),
									nodes = treeObj.getSelectedNodes(true),
									v = "";
								for(var i = 0; i < nodes.length; i++) {
									v += nodes[i].restId;
								}
								restList = v;
							}
						}
					};
					var zNodes = data.list
					var zTreeObj = $.fn.zTree.init($("#treeDemoRest"), setting, zNodes); //接口权限
				}
				//失败回调函数
				req.fail = function(retcode) {
					minAlert(retcode);
				}
				//调用
				$.ajaxPost(req);
			}
		},
		mounted: function(event) {
			this.loadTable();
		}
	})

})

/**
 * 提示
 */
function minAlert(info) {
	$.minAlert({
		ico: "error",
		delay: 2000,
		content: info
	});
}