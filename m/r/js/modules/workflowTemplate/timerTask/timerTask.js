
    $(function () {
    var t = new Vue({
        el: "#taskTimerBody",
        data: {
            //url: "//localhost/rest/taskLog_task",
            url: "/rest/taskLog_task",
            isTabPageIndex0 : true ,
            cmdtype: "tasklogTimer",
            cmdExeOnce: "exeOnceTaskLogTimer",
            //cmdExeTimer : "exeOnceTaskLogTimer",
            isSelect: false,
            subsysIdSelect:0,
            subsysList: {},
            recordIni: {
                exeType: 1,
                params: "",
                exeFirstday: 1,
                exePeriod: 1,
                exeTime: "00:00",
                retryTimes: 3,
                subsysId: 1
            },
            recordEdit: $.extend({}, this.recordIni),//新增修改
            taskList: [],
            taskListAll: [],
            taskListPublished: [],
            runStatusList: [],
            status: {
                0: "0--草稿",
                1: "1--发布",
                2: "2--停用"
            },
            statusChng: {
                0: 1,
                1: 2,
                2: 1
            },
            statusBtnCaption: {
                0: "发布",
                1: "停用",
                2: "发布"
            },
            exeTypes: {
                1: "1--JAVA类",
                2: "2--REST接口",
                3: "3--SQL语句"
            }
        },

        methods: {
            btnAction: function (event, cmd, data) {
                var that = this;
                var reqOps = {
                    url: this.url,
                    cmdtype: this.cmdtype,
                    cmd: cmd,
                    data: data
                }
                reqOps.success = function (data) {
                    that.loadTable();
                    if (cmd == "queryStatus") {
                        that.runStatusList = data.list[0];
                    } else if (cmd == "stopJob" || cmd == "startJob") {
                        that.btnRefreshAll(event);
                    }
                }
                reqOps.fail = function (retcode, retmsg) {
                    minAlert(retmsg);
                }
                $.ajaxPost(reqOps);
            },
            btnStartSch: function (event, item) {
                this.btnAction(event, "startSch", {});
                this.btnStartJobAll(event);
            },
            btnStopSch: function (event, item) {
                this.btnStopJobAll(event);
                this.btnAction(event, "stopSch", {});
            },
            btnStartStopJob: function (event, item) {
                var cmd = this.runStatusList[item.taskId] ? "stopJob" : "startJob";
                this.btnAction(event, cmd, {taskId: item.taskId});
            },

            btnRefreshAll: function (event) {
                this.btnAction(event, "queryStatus", {});
            },
            btnExeOnce: function (event, item) {
                this.btnAction(event, this.cmdExeOnce, {taskId: item.taskId});
            },
            btnStartJob: function (event, item) {
                var cmd = "startJob";
                this.btnAction(event, cmd, {taskId: item.taskId});
            },
            btnStopJob: function (event, item) {
                var cmd = "stopJob";
                this.btnAction(event, cmd, {taskId: item.taskId});
            },

            btnDoAll: function (event,fnName) {
                var that = this;
                count = 0;
                for (var i = 0; i < that.taskList.length; i++) {
                    if (that.taskList[i].isSelect) {
                        if (that.subsysIdSelect == 0 || that.subsysIdSelect == that.taskList[i].subsysId) {
                            count++;
                            fnName(event, that.taskList[i]);
                        }
                    }
                }
                if (count == 0) {
                    alert("请选择任务!");
                }
            },
            btnStartJobAll: function (event) {
                this.btnDoAll(event, this.btnStartJob);
            },
            btnStopJobAll: function (event) {
                this.btnDoAll(event, this.btnStopJob);

            },
            btnExeAll: function (event) {
                this.btnDoAll(event, this.btnExeOnce);
            },

            btnModifyStatus: function (event, item) {
                this.btnAction(event, "modifyStatus", {
                    taskId: item.taskId,
                    status: this.statusChng[item.status]
                });
            },
            loadTable: function (event) {
                var that = this;
                var reqOps = {
                    url: this.url,
                    cmdtype: this.cmdtype,
                    cmd: "getTaskLogTimerList",
                    data: {}
                };
                reqOps.success = function (data) {
                    that.taskListAll = data.list;
                    if( that.isTabPageIndex0 ) {
                        that.taskList = $.extend([], that.taskListAll);
                        for (var i = 0; i < that.taskList.length; i++) {
                            that.taskList[i].isSelect = false;
                        }
                    } else {
                        that.taskListPublished = [];
                        for (var i = 0; i < that.taskListAll.length; i++) {
                            if (that.taskListAll[i].status == 1) {
                                that.taskListPublished.push(that.taskListAll[i])
                            }
                        }
                        that.taskList = $.extend([], that.taskListPublished);
                        for (var i = 0; i < that.taskList.length; i++) {
                            that.taskList[i].isSelect = that.isSelect;
                        }
                    }
                    U.sortByTitle(that.taskList);
                }
                reqOps.fail = function(retcode, retmsg) {
                    minAlert(retmsg);
                }
                $.ajaxPost(reqOps);
            },
            //显示新增模态框
            btnAdd: function (event) {
                this.isAdd = true;
                $("#myModalList").text("新增定时任务");
                this.recordEdit = $.extend({}, this.recordIni),//新增修改
                    $("#myModalAdd").modal();

            },
            btnEdit: function (event, item) {
                this.isAdd = false;
                $("#myModalList").text("修改定时任务");
                this.recordEdit = $.extend({}, item);
                $("#myModalAdd").modal();
            },

            ///显示删除框
            btnDel: function (event, item) {
                this.recordEdit = $.extend({},item);
                $("#text").html("确定删除" + this.recordEdit.taskId + "吗？");
                $("#delModal").modal();
            },
            ///确定删除
            btnDeleteConfirm: function (event) {
                var that = this;

                var reqOps = {
                    url: this.url,
                    cmdtype: this.cmdtype,
                    cmd: "delTaskLogTimer",
                    data: {
                        taskId: that.recordEdit.taskId
                    }
                };
                reqOps.success = function (data) {
                    $("#delModal").modal("hide"); //隐藏新增模态框
                    that.loadTable();
                }
                reqOps.fail = function (retcode, retmsg) {
                    minAlert(retmsg);
                }
                $.ajaxPost(reqOps);
            },
            ///新增、修改提交内容
            btnSave: function (event) {
                var that = this;
                //自定义参数
                var reqOps = {
                    url: that.url,
                    cmdtype: that.cmdtype,
                    cmd: that.isAdd ? "addTaskLogTimer" : "modifyTaskLogTimer" ,
                    data: that.recordEdit
                };
                reqOps.success = function (data) {
                    $("#myModalAdd").modal("hide"); //隐藏新增模态框
                    that.loadTable();
                }

                reqOps.fail = function (retcode, retmsg) {
                    minAlert(retmsg);
                }
                $.ajaxPost(reqOps);
            },


            onchangeSelectAll:function(event){
                for (var i = 0; i < this.taskList.length; i++) {
                    this.taskList[i].isSelect = !this.isSelect;
                }
            },

            clickTr: function(event) {
                $(event.target).stopPropagation
                var that = this;
                $(event.target).parent().addClass("warning").siblings("tr").removeClass("warning"); //当前行高亮显示，

            },
            clickSort: function(event,sortF){
                U.clickTitleSort(event,sortF);
                this.loadTable();
            },
            isTabPageIndex: function (event, isTrue) {
                this.isTabPageIndex0 = isTrue;
                this.loadTable()
            }
        },
        mounted: function (event) {
            this.subsysList = {};
            U.getSubSysDictList(this.subsysList);
            //this.loadTable()
            this.btnRefreshAll();
        }
    });


})

