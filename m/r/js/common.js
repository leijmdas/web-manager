// var rmd5jsFile="<script type='text/javascript' src='"+U.rootPath+"m/r/lib/md5.js'></script>"
// document.write(rmd5jsFile);

//工具
var U = {
    admin_domain : "",
    isTest: false,
    testToken: "",
    testApiKey: "",
    setTestToken: function (token,testApiKey) {
        U.isTest = true;
        U.testToken = token;
        U.testApiKey = testApiKey;
        localStorage.token = token;
        localStorage.apiKey = testApiKey;
        U.loadSsoByToken();
    },

    saveSession: function (logSso) {

        localStorage.getLogSso = JSON.stringify(logSso);
        localStorage.nickName = logSso.nick_name;
        localStorage.token = logSso.token;
        localStorage.refresh_token = logSso.refresh_token;
        localStorage.userType = logSso.userType;
        localStorage.apiKeyModel = JSON.stringify(logSso.apiKeyModel);
        localStorage.apiKey = logSso.apiKeyModel.apiKey;


    },

    removeSession: function () {
        localStorage.removeItem("nickName");
        localStorage.removeItem("userType");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("userToken");
        localStorage.removeItem("getLogSso");
        localStorage.removeItem("apiKeyModel");
    },
    loadSsoByToken: function (sessionData) {

        var reqOps = {
            url: "//project.youtobon.com/rest/context",
            async: false,
            cmdtype: "context",
            cmd: "getLogSso",
            data: {}
        };
        reqOps.success = function (data) {
            var getLogSso = data.list[0];
            U.saveSession(getLogSso);
            if (sessionData != null) {
                sessionData = $.extend({}, getLogSso);
            }

        };
        reqOps.fail = function (retcode, retmsg) {
            alert(retcode);
            U.removeSession();
        };
        $.ajaxPost(reqOps);

        return sessionData;
    }
};

//操作cookie
U.setCookie = function (name, value, time) {
    var d = new Date();
    d.setTime(d.getTime() + time);
    document.cookie = name + '=' + escape(value) +
        (time === null ? '' : ';expires=' + d.toUTCString());
};

U.getCookie = function (name) {
    if (document.cookie.length > 0) {
        var arr = document.cookie.split('; ');
        for (var i = 0; i < arr.length; i++) {
            var e = arr[i].split('=');
            if (e[0] === name) {
                return unescape(e[1]);
            }
        }
    }
    return null;
};

U.removeCookie = function (name) {
    var d = new Date();
    d.setTime(d.getTime() - 10000);
    document.cookie = name + '=; expires=' + d.toUTCString();
};

U.checkCookie = function (name) {
    var value = U.getCookie(name);
    return value != null;
};

//获取url查询参数对象
U.urlParamObj = function () {
    var obj = {};
    var queryString = window.location.search.substr(1);
    queryString = decodeURI(queryString);
    queryString.replace(/([^=&]+)=([^=&]*)/g, function (rs, $1, $2) {
        if (obj[$1]) {
            if ($.isArray(obj[$1])) {
                obj[$1].push($2);
            } else {
                obj[$1] = [obj[$1], $2];
            }
        } else {
            obj[$1] = $2;
        }
    });


    if (obj['token']) {
        localStorage.token = obj['token'];
    }

    return obj;
}();

//项目根目录
U.rootPath = function () {
    var href = location.href,
        pathName = location.pathname;
    var rp = href.substring(0, href.indexOf(pathName));
    if (U.isTest) {
        return rp + "/ytb-web-manager/src/main/webapp/";
    }
    return rp;
}();

U.datetimeFormatString = function (stype, time) {
    if (time == null) {
        return time;
    }
    if (stype == 'DATE') {
        return U.dateFormatString(time);
    } else if (stype == 'DATETIME') {
        return U.timeFormatString(time);
    } else if (stype == 'TIMESTAMP') {
        return U.timeFormatString(time);
    }
    return time;
}


//时间转化
//毫秒转本地时间字符串 返回字符串
U.timeToLocalString = function (time) {
    return new Date(time).toLocaleString();
};

//毫秒格式化时间字符串
U.timeFormatString = function (time) {
    //yyyy-MM-dd HH:mm:ss
    var o = new Date(time), arr, i;
    arr = [
        o.getFullYear(),
        o.getMonth() + 1,
        o.getDate(),
        o.getHours(),
        o.getMinutes(),
        o.getSeconds()];
    for (i = 0; i < arr.length; i++) {
        if (i === 0) {
            continue;
        }
        arr[i] = (arr[i] + '').length === 1 ? '0' + arr[i] : arr[i];
    }
    return arr[0] + '-' + arr[1] + '-' + arr[2] + ' ' + arr[3] + ':' + arr[4] +
        ':' + arr[5];
};
U.dateFormatString = function (time) {
    //yyyy-MM-dd HH:mm:ss
    var o = new Date(time), arr, i;
    arr = [
        o.getFullYear(),
        o.getMonth() + 1,
        o.getDate(),
        o.getHours(),
        o.getMinutes(),
        o.getSeconds()];
    for (i = 0; i < arr.length; i++) {
        if (i === 0) {
            continue;
        }
        arr[i] = (arr[i] + '').length === 1 ? '0' + arr[i] : arr[i];
    }
    return arr[0] + '-' + arr[1] + '-' + arr[2];
};

/**
 *
 * @param size B
 */
U.fileSizeToString = function (size) {
    var GB = 1024 * 1024 * 1024;//1GB
    var MB = 1024 * 1024;//1MB
    var KB = 1024;//1KB

    var num, s;
    if (size >= GB) {
        num = size / GB;
        s = 'GB';
    } else if (size >= MB) {
        num = size / MB;
        s = 'MB';
    } else if (size >= KB) {
        num = size / KB;
        s = 'KB';
    } else {
        num = size;
        s = 'B';
    }
    return num.toFixed(0) + s;
};

//jquery
$.extend({

    /**
     * 依赖jQuery layer
     *
     * 异步POST
     * @param opt
     * url 请求的地址
     * cmdtype
     * cmd
     * data 对象形式 如果isMultipart=true, data = {file:File,x1='',x2=''}
     * async
     * success 业务上成功回调函数
     * fail 业务上失败回调函数
     * @param isMultipart 是否是文件上传请求
     */
    ajaxPost: function (opt, isMultipart, accept, size, verifyFail) {
        var msgBox = function (retcode, retmsg) {
            var s;
            if (retcode === 0 || retcode === 200) {
                s = '消息：' + retmsg;
            } else {
                s = '错误码：' + retcode + '，消息：' + retmsg;
            }
            var layer = parent.layer || layer;
            layer.msg(s, {
                title: false,
                offset: 't',
                closeBtn: 0,
                shade: 0,
                time: 3000,
                anim: 5,
                resize: false,
                area: ['300px', '100px']
            });
        };

        var success = function (message) {
            msgBox(message.retcode, message.retmsg);
            if (message.retcode === 0) {
                opt.success && opt.success.apply(null, [message.msgBody,message]);
            } else {
                if(message.retcode===-1 && message.cmd==="getMenuLeftList"){
                    window.location.href = '/login.html';
                }
                if(message.retcode===3) {
                    window.location.href = '/m/login.html';
                }else {
                    opt.fail && opt.fail.apply(null, [message.retcode, message.retmsg]);
                }
            }
        };

        var error = function (jqXHR, textStatus, e) {
            msgBox(-99999, textStatus);
            throw e;
        };

        var complete = function (jqXHR, textStatus) {
            opt.complete && opt.complete(jqXHR, textStatus);
        };

        opt.async = (opt.async === undefined) ? true : opt.async;

        var t = new Date().getTime();

        var baseParams = {
            token: U.isTest ? U.testToken : localStorage.token,
            reqtime: t,
            seqno: t,
            apiKey : localStorage.apiKey
        };

        var formData;

        if (isMultipart) {
            /**
             * {file:File,msgBody={}}
             */
            formData = new FormData();
            var file, innerMsgBody = {},
                msgBody = $.extend({}, baseParams, {cmdtype: opt.cmdtype, cmd: opt.cmd, msgBody: innerMsgBody}),
                key;
            for (key in opt.data) {
                if (opt.data.hasOwnProperty(key)) {
                    if (key === 'file') {
                        file = opt.data[key];
                    } else {
                        innerMsgBody[key] = opt.data[key];
                    }
                }
            }
            formData.append('file', file);
            formData.append('msgBody', JSON.stringify(msgBody));

            var verifyFailFn;
            if (typeof size === 'function') {
                verifyFailFn = size;
                size = 1024 * 1024;//默认限制大小1MB
            }

            //文件格式校验
            var typeArr = (accept && accept.length > 0 && accept.split(',')) || [];
            if (!verifyFailFn) {
                verifyFailFn = verifyFail;
            }
            var type = file.type.match(/^image/) ? file.type : file.name.substr(file.name.lastIndexOf('.') + 1);
            if (typeArr.indexOf(type) === -1) {
                verifyFailFn && verifyFailFn('accept', accept, type);
                return;
            } else if (file.size > size) {
                verifyFailFn && verifyFailFn('size', size, file.size);//大小验证不通过 限制大小size 当前文件大小file.size
                return;
            }

        } else {
            /**
             * {token,reqtime,seqno,cmdtype,cmd,msgBody}
             */
            formData = $.extend({}, baseParams, {cmdtype: opt.cmdtype, cmd: opt.cmd, msgBody: opt.data});
        }
        if (localStorage.apiKeyModel) {
            formData = $.extend(formData,
                {
                    apiKey: localStorage.apiKey,
                    sign: typeof (md5) == "function" ? md5(opt.url) : opt.url
                });
        }
        $.ajax({
            url: opt.url,
            type: 'POST',
            data: isMultipart ? formData : JSON.stringify(formData),
            contentType: isMultipart ? false : 'application/json; charset=utf-8',
            dataType: 'json',
            cache: false,
            async: opt.async,
            processData: !isMultipart,
            success: success,
            error: error,
            complete: complete
        });

    },
    /**
     * 构建上传参数
     * @param params
     */
    buildUploadParams: function (cmdtype, cmd, extra) {
        var t = new Date().getTime(),
            reqOps = {
                token: U.isTest ? U.testToken : localStorage.token,
                reqtime: t,
                seqno: t,
                cmdtype: cmdtype,
                cmd: cmd,
                apiKey : localStorage.apiKey,
                msgBody: extra
            };
        return JSON.stringify($.extend({}, reqOps));
    },
    /**
     * 将请求参数消息转换成base64字符串
     * 目前用在预览图片上previewImage
     * @param opt {cmdtype,cmd,data}
     */
    paramsToBase64: function (opt) {
        var t = new Date().getTime();

        var baseParams = {
            token: U.isTest ? U.testToken : localStorage.token,
            reqtime: t,
            seqno: t,
            apiKey : localStorage.apiKey,
        };

        var reqOpt = $.extend({}, baseParams, {cmdtype: opt.cmdtype, cmd: opt.cmd, msgBody: opt.data});

        return Base64.encode(JSON.stringify(reqOpt));
    },
    //文件上传
    fileUpload: function (reqOps) {
        /*reqOps = {
            url: '',
            cmdtype: '',
            cmd: '',
            data: {
                file: ''
            },
            success: function () {

            },
            fail: function () {

            },
            verifyFail: function () {

            },
            accept: '',
            size: 0
        };*/
        $.ajaxPost(reqOps, true, reqOps.accept, reqOps.size, reqOps.verifyFail);
    },
    //获取文件下载的Url
    getFileDownloadUrl: function (reqOps) {
        /*reqOps = {
            url:'',
            cmdtype:'',
            cmd:'',
            data:{

            }
        };*/
        return reqOps.url + '?msgBody=' + $.paramsToBase64(reqOps);
    },
    //图片预览
    previewImage: function (reqOpt) {
        /*reqOpt = {
            url: '/rest/template/previewImage',
            cmdtype: 'templateDocument',
            cmd: 'previewJson',
            data: {
                documentId: 1
            }
        };*/
        return reqOpt.url + '?msgBody=' + $.paramsToBase64(reqOpt);
    },
    //构造layui table 需要的参数
    buildLayuiTableReqParams: function (cmdtype, cmd, data) {
        var t = new Date().getTime();
        return {
            token: U.isTest ? U.testToken : localStorage.token,
            reqtime: t,
            seqno: t,
            apiKey : localStorage.apiKey,
            cmdtype: cmdtype,
            cmd: cmd,
            msgBody: data
        };
    }
});

$.fn.extend({
    /**
     * 转换表单数据 返回对象
     */
    parseFormData: function () {
        var serializeObj = {}, array = this.serializeArray();
        $(array).each(function () {
            if (serializeObj[this.name]) {
                if ($.isArray(serializeObj[this.name])) {
                    serializeObj[this.name].push(this.value);
                } else {
                    serializeObj[this.name] = [serializeObj[this.name], this.value];
                }
            } else {
                serializeObj[this.name] = this.value;
            }
        });
        return serializeObj;
    },
    /**
     * 表单异步提交
     * @param opt
     * url
     * cmdtype
     * cmd
     * data 除了表单数据以外的额外数据 对象形式
     * success
     * fail
     * filter 回调函数 过滤表单序列化后的数据
     */
    ajaxSubmitForm: function (opt) {
        var formData = $.extend({}, $(this).parseFormData(), opt.data);
        if (opt.filter) {
            opt.filter(formData);
        }
        var _opt = {
            url: opt.url,
            cmdtype: opt.cmdtype,
            cmd: opt.cmd,
            data: formData,
            success: opt.success,
            fail: opt.fail
        };
        $.ajaxPost(_opt);
    }
});

//bootstrap-table 表格渲染
U.bs = {};
U.bs.table = {
    render: function (tableSelector, tableToolbar, columns, data, tableClickRowCallback) {
        var opt = {
            tableSelector: '',
            tableToolbar: '',
            toolbarBtn: [],
            columns: [],
            data: [],
            tableClickRowCallback: null
        };
        if (typeof tableSelector === 'object') {
            opt = tableSelector;
        } else {//为了兼容以前的用法 以前的传参方式不支持工具栏配置
            opt.tableSelector = tableSelector;
            opt.tableToolbar = tableToolbar;
            opt.columns = columns;
            opt.data = data;
            opt.tableClickRowCallback = tableClickRowCallback;
        }
        var $bsIns = U.bs.table.bsTableCache[opt.tableSelector];
        if ($bsIns) {
            $bsIns.bootstrapTable('refreshOptions', opt);
            // $bsIns.bootstrapTable('load', opt.data);
        } else {//第一次加载表格时
            $bsIns = $(opt.tableSelector).bootstrapTable({
                columns: opt.columns,
                toolbar: opt.tableToolbar,
                search: true,
                showRefresh: true,
                showColumns: true,
                onRefresh: function (e) {
                    //重新加载数据
                },
                onClickRow: function (row, $element, filed) {
                    opt.tableClickRowCallback && opt.tableClickRowCallback.apply(null, [row]);
                },
                data: opt.data
            });
            U.bs.table.bsTableCache[opt.tableSelector] = $bsIns;

            var $tableToolbar = $(opt.tableToolbar);
            $.each(opt.toolbarBtn || [], function (i, o) {
                var $btnGroup = $('<div class="btn-group"></div>');
                var $btn = $('<button type="button" class="btn"></button>');
                $btn.text(o.btnName);
                $btn.addClass(o.className);
                $btnGroup.append($btn);
                $tableToolbar.append($btnGroup);
                if (o.onClick && $.isFunction(o.onClick)) {
                    $btn.on('click', o.onClick);
                }
            });
        }
    },
    bsTableCache: {},//缓存表格
    bsTableCacheQueryParams: {}//缓存查询参数
};
/*
$(function () {
    var href = location.href;

    if (!localStorage.token) {
        window.location.href = '/m/v/login.html';
    }
});*/

U.getSubSysDictList = function (subsysList) {
    var reqOps = { //自定义参数
        url: U.admin_domain + "/rest/sysmetadata",
        cmdtype: "metadata",
        cmd: "getSubSysDictList"
    };
    reqOps.success = function (data) {
        lst = data.list;
        for (var i = 0; i < lst.length; i++) {
            subsysList[lst[i].subsysId] = lst[i].subsysName;
        }
    }
    reqOps.fail = function (retcode) {
        minAlert(retcode)
    }
    $.ajaxPost(reqOps);
};

U.clickTitleSort = function (event, sortField) {
    U.isSort = U.isSort == "desc" ? "asc" : "desc";
    U.sortField = sortField;
};
U.sortByTitle = function (sortList) {
    if (U.isSort) {
        sortList.sort(function (a, b) {
            if (typeof (b[U.sortField]) == "number") {
                return U.isSort == "asc" ? a[U.sortField] - b[U.sortField] :
                    b[U.sortField] - a[U.sortField];
            }
            return U.isSort == "asc" ? a[U.sortField].localeCompare(b[U.sortField]) :
                b[U.sortField].localeCompare(a[U.sortField]);
        });
    }
};
// U.setTestToken("6ad91a1523ec48ffbe115ea442c121ec",1556166726548);


