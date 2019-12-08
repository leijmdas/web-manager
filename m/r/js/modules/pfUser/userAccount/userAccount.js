$(function(){
    var vm = new Vue({
        el: "#mainDiv",
        data: {
            url: "//project.youtobon.com" ,
            dataGrowth:{},//数据增长
            userListData:[],
            detailsData:[],
            seeDetailData:[],
            checktype:{
                10:'充值',
                20:'提现',
                30:'收入',
                40:'支出',
            }
        },
        filters: {
            formatDate: function (value) {//日期转换器
                var date = new Date(value);
                var y = date.getFullYear();
                var MM = date.getMonth() + 1;
                MM = MM < 10 ? ('0' + MM) : MM;
                var d = date.getDate();
                d = d < 10 ? ('0' + d) : d;
                var h = date.getHours();
                h = h < 10 ? ('0' + h) : h;
                var m = date.getMinutes();
                m = m < 10 ? ('0' + m) : m;
                var s = date.getSeconds();
                s = s < 10 ? ('0' + s) : s;
                return y + '-' + MM + '-' + d + ' ' + h + ':' + m + ':' + s;
            }
        },
        methods: {
            loadData:function(){//数据增长列表
                var that = this;
                var reqOps = {
                    url: that.url+ "/rest/wallet",
                    cmdtype: "userOut",
                    cmd: "accountInfo",
                    data: {
                    }
                };
                reqOps.success = function (data) {
                    that.dataGrowth=data.list[0]
                }
                reqOps.fail = function (retcode) {
                    minAlert(retcode)
                }
                $.ajaxPost(reqOps);
            },
            loadAllList:function(typeSelect){
                var that = this;
                var reqOps = {
                    url: that.url+ "/rest/wallet",
                    cmdtype: "userInner",
                    cmd: "accountInfoList",
                    data: {
                        pageSize:10,
                        currPage:1,
                        type:typeSelect,
                        orderBy:'asc',
                        toOrder:'inner_id'
                    }
                };
                reqOps.success = function (data) {
                    that.userListData=data.list.list;
                    var count=data.list.totalCount;//总页数
                    layui.use(['laypage', 'layer'], function(){
                        var laypage = layui.laypage;
                        laypage.render({
                            elem: 'pageTable'
                            ,count: count
                            ,layout: ['count', 'prev', 'page', 'next', 'limit', 'refresh', 'skip']
                            ,jump: function(obj){
                                var reqOps = {
                                    url: that.url+ "/rest/wallet",
                                    cmdtype: "userInner",
                                    cmd: "accountInfoList",
                                    data: {
                                        currPage: obj.curr,
                                        pageSize: obj.limit,
                                        type:typeSelect,
                                        orderBy:'asc',
                                        toOrder:'trade_id'
                                    }
                                };
                                reqOps.success = function(data) {
                                    Vue.set(vm,'userListData', data.list.list);
                                }
                                reqOps.fail = function(retcode) {
                                    alert(retcode)
                                }
                                $.ajaxPost(reqOps);
                            }
                        });
                    });
                }
                reqOps.fail = function (retcode) {
                    minAlert(retcode)
                }
                $.ajaxPost(reqOps);
            },
            typeSelect:function () {
                var self = this;
                var typeSelect= $("#typeSelect option:selected").val();
                self.loadAllList(typeSelect);
            },
            typeChange:function(){
                var self = this;
                var typeChange = $("#typeChange option:selected").val();
                var item = self.seeDetailData;
                self.seeDetails(item,typeChange);
            },
            black:function () {
                $('#index').show();
                $('#details').hide();
            },
            seeDetails:function(item,tradeType){
                console.log(item);
                var that = this;
                that.seeDetailData=item;
                $('#index').hide();
                $('#details').show();
                var reqOps = {
                    url: that.url+ "/rest/wallet",
                    cmdtype: "userDetail",
                    cmd: "accountDetailInfo",
                    data: {
                        tradeType:tradeType,
                        innerId:item.userInners.innerId,
                    }
                };
                reqOps.success = function (data) {
                    Vue.set(vm,'detailsData', data.list)//赋值的方法
                }
                reqOps.fail = function (retcode) {
                    minAlert(retcode)
                }
                $.ajaxPost(reqOps);
            }
        },

        mounted:function(){
            this.loadData();
            this.loadAllList(1)
        },
    });
})