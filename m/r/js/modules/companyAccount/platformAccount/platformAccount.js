$(function(){
    var vm = new Vue({
        el: "#mainDiv",
        data: {
            url: "//project.youtobon.com" ,
            moneyData:[],
            bankCardData:[],
            tabelData:[],
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
                    cmdtype: "pfInner",
                    cmd: "accountInnerInfo",
                    data: {
                    }
                };
                reqOps.success = function (data) {
                    that.moneyData = data.list;
                }
                reqOps.fail = function (retcode) {
                    alert(retcode)
                }
                $.ajaxPost(reqOps);
            },
            typeSelect:function () {
                var self = this;
                var typeSelect= $("#typeSelect option:selected").val();
                self.loadTabel(typeSelect);
            },
            loadTabel:function(typeSelect){
                var that = this;
                var reqOps = {
                    url: that.url+ "/rest/wallet",
                    cmdtype: "userDetail",
                    cmd: "accountDetailByPage",
                    data: {
                        tradeType:typeSelect,
                        pageSize:10,
                        currPage:1,
                        orderBy:'asc',
                        toOrder:'trade_id'
                    }
                };
                reqOps.success = function (data) {
                    that.tabelData = data.list.list;
                    var count=data.list.totalCount;//总页数
                    layui.use(['laypage', 'layer'], function(){
                        var laypage = layui.laypage;
                        laypage.render({
                            elem: 'paging'
                            ,count: count
                            ,layout: ['count', 'prev', 'page', 'next', 'limit', 'refresh', 'skip']
                            ,jump: function(obj){
                                var reqOps = {
                                    url: that.url+ "/rest/wallet",
                                    cmdtype: "userDetail",
                                    cmd: "accountDetailByPage",
                                    data: {
                                        tradeType:typeSelect,
                                        currPage: obj.curr,
                                        pageSize: obj.limit,
                                        orderBy:'asc',
                                        toOrder:'trade_id'
                                    }
                                };
                                reqOps.success = function(data) {
                                    Vue.set(vm,'tabelData', data.list.list);
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
                    alert(retcode)
                }
                $.ajaxPost(reqOps);
            },
            recharge:function(){
                $('.maintabel').hide();
                $('.recharge').show();
                $('.cashWithdrawal').hide();

            },
            selectCar:function(){
                $('#selectCar').modal();
            },
            addCar:function(){
                $('#addCar').modal();
            },
            cashWithdrawal:function(){
                $('.maintabel').hide();
                $('.recharge').hide();
                $('.cashWithdrawal').show();
                var that = this;
                var reqOps = {
                    url: that.url+ "/rest/wallet",
                    cmdtype: "pfOut",
                    cmd: "accountOutInfo",
                    data: {
                    }
                };
                reqOps.success = function (data) {
                    that.bankCardData = data.list;
                }
                reqOps.fail = function (retcode) {
                    alert(retcode)
                }
                $.ajaxPost(reqOps);
            },
            rechargeSelct:function(event){
                $(event.currentTarget).addClass("rechargeModebor").siblings().removeClass("rechargeModebor");
            },
            blancSelct:function(event){
                $(event.currentTarget).addClass("rechargeModebor").siblings().removeClass("rechargeModebor");
                $(event.currentTarget).siblings().find('input').prop('checked',false);
                $(event.currentTarget).find('input').prop('checked',true);
            },
        },

        mounted:function(){
            this.loadData();
            this.loadTabel(10);
        },
    });
})