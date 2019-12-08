$(function() {
	var t = new Vue({
        el: "#divMax",
        data: {
            isAdd: false,
            url: "/rest/activiti",
            //url: "//localhost/rest/activiti",
            recordIni:{proc_type:1},
            record:{},
            showRecords:[],
			records:[],

			//procContent: {} ,
            isDel: true,
            procTypes: {
                1: "通知",
                2: "审批",
                3: "举报",
                4: "支付"
            },
            status: {
                0: "草稿",
                1: "发布",
                2: "激活",
                3: "停用"
				},
			btnStatus:
				{
                    0:"发布",
                    1:"停用",
                    2:"停用",
                    3:"激活"
				},
            statusChng:{
                0:2,
                1:2,
                2:3,
				3:2
            }
		},
		methods: {
			loadTable: function(event) {
				var that = this;
				var reqOps = {
                    url: that.url,
                    "cmdtype": "manager",
					"cmd": "getActivitiTemplateList"
				};
                //成功回调函数
                reqOps.success = function (data) {
                    that.showRecords = data.list;
                    for (i = 0, len = data.list.length; i < len; i++) {
                        data.list[i].test_time = U.dateFormatString(data.list[i].test_time);
                    }
                    $("#tbody tr:first-child").addClass("warning").siblings("tr").removeClass("warning");
                    $("#tbody thead tr th").addClass("active");
                }
                reqOps.fail = function(retcode, retmsg) {
					minAlert(retmsg);
				}
				$.ajaxPost(reqOps);
			},
            ///显示新增弹框
            btnAdd: function (event) {
                this.record = this.recordIni;
                this.records = [this.record];
                this.isAdd = true;
                $("#proc_code").val("");
                $("#proc_file").val("");
                $("#addModal").modal();
            },
            btnEdit: function (event, r) {
                if (r.status > 0) {
                    alert("状态是草稿才可以修改！"+r.proc_id);
                    this.loadTable();
                    return;
                }

                this.record = $.extend({}, r);
                this.records = [this.record];
                this.isAdd = false;
                $("#addModal").modal();

            },


            uploadFile: function (event, r) {
                if (r.status > 0) {
                    alert("状态是草稿才可以修改！"+r.proc_id);
                    this.loadTable();
                    return;
                }
                this.record = $.extend({}, r);
                $("#proc_id").val(this.record.proc_id );
                $("#uploadFileModal").modal();
            },

            registerUploadFile: function (event) {

                var that = this;
                $('#userFormUpload').ajaxForm({
                    url: "/rest/uploadActiviti",
                    //url: "//localhost/rest/uploadActiviti",
                    method: 'post',
					dataType: "text",
					beforeSubmit: function(arr, $form, options) {

						var type = ['xml'];
						var errorAlert = function() {
							var msg = '文件类型只允许上传：' + type.join('、') + '。';
							layer.alert(msg, function(index) {
								layer.close(index);
							});
						};
						//alert(JSON.stringify(arr));
						for(var i in arr) {
							if(arr[i].name === 'filename') {
								var file = arr[i].value;
								var name = file.name;
								var lastDotIndex = name.lastIndexOf('.');
								if(lastDotIndex === -1 || lastDotIndex === name.length - 1) {
									errorAlert();
									return false;
								}
								var suffix = name.substring(lastDotIndex + 1);
								if(type.indexOf(suffix) === -1) {
									errorAlert();
									return false;
								}
							}
						}
					},
					success: function(data, textStatus, jqXHR, $form) {
						minAlert("文件上传成功");
						that.loadTable();
						$("#uploadFileModal").modal("hide");
					},
					error: function(XMLHttpRequest, textStatus, errorThrown) {}
				});

			},
            btnDel: function (event,r) {
                if (r.status > 0) {
                    alert("状态是草稿才可以删除！"+r.proc_id);
                    return;
                }
                this.isDel = true;
                this.record = $.extend({},r);
                //alert(JSON.stringify(r))
                $("#deleText").text("删除");
                $("#text").text("确定删除" + this.record.proc_id + "吗？")
                $("#delModal").modal();
            },
            ///确定删除
			deleteInfo: function(event) {

				var that = this;
				if(that.isDel){
                 	//自定义参数
                    var reqOps = {
                        cmdtype : "manager",
						"cmd": "removeActivitiTemplate",
						"url": "/rest/activiti",
						"data": {
							 proc_id : this.record.proc_id
						}
					};
					//成功回调函数
					reqOps.success = function(data) {
						$("#delModal").modal("hide");
                        that.loadTable();
					}
					//失败回调函数
					reqOps.fail = function(retcode, retmsg) {
						minAlert(retmsg);
					}
					//调用
					$.ajaxPost(reqOps);
				} else {
					//自定义参数
                    alert("modify status");
					var reqOps = {
                        "url": that.url,
                        "cmdtype": "manager",
						"cmd": "modifyActivitiStatus",
						"data": {
							"proc_id":  that.record.proc_id,
							"status": that.statusChng[that.record.status],
							"proc_code": that.record.proc_code
						}
					};
					reqOps.success = function(data) {
						$("#delModal").modal("hide");
						that.loadTable();
						$("#tbody tr").eq(0).addClass("warning").siblings("tr").removeClass("warning");
					} ;
					reqOps.fail = function(retcode, retmsg) {
						minAlert(retmsg);
					} ;
					$.ajaxPost(reqOps);
				}
            },
            ///发布
            modifyStatus: function (event, r) {
                this.isDel = false;
                this.record = $.extend({}, r);
                $("#text").text("确定发布吗？" + this.record.proc_id);
                $("#delModal").modal();
                event.stopPropagation();
            },
			// 确定修改保存内容
			btnSave : function(event) {
				var that = this;
                that.record.proc_code =$("#proc_code").val();
                that.record.proc_file =$("#proc_file").val();
                that.record.proc_type = $("#proc_type").val();
                that.record.proc_content =  null;
                var reqOps = {
                    url: that.url,
                    cmdtype: "manager",
                    cmd: that.isAdd ? "addActivitiTemplate" : "modifyActivitiTemplate",
                    data: that.record
                };
                reqOps.success = function (data) {
                	that.loadTable();
                    $("#addModal").modal("hide");
                }
                reqOps.fail = function(retcode) {
					minAlert(retcode);
				}
				$.ajaxPost(reqOps);
            },

            trClick: function (event, item) {
                $("#tbody tr ").each(function () {
                    $(this).bind("click", function () {
                        $(this).addClass("warning"); //当前行高亮
                        $(this).siblings("tr").removeClass("warning");
                    })
                })
            },

            btnEditFile: function (event, r) {
                if (r.status > 0) {
                    alert("状态是草稿才可以修改！"+r.proc_id);
                    this.loadTable();
                    return;
                }
                this.record = $.extend({}, r);
                var that=this;
                var reqOps = {
                    url: that.url,
                    cmdtype: "manager",
                    cmd:  "getActivitiTemplateById" ,
                    data: {
                        proc_id: that.record.proc_id
                	}
                };
                reqOps.success = function (data) {
                    that.record.proc_content = data.list[0].proc_content;
                    $("#editProc_content").val(that.record.proc_content );
                    $("#editFileModal").modal();
                }
                reqOps.fail = function(retcode) {
                    minAlert(retcode);
                }
                $.ajaxPost(reqOps);
            },

            btnSaveContent: function(event) {
                var that = this;
                //自定义参数
                var reqOps = {
                    url: that.url,
                    cmdtype: "manager",
                    cmd: "modifyActivitiTemplateContent",
                    data: {
                        "proc_id": that.record.proc_id,
                        "proc_content": $("#editProc_content").val(),
                    }
                }
                //成功回调函数
                reqOps.success = function(data) {
                    $("#editFileModal").modal("hide");
                }
                reqOps.fail = function(retcode) {
                    minAlert(retcode);
                }
                $.ajaxPost(reqOps);
            }

		},
		mounted: function(event) {
			this.loadTable();
			this.registerUploadFile();
		}
	});
})