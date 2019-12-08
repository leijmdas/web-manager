$(function () {
    var vue = new Vue({
        el: "#cacheBody",
        data: {
            cachedTableList:[],
            //admin_url: "//localhost/rest/context",
            admin_url: "/rest/context",
            project_url: "//project.youtobon.com/rest/context",
            bangbang_url: "//bangbang.youtobon.com/rest/context",
            url_metadata : "http:/rest/sysmetadata"
        },
        methods: {
            getCachedTableList: function () {
                var self  = this;
                var reqOps = {
                    url: self.url_metadata,
                    cmdtype: "metadata",
                    cmd:  "getCachedTableList",
                    data: {}
                };

                reqOps.success = function (data) {
                    self.cachedTableList = data.list;
                }
                reqOps.fail = function (retcode) {
                    minAlert(retcode);
                }
                $.ajaxPost(reqOps);
            },

            refreshContext: function (event,cmd,url,data) {
                var reqOps = {
                    url: url,
                    cmdtype: "cacheManager",
                    cmd: cmd,
                    data: data
                };

                reqOps.success = function (data) {
                }
                reqOps.fail = function (retcode) {
                    minAlert(retcode)
                }
                $.ajaxPost(reqOps);
            },

            refreshConfig1: function (event) {
                this.refreshContext(event,"refreshConfig",this.admin_url);
            },
            refreshConfig2: function (event) {
                this.refreshContext(event,"refreshConfig",this.project_url);
            },
            refreshConfig3: function (event) {
                this.refreshContext(event,"refreshConfig",this.bangbang_url);
            },
            refreshErrorCode1: function (event) {
                this.refreshContext(event, "refreshErrorCode", this.admin_url);
            },
            refreshErrorCode2: function (event) {
                this.refreshContext(event, "refreshErrorCode", this.project_url);
            }, refreshErrorCode3: function (event) {
                this.refreshContext(event, "refreshErrorCode", this.bangbang_url);
            },
            clearSubsys1: function (event) {
                this.refreshContext(event, "refreshTable", this.admin_url,{tableName:'subsys_dict'});
            },
            clearSubsys2: function (event) {
                this.refreshContext(event, "refreshTable", this.project_url,{tableName:'subsys_dict'});
            },
            clearSubsys3: function (event) {
                this.refreshContext(event, "refreshTable", this.bangbang_url,{tableName:'subsys_dict'});
            },
            clearSession1: function (event) {
                this.refreshContext(event, "clearSessionTimeout", this.admin_url);
            },
            clearSession2: function (event) {
                this.refreshContext(event, "clearSessionTimeout", this.project_url);

            },clearSession3: function (event) {
                this.refreshContext(event, "clearSessionTimeout", this.bangbang_url);

            },
            refreshUserRight1: function (event) { //刷新用户权限
                this.refreshContext(event, "refreshUser", this.admin_url);

            },
            refreshUserRight2: function (event) { //刷新用户权限
                this.refreshContext(event, "refreshUser", this.project_url);
            },
            refreshUserRight3: function (event) { //刷新用户权限
                this.refreshContext(event, "refreshUser", this.bangbang_url);
            },
            refreshAll1: function (event) { //刷新用户权限
                this.refreshContext(event, "refreshAll", this.admin_url);

            },
            refreshAll2: function (event) { //刷新用户权限
                this.refreshContext(event, "refreshAll", this.project_url);
            },refreshAll3: function (event) { //刷新用户权限
                this.refreshContext(event, "refreshAll", this.bangbang_url);
            },
            clearTagFuncion1: function (event) {
                this.refreshContext(event, "refreshTable", this.admin_url,{tableName:'tag_function'});
            },
            clearTagFuncion2: function (event) {
                this.refreshContext(event, "refreshTable", this.project_url,{tableName:'tag_function'});
            },
            clearTagFuncion3: function (event) {
                this.refreshContext(event, "refreshTable", this.bangbang_url,{tableName:'tag_function'});
            },
            clearSystable1: function (event,tabl) {
                this.refreshContext(event, "refreshTable", this.admin_url,{tableName:tabl});
            },
            clearSystable2: function (event,tabl) {
                this.refreshContext(event, "refreshTable", this.project_url,{tableName:tabl});
            },
            clearSystable3: function (event,tabl) {
                this.refreshContext(event, "refreshTable", this.bangbang_url,{tableName:tabl});
            },
            loadTable: function () { // 页面加载之后初始化表格内容
                var reqOps = {};
                reqOps.success = function (data) { //成功回调函数
                }
                reqOps.fail = function (retcode) { //失败回调函数
                    minAlert(retcode)
                }
                $.ajaxPost(reqOps); //调用
            },
            clickTr: function(event) {
                //$(event.target).stopPropagation
                var that = this;
                $(event.target).parent().addClass("bg-blue").siblings("tr").removeClass("bg-blue"); //当前行高亮显示，

            }
        },
        mounted: function (event) { // 页面加载之后初始化表格内容
            //this.loadTable();
            this.getCachedTableList();
        }
    });
})