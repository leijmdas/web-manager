$(function () {
    var vm = new Vue({
        el: '#app',
        data: {
            url: '/rest/webpagemng',
            resourceList: [],
            resTypeObj: {
                1: '项目协作介绍',
                2: '成功案例',
                3: '顶部轮播图',
                4: '找项目',
                5: '发需求'
            },
            resourceTable: {
                tableSelector: '#pw-se-table',
                tableToolbar: '#pw-se-table-toolbar',
                columns: [
                    {field: 'resId', title: '资源ID', width: 100},
                    {
                        field: 'resType', title: '资源类型', width: 200, formatter: function (value, row, index) {
                            return value + '--' + vm.resTypeObj[value];
                        }
                    },
                    {field: 'title', title: '标题', width: 200},
                    {field: 'content', title: '内容'},
                    {
                        field: 'imgDocId', title: '缩略图预览', width: 200, formatter: function (value, row, index) {
                            var $img = $('<img src="" width="100" height="100">');
                            $img.attr('src', vm.imgSrcArr(value));
                            return $img.prop('outerHTML');
                        }
                    },
                    {field: 'sortNo', title: '排序', sortable: true, order: 'asc', width: 100},
                    {
                        field: 'createTime',
                        title: '创建时间',
                        sortable: true,
                        order: 'desc',
                        width: 150,
                        formatter: function (value, row, index) {
                            return U.timeFormatString(value);
                        }
                    },
                    {
                        title: '操作', width: 200, formatter: function (value, row, index) {
                            var $toolbar = $('<div class="btn-toolbar"></div>');
                            var $btnGroup = $([
                                '<div class="btn-group">',
                                '<button type="button" class="btn btn-default btn-sm modify">修改</button>',
                                '<button type="button" class="btn btn-default btn-sm remove">删除</button>',
                                '</div>'
                            ].join(''));
                            $toolbar.append($btnGroup);
                            return $toolbar.prop('outerHTML');
                        },
                        events: {
                            'click .modify': function (e, value, row) {
                                e.stopPropagation();
                                vm.resourceModalObj = $.extend({}, row, {
                                    panelTitle: '修改' + vm.tabInfo.text,
                                    resType: vm.getResTypeByTabIndex(vm.tabInfo.index)
                                });
                                $('#modal-resource').modal('show');
                            },
                            'click .remove': function (e, value, row) {
                                e.stopPropagation();
                                var data = row;
                                layer.confirm('确认删除ID=' + data.resId + '的数据？', function (index) {
                                    $.ajaxPost({
                                        url: vm.url,
                                        cmdtype: 'pageResourceMng',
                                        cmd: 'removePageResource',
                                        data: {
                                            resId: data.resId
                                        },
                                        success: function () {
                                            layer.close(index);
                                            vm.ajaxResourceList();
                                        }
                                    });
                                });
                            }
                        }
                    }
                ],
                tableClickRowCallback: function () {
                }
            },
            resourceModalObj: {},
            resourceModalInit: {
                panelTitle: '',
                resId: 0,
                resType: 0,
                title: '',
                content: '',
                imgDocId: 0,
                sortNo: 0
            },
            tabInfo: {
                index: 0,
                text: '项目协作介绍'
            },
            indexToResType: {
                0: 3,
                1: 1,
                2: 2,
                3: 4,
                4: 5
            },
            uploadImgFailMsg: '',
            uploadImgMsgBody: {
                url: '/rest/upload',
                cmdtype: 'templateDocument',
                cmd: 'uploadPIC',
                data: {}
            }
        },
        methods: {
            showContent: function (resType) {
                return [1, 2, 4, 5].indexOf(resType) !== -1;
            },
            isTextArea: function (resType) {
                return [4, 5].indexOf(resType) !== -1;
            },
            getResTypeByTabIndex: function (index) {
                var vm = this;
                return vm.indexToResType[index];
            },
            tabClick: function (e) {
                var target = e.target;
                var $target = $(target);
                var index = $target.parent().index();
                var text = $target.text();
                if (vm.tabInfo.index !== index) {
                    vm.tabInfo.index = index;
                    vm.tabInfo.text = text;
                    this.ajaxResourceList(vm.getResTypeByTabIndex(index));
                }
            },
            ajaxResourceList: function (resType) {
                var vm = this;
                if (!resType) {
                    resType = vm.getResTypeByTabIndex(vm.tabInfo.index);
                }
                $.ajaxPost({
                    url: '/rest/webpagemng',
                    cmdtype: 'pageResourceMng',
                    cmd: 'selectPageResourceList',
                    data: {
                        resType: resType
                    },
                    success: function (msgBody) {
                        vm.resourceList = msgBody.list;
                        var columns = $.extend(true, [], vm.resourceTable.columns);
                        if (resType === 3) {
                            $.each(columns, function (i, item) {
                                if (item.field === 'title' || item.field === 'content') {
                                    item.visible = false;
                                }
                            });
                        }
                        U.bs.table.render.call(vm, vm.resourceTable.tableSelector, vm.resourceTable.tableToolbar, columns, vm.resourceList, vm.resourceTable.tableClickRowCallback);
                    }
                });
            },
            showResourceModalAdd: function (e) {
                vm.resourceModalObj = $.extend({}, vm.resourceModalInit, {
                    panelTitle: '添加' + vm.tabInfo.text,
                    resType: vm.getResTypeByTabIndex(vm.tabInfo.index)
                });
                $('#modal-resource').modal('show');
            },
            submitResource: function (e) {
                var cmd = vm.resourceModalObj.resId === 0 ? 'addPageResource' : 'updatePageResource';
                $.ajaxPost({
                    url: vm.url,
                    cmdtype: 'pageResourceMng',
                    cmd: cmd,
                    data: vm.resourceModalObj,
                    success: function () {
                        $('#modal-resource').modal('hide');
                        vm.ajaxResourceList(vm.getResTypeByTabIndex(vm.tabInfo.index));
                    }
                });
            },
            imgSrcArr: function (imgDocId) {
                if (imgDocId === 0) {
                    return [];
                }
                var restApi = '/rest/template/previewImage';
                var msgBody;
                msgBody = $.paramsToBase64({
                    cmdtype: 'templateDocument',
                    cmd: 'previewJson',
                    data: {
                        documentId: imgDocId
                    }
                });
                return [restApi + '?msgBody=' + msgBody];
            },
            uploadImgVerifyFail: function (obj) {
                if (obj.failType === 'accept') {
                    vm.uploadImgFailMsg = '类型必须是：' + obj.accept + ' , 当前文件的类型：' + obj.type + '。';
                } else if (obj.failType === 'size') {
                    vm.uploadImgFailMsg = '大小必须限制在：' + U.fileSizeToString(obj.size) + '内 , 当前文件的大小：' + U.fileSizeToString(obj.curFileSize) + '。';
                }
            },
            uploadImgSuccess: function (msgBody) {
                vm.resourceModalObj.imgDocId = msgBody.documentId;
                vm.uploadImgFailMsg = '';
            },
            uploadImgFail: function (retcode, retmsg) {
                vm.uploadImgFailMsg = '上传失败！';
            },
            uploadImgRemove: function (index) {
                $.ajaxPost({
                    url: '/rest/template',
                    cmdtype: 'templateDocument',
                    cmd: 'delReDocument',
                    data: {
                        documentId: vm.resourceModalObj.imgDocId
                    },
                    success: function (msgBody) {
                        vm.resourceModalObj.imgDocId = 0;
                    }
                });
            }
        },
        computed: {},
        mounted: function () {
            this.ajaxResourceList();
        }
    });
});