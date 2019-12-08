$(function(){
    var vm = new Vue({
        el: "#userPlatformBody",
        data: {
            url: U.admin_domain + "/rest/pfUser/platformUserManager",
            userData:[],
            userRecord:"",
            companyData:[],
            companyRecord:"",
            userStatus:{
                0:'已启用',
                1:'已禁用'
            },
            q:{
                nickName:null,
            },
            showUserInfo:true,
            showCompanyInfo:true,
            showBtnList:true,
            blackFlag:true,
            showUserBlack:true,
            userBlackData:[]
        },
        mounted:function(){
            this.loadUser();
        },
        methods: {
            loadUser:function(){//加载用户列表
                var that = this;
                that.blackFlag = true;
                $("#userDiv").show();
                $("#companyDiv").hide();
                $("#userBla").hide();//隐藏用户黑明单
                var reqOps = {
                    url: that.url,
                    cmdtype: "platformUserManager",
                    cmd: "getPlatformUser",
                    data: {
                        currPage: 1,
                        pageSize: 10,
                        nickName:that.q.nickName
                    }
                };
                reqOps.success = function (data) {
                    //成功回调函数
                    that.userData=data.list.list;
                    var count=data.list.totalCount;//总页数
                    layui.use(['laypage', 'layer'], function(){
                        var laypage = layui.laypage;
                        laypage.render({
                            elem: 'pageTable'
                            ,count: count,
                            limit:10
                            ,layout: ['count', 'prev', 'page', 'next', 'limit', 'refresh', 'skip']
                            ,jump: function(obj){
                                var reqOps = {
                                    url: that.url,
                                    cmdtype: "platformUserManager",
                                    cmd: "getPlatformUser",
                                    data: {
                                        currPage: obj.curr,
                                        pageSize: obj.limit,
                                        nickName:that.q.nickName
                                    }
                                };
                                reqOps.success = function(data) {
                                    Vue.set(vm,'userData', data.list.list);
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
                reqOps.fail = function (retcode) {
                    minAlert(retcode)
                }
                $.ajaxPost(reqOps);
            },
            getUserRecord:function (item) {//获取用户明细
                vm.showBtnList=false;
                vm.showUserInfo = false;
                vm.userRecord = item;
                $("#companyDiv").hide();
                $("#userDiv").hide();


            },
            getComapnyRecord:function(item){
                vm.showBtnList=false;
                vm.showCompanyInfo = false;
                vm.companyRecord = item;
                $("#companyDiv").hide();
                $("#userDiv").hide();

            },
            loadCompany:function(){
                var that = this;
                vm.blackFlag = false;
                $("#companyDiv").show();
                $("#userDiv").hide();
                $("#userBla").hide();
                var reqOps = {
                    url: that.url,
                    cmdtype: "platformUserManager",
                    cmd: "getPlatformCompany",
                    data: {
                        currPage: 1,
                        pageSize: 10,
                        nickName:that.q.nickName
                    }
                };
                reqOps.success = function (data) {
                    //成功回调函数
                    that.companyData=data.list.list;
                    var count=data.list.totalCount;//总页数
                    layui.use(['laypage', 'layer'], function(){
                        var laypage = layui.laypage;
                        laypage.render({
                            elem: 'pageCompanyTable'
                            ,count: count,
                            limit:10
                            ,layout: ['count', 'prev', 'page', 'next', 'limit', 'refresh', 'skip']
                            ,jump: function(obj){
                                var reqOps = {
                                    url: that.url,
                                    cmdtype: "platformUserManager",
                                    cmd: "getPlatformCompany",
                                    data: {
                                        currPage: obj.curr,
                                        pageSize: obj.limit,
                                        nickName:that.q.nickName
                                    }
                                };
                                reqOps.success = function(data) {
                                    Vue.set(vm,'companyData', data.list.list);
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
                        element.on('nav(pageCompanyTable)', function(elem) {
                        });
                    });
                }
                reqOps.fail = function (retcode) {
                    alert(retcode)
                }
                $.ajaxPost(reqOps);
            },
            imgSrcArr: function (idCardPic) {
                if(idCardPic !='' && idCardPic !=null){
                    var srcArr = [];
                    var restApi = '//project.youtobon.com/rest/ytbuser/image/previewImage';
                    var msgBody = $.paramsToBase64({
                        cmdtype: 'userImage',
                        cmd: 'previewImage',
                        data: {
                            documentId: idCardPic
                        }
                    });
                    srcArr.push(restApi + '?msgBody=' + msgBody);
                    return srcArr;
                }
            },
            goUserBack:function(){
                vm.showBtnList=true;
                vm.showUserInfo = true;
                $("#companyDiv").hide();
                $("#userDiv").show();
            },
            goCompanyBack:function(){
                vm.showBtnList=true;
                vm.showCompanyInfo=true;
                $("#companyDiv").show();
                $("#userDiv").hide();
            },
            loadUserBlack:function (type) {//获取用户黑明单列表

                var that = this;
                $("#userBla").show();

                if(type == 1){
                    $("#userDiv").hide();
                }else{
                    $("#companyDiv").hide();
                }



                var reqOps = {
                    url: "//project.youtobon.com/rest/ytbuser",
                    cmdtype: "userCenter",
                    cmd: "getUserBlack",
                    data: {
                        currPage: 1,
                        pageSize: 10,
                        userType:type
                    }
                };
                reqOps.success = function (data) {
                    //成功回调函数
                    that.userBlackData=data.list.list;
                    var count=data.list.totalCount;//总页数
                    layui.use(['laypage', 'layer'], function(){
                        var laypage = layui.laypage;
                        laypage.render({
                            elem: 'pageUserBlackTable'
                            ,count: count,
                            limit:10
                            ,layout: ['count', 'prev', 'page', 'next', 'limit', 'refresh', 'skip']
                            ,jump: function(obj){
                                var reqOps = {
                                    url: "//project.youtobon.com/rest/ytbuser",
                                    cmdtype: "userCenter",
                                    cmd: "getUserBlack",
                                    data: {
                                        currPage: obj.curr,
                                        pageSize: obj.limit,
                                        userType:type
                                    }
                                };
                                reqOps.success = function(data) {
                                    Vue.set(vm,'userBlackData', data.list.list);
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
                        element.on('nav(pageUserBlackTable)', function(elem) {
                        });
                    });
                }
                reqOps.fail = function (retcode) {
                    alert(retcode)
                }
                $.ajaxPost(reqOps);



            },
            addUserBlack:function (blackId,type) {
                var that = this;
                that.blackFlag = true;
                $("#userDiv").show();
                $("#companyDiv").hide();
                $("#userBla").hide();//隐藏用户黑明单
                var reqOps = {
                    url: "//project.youtobon.com/rest/ytbuser",
                    cmdtype: "userCenter",
                    cmd: "addUserBlack",
                    data: {
                        blackId: blackId,
                        type: type,
                    }
                };
                reqOps.success = function (data) {

                }
                reqOps.fail = function (retcode) {
                    alert(retcode)
                }
                $.ajaxPost(reqOps);
            }

        }
    });
})