var YTBUI = {};

var ytbComponents = [];

var noop = function () {

};

var randomNum = 0;

var getRandomId = function () {
    return 'random-num-' + (++randomNum);
};

//上传组件
var ytbUploadImg = {
    name: 'ytb-upload',
    props: {
        uploadType: {
            type: String,
            default: 'img-list' // img-list/file
        },
        preview: {
            type: Boolean,
            default: false
        },
        imgSrcArr: {
            type: Array,
            default: function () {
                return []
            }
        },
        msgBody: {
            type: Object,
            default: function () {
                return {}
            }
        },
        limit: {
            type: Number,
            default: 5
        },
        accept: {
            type: String,
            default: 'image/png,image/jpg,image/jpeg'

        },
        size: {
            type: Number,
            default: 1024 * 1024 // 默认1MB
        },
        onVerifyFail: {
            type: Function,
            default: noop
        },
        onSuccess: {
            type: Function,
            default: noop
        },
        onFail: {
            type: Function,
            default: noop
        },
        onRemove: {
            type: Function,
            default: noop
        },
        fileData: {
            type: Object,
            default: function () {
                return {
                    desc: '请上传文件：',
                    filename: '',
                    downloadUrl: ''
                }
            }
        }
    },
    data: function () {
        return {
            showBtnGroupArr: []
        }
    },
    template: [
        '<div class="ytb-upload" :class="classObject">',

        '<template v-if="uploadType===\'img-list\'">',

        '<div class="ytb-img-list" v-if="imgSrcArr.length>0">',

        '<span class="ytb-img-wrap" v-for="(src,index) in imgSrcArr" @mouseenter="hover" @mouseleave="hover">',
        '<img :src="src" class="ytb-img-own">',
        '<div class="ytb-img-btn-group-wrap">',
        '<div class="ytb-img-btn-group">',
        '<a href="javascript:;" class="ytb-img-btn-see"></a>',
        '<a href="javascript:;" class="ytb-img-btn-remove" v-if="!preview" @click="removePic($event,index)"></a>',
        '</div>',
        '</div>',
        '</span>',

        '</div>',

        '<div class="ytb-img-show" v-else></div>',

        '<span class="ytb-img-upload-btn" v-if="!preview && !isLimit" @click="clickUploadBtn">',
        '<input type="file" class="ytb-upload-input-file-own" @change="upload">',
        '</span>',

        '<div><slot></slot></div>',

        '</template>',

        '<template v-else-if="uploadType===\'file\'">',

        '<div class="ytb-file-upload-wrap">',

        '<span class="ytb-upload-file-desc">{{fileData.desc}}</span>',
        '<a :href="fileData.downloadUrl" class="ytb-upload-file-name">{{fileData.filename}}</a>',
        '<span class="ytb-file-upload-btn" @click="clickUploadBtn">上传',
        '<input type="file" class="ytb-upload-input-file-own" @change="upload">',
        '</span>',

        '</div>',

        '<div><slot></slot></div>',

        '</template>',

        '<template v-else-if="uploadType===\'file-list\'">',

        '<div class="ytb-file-upload-wrap">',
        '<span class="ytb-upload-file-desc">{{fileData.desc}}</span>',
        '<span class="ytb-file-upload-btn" @click="clickUploadBtn">上传',
        '<input type="file" class="ytb-upload-input-file-own" @change="upload">',
        '</span>',

        '<div class="ytb-file-list-wrap">',
        '<div class="ytb-file-list-item" v-for="(e,index) in fileData.fileInfoArr">',
        '<a :href="e.downloadUrl" class="ytb-upload-file-name">{{e.filename}}</a>',
        '<a href="javascript:;" @click="remFile($event,index)">删除</a>',
        '</div>',
        '</div>',

        '</div>',

        '<div><slot></slot></div>',

        '</template>',

        '</div>'
    ].join(''),
    methods: {
        clickUploadBtn: function (e) {
            var target = e.target;
            var inputFile = target.children[0];
            inputFile.dispatchEvent(new MouseEvent('click'));
        },
        upload: function (e) {
            var that = this;
            var target = e.target;
            var file = target.files[0];
            var opt = $.extend({}, this.msgBody);
            opt.data = opt.data || {};
            opt.data.file = file;
            opt.success = this.onSuccess;
            opt.fail = this.onFail;
            var complete = function () {
                target.value = '';
            };
            opt.complete = complete;
            $.ajaxPost(opt, true, this.accept, this.size, function () {
                if (arguments[0] === 'accept') {//格式验证不通过
                    that.onVerifyFail({
                        failType: 'accept',
                        accept: arguments[1],
                        type: arguments[2]
                    });
                } else if (arguments[0] === 'size') {//大小验证不通过
                    that.onVerifyFail({
                        failType: 'size',
                        size: arguments[1],//限制大小 B为单位
                        curFileSize: arguments[2]//当前文件大小 B为单位
                    });
                }
                complete();
            });
        },
        hover: function (e) {
            var target = e.target, $target = $(target);
            var $btnGroup = $($target.find('.ytb-img-btn-group-wrap')[0]);
            if (e.type === 'mouseenter') {
                $btnGroup.show();
            } else {
                $btnGroup.hide();
            }
        },
        removePic: function (e, index) {
            this.onRemove(index);
        },
        remFile: function (e, index) {
            this.removePic(e, index);
        }
    },
    computed: {
        classObject: function () {
            var classArr = [];
            if (this.uploadType === 'img-list') {
                classArr.push('ytb-img-upload');
            } else if (this.uploadType === 'file') {
                classArr.push('ytb-file-upload');
            } else if (this.uploadType === 'file-list') {
                classArr.push('ytb-file-list-upload');
            }
            return classArr;
        },
        isLimit: function () {
            return this.imgSrcArr.length >= this.limit;
        }
    }
};
ytbComponents.push(ytbUploadImg);

var ytbBangBang = {
    name: 'ytb-bang-bang',
    props: {},
    template: [
        '<div class="ytb-bang-bang-wrap">',
        '<ul class="ytb-bang-bang-friend">',

        '<li>',
        '<span class="ytb-bang-bang-logo" @click="popBangBangPanel"></span>',
        '<ul class="ytb-bang-bang-menu">',
        '<li><a href="javascript:;" class="ytb-bang-bang-menu-item"><span>如何使用</span></a></li>',
        '<li><a href="javascript:;" class="ytb-bang-bang-menu-item"><span>联系客服</span></a></li>',
        '<li class="ytb-bang-bang-menu-child-last"><span class="ytb-bang-bang-menu-arrow-up"></span></li>',
        '</ul>',
        '</li>',

        '</ul>',
        '</div>'
    ].join(''),
    data: function () {
        return {
            offset: {},
            open: false
        };
    },
    computed: {},
    methods: {
        getBangBangUrl: function () {
            var token = sessionStorage.token;
            var getLogSso = JSON.parse(sessionStorage.getLogSso);
            var userId = getLogSso.userId;
            var params = ['userId=' + userId, 'token=' + token].join('&');
            return encodeURI('//bangbang.youtobon.com/bangbang/views/index.jsp?' + params);
        },
        popBangBangPanel: function () {
            // top.window.open(this.getBangBangUrl(), '_blank');
            var vmThis = this;
            if (BBAPI.layerIndex !== undefined) {
                return;
            }
            var offset = vmThis.getOffset();
            layer.config({
                extend: 'bangbang/style.css'
            });
            layer.open({
                type: 2,
                area: ['262px', '524px'],
                content: vmThis.getBangBangUrl(),
                skin: 'layer-ext-bangbang',
                shade: 0,
                resize: false,
                move: false,
                title: false,
                closeBtn: 0,
                offset: [offset.top + 'px', offset.left + 'px'],
                success: function (layero, index) {
                    BBAPI.layerIndex = index;
                    /*layer.style(index, {
                        'border': 'none',
                        'box-shadow': 'none',
                        'background': 'none'
                    });*/
                }
            });
        },
        getOffset: function () {
            var $logo = this.get$Logo();
            var w = $logo.width();
            return {
                left: this.offset.left - (262 - w),
                top: this.offset.top - 524
            }
        },
        get$Logo: function () {
            var $el = $(this.$el);
            return $el.find('.ytb-bang-bang-logo');
        },
        resize: function () {
            var vmThis = this;
            var offset = vmThis.getOffset();
        }
    },
    mounted: function () {
        var $logo = this.get$Logo();
        var offset = $logo.offset();
        this.offset = {left: offset.left, top: offset.top};
        var vmThis = this;
        $(window).resize(function () {
            vmThis.resize();
        });
    }
};
ytbComponents.push(ytbBangBang);

var ytbRichTextarea = {
    name: 'ytb-rich-textarea',
    props: {
        id: {
            type: String,
            default: function () {
                return getRandomId();
            }
        },
        value: String//v-model
    },
    data: function () {
        return {
            editorIns: null
        }
    },
    template: [
        '<div class="ytb-rich-textarea-wrap">',
        '<textarea :id="id" :value="value"></textarea>',
        '</div>'
    ].join(''),
    computed: {},
    methods: {},
    mounted: function () {
        var that = this;
        this.editorIns = UE.getEditor(this.id, {
            zIndex: 2000,
            enableContextMenu: false,
            initialFrameHeight: 200,
            toolbars: [
                [
                    'source', //源代码
                    'fontfamily', //字体
                    'fontsize', //字号
                    'forecolor', //字体颜色
                    'backcolor', //背景色
                    'bold', //加粗
                    'italic', //斜体
                    'underline', //下划线
                    'strikethrough',//删除线
                    'justifyleft', //居左对齐
                    'justifyright', //居右对齐
                    'justifycenter', //居中对齐
                    'justifyjustify', //两端对齐
                    'link', //超链接
                    'removeformat', //清除格式
                    'help' //帮助
                ]
            ]
        });
        this.editorIns.addListener('contentChange', function () {
            that.$emit('input', that.editorIns.getContent());
        });
    },
    watch: {
        value: function (newVal, oldVal) {
            this.editorIns.setContent(newVal);
            this.editorIns.focus(true);
        }
    }
};
ytbComponents.push(ytbRichTextarea);

var ytbDialog = {
    name: 'ytb-dialog',
    props: {
        visible: Boolean,
        title: {
            type: String,
            default: ''
        },
        width: {
            type: String,
            default: '300px'
        },
        btnDirect: {
            type: String,
            default: 'right'
        }
    },
    data: function () {
        return {
            modalId: ''
        }
    },
    template: [
        '<div class="ytb-dialog-wrap" v-show="visible">',
        '<div class="ytb-dialog" :style="{width:width}">',
        '<div class="ytb-dialog-header">',
        '<span class="ytb-dialog-title">{{title}}</span>',
        '<div class="ytb-dialog-header-btn-group">',
        '<slot name="header"></slot>',
        '</div>',
        '</div>',
        '<div class="ytb-dialog-body"><slot></slot></div>',
        '<div class="ytb-dialog-footer"><slot name="footer"></slot></div>',
        '</div>',
        '</div>'
    ].join(''),
    computed: {},
    methods: {
        open: function () {
            $('#' + this.modalId).show();
        },
        close: function () {
            $('#' + this.modalId).hide();
        }
    },
    created: function () {
        this.modalId = getRandomId();
        var div = document.createElement('div');
        div.className = 'ytb-modal';
        div.id = this.modalId;
        document.body.appendChild(div);
    },
    mounted: function () {
        $('#' + this.modalId).insertAfter($(this.$el));
        this.visible ? this.open() : this.close();
    },
    watch: {
        visible: function (newVal) {
            newVal ? this.open() : this.close();
        }
    }
};
ytbComponents.push(ytbDialog);

//邀请好友
var ytbInviteFriend = {
    name: 'ytb-invite-friend',
    props: {
        dataObj: Object,
        result: {
            type: Array,
            default: function () {
                return [];
            }
        },
        limit: {
            type: Number,
            default: 1
        }
    },
    data: function () {
        return {
            curSelectedFriend: null,
            $preSelectedFriend: null,
            addedNum: 0,
            searchContent: '',
            friends: [],
            groups: [],
            tabIndex: 0
        }
    },
    computed: {},
    template: [
        '<div class="ytb-invite-friend clearfix">',

        '<div class="ytb-friend pull-left">',

        '<div class="ytb-input-box">',
        '<label class="ytb-label">搜索</label>',
        '<div class="ytb-input-wrap">',
        '<input type="text" class="ytb-input" v-model="searchContent">',
        '</div>',
        '<a href="javascript:;" class="ytb-input-search-btn" @click="searchFriend"></a>',
        '</div>',

        '<div class="ytb-friend-wrap clearfix">',

        '<div class="nav-btn-group-wrap pull-left">',
        '<div class="nav-btn-group">',
        '<div class="nav-btn-wrap" @click="activeSelItem(0)">',
        '<span  class="txl-icon" :class="tabIndex===0?\'txl-icon-active\':\'\'"></span>',
        '<p>通讯录</p>',
        '</div>',
        '<div class="nav-btn-wrap" @click="activeSelItem(1)">',
        '<span  class="group-icon" :class="tabIndex===1?\'group-icon-active\':\'\'"></span>',
        '<p>群组</p>',
        '</div>',
        '</div>',
        '</div>',

        //通讯录
        '<div class="ytb-friend-list pull-right" v-show="tabIndex===0">',
        '<div class="item-friend" v-for="item in friends" @click="clickFriendItem($event,item)">',
        '<span class="user-icon"></span>',
        '<span class="user-name">{{item.realName}}</span>',
        '</div>',
        '</div>',

        //群组
        '<div class="ytb-friend-list pull-right" v-show="tabIndex===1">',
        '<div class="group-item" v-for="item in groups">',
        '<span class="arrow arrow-close"></span>',
        '<p class="title" @click="groupItemClick">{{item.groupName}}(3)</p>',
        '<div class="user-list">',
        '<div class="user-item" v-for="e in item.userFriendsModel" @click="clickFriendItem($event,e)">',
        '<span class="user-icon"></span>',
        '<span class="user-name">{{e.realName}}</span>',
        '</div>',
        '</div>',
        '</div>',
        '</div>',

        '</div>',

        '</div>',

        '<div class="ytb-friend-control pull-left">',
        '<a href="javascript:;" class="control-arrow" @click="clickRightMove">&gt;</a>',
        '</div>',

        '<div class="ytb-friend-select pull-right">',
        '<div class="ytb-sel-info">',
        '<span class="selected-msg">已选择好友：{{addedNum}}/{{limit}}</span>',
        '<a href="javascript:;" class="all-remove" @click="allRemove">全部移除</a>',
        '</div>',
        '<div class="ytb-friend-select-wrap">',
        '<div class="item-friend" v-for="item in result" @click="clickSelectedFriendItem">',
        '<span class="user-icon"></span>',
        '<span>{{item.realName}}</span>',
        '<a href="javascript:;" class="remove-icon" @click="removeFriendItem($event,item)"></a>',
        '</div>',
        '</div>',
        '</div>',
        '</div>'
    ].join(''),
    methods: {
        groupItemClick: function (e) {
            var target = e.target, $target = $(target);
            var $userList = $target.next('.user-list');
            $userList.toggle();
            var $arrow = $target.prev('.arrow');
            $arrow.removeClass('arrow-open arrow-close');
            if ($userList.is(':visible')) {
                $arrow.addClass('arrow-open');
            } else {
                $arrow.addClass('arrow-close');
            }

        },
        activeSelItem: function (tabIndex) {
            this.tabIndex = tabIndex;
        },
        clickFriendItem: function (e, item) {
            if (this.$preSelectedFriend) {
                this.$preSelectedFriend.css({background: '#fff'});
            }
            $(e.currentTarget).css({background: '#D1D2D3'});
            this.$preSelectedFriend = $(e.currentTarget);
            this.curSelectedFriend = item;
        },
        clickRightMove: function (e) {
            var that = this;
            if (!that.curSelectedFriend) {
                return;
            }
            var exist = false;
            $.each(this.result, function (i, item) {
                if (item.userId === that.curSelectedFriend.userId) {
                    exist = true;
                    return false;
                }
            });
            if (!exist && this.addedNum < this.limit) {
                this.result.push(this.curSelectedFriend);
                this.addedNum++;
            }
        },
        allRemove: function () {
            this.result.splice(0, this.result.length);
            this.addedNum = 0;
        },
        clickSelectedFriendItem: function (e) {
            var $currentTarget = $(e.currentTarget);
            $currentTarget.siblings().css({background: '#fff'}).find('.remove-icon').hide();
            $currentTarget.css({background: '#D1D2D3'}).find('.remove-icon').show();
        },
        removeFriendItem: function (e, item) {
            var index = -1;
            $.each(this.result, function (i, rItem) {
                if (rItem.userId === item.userId) {
                    index = i;
                    return false;
                }
            });
            if (index >= 0) {
                this.result.splice(index, 1);
                this.addedNum--;
            }
        },
        searchFriend: function () {
            var that = this;
            var searchContent = this.searchContent;
            var searchResult = [];
            if (searchContent) {
                $.each(that.dataObj.friendList, function (i, item) {
                    if (item.realName.indexOf(searchContent) !== -1) {
                        searchResult.push(item);
                    }
                });
                that.friends = searchResult;
            } else {
                that.friends = that.dataObj.friendList;
            }
        }
    },
    created: function () {
        this.friends = this.dataObj.friendList;
        this.groups = this.dataObj.groupList;
    },
    mounted: function () {

    },
    watch: {
        dataObj: function (newVal) {
            this.dataObj = newVal;
            this.friends = this.dataObj.friendList;
            this.groups = this.dataObj.groupList;
            this.allRemove();
        }
    }
};
ytbComponents.push(ytbInviteFriend);

//注册组件
for (var i = 0; i < ytbComponents.length; i++) {
    Vue.component(ytbComponents[i].name, ytbComponents[i]);
}

YTBUI.utils = {};
YTBUI.utils.print = function (selector, cssPathArr) {
    /*var printContent = $(selector).html();

    var sourceHtml = document.body.innerHTML;
    document.body.innerHTML = printContent;
    print();
    document.body.innerHTML = sourceHtml;*/

    var $printIframe, printWindow, printDocument;

    var content = $(selector).html();
    var iframeSelector = YTBUI.utils.print.iframeSelector;
    if (!iframeSelector) {
        var id = 'print' + new Date().getTime();
        var $iframe = $('<iframe style="display: none;"></iframe>').attr('id', id);
        $('body').append($iframe);
        iframeSelector = YTBUI.utils.print.iframeSelector = '#' + id;


    }
    $printIframe = $(iframeSelector);
    printWindow = $printIframe.prop('contentWindow');
    printDocument = printWindow.document;
    $.each(cssPathArr, function (i, path) {
        var link = document.createElement('link');
        link.rel = 'stylesheet';
        link.type = 'text/css';
        link.href = path;
        printDocument.getElementsByTagName('head')[0].appendChild(link);
    });
    printDocument.body.innerHTML = content;
    printWindow.print();
};
YTBUI.utils.print.iframeSelector = null;