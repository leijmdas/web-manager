// U.isTest=true;
// U.testToken="d588ba62851b404284eeca7607201540";
//手续费
var vm= new Vue({
    el: "#tabelMain",
    data: {
        requestUrl:"",
        serviceChargedata:[],
        checkTypes: {
            10: "钱包提现至银行卡费率",
            11: "钱包提现至支付宝费率",
            12: "钱包提现至微信费率"
        },
    },
    created: function () {
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
    methods:{
        loadLayui:function (data) {
            var self  = this;
            var count = data.list.totalCount;
            layui.use(['laypage'], function(){
                var laypage = layui.laypage
                //完整功能
                laypage.render({
                    elem: 'paging'
                    ,count: count
                    ,layout: ['count', 'prev', 'page', 'next', 'limit', 'refresh', 'skip']
                    ,jump: function(obj){
                        var reqOps = {
                            "cmdtype": "serviceFee",
                            "cmd": "getServiceFeePage",
                            "url": self.requestUrl+"/rest/charges",
                            "data":{
                                "currPage": obj.curr,
                                "pageSize": obj.limit,
                                orderBy:'asc',
                                toOrder:'fee_id'
                            }
                        };
                        reqOps.success = function(data) { //成功回调函数
                            // console.log(data.list)
                            // self.items=data.list.list;
                            Vue.set(vm,'serviceChargedata', data.list.list)//赋值的方法
                            // console.log(self.items);

                        }
                        reqOps.fail = function(retcode) { //失败回调函数
                            alert(retcode)
                        }
                        $.ajaxPost(reqOps); //调用
                    }
                });
            });
        },
        loaddata:function () {
            var self = this;
            var reqOps = {
                "cmdtype": "serviceFee",
                "cmd": "getServiceFeePage",
                "url": self.requestUrl+"/rest/charges",
                "data":{
                    pageSize:10,
                    currPage:1,
                    orderBy:'asc',
                    toOrder:'fee_id'
                }
            };
            reqOps.success = function(data) { //成功回调函数
                console.log(data);
                Vue.set(vm,'serviceChargedata', data.list.list)//动态赋值的方法
                self.loadLayui(data);
            }
            reqOps.fail = function(retcode) { //失败回调函数
                alert(retcode)
            }
            $.ajaxPost(reqOps); //调用
        },
        enable:function (item) {//启用
            var self = this;
            var reqOps = {
                "cmdtype": "serviceFee",
                "cmd": "updateServiceFee",
                "url": self.requestUrl+"/rest/charges",
                "data":{
                    state:0,
                    feeId:item.feeId,
                    projectType:item.projectType
                }
            };
            reqOps.success = function(data) { //成功回调函数
                self.loaddata();

            }
            reqOps.fail = function(retcode) { //失败回调函数
                alert(retcode)
            }
            $.ajaxPost(reqOps); //调用
        },
        prohibit:function (item) {//禁用
            var self = this;
            var reqOps = {
                "cmdtype": "serviceFee",
                "cmd": "updateServiceFee",
                "url": self.requestUrl+"/rest/charges",
                "data":{
                    state:1,
                    feeId:item.feeId,
                    projectType:item.projectType
                }
            };

            reqOps.success = function(data) { //成功回调函数
                self.loaddata();

            }
            reqOps.fail = function(retcode) { //失败回调函数
                alert(retcode)
            }
            $.ajaxPost(reqOps); //调用
        },
        edit:function (item) {
            $("#edit").modal();
            $("#typeSelect").val(item.projectType);
            $("#describeText").val(item.describeText);
            $("#feeRate").val(item.feeRate);
            $("#information").attr('feeId',item.feeId);
        },
        saveEdit:function(){
                var self = this;
                var reqOps = {
                    "cmdtype": "serviceFee",
                    "cmd": "updateServiceFee",
                    "url": self.requestUrl+"/rest/charges",
                    "data":{
                        feeRate:$('#feeRate').val(),
                        feeId:$("#information").attr('feeId'),
                        projectType:$("#typeSelect").val(),
                        describeText:$('#describeText').val(),
                    }
                };
                reqOps.success = function(data) { //成功回调函数
                    console.log(data)
                    $("#edit").modal('hide');
                    self.loaddata()
                }
                reqOps.fail = function(retcode) { //失败回调函数
                    alert(retcode)
                }
                $.ajaxPost(reqOps); //调用
        },
    },
    mounted:function(){
        this.loaddata();
        // this.loadLayui();
    }
})


