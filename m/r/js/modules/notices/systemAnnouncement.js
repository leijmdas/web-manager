$(function(){
    var vm = new Vue({
        el: "#app",
        data: {
            items: [],
            showList: true,
            sysNoticesRecord:{},
            title:null,
            q:{title:null},
            messageType: {
                1:"系统通知",
                2:"系统公告",
                3:"私信",
            },
        },
        mounted:function(){
            this.getSysNoticesData();
        },
        methods: {
            getSysNoticesData:function(){
                var self = this;
                var reqOps = {
                    url: U.admin_domain+"/rest/sysNotices/notices",
                    cmdtype: "systemNotices",
                    cmd: "getSysNoticesList",
                    data: {
                        currPage: 1,
                        pageSize: 5,
                        title:self.q.title,
                        type:2
                    }
                };
                //响应结果
                reqOps.success = function(data) { //成功回调函数
                    self.items=data.list.list;
                    var count=data.list.totalCount;//总页数
                    layui.use(['laypage', 'layer'], function(){
                        var laypage = layui.laypage;
                        laypage.render({
                            elem: 'pageTable'
                            ,count: count,
                            limit:5
                            ,layout: ['count', 'prev', 'page', 'next', 'limit', 'refresh', 'skip']
                            ,jump: function(obj,first){
                                var reqOps = {
                                    url: U.admin_domain+"/rest/sysNotices/notices",
                                    cmdtype: "systemNotices",
                                    cmd: "getSysNoticesList",
                                    data: {
                                        type:2,
                                        currPage: obj.curr,
                                        pageSize: obj.limit,
                                        title:self.q.title,
                                    }
                                };
                                reqOps.success = function(data) {
                                    Vue.set(vm,'items', data.list.list);
                                }
                                reqOps.fail = function(retcode) {
                                    alert(retcode)
                                }
                                $.ajaxPost(reqOps);
                            }
                        });
                    });
                    $('#restBtn').click(function(){
                        layer.closeAll();
                    });
                    layui.use('element', function() {
                        var element = layui.element;
                        //监听导航点击
                        element.on('nav(pageTable)', function(elem) {
                        });
                    });
                }
                reqOps.fail = function(retcode) { //失败回调函数
                    alert(retcode)
                }
                $.ajaxPost(reqOps); //调用
            },
            add:function(){
                vm.showList = false;
                vm.title = "新增";
                vm.sysNoticesRecord = {};
            },
            update: function (userId) {
                vm.showList = false;
                vm.title = "修改";
                vm.toUpdateSysNotices(userId);
            },
            saveOrUpdate:function(){
                var cmd = vm.sysNoticesRecord.id == null ? "addSysNotices" : "updateSysNotices";
                var reqOps = {
                    url: U.admin_domain+"/rest/sysNotices/notices",
                    cmdtype: "systemNotices",
                    cmd: cmd,
                    data: JSON.stringify(vm.sysNoticesRecord),
                };
                reqOps.success = function(data) {
                    vm.showList=true;
                    vm.getSysNoticesData();
                }
                reqOps.fail = function(retcode) {
                    minAlert(retcode)
                }
                $.ajaxPost(reqOps);
            },
            del: function (id) {
                layer.confirm('确定要删除改记录？', function(){
                    var reqOps = {
                        url: U.admin_domain+"/rest/sysNotices/notices",
                        cmdtype: "systemNotices",
                        cmd: "deleteSysNotices",
                        data: {
                            id: id
                        }
                    };
                    reqOps.success = function(data) {
                        vm.showList=true;
                        vm.getSysNoticesData();
                    }
                    reqOps.fail = function(retcode) {
                        alert(retcode)
                    }
                    $.ajaxPost(reqOps);
                });
            },
            reload: function () {
                vm.showList = true;
                vm.getSysNoticesData();
            },
            //去修改
            toUpdateSysNotices:function(id){
                var reqOps = {
                    url: U.admin_domain+"/rest/sysNotices/notices",
                    cmdtype: "systemNotices",
                    cmd: "getSysNoticeById",
                    data: {
                        id: id
                    }
                };
                reqOps.success = function(data) {
                    vm.sysNoticesRecord=data.list;
                }
                reqOps.fail = function(retcode) {
                    alert(retcode)
                }
                $.ajaxPost(reqOps);
            },
            clickTr: function(event) {
                $(event.target).parent().siblings("tr").removeClass("bg-blue");
                $(event.target).parent().addClass("bg-blue");
            },
        },
    });
})