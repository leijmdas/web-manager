// U.isTest=true;
// U.testToken="d588ba62851b404284eeca7607201540";

    var vm= new Vue({
        el: "#tabelMain",
        data: {
            requestUrl:"",
            serviceChargedata:[],
            checkTypes: {
        1: "研发设计类",
        2: "加工采购类",
        3: "咨询服务类",
        4: "生产环节类",
        5: "学生课题类",
        10: "虚拟账户类",
        11: "平台支付类",
        12: "平台财富类"
},
        },
        created: function () {
        },
        methods:{
            loadLayui:function () {
                layui.use('laydate', function() {
                    var laydate = layui.laydate;
                    //常规用法
                    lay('.test-item').each(function(){
                        laydate.render({
                            elem: this
                            ,trigger: 'click'
                        });
                    });
                })
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
                        console.log(data)
                        Vue.set(vm,'serviceChargedata', data.list.list)//动态赋值的方法

                    }
                    reqOps.fail = function(retcode) { //失败回调函数
                        alert(retcode)
                    }
                    $.ajaxPost(reqOps); //调用
            },
            addServiceCharge:function () {
                $("#addServiceCharge").modal();
                $('#saveServiceCharge').attr('saveType','1');

            },
            edit:function () {
                $("#addServiceCharge").modal();
                $('#saveServiceCharge').attr('saveType','2');

            },
            saveServiceCharge:function(){
                var saveType = $('#saveServiceCharge').attr('saveType');
                if (saveType == 1){
                    var self = this;
                    var reqOps = {
                        "cmdtype": "serviceFee",
                        "cmd": "insertServiceFee",
                        "url": self.requestUrl+"/rest/charges",
                        "data":{
                            projectType:1,
                            upperLimit:1,
                            lowerLimit:1,
                            feeRate:1.00
                        }
                    };
                    reqOps.success = function(data) { //成功回调函数
                        console.log(data)
                        // Vue.set(vm,'serviceChargedata', data.list)//动态赋值的方法

                    }
                    reqOps.fail = function(retcode) { //失败回调函数
                        alert(retcode)
                    }
                    $.ajaxPost(reqOps); //调用
                }else {
                    var self = this;
                    var reqOps = {
                        "cmdtype": "serviceFee",
                        "cmd": "updateServiceFee",
                        "url": self.requestUrl+"/rest/charges",
                        "data":{
                            projectType:2,
                            upperLimit:1,
                            lowerLimit:1,
                            feeRate:1.00,
                            feeId:7
                        }
                    };
                    reqOps.success = function(data) { //成功回调函数
                        console.log(data)
                        // Vue.set(vm,'serviceChargedata', data.list)//动态赋值的方法
                    }
                    reqOps.fail = function(retcode) { //失败回调函数
                        alert(retcode)
                    }
                    $.ajaxPost(reqOps); //调用
                }
            },

        },
        mounted:function(){
            this.loaddata();
            this.loadLayui();
        }
    })


