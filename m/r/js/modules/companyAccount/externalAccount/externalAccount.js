$(function(){
    var vm = new Vue({
        el: "#mainDiv",
        data: {
            url: "//project.youtobon.com" ,
            bankCardData:[],
            checkAcType:{
                100:'银行卡',
                200:'支付宝',
                300:'财富通',
                801:'总帐户',
                802:'服务费',
                803:'手续费'
            },
            checkStatus:{
                0:'正常',
                1:'冻结'
            }
        },

        methods: {
            loadData:function(){
                var that = this;
                var reqOps = {
                    url: that.url+ "/rest/wallet",
                    cmdtype: "pfOut",
                    cmd: "accountOutInfo",
                    data: {
                        status:0
                    }
                };
                reqOps.success = function (data) {
                    that.bankCardData = data.list
                }
                reqOps.fail = function (retcode) {
                    minAlert(retcode)
                }
                $.ajaxPost(reqOps);
            },
            untie:function(id){
                $('#untie').modal();
                $('#untieOk').attr('uid',id)
            },
            untieOk:function () {
                var that = this;

                var pfOutId = $('#untieOk').attr('uid');
                var reqOps = {
                    url: that.url+ "/rest/wallet",
                    cmdtype: "pfOut",
                    cmd: "prohibitOutInfo",
                    data: {
                        pfOutId:pfOutId,
                        status:1
                    }
                };
                reqOps.success = function (data) {
                    alert('解绑成功')

                }
                reqOps.fail = function (retcode) {
                    alert(retcode)
                }
                $.ajaxPost(reqOps);
            },
            addCar:function(){
                $('#addCar').modal();

            }
        },

        mounted:function(){
            this.loadData();
        },
    });
})