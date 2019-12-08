$(function(){
    var vm = new Vue({
        el: "#mainDiv",
        data: {
            url: "//project.youtobon.com" ,
            tabelData:[],
            checkAcType:{
                100:'银行卡',
                200:'支付宝',
                300:'财富通',
                801:'总帐户',
                802:'服务费',
                803:'手续费',
                804:'税费'
            },
            checkStatus:{
                0:'正常',
                1:'冻结'
            },
            item:[]
        },

        methods: {
            loadData:function(){
                var that = this;
                var reqOps = {
                    url: that.url+ "/rest/wallet",
                    cmdtype: "pfInner",
                    cmd: "accountInnerInfo",
                    data: {
                    }
                };
                reqOps.success = function (data) {
                    that.tabelData = data.list
                }
                reqOps.fail = function (retcode) {
                    minAlert(retcode)
                }
                $.ajaxPost(reqOps);
            },
            selectLine:function(item,event){
                var that = this;
                $(event.currentTarget).css('background','#ddd').siblings().css('background','#fff');
                console.log(item)
                that.item = item;
            },
            outAccount:function(){
                var that = this;
                if(that.item.length == 0){
                alert('请选择一条数据')
                }else {
                    $("#refuseModal").modal();
                }
                $('#inAccount').hide();
                $('#outAccount').show();
            },
            inAccount:function(){
                var that = this;
                console.log(that.item.length)
                if(that.item.length == 0){
                    alert('请选择一条数据')
                }else {
                    $("#refuseModal").modal();
                }
                $('#outAccount').hide();
                $('#inAccount').show();
            },
            inAccountSave:function () {
                var that = this;
                var tradeType=$("#tradeType option:selected").val();
                var tradeType2=$("#tradeType2 option:selected").val();
                var reqOps = {
                    url: that.url+ "/rest/wallet",
                    cmdtype: "pfDetail",
                    cmd: "newRecordIn",
                    data: {
                        "pfInnerId":that.item.pfInnerId,
                        "balance":$("#money").val(),
                        "tradeType":tradeType,
                        "tradeSubtype":tradeType2
                    }
                };
                reqOps.success = function (data) {
                    alert('保存成功')
                }
                reqOps.fail = function (retcode) {
                    minAlert(retcode)
                    alert('请先选择一行数据');

                }
                $.ajaxPost(reqOps);
            },
            outAccountSave:function () {
                var that = this;
                var tradeType=$("#tradeType option:selected").val();
                var tradeType2=$("#tradeType2 option:selected").val();
                var reqOps = {
                    url: that.url+ "/rest/wallet",
                    cmdtype: "pfDetail",
                    cmd: "newRecordOut",
                    data: {
                        "pfInnerId":that.item.pfInnerId,
                        "balance":$("#money").val(),
                        "tradeType":tradeType,
                        "tradeSubtype":tradeType2
                    }
                };
                reqOps.success = function (data) {
                    alert('保存成功')
                }
                reqOps.fail = function (retcode) {
                    minAlert(retcode)
                    alert('请先选择一行数据');

                }
                $.ajaxPost(reqOps);
            }
        },

        mounted:function(){
            this.loadData();
        },
    });
})