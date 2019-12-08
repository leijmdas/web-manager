$(function () {
    var vm = new Vue({
        el: '#app',
        data: {
            url: '/rest/webpagemng',
            listTree: [],
            curQueType: {
                id: 0
            },
            existSelNode: false,
            treeObj: {},
            treeNodes: [],
            questionPageData: {},
            questionTable: {
                tableSelector: '#question-table',
                tableToolbar: '#question-table-toolbar',
                toolbarBtn: [
                    {
                        btnName: '添加', className: 'btn-primary', onClick: function (e) {
                            vm.questionModalObj = $.extend({}, vm.questionModalInit, {
                                panelTitle: '添加问题',
                                typeId: vm.curQueType.id,
                                typeName: vm.curQueType.typeName
                            });
                            $('#modal-question').modal('show');
                        }
                    }
                ],
                columns: [
                    {field: 'qid', title: 'ID', width: 100, visible: false},
                    {field: 'typeId', title: '类别ID', width: 100, visible: false},
                    {field: 'typeName', title: '类别名称', width: 150},
                    {field: 'title', title: '问题', width: 300},
                    {field: 'content', title: '答案', width: 300},
                    {
                        field: 'mark', title: '标记', width: 200, formatter: function (value, row, index) {
                            if ([4, 5, 6].indexOf(row.typeId) !== -1) {
                                return '-';
                            }
                            var obj = {
                                1: '无',
                                2: '入门教程',
                                3: '快速引导'
                            };
                            var $btnGroup = $([
                                '<div class="btn-group">',
                                '<button type="button" class="btn btn-warning btn-sm dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">',
                                ' 标记为 <span class="caret"></span>',
                                '</button>',
                                '<ul class="dropdown-menu">',
                                '<li><a href="javascript:;">无</a></li>',
                                '<li><a href="javascript:;">入门教程</a></li>',
                                '<li><a href="javascript:;">快速引导</a></li>',
                                '</ul>',
                                '</div>'
                            ].join(''));
                            var s = '<span>' + obj[row.mark] + '</span>';
                            return s + $btnGroup.prop('outerHTML');
                        },
                        events: {
                            'click .dropdown-menu': function (e, value, row) {
                                var $target = $(e.target);
                                var index = $target.parent().index();
                                $.ajaxPost({
                                    url: vm.url,
                                    cmdtype: 'customerServiceCenter',
                                    cmd: 'updateQuestion',
                                    data: {
                                        qid: row.qid,
                                        mark: index + 1
                                    },
                                    success: function () {
                                        vm.renderQuestionTable();
                                    }
                                });
                            }
                        }
                    },
                    {field: 'picDocId', title: '缩略图', width: 150},
                    {field: 'btnName', title: '按钮名称', width: 100},
                    {field: 'forwardUrl', title: '跳转网页地址', width: 200},
                    {field: 'sortNo', title: '排序', sortable: true, width: 100},
                    {
                        title: '操作', width: 200, formatter: function (value, row, index) {
                            var $toolbar = $('<div class="btn-toolbar"></div>');
                            var $btnGroup = $([
                                '<div class="btn-group">',
                                '<button type="button" class="btn btn-warning btn-sm modify">修改</button>',
                                '<button type="button" class="btn btn-danger btn-sm remove">删除</button>',
                                '</div>'
                            ].join(''));
                            $toolbar.append($btnGroup);
                            return $toolbar.prop('outerHTML');
                        },
                        events: {
                            'click .modify': function (e, value, row) {
                                e.stopPropagation();
                                vm.questionModalObj = $.extend({}, row, {
                                    panelTitle: '修改问题',
                                    typeName: vm.curQueType.typeName
                                });
                                $('#modal-question').modal('show');
                            },
                            'click .remove': function (e, value, row) {
                                e.stopPropagation();
                                var data = row;
                                layer.confirm('确认删除ID=' + data.qid + '的问题？', function (index) {
                                    $.ajaxPost({
                                        url: vm.url,
                                        cmdtype: 'customerServiceCenter',
                                        cmd: 'removeQuestion',
                                        data: {
                                            qid: data.qid
                                        },
                                        success: function () {
                                            layer.close(index);
                                            vm.renderQuestionTable();
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
            questionTableQueryParams: {},

            questionViewPageData: {},
            questionViewTable: {
                tableSelector: '#question-view-table',
                tableToolbar: '#question-view-table-toolbar',
                toolbarBtn: [],
                columns: [
                    {field: 'qid', title: 'ID', width: 100, visible: false},
                    {field: 'typeId', title: '类别ID', width: 100, visible: false},
                    {field: 'typeName', title: '类别名称', width: 150},
                    {field: 'title', title: '问题', width: 300},
                    {field: 'content', title: '答案', width: 300},
                    {
                        field: 'mark', title: '标记', width: 200, formatter: function (value, row, index) {
                            var obj = {
                                1: '无',
                                2: '入门教程',
                                3: '快速引导'
                            };
                            return '<span>' + obj[row.mark] + '</span>';
                        }
                    },
                    {field: 'picDocId', title: '缩略图', width: 150},
                    {field: 'btnName', title: '按钮名称', width: 100},
                    {field: 'forwardUrl', title: '跳转网页地址', width: 200},
                    {field: 'sortNo', title: '排序', sortable: true, width: 100}
                ],
                tableClickRowCallback: function () {
                }
            },
            questionTableViewQueryParams: {},
            questionModalObj: {},
            questionModalInit: {
                panelTitle: '',
                qid: 0,
                typeId: 0,
                typeName: '',
                title: '',
                content: '',
                mark: 1,
                picDocId: 0,
                btnName: '',
                forwardUrl: '',
                sortNo: 0

            },
            queTypeModalObj: {},
            queTypeModalInit: {
                id: 0,
                typeName: '',
                parentId: 0,
                sortNo: 0
            },
            tabInfo: {
                index: 0,
                text: '问题类别'
            },
            uploadImgFailMsg: '',
            uploadImgMsgBody: {
                url: '/rest/upload',
                cmdtype: 'templateDocument',
                cmd: 'uploadPIC',
                data: {}
            },

            //热搜
            hotSearchPanelInfo: {
                title: ''
            },
            hotSearchModalObj: {},
            hotSearchModalObjInit: {
                id: 0,
                keyword: '',
                count: 0
            },
            hotSearchTable: {
                tableSelector: '#hot-search-table',
                tableToolbar: '#hot-search-table-toolbar',
                toolbarBtn: [
                    {
                        btnName: '添加', className: 'btn-primary', onClick: function (e) {
                            vm.hotSearchModalObj = $.extend({}, vm.hotSearchModalObjInit);
                            vm.hotSearchPanelInfo.title = '添加热搜关键词';
                            $('#modal-hot-search').modal('show');
                        }
                    }
                ],
                columns: [
                    {field: 'id', title: 'ID', width: 100, sortable: true, order: 'asc'},
                    {field: 'keyword', title: '关键词', width: 500},
                    {field: 'count', title: '搜索次数', width: 100, sortable: true, order: 'desc'},
                    {
                        title: '操作', width: 300, formatter: function (value, row, index) {
                            var $toolbar = $('<div class="btn-toolbar"></div>');
                            var $btnGroup = $([
                                '<div class="btn-group">',
                                '<button type="button" class="btn btn-warning btn-sm modify">修改</button>',
                                '<button type="button" class="btn btn-danger btn-sm remove">删除</button>',
                                '</div>'
                            ].join(''));
                            $toolbar.append($btnGroup);
                            return $toolbar.prop('outerHTML');
                        },
                        events: {
                            'click .modify': function (e, value, row) {
                                e.stopPropagation();
                                vm.hotSearchModalObj = $.extend({}, row);
                                vm.hotSearchPanelInfo.title = '修改热搜关键词';
                                $('#modal-hot-search').modal('show');
                            },
                            'click .remove': function (e, value, row) {
                                e.stopPropagation();
                                var data = row;
                                layer.confirm('确认删除ID=' + data.id + '的数据？', function (index) {
                                    layer.close(index);
                                    $.ajaxPost({
                                        url: vm.url,
                                        cmdtype: 'customerHotServiceCenter',
                                        cmd: 'removeHotSearch',
                                        data: {
                                            id: data.id
                                        },
                                        success: function () {
                                            layer.close(index);
                                            vm.renderHotSearchTable();
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
            hotSearchTableQueryParams: {}
        },
        methods: {
            tabClick: function (e) {
                var target = e.target;
                var $target = $(target);
                var index = $target.parent().index();
                var text = $target.text();
                if (vm.tabInfo.index !== index) {
                    vm.tabInfo.index = index;
                    vm.tabInfo.text = text;
                    switch (index) {
                        case 0: {
                            break;
                        }
                        case 1:
                        case 2: {
                            vm.renderQuestionViewTable({
                                question: {
                                    mark: index + 1
                                },
                                pageNo: 1,
                                limit: 10
                            });
                            break;
                        }
                        case 3: {
                            vm.renderHotSearchTable({
                                /*question: {
                                    mark: index + 1
                                },
                                pageNo: 1,
                                limit: 10*/
                            });
                        }
                    }
                }
            },
            ajaxQueTypeListTree: function () {
                var vm = this;
                $.ajaxPost({
                    url: vm.url,
                    cmdtype: 'customerServiceCenter',
                    cmd: 'selQueTypeListTree',
                    data: {},
                    success: function (msgBody) {
                        vm.listTree = msgBody.list;
                        var setting = {
                            data: {
                                key: {
                                    name: 'typeName',
                                    children: 'child'
                                }
                            },
                            callback: {
                                onClick: function zTreeOnClick(event, treeId, treeNode) {
                                    vm.curQueType = treeNode;
                                    vm.existSelNode = true;
                                    //如果无子节点,则加载类别对应的问题表格数据
                                    if (!treeNode.isParent) {
                                        vm.renderQuestionTable({
                                            question: {
                                                typeId: treeNode.id
                                            },
                                            pageNo: 1,
                                            limit: 10
                                        });
                                    }
                                }
                            }
                        };
                        vm.treeObj = $.fn.zTree.init($('#queTypeTree'), setting, vm.listTree);
                        vm.treeNodes = vm.treeObj.getNodes();
                        /*if (vm.treeNodes.length > 0) {
                            vm.treeObj.selectNode(vm.treeNodes[0]);
                            vm.curQueType = vm.treeNodes[0];
                        }*/
                    }
                });
            },
            parseTime: function (time) {
                return U.timeFormatString(time);
            },
            renderQuestionTable: function (queryParams) {
                var vm = this;
                if (queryParams) {
                    vm.questionTableQueryParams = queryParams;
                }
                $.ajaxPost({
                    url: vm.url,
                    cmdtype: 'customerServiceCenter',
                    cmd: 'questionPageData',
                    data: vm.questionTableQueryParams,
                    success: function (msgBody) {
                        vm.questionPageData = msgBody.list;
                        vm.questionTable.data = vm.questionPageData.list;
                        U.bs.table.render(vm.questionTable);
                    }
                });
            },
            renderQuestionViewTable: function (queryParams) {
                var vm = this;
                if (queryParams) {
                    vm.questionTableViewQueryParams = queryParams;
                }
                $.ajaxPost({
                    url: vm.url,
                    cmdtype: 'customerServiceCenter',
                    cmd: 'questionPageData',
                    data: vm.questionTableViewQueryParams,
                    success: function (msgBody) {
                        vm.questionViPageData = msgBody.list;
                        vm.questionViewTable.data = vm.questionViPageData.list;
                        U.bs.table.render(vm.questionViewTable);
                    }
                });
            },
            submitQuestion: function (e) {
                var cmd = vm.questionModalObj.qid === 0 ? 'addQuestion' : 'updateQuestion';
                $.ajaxPost({
                    url: vm.url,
                    cmdtype: 'customerServiceCenter',
                    cmd: cmd,
                    data: vm.questionModalObj,
                    success: function () {
                        $('#modal-question').modal('hide');
                        vm.renderQuestionTable();
                    }
                });
            },
            queTypeTreeToolbarClick: function (e, index) {
                if ([2, 3].indexOf(index) !== -1 && !vm.existSelNode) {
                    layer.alert('请选择一个节点！', function (index) {
                        layer.close(index);
                    });
                    return;
                }
                switch (index) {
                    case 1: {//添加
                        vm.queTypeModalObj = $.extend({}, vm.queTypeModalInit, {
                            panelTitle: '添加问题类别',
                            parentId: vm.curQueType.id
                        });
                        $('#modal-que-type').modal('show');
                        break;
                    }
                    case 2: {//编辑
                        vm.queTypeModalObj = $.extend({}, vm.curQueType, {
                            panelTitle: '修改问题类别'
                        });
                        $('#modal-que-type').modal('show');
                        break;
                    }
                    case 3: {//删除
                        var data = vm.curQueType;
                        var node = vm.treeObj.getNodeByParam('id', data.id);
                        if (node.isParent) {
                            layer.alert('该节点下存在子节点，不允许删除！', function (index) {
                                layer.close(index);
                            });
                            return;
                        }
                        layer.confirm('确认删除ID=' + data.id + '的问题类别？', function (index) {
                            $.ajaxPost({
                                url: vm.url,
                                cmdtype: 'customerServiceCenter',
                                cmd: 'removeQueType',
                                data: {
                                    id: data.id
                                },
                                success: function (msgBody) {
                                    layer.close(index);
                                    vm.renderTree('delete', msgBody.list[0]);
                                }
                            });
                        });
                        break;
                    }
                    default: {

                    }
                }
            },
            submitQueType: function (e) {
                var cmd = vm.queTypeModalObj.id === 0 ? 'addQueType' : 'updateQueType';
                $.ajaxPost({
                    url: vm.url,
                    cmdtype: 'customerServiceCenter',
                    cmd: cmd,
                    data: vm.queTypeModalObj,
                    success: function (msgBody) {
                        $('#modal-que-type').modal('hide');
                        vm.renderTree(cmd === 'addQueType' ? 'add' : 'update', msgBody.list[0]);
                    }
                });
            },
            renderTree: function (act, dataObj) {
                var curNode = vm.treeObj.getNodeByParam('id', dataObj.id, null);
                var parentNode = vm.treeObj.getNodeByParam('id', dataObj.parentId, null);
                switch (act) {
                    case 'add': {
                        curNode = dataObj;
                        if (dataObj.parentId > 0) {//添加的是子节点
                            vm.treeObj.addNodes(parentNode, curNode);
                        } else {//添加的是根节点
                            vm.treeObj.addNodes(null, curNode);
                        }
                        break;
                    }
                    case 'update': {
                        curNode = $.extend(curNode, dataObj);
                        vm.treeObj.updateNode(curNode);
                        break;
                    }
                    case 'delete': {
                        vm.treeObj.removeNode(curNode);
                        break;
                    }
                }
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
            },
            renderHotSearchTable: function (queryParams) {
                var vm = this;
                if (queryParams) {
                    vm.hotSearchTableQueryParams = queryParams;
                }
                $.ajaxPost({
                    url: vm.url,
                    cmdtype: 'customerHotServiceCenter',
                    cmd: 'selHot',
                    data: vm.hotSearchTableQueryParams,
                    success: function (msgBody) {
                        vm.hotSearchTable.data = vm.hotSearchDataList = msgBody.list;
                        U.bs.table.render(vm.hotSearchTable);
                    }
                });
            },
            submitHotSearch: function (e) {
                var cmd = vm.hotSearchModalObj.id === 0 ? 'addHotSearch' : 'updateHotSearch';
                $.ajaxPost({
                    url: vm.url,
                    cmdtype: 'customerHotServiceCenter',
                    cmd: cmd,
                    data: vm.hotSearchModalObj,
                    success: function (msgBody) {
                        $('#modal-hot-search').modal('hide');
                        vm.renderHotSearchTable();
                    }
                });
            }
        },
        computed: {},
        mounted: function () {
            this.ajaxQueTypeListTree();
        }
    });
});