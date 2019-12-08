var dataN = [];
var taskId = "";
var textInfo = "通过";
$(function() {
	var t = new Vue({
		el: "#divMax",
		data: {
			tableList: {},
			personalRealInfo: {}
		},
		methods: {
			///操作按钮
			dd: function(value, row, index) {
				var html = "";
				if(row.taskStat == 0) {
					html = '<button type="button" class="RoleOfA btn btn-primary  btn-sm " style="margin-right:15px;">认领</button>'
				} else if(row.taskStat == 1) {
					html = '<button type="button" class="RoleOfEdit btn btn-primary  btn-sm" style="margin-right:15px;">审核</button>'
				} else if(row.taskStat == 2 || row.taskStat == 3) {
					html = '<button type="button" class="RoleOfEdit btn btn-active  btn-sm" style="margin-right:15px;" disabled="">审核</button>'
				}
				return html;
			},
			///加载表格信息
			refLoadTable: function(event) {
				var objectType = "";
				if(window.location.href.indexOf("PersonalRealName.html") > 0) { //个人
					objectType = 11;
				} else if(window.location.href.indexOf("EnterpriseQualification.html") > 0) { //企业
					objectType = 12;
				}
				//自定义参数
				var reqOp = {
					"cmdtype": "tasklog",
					"cmd": "getTaskLogTaskList",
					"url": "/rest/taskLog_task",
					"data": {
						"object_type": objectType,
						"userId": 1
					}
				};
				reqOp.success = function(data) {
					taskId = data.list[0].taskId;
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
				var objectType = "";
				if(window.location.href.indexOf("PersonalRealName.html") > 0) { //个人
					objectType = 11;
				} else if(window.location.href.indexOf("EnterpriseQualification.html") > 0) { //企业
					objectType = 12;
				}
				//自定义参数
				var reqOps = {
					"cmdtype": "tasklog",
					"cmd": "getTaskLogTaskList",
					"url": "/rest/taskLog_task",
					"data": {
						"object_type": objectType,
						"userId": 1
					}
				};
				//成功回调函数
				reqOps.success = function(data) {
					dataN = data.list;
					$('#reportTable').bootstrapTable({
						//method: 'get',
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
						columns: [{
								field: "taskId",
								title: "ID",
								align: "center",
								valign: "middle",
								sortable: "true"
							},
							{
								field: "userName",
								title: "用户名称",
								align: "center",
								valign: "middle",
								sortable: "true"
							},
							{
								field: "mobile",
								title: "手机号",
								align: "center",
								valign: "middle",
								sortable: "true"
							},
							{
								field: "applicationtime",
								title: "申请时间",
								align: "center",
								valign: "middle",
								sortable: "true"
							},
							{
								field: "taskStat",
								title: "审核意见",
								align: "center",
								valign: "middle",
								sortable: "true"
							},
							{
								field: "taskStat",
								title: "审核状态",
								align: "center",
								valign: "middle",
								sortable: "true",
								formatter: function(value, row, index) { //(0未受理 1已受理 2.审核通过 3已拒绝)
									var info = "";
									switch(value) {
										case 0:
											info = "未受理";
											return info;
											break;
										case 1:
											info = "已受理";
											return info;
											break;
										case 2:
											info = "审核通过";
											return info;
											break;
										case 3:
											info = "已拒绝";
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
								field: "userstatus_end_btn",
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

						},
						//点击表格行的事件
						onClickRow: function(row, $element) {
							$($element).addClass('warning').siblings("tr").removeClass("warning"); //添加class
							taskId = row.taskId;
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
						$('#reportTable').bootstrapTable('resetView');
					})
				}
				//失败回调函数
				reqOps.fail = function(retcode, retmsg) {
					minAlert(retmsg);
				}
				//调用
				$.ajaxPost(reqOps);
			},
			///通过
			btnPassThrough: function(event) {
				$("#text").html("确认通过该用户认证吗？");
				$("#TrueModal").modal("show");
			},
			///拒绝
			refuse: function(event) {
				$("#refuseModal").modal();
			},
			///确定拒绝
			btnRefuseTrue: function(event) {
				textInfo = $("#info").val();
				var that = this;
				//自定义参数
				var reqOp = {
					"cmdtype": "tasklog",
					"cmd": "approval",
					"url": "/rest/taskLog_task",
					"data": {
						"taskId": taskId,
						"task_remark": textInfo,
						"task_stat": 2
					}
				};
				reqOp.success = function(data) {
					$("#refuseModal").modal("hide"); //隐藏
					$("#myModalAuditing").modal("hide"); //隐藏
					that.refLoadTable();
				} //失败回调函数
				reqOp.fail = function(retcode, retmsg) {
					minAlert(retmsg);
				}
				//调用
				$.ajaxPost(reqOp);
			},
			//确定认领、通过
			btnTrue: function(event) {
				alert("dj")
				var that = this;
				if($("#text").text().trim() == "确定认领吗？") {
					//自定义参数
					var reqOp = {
						"cmdtype": "tasklog",
						"cmd": "claimTask",
						"url": "/rest/taskLog_task",
						"data": {
							"taskId": taskId,
							"userId": 1
						}
					};
					reqOp.success = function(data) {
						minAlert("认领成功");
						$("#TrueModal").modal("hide");
						that.refLoadTable();
					} //失败回调函数
					reqOp.fail = function(retcode, retmsg) {
						minAlert(retmsg);
					}
					//调用
					$.ajaxPost(reqOp);
				} else if($("#text").text().trim() == "确认通过该用户认证吗？") {
					//自定义参数
					var reqOp = {
						"cmdtype": "tasklog",
						"cmd": "approval",
						"url": "/rest/taskLog_task",
						"data": {
							"taskId": taskId,
							"task_remark": textInfo,
							"task_stat": 2
						}
					};
					reqOp.success = function(data) {
						$("#myModalAuditing").modal("hide"); //隐藏
						$("#TrueModal").modal("hide");
						that.refLoadTable();
					} //失败回调函数
					reqOp.fail = function(retcode, retmsg) {
						minAlert(retmsg);
					}
					//调用
					$.ajaxPost(reqOp);
				}

			},
		},
		mounted: function(event) {
			this.$options.methods.loadTable()
		}
	});
	window.operateEvents = {
		'click .RoleOfA': function(e, value, row, index) {
			$("#text").html("确定认领吗？")
			$("#TrueModal").modal();
		},
		//审核
		'click .RoleOfEdit': function(e, value, row, index) {

			//自定义参数
			var reqOp = {
				"cmdtype": "tasklog",
				"cmd": "getTaskLogTaskById",
				"url": "/rest/taskLog_task",
				"data": {
					"taskId": row.taskId
				}
			};
			reqOp.success = function(data) {
				t.personalRealInfo = data.list;
				$("#myModalAuditing").modal();
			} //失败回调函数
			reqOp.fail = function(retcode, retmsg) {
				minAlert(retmsg);
			}
			//调用
			$.ajaxPost(reqOp);
		}
	};
})