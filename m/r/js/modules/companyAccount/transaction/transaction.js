$(function(){
    var vm = new Vue({
        el: "#mainDiv",
        data: {
            url: "//project.youtobon.com" ,
            transaction:[]
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
            loadData:function(){
                var that = this;
                var reqOps = {
                    url: that.url+ "/rest/wallet",
                    cmdtype: "pfDetail",
                    cmd: "accountPfDetailInfo",
                    data: {
                        currPage: 1,
                        pageSize: 10,
                        orderBy:'asc',
                        toOrder:'pf_detail_id'
                    }
                };
                reqOps.success = function (data) {
                    that.transaction = data.list.list;
                    var count=data.list.totalCount;//总页数
                    layui.use(['laypage', 'layer'], function(){
                        var laypage = layui.laypage;
                        laypage.render({
                            elem: 'paging'
                            ,count: count
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
                }
                reqOps.fail = function (retcode) {
                    minAlert(retcode)
                }
                $.ajaxPost(reqOps);
            },
        },

        mounted:function(){
            this.loadData();
        },
    });
})