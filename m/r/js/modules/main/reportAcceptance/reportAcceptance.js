// U.isTest=true;
// U.testToken="d588ba62851b404284eeca7607201540";
var vm= new Vue({
    el: "#tabelMain",
    data: {
        requestUrl:"",
        listData:[],
        checkStat:{
            1:'待处理',
            2:'已核实',
            3:'恶意举报'
        }
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
        // loadLayui:function (data,areaId) {
        //     var self  = this;
        //     var count = data.list.totalCount;
        //     layui.use(['laypage'], function(){
        //         var laypage = layui.laypage
        //         //完整功能
        //         laypage.render({
        //             elem: 'paging'
        //             ,count: count
        //             ,layout: ['count', 'prev', 'page', 'next', 'limit', 'refresh', 'skip']
        //             ,jump: function(obj){
        //                 console.log(obj);
        //                 var reqOps = {
        //                     "cmdtype": "DistAreaSalary",
        //                     "cmd": "getDistAreaSalaryPage",
        //                     "url":  self.requestUrl+"/rest/charges",
        //                     "data":{
        //                         "areaId":areaId,
        //                         "currPage": obj.curr,
        //                         "pageSize": obj.limit,
        //                         orderBy:'asc',
        //                         toOrder:'salary_id'
        //                     }
        //                 };
        //                 reqOps.success = function(data) { //成功回调函数
        //                     // console.log(data.list)
        //                     // self.items=data.list.list;
        //                     Vue.set(vm,'areaData', data.list.list)//赋值的方法
        //                     // console.log(self.items);
        //
        //                 }
        //                 reqOps.fail = function(retcode) { //失败回调函数
        //                     alert(retcode)
        //                 }
        //                 $.ajaxPost(reqOps); //调用
        //             }
        //         });
        //     });
        // },
        loaddata:function () {
            var self = this;
            var reqOps = {
                "cmdtype": "reportList",
                "cmd": "getReportList",
                "url": self.requestUrl+"/rest/reportManager/sysReport",
                "data":{
                    pageSize:10,
                    currPage:1,
                }
            };
            reqOps.success = function(data) { //成功回调函数
                Vue.set(vm,'listData', data.list.list)//动态赋值的方法
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
                                "cmdtype": "reportList",
                                "cmd": "getReportList",
                                "url":  self.requestUrl+"/rest/reportManager/sysReport",
                                "data":{
                                    "currPage": obj.curr,
                                    "pageSize": obj.limit,
                                }
                            };
                            reqOps.success = function(data) { //成功回调函数
                                // console.log(data.list)
                                // self.items=data.list.list;
                                Vue.set(vm,'listData', data.list.list)//赋值的方法
                                // console.log(self.items);

                            }
                            reqOps.fail = function(retcode) { //失败回调函数
                                alert(retcode)
                            }
                            $.ajaxPost(reqOps); //调用
                        }
                    });
                });
            }
            reqOps.fail = function(retcode) { //失败回调函数
                alert(retcode)
            }
            $.ajaxPost(reqOps); //调用
        },

    },
    mounted:function(){
        this.loaddata();
    }
})


