var tab; //用户表
var role; //角色表

// EditeMenu(); //绑定删除，编辑、禁用点击事件
$(function () {
    var ta = new Vue({
        el: "#userBody",
        data: {
            url : "/rest/sysuser",
            userId : 0,
            searchUserName : "",
            isAdd : false,
            addRecordIni :[],
            editRecord :[],
            getUserList: [],
            getUserRoleList: [],

            statusList: {
                true: "正常",
                false: "禁用"
            },
            statusActionList: {
                true: "禁用",
                false: "启用"
            }

        },

        methods: {
            loadUserRoleList: function () {
                var self = this;
                var reqRole = {
                    "url": "/rest/sysuser",
                    cmdtype: "role",
                    cmd: "getUserRoleList",
                    "data": {
                        userId: self.userId
                    }
                };
                reqRole.success = function (data) {
                    self.getUserRoleList = data.list;
                    $("#RoleTable").find("tr").eq(0).addClass("bg-blue").siblings("tr").removeClass("bg-blue");

                }
                reqRole.fail = function (retcode) {
                    minAlert(retcode)
                }
                $.ajaxPost(reqRole);

            },
            showUserList: function () {
                var that = this;
                var reqOps = {
                    "url": "/rest/sysuser",
                    "cmdtype": "user",
                    "cmd": "getUserList",
                    "data": {
                        "userName": that.searchUserName
                    }
                };
                //成功回调函数
                reqOps.success = function (data) {
                    that.getUserList = data.list;
                    if (that.getUserList.length > 0) {
                        that.userId = that.getUserList[0].userId;
                        that.editRecord=that.getUserList[0];
                    }
                    that.loadUserRoleList();
                }
                //失败回调函数
                reqOps.fail = function (retcode) {
                    minAlert(retcode);
                }
                //调用
                $.ajaxPost(reqOps);

            },
            modifyStatus: function (event, item) {
                var that=this;
                var reqOps = {
                    url: this.url,
                    cmdtype: "user",
                    cmd: "setStatus",
                    data: {
                        userId: item.userId,
                        status: !item.status
                    }
                };
                reqOps.success = function (data) {
                    that.showUserList();
                }
                reqOps.fail = function (retcode) {
                    minAlert(retcode);
                }
                $.ajaxPost(reqOps);
            },

            btnDelUser: function (event, item) {
                this.editRecord=$.extend({},item);
                $("#text").html("确定删除吗?" + item.userId);
                $("#delModal").modal();
            },
            btnDelConfirm: function (event) {
                var that=this;
                var reqOps = {
                    url: that.url,
                    cmdtype: "user",
                    cmd: "deleteUserById",
                    data: {
                        userId: this.editRecord.userId
                    }
                };
                reqOps.success = function (data) {
                    $("#delModal").modal("hide");
                    that.showUserList();
                }
                reqOps.fail = function (retcode) {
                    minAlert(retcode);
                }
                $.ajaxPost(reqOps);
            },
            btnAddUser : function (event) {
                this.isAdd=true;
                this.editRecord=$.extend({},this.addRecordIni);
                $("#myModalUser").modal();
            },
            btnEditUser : function (event,item) {
                this.isAdd=false;
                this.editRecord=$.extend({},item);
                $("#myModalUser").modal();
            },
            btnSave: function (event) {
                var self=this;
                var reqOps = {
                    "url": "/rest/sysuser",
                    "cmdtype": "user",
                    "cmd": self.isAdd?"addUserInfo":"updateUserInfo",
                    "data": self.editRecord
                };
                //成功回调函数
                reqOps.success = function (data) {
                    self.showUserList( );
                    $("#myModalUser").modal("hide")
                }
                //失败回调函数
                reqOps.fail = function () {
                    minAlert(data.retmsg)
                }
                //调用
                $.ajaxPost(reqOps);
            },

            /**
             * 用户普通搜索  userName
             */
            btnSearchClick:function(event,isSearch) {
                if(!isSearch){
                    this.searchUserName="";
                }
                this.showUserList();
            },
            clickUser: function (event, item) {
                this.userId = item.userId;
                $(event.target).parent().addClass("bg-blue").siblings("tr").removeClass("bg-blue"); //当前行高亮显示，
                this.editRecord=$.extend({},item);
                this.loadUserRoleList();
            },
            clickRole: function (event, item) {
                //this.userId = item.userId;
                $(event.target).parent().addClass("bg-blue").siblings("tr").removeClass("bg-blue"); //当前行高亮显示
                //this.loadUserRoleList();
            },
            saveUserRole : function (event) {

                roleIds  = [];
                for(var i=0;i<this.getUserRoleList.length;i++){
                    if(this.getUserRoleList[i].isSelect) {
                        roleIds.push(this.getUserRoleList[i].roleId);
                    }
                }
                var reqOps = {
                    url: this.url,
                     cmdtype : "role" ,
                     cmd : "saveUserRole",
                     data : {
                        userId: this.userId,
                        roleId: roleIds.join(","),
                        createBy: 0
                    }
                };
                reqOps.success = function (data) {
                    minAlert("保存成功");
                }
                reqOps.fail = function (retcode) {
                    minAlert(retcode)
                }
                $.ajaxPost(reqOps);
            }
        },

        mounted: function (event) {
            this.showUserList();
        }

    });
    // $("#checkInput").click(function () {
    //     checkAll(checkInput, RoleTable)
    // })
})



