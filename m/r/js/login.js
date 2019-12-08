$(function () {


    $("#imgCode").click(function () {
        this.src='http:/rest/context/getPicCode';
    });

    $("#Login").click(function () {
        var reqOps = {
            url: "/rest/sysuser",
            apiKey : sessionStorage.apiKey ,
            cmdtype: "user",
            cmd: "login",
            data: {
                userName: $("#userName").val(),
                password: $("#password").val(),
                loginType:1
            }
        };
        reqOps.success = function (data,message) {

            var getLogSso = data.list[0];
            U.saveSession(getLogSso);
            window.location.href = "index.html";
        }
        reqOps.fail = function (retcode, retmsg) {
            U.removeSession();
            if ($("#pas").find("div[class='input-help']").length > 0) {

            } else {
                $("#pas").append('<div class="input-help"><ul><li>' + retmsg + '</li></ul></div>');
            }
            $("#pas").parent().addClass("check-error").removeClass("check-success");
        }
        $.ajaxPost(reqOps);
    });

    //点击Enter键登录
    $("body").keydown(function (event) {
        if (event.keyCode == "13") {//keyCode=13是回车键
            $("#Login").click();
        }
    });
});


//点击获取验证码
var codeflag = 60;
var phoneflag = 0;
function getPhoneCode(){
    var mobile = $("#mobilePhone").val();
    if(!/^(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}|(170[059])[0-9]{6}$/i.test(mobile))
    {
        alert("请输入正确的手机号");
    }else if(/^(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}|(170[059])[0-9]{6}$/i.test(mobile)){
        phoneflag = 1;
    }
    if(phoneflag == 1 && codeflag == 60){
        var timeflag = setInterval(function(){
            if(codeflag>0){
                $('#fetchCode').val(codeflag+'秒后重发');
                $('#fetchCode').css({'color':'gray'});
                $('#fetchCode').attr('disabled','disabled');
                codeflag--;

            }else {
                codeflag = 60;
                $('#fetchCode').val('重新发送验证码');
                $('#fetchCode').css({'color':'#0000FF'});
                $('#fetchCode').removeAttr('disabled');
                clearInterval(timeflag);
            }
        },1000);
    };

   /* if(phoneflag = 1){
        //发送验证码
        var reqOps = {
            url: "http://project.youtobon.com/rest/smsLog_sms",
            cmdtype: "smslog",
            cmd: "sendSmsCode",
            data: {
                smsType: "用户注册验证码",
                phone: mobile,
            }
        };
        reqOps.success = function(data) {

        };
        reqOps.fail = function(retcode) { //失败回调函数
            alert(retcode)
        }
    }*/
};

//更换登录方式
function loginType(type){
    if(type == 1){
        $("#phoneDiv").show();
        $("#pwdDiv").hide()
    }else{
        $("#phoneDiv").hide();
        $("#pwdDiv").show()
    }
};

//手机登录
function phoneLogin(){
    var mobile = $("#mobilePhone").val();
    var reqOps = {
        url: "/rest/sysuser",
        cmdtype: "user",
        cmd: "login",
        apiKey : sessionStorage.apiKey ,
        data: {
            mobile: mobile,
            phoneCode: $("#phoneCode").val(),
            loginType:2
        }
    };
    reqOps.success = function (msgBody) {
        U.saveSession(msgBody);
        window.location.href = "index.html";
    }
    reqOps.fail = function (retcode, retmsg) {
        U.removeSession();

    }
    $.ajaxPost(reqOps);
}

//校验验证码

