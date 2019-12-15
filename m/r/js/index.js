function firstShow() {
    // $('#first-page').text(sessionStorage.getItem('nickName'));
};
$(function () {
    // var loginName = U.getCookie("loginName");
    // $('#first-page').text(loginName);
    $('#clear-cache').on('click', function () {
        //window.alert("欢迎！clear cache");
    })

    $('#exit-login').on('click', function () {
        var t = new Date().getTime();
        var reqOps = {
            url: "/rest/context",
            cmdtype: "context",
            cmd: "logout",
            data: {}
        }
        //成功回调函数
        reqOps.success = function (msgBody) {
            U.removeSession();      // window.location.href = "index.html";
        }
        //失败回调函数
        reqOps.fail = function (retcode, retmsg) {
            // if ($("#pas").find("div[class='input-help']").length > 0) {
            //
            // } else {
            //     $("#pas").append('<div class="input-help"><ul><li>' + retmsg + '</li></ul></div>');
            // }
            // $("#pas").parent().addClass("check-error").removeClass("check-success");

        }
        //调用
        $.ajaxPost(reqOps);
    })

    $(".leftnav h2").click(function () {
        $(this).next().slideToggle(200);
        $(this).toggleClass("on");
    })
    $(".leftnav ul li a").click(function () {
        $("#a_leader_txt").text($(this).text());
        $(".leftnav ul li a").removeClass("on");
        $(this).addClass("on");
    });
    /**
     * 展开所有节点
     */
    $("#btnOpen").click(function () {
        $("#index_tree_ul li[class='folder']").each(function () {
            $(this).addClass("open");
            $(this).siblings("ul").css("display", "block")
        })
    });
    /**
     * 折叠所有节点
     */
    $("#btnClose").click(function () {
        $("#index_tree_ul li[class='folder open']").each(function () {
            $(this).removeClass("open");

            $(this).siblings("ul").css("display", "none")
        })
    })

    //自定义参数
    var reqOps = {
        url: "/rest/sysuser",
        //url: "//localhost/rest/sysuser",
        apiKey : sessionStorage.apiKey ,

        cmdtype: "menu",
        cmd: "getMenuLeftList"
    };

    //成功回调函数
    reqOps.success = function (data) {

        var html = ''; //<li><a href="#" ref="hyjm" name="hyjm">欢迎界面</a></li>
        for (i in data.list) {
            html += '<li class="folder"><a href=' + data.list[i].menuUrl + ' ref="ckgl" target="right" name="' + data.list[i].menuName + '">' + data.list[i].menuName + '</a></li>'; //data.Data.Rows[i].department;一级菜单内容
            html += '<ul>';
            if (data.list[i].children != "") {
                for (b in data.list[i].children) {
                    html += '<li><a href=' + data.list[i].children[b].menuUrl + ' ref="kcgl" target="right" name="' + data.list[i].children[b].menuName + '">' + data.list[i].children[b].menuName + '</a></li>'; //二级菜单内容
                    if (data.list[i].children[b].children != "") {
                        html += '<ul>';
                        for (f in data.list[i].children[b].children) {
                            html += '<li><a href=' + data.list[i].children[b].children[f].menuUrl + ' ref="yhgl" target="right" name="' + data.list[i].children[b].children[f].menuName + '">' + data.list[i].children[b].children[f].menuName + '</a></li>'; //三级菜单内容
                        }
                        html += '</ul>';
                    }
                }
            }
            html += '</ul>';
        }
        $("#index_tree_ul").html(html); //动态输出左侧菜单
        $(".st_tree").SimpleTree({
            /* 可无视代码部分*/
            click: function (a) {
                var href = $(a).attr("href"); //获取左侧点击的内容
                if (href.indexOf(".html") > 1) {
                    $("#iframe").attr("src", href); //改变嵌套的页面链接
                    $("#a_leader_txt").text($(a).attr("name"));
                    ; //改变导航信息
                }
            }
        });
    }
    //失败回调函数
    reqOps.fail = function (retcode) {
        minAlert(retcode)
    }

    //调用
    $.ajaxPost(reqOps);
}
);

//点击修改密码弹出模态框
function showChangePwd(){

    layer.open({
        type: 1,
        skin: 'layui-layer-molv',
        title: "修改密码",
        area: ['550px', '295px'],
        shadeClose: false,
        content: jQuery("#passwordLayer"),
        btn: ['修改','取消'],
        btn1: function (index) {
            var pwd = $("#pwd").val();
            var newPwd = $("#newPwd").val();
            var oldPwd = $("#oldPwd").val();
            if(pwd !=newPwd){
                layer.alert('两次密码不一样');
            }

            //自定义参数
            var reqOps = {
                url: "/rest/sysuser",
                cmdtype: "user",
                cmd: "updatePassword",
                data:{
                    newPwd:pwd,
                    oldPwd:oldPwd
                }
            };
            reqOps.success = function (data) {
                layer.close(index);
                layer.alert('修改成功');
            }
            reqOps.fail = function (retcode) {
                minAlert(retcode)
            }
            $.ajaxPost(reqOps);

        }
    });

}




