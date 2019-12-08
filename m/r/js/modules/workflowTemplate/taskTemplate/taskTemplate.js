var dataTableHot;
var templateId = ""; //策略id
var templateIndex = "";
var dataN = [];
$(function() {
	var t = new Vue({
		el: "#divMax",
		data: {
			tableList: {}, //新增修改
			tableInfo: {}, //查看信息
			templateType: 0, //控制策略类型
			objectType:0,//控制任务内容类别
			templateTypeList: [{//策略类型
					value: 0,
					text: "通用"
				},
				{
					value: 1,
					text: "通知"
				},
				{
					value: 2,
					text: "审核"
				},
				{
					value: 3,
					text: "支付"
				},
				{
					value: 4,
					text: "举报"
				},
				{
					value: 5,
					text: "信用评价"
				}
			],  
			objectTypeList: [ //任务内容类别
				{
					value: 0,
					text: "通用"
				},
				{
					value: 1,
					text: "user用户资料表"
				},
				{
					value: 2,
					text: "project项目发布"
				},
				{
					value: 3,
					text: "document项目文档"
				},
				{
					value: 4,
					text: "report举报"
				},
				{
					value: 5,
					text: "pay支付"
				}
			]
		},
		methods: {
			///操作按钮
			dd: function(value, row, index) {
				return [
					'<button type="button" class="RoleOfEdit btn btn-primary  btn-sm">查看</button>'
				].join('');
			},
			///加载表格信息
			refLoadTable: function(event) {
				//自定义参数
				var reqOp = {
					"cmdtype": "tasklog",
					"cmd": "getTemplatePolicyList",
					"url": "/rest/taskLog_task"
				};
				reqOp.success = function(data) {
					templateId = data.list[0].templateId;
					$("#reportTable").bootstrapTable("load", data.list);
				} //失败回调函数
				reqOp.fail = function(retcode, retmsg) {
					minAlert(retmsg);
				}
				//调用
				$.ajaxPost(reqOp);
			},
			loadTable: function(event) {
				var that = this;
				//自定义参数
				var reqOps = {
					"cmdtype": "tasklog",
					"cmd": "getTemplatePolicyList",
					"url": "/rest/taskLog_task"
				};
				//成功回调函数
				reqOps.success = function(data) {
                    for (i = 0, len = data.list.length; i < len; i++) {
                        data.list[i].createTime = U.dateFormatString(data.list[i].createTime);
                    }
                    dataN = [];
					dataN = data.list;
					templateId = data.list[0].templateId;
					$('#reportTable').bootstrapTable({
						cache: false,
						height: 750,
						striped: false, //隔行变色
						pagination: true,
						pageSize: 20,
						pageNumber: 1,
						pageList: [10, 20, 50, 100, 200, 500],
						search: true,
						showColumns: true,
						showRefresh: true,
						showExport: true,
						exportTypes: ['csv', 'txt', 'xml'],
						search: true,
						clickToSelect: true,
						toolbar: '#toolbar',
						showLoading: true,
						onLoadSuccess: function(data) {
							dataN = data.list;
						},
						columns: [{
								field: "templateId",
								title: "ID",
								align: "center",
								valign: "middle",
								sortable: "true",
								color: "#cccccc",
								visible: false
							},
							{
								field: "templateName",
								title: "策略名称",
								align: "center",
								valign: "middle",
								sortable: "true"
							},
							{
								field: "templateType",
								title: "策略类型",
								align: "center",
								valign: "middle",
								sortable: "true",
								formatter: function(value, row, index) { //0:通用1:通知2审核3支付4举报5信用评价
									var info = "";
									switch(value) {
										case 0:
											info = "通用";
											return info;
											break;
										case 1:
											info = "通知";
											return info;
											break;
										case 2:
											info = "审核";
											return info;
											break;
										case 3:
											info = "支付";
											return info;
											break;
										case 4:
											info = "举报";
											return info;
											break;
										case 5:
											info = "信用评价";
											return info;
											break;
										default:
											info = "";
											break;
											return info;
									}
								}
							},
							{
								field: "objectType",
								title: "任务内容类别",
								align: "center",
								valign: "middle",
								sortable: "true",
								formatter: function(value, row, index) { //0: 通用 1: user用户资料表 2: project项目发布 3: document项目文档 4: report举报 5: pay支付 
									var info = "";
									switch(value) {
										case 0:
											info = "通用";
											return info;
											break;
										case 1:
											info = "user用户资料表";
											return info;
											break;
										case 2:
											info = "project项目发布";
											return info;
											break;
										case 3:
											info = "document项目文档";
											return info;
											break;
										case 4:
											info = "report举报";
											return info;
											break;
										case 5:
											info = "pay支付 ";
											return info;
											break;
										default:
											info = "";
											break;
											return info;
									}
								}
							},
							{
								field: "templateClass",
								title: "模板策略类",
								align: "center",
								valign: "middle",
								sortable: "true",	 
							},
							{
								field: "pageUrl",
								title: "受理策略页面url",
								align: "center",
								valign: "middle",
								sortable: "true"
							},
							{
								field: "createTime",
								title: "创建时间",
								align: "center",
								valign: "middle",
								sortable: "true"
							},
							{
								title: "操作",
								align: "center",
								valign: "middle",
								sortable: "true",
								events: "operateEvents",
								formatter: that.dd
							}
						],
						data: dataN,
						onPageChange: function(size, number) {
							//$("#pageSizeInput").val(size);
							//$("#pageNumberInput").val(number);

							//var form = $('#tableForm');
							//form.action= '${base}/showReport';
							//form.submit();
						},
						//点击表格行的事件
						onClickRow: function(row, $element) {
							$($element).addClass('warning').siblings("tr").removeClass("warning"); //添加class
							templateId = row.templateId;
						},
						///	点击刷新按钮后触发。
						onRefresh: function(event) {
							that.refLoadTable();
						},
						///表格加载完成后
						onPostBody: function(event) {
							$("#reportTable thead tr th").addClass("active"); //表头颜色
							$("#reportTable tbody tr:first-child").addClass("warning");
						},
						formatNoMatches: function() {
							return '无符合条件的记录';
						}
					});
					$(window).resize(function() {
						dataTableHot = $('#reportTable').bootstrapTable('resetView');
					});
				}
				//失败回调函数
				reqOps.fail = function(retcode, retmsg) {
					minAlert(retmsg);
				}
				//调用
				$.ajaxPost(reqOps);
			},
			//显示新增模态框
			add: function(event) {
				$("#myModalList").text("新增任务模板 ");
				t.tableList = [{
					"templateId": "",
					"templateType": 0,
					"templateName": "",
					"objectType": 0,
					"createTime": "",
					"templateClass": 0,
					"pageUrl": "",
					"createBy": ''
				}];
				t.templateType = 0; //控制策略类型
				t.objectType = 0; //通知类型
				$("#templateName").val(""); //清空策略名称
				$("#templateType").find("option:eq(0)").attr("selected", "selected"); //清空策略类型
				$("#objectType").find("option:eq(0)").attr("selected", "selected"); //清空任务内容类别
				$("#templateClass").val(""); //清空模板类型
				$("#pageUrl").val(""); //清空受理页面url
				$("#myModalAdd").modal();

			},
			//显示修改模态框
			edit: function(event) {
				$("#myModalList").text("修改任务模板");
				//自定义参数
				var req = {
					"cmdtype": "tasklog",
					"cmd": "getTemplatePolicy",
					"url": "/rest/taskLog_task",
					"data": {
						"templateId": templateId
					}
				};
				//成功回调函数
				req.success = function(data) {
					t.tableList = data.list;
					t.objectType = data.list[0].objectType;
					t.templateType = data.list[0].templateType;
					$("#myModalAdd").modal();
				}
				//失败回调函数
				req.fail = function(retcode, retmsg) {
					minAlert(retmsg);
					$("#myModalAdd").modal("hide"); //隐藏修改框
				}
				//调用
				$.ajaxPost(req);
			},
			///显示删除框
			del: function(event) {
				$("#delModal").modal();
			},
			///确定删除
			btnDeletePolicy: function(event) {
				var that = this;
				//自定义参数
				var reqOps = {
					"cmdtype": "tasklog",
					"cmd": "delTemplatePolicy",
					"url": "/rest/taskLog_task",
					"data": {
						"templateId": templateId
					}
				};
				//成功回调函数
				reqOps.success = function(data) {
					$("#delModal").modal("hide"); //隐藏新增模态框
					that.refLoadTable();
				}
				//失败回调函数
				reqOps.fail = function(retcode, retmsg) {
					minAlert(retmsg);
				}
				//调用
				$.ajaxPost(reqOps);
			},
			///新增、修改提交内容
			btnPassThrough: function(event) {
				var that = this;
				var cmd = "";
				var d = {};
				if($("#myModalList").text().trim() == "修改任务模板") {
					cmd = "modifyTemplatePolicy";
					d = {
						"templateId": templateId,
						 "templateType": $("#templateType").find("option:checked").val(),
						"templateName": $("#templateName").val(),
						"templateClass": $("#templateClass").val(),
						"pageUrl": $("#pageUrl").val(),
						"objectType": $("#objectType").find("option:checked").val()
					};
				} else if($("#myModalList").text().trim() == "新增任务模板") {
					cmd = "addTemplatePolicy";
					d = {
						"templateType": $("#templateType").find("option:checked").val(),
						"templateName": $("#templateName").val(),
						"templateClass": $("#templateClass").val(),
						"pageUrl": $("#pageUrl").val(),
						"objectType": $("#objectType").find("option:checked").val()
					};
				}
				//自定义参数
				var reqOps = {
					"cmdtype": "tasklog",
					"cmd": cmd,
					"url": "/rest/taskLog_task",
					"data": d
				};
				//成功回调函数
				reqOps.success = function(data) {
					$("#myModalAdd").modal("hide"); //隐藏新增模态框
					that.refLoadTable();
				}
				//失败回调函数
				reqOps.fail = function(retcode, retmsg) {
					minAlert(retmsg);
				}
				//调用
				$.ajaxPost(reqOps);
			},
			//点击查看模态框内的修改弹出修改框
			btnedit: function(event) {
				var that = this;
				$("#lookModal").modal("hide");
				that.edit();
			},
		},
		mounted: function(event) {
			this.$options.methods.loadTable();
		}
	});
	window.operateEvents = {
		//查看
		'click .RoleOfEdit': function(e, value, row, index) {
						$("#lookModal").modal();
			//自定义参数
			var reqOp = {
				"cmdtype": "tasklog",
					"cmd": "getTemplatePolicy",
					"url": "/rest/taskLog_task",
					"data": {
						"templateId": row.templateId
					}
			};
			reqOp.success = function(data) {

				t.templateType=data.list[0].templateType;
				t.objectType=data.list[0].objectType;
				t.tableInfo = data.list;
					
			} //失败回调函数
			reqOp.fail = function(retcode, retmsg) {
				minAlert(retmsg);
			}
			//调用
			$.ajaxPost(reqOp);

		}
	};
})