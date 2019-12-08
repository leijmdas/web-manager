$(function () {
    var URL_ADMIN = '';
    var vm = new Vue({
        el: '#app',
        data: {
            url: '/rest/template',
            repositoryList: [],//模板仓库列表
            curRepository: null,//当前模板仓库
            workJobTypeList: [],//岗位分类列表
            serviceFeeList: [],//服务费列表

            repositoryMap: {},
            workJobTypeMap: {},

            /**
             * 模板仓库相关数据
             */
            //模板仓库状态名称
            stateNameArr: ['草稿', '发布', '停用'],

            //模板仓库 0 预览模式 1 编辑模式
            actionType: 0,


            /**
             * 文档模板相关数据
             */

            docTypeObj: {
                '100': '需求模板',
                '101': '采购单',
                '102': '加工单',

                '200': '工作组计划模板',
                '201': '采购报价单',
                '202': '加工报价单',

                '300': '设计模板',
                '400': '交付模板',
                '500': '其它模板',
                '600': '集成文档',
                '601': '集成设计文档',
                '602': '集成交付模板',
                '603': '测试方案及测试报告',
                '800': '存档文件'
            },

            docTypeModalObjXqs: {
                '100': '需求模板',
                '101': '采购单',
                '102': '加工单'
            },
            docTypeModalObjGzjh: {
                '200': '工作组计划模板',
                '201': '采购报价单',
                '202': '加工报价单'
            },
            docTypeModalObjJcWd: {
                '600': '集成文档',
                '601': '集成设计文档',
                '602': '集成交付模板',
                '603': '测试方案及测试报告'
            },
            //添加模板时动态设置可添加模板类型
            docTypeModalObj: null,

            //记录tab1点击的文档模板类型
            docType: -1,
            //记录点击tab1时,tab的名称
            curTab1Name: '',
            //记录点击tab2时,tab的名称
            curTab2Name: '',

            /**
             * tab2的需求因子需要的相关数据
             */
            curXqsData: null,


            /**
             * bootstrap table 实例保存
             */
            bsTableCache: {},

            /**
             * 文档模板修改对象
             */
            docTplModifyData: {},

            /**
             * 需求因子列表
             */
            reqItemList: [],

            /**
             * 岗位列表
             */
            workJobList: [],

            /**
             * 当前岗位真值约束对象
             */
            curWorkJobCheck: null,

            /**
             * 当前需求因子对象
             */
            curReqItem: {}
        },
        computed: {
            /**
             * 模板仓库相关操作
             */
            //关联岗位分类名称
            repositoryWorkJobTypeName: function () {
                var workJobType = this.workJobTypeMap[this.curRepository.workJobType];
                return workJobType ? workJobType.workJobTypeName : '';
            },
            //模板仓库状态
            repositoryState: function () {
                return this.stateNameArr[this.curRepository.state];
            }
        },
        methods: {
            processData: function () {
                var vmThis = this;
                if (this.repositoryList.length > 0) {
                    this.curRepository = this.repositoryList[0];
                    $.ajaxPost({
                        url: U.rootPath + '/rest/template',
                        cmdtype: 'repository',
                        cmd: 'getWorkJobListByWorkJobTypeId',
                        data: {
                            workJobTypeId: this.curRepository.workJobType
                        },
                        success: function (msgBody) {
                            vmThis.workJobList = msgBody.list;
                        }
                    });
                }
                var i, e;
                for (i = 0; i < this.repositoryList.length; i++) {
                    e = this.repositoryList[i];
                    this.repositoryMap[e.repositoryId] = e;
                }
                for (i = 0; i < this.workJobTypeList.length; i++) {
                    e = this.workJobTypeList[i];
                    this.workJobTypeMap[e.workJobTypeId] = e;
                }
            },
            clickRepositoryItem: function (repositoryId) {
                var vmThis = this;
                if (this.curRepository && this.curRepository.repositoryId !== repositoryId) {
                    this.curRepository = this.repositoryMap[repositoryId];
                    vmThis.tab1Refresh();
                    vmThis.tab2refresh();
                    $.ajaxPost({
                        url: U.rootPath + '/rest/template',
                        cmdtype: 'repository',
                        cmd: 'getWorkJobListByWorkJobTypeId',
                        data: {
                            workJobTypeId: this.curRepository.workJobType
                        },
                        success: function (msgBody) {
                            vmThis.workJobList = msgBody.list;
                        }
                    });
                }
            },
            ensureRelation: function (e) {
                var vmThis = this;
                $.ajaxPost({
                    url: vmThis.url,
                    cmdtype: 'repository',
                    cmd: 'setUpRefAll',
                    data: {
                        repositoryId: vmThis.curRepository.repositoryId,
                        projectId: 0
                    },
                    success: function (msgBody) {
                        layer.alert('确认关系成功！', function (index) {
                            layer.close(index);
                        });
                    }
                });
            },
            /**
             * 模板仓库相关操作
             */
            //编辑模式
            repositoryEdit: function () {
                this.actionType = 1;
            },
            //取消编辑模式
            repositoryCancel: function () {
                this.actionType = 0;
            },
            //保存
            repositorySave: function (e) {
                var that = this;
                var msgBody = $(event.currentTarget).parseFormData();
                $.ajaxPost({
                    url: U.rootPath + '/rest/template',
                    cmdtype: 'repository',
                    cmd: 'modifyRepository',
                    data: msgBody,
                    success: function (msgBody) {
                        // that.init();
                        location.reload();
                    }
                });
            },
            //删除
            repositoryRemove: function () {
                var that = this;
                $.bs.confirm('确认删除吗？', function (e, id) {
                    //关闭模态框
                    $.bs.close(id);
                    //ajax删除
                    var repositoryId = that.curRepository.repositoryId;
                    $.ajaxPost({
                        url: U.rootPath + '/rest/template',
                        cmdtype: 'repository',
                        cmd: 'removeRepository',
                        data: {
                            repositoryId: repositoryId
                        },
                        success: function () {
                            location.reload();
                        }
                    });
                });
            },
            //添加
            repositoryAdd: function (event) {
                var that = this;
                var msgBody = $(event.currentTarget).parseFormData();
                $.ajaxPost({
                    url: U.rootPath + '/rest/template',
                    cmdtype: 'repository',
                    cmd: 'addRepository',
                    data: msgBody,
                    success: function (msgBody) {
                        location.reload();
                    }
                });
            },
            tab1Click: function (e) {
                var vmThis = this;
                var index = $(e.target).parent().index();
                if (index === 1) {
                    vmThis.refreshAllDocTpl();
                }
            },
            tab1Refresh: function () {
                var $tab1 = $('#tab1');
                var index = $tab1.find('li.active').index();
                if (index === 1) {
                    this.refreshAllDocTpl();
                }
            },
            refreshAllDocTpl: function () {
                var vmThis = this;
                var tableSelector = '#all-tpl-table';
                var tableToolbar = '#all-tpl-table-toolbar';
                var data = [];
                var tableClickRowCallback = function () {

                };
                $.ajaxPost({
                    url: U.rootPath + '/rest/template',
                    cmdtype: 'repository',
                    cmd: 'spFindAllTemplateByRepository',
                    data: {
                        repositoryId: vmThis.curRepository.repositoryId,
                        projectId: 0
                    },
                    success: function (msgBody) {
                        data = msgBody.list;
                        vmThis.docTemplateTableInit(tableSelector, tableToolbar, data, tableClickRowCallback);
                        // vmThis.docType = docType;
                        // vmThis.curTab1Name = title;
                    }
                });
            },
            tab2Click: function (e) {
                var index = $(e.target).parent().index();
                this.refreshDocTpl(index);
            },
            tab2refresh: function () {
                var $tab1 = $('#tab2');
                var index = $tab1.find('li.active').index();
                this.refreshDocTpl(index);
            },
            refreshDocTpl: function (index) {
                var vmThis = this;
                var $li = $('#tab2').find('li:eq(' + index + ')');
                var title = $li.find('a').text();
                var tableSelector, tableToolbar, docType, tableClickRowCallback, docTypeArr = [];
                if (index === 0) {
                    tableSelector = '#xqs-tpl-table';
                    tableToolbar = '#xqs-tpl-table-toolbar';
                    docType = '100';
                    tableClickRowCallback = function (rowData) {
                        vmThis.curXqsData = rowData;
                        vmThis.tab2refresh();
                    };
                    vmThis.docTypeModalObj = $.extend({}, vmThis.docTypeModalObjXqs);
                } else if (index === 1) {
                    tableSelector = '#gzz-tpl-table';
                    tableToolbar = '#gzz-tpl-table-toolbar';
                    docType = '200';
                    vmThis.docTypeModalObj = $.extend({}, vmThis.docTypeModalObjGzjh);
                } else {
                    tableSelector = '#jc-tpl-table';
                    tableToolbar = '#jc-tpl-table-toolbar';
                    docType = '600';
                    vmThis.docTypeModalObj = $.extend({}, vmThis.docTypeModalObjJcWd);
                }
                if ([0, 1, 2].indexOf(index) !== -1) {
                    $.each(vmThis.docTypeModalObj, function (k, v) {
                        docTypeArr.push(parseInt(k));
                    })
                }
                var params = {
                    repositoryId: vmThis.curRepository.repositoryId
                };
                if (docTypeArr.length > 0) {
                    params.docTypeArr = docTypeArr;
                } else {
                    params.docType = docType;
                }
                $.ajaxPost({
                    url: U.rootPath + '/rest/template',
                    cmdtype: 'repository',
                    cmd: 'getDocTemplateList',
                    data: params,
                    success: function (msgBody) {
                        var data = msgBody.list;
                        vmThis.docTemplateTableInit(tableSelector, tableToolbar, data, tableClickRowCallback);
                        vmThis.docType = docType;
                        vmThis.curTab1Name = title;
                        if (index === 0) {
                            vmThis.curXqsData = data[0] || {};
                            vmThis.tab3Refresh();
                        }
                    }
                });
            },
            //文档模板表格初始化
            docTemplateTableInit: function (tableSelector, tableToolbar, data, tableClickRowCallback) {
                var vmThis = this;
                var $bsIns = vmThis.bsTableCache[tableSelector];
                if ($bsIns) {
                    $bsIns.bootstrapTable('load', data);
                } else {
                    $bsIns = $(tableSelector).bootstrapTable({
                        columns: [
                            {field: 'templateId', title: '模板ID', sortable: true},
                            {field: 'title', title: '模板名称', sortable: true},
                            {field: 'alias', title: '别名', width: 150, sortable: true},
                            /*{
                                field: 'repositoryNoName',
                                title: '模板仓库编号+名称',
                                width: 200,
                                sortable: true,
                                formatter: function (value, row, index) {
                                    return row.repositoryNo + '-' + row.repositoryName;
                                }
                            },*/
                            {
                                field: 'docXls',
                                title: 'Excel标识',
                                width: 100,
                                formatter: function (value, row, index) {
                                    return row.docXls;
                                }
                            },
                            {
                                field: 'documentId',
                                title: '内容标识',
                                width: 100,
                                formatter: function (value, row, index) {
                                    return row.documentId;
                                }
                            },
                            {
                                field: 'docType',
                                title: '模板类型',
                                width: 150,
                                sortable: true,
                                formatter: function (value, row, index) {
                                    return vmThis.docTypeObj[row.docType];
                                }
                            },
                            {
                                title: '操作', width: 150,
                                formatter: function (value, row, index) {
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
                                    'click .modify': function (e, value, row, index) {
                                        e.stopPropagation();
                                        //弹出修改面板
                                        vmThis.docTplModifyData = row;
                                        $('#modal-modify-doc-template').modal('show');
                                    },
                                    'click .remove': function (e, value, row, index) {
                                        e.stopPropagation();
                                        var data = row;
                                        layer.confirm('确认删除此文档模板吗？', function (index) {
                                            $.ajaxPost({
                                                url: U.rootPath + '/rest/template',
                                                cmdtype: 'repository',
                                                cmd: 'removeDoctemplate',
                                                data: {
                                                    templateId: data.templateId
                                                },
                                                success: function () {
                                                    layer.close(index);
                                                    vmThis.tab2refresh();
                                                }
                                            });
                                        });
                                    }
                                }
                            },
                            {
                                field: '', title: '模板操作', width: 400, formatter: function (value, row, index) {
                                    var $toolbar = $('<div class="btn-toolbar"></div>');

                                    var $btnGroup = $([
                                        '<div class="btn-group">',
                                        '<button type="button" class="btn btn-default btn-sm import">导入</button>',
                                        '<button type="button" class="btn btn-default btn-sm parse">文档转换</button>',
                                        '<button type="button" class="btn btn-default btn-sm exportTableData">导出表</button>',
                                        '<button type="button" class="btn btn-default btn-sm edit">编辑</button>',
                                        '<button type="button" class="btn btn-default btn-sm preview">预览</button>',
                                        '<button type="button" class="btn btn-default btn-sm print">打印</button>',
                                        '<button type="button" class="btn btn-default btn-sm download">下载</button>',
                                        '</div>'
                                    ].join(''));

                                    $toolbar.append($btnGroup);

                                    return $toolbar.prop('outerHTML');
                                },
                                events: {
                                    'click .import': function (e, value, row, index) {
                                        e.stopPropagation();
                                        var rowData = row;
                                        var params = '?templateId=' + rowData.templateId;
                                        layer.open({
                                            type: 2,
                                            content: U.rootPath +
                                                '/m/v/modules/projtemplate/doctemplate/import.html' + params,
                                            area: ['768px', '500px']
                                        });
                                    },
                                    'click .parse': function (e, value, row, index) {
                                        e.stopPropagation();
                                        var data = row;
                                        if (data.docXls > 0) {
                                            layer.confirm('确认转换此文档模板吗？', function () {
                                                layer.load(2);
                                                $.ajaxPost({
                                                    url: U.rootPath + '/rest/template',
                                                    cmdtype: 'projType',
                                                    cmd: 'parseDocTemplate',
                                                    data: {
                                                        templateId: data.templateId
                                                    },
                                                    success: function () {
                                                        layer.closeAll();
                                                        layer.alert('转换成功！', function (index) {
                                                            layer.close(index);
                                                            vmThis.tab2refresh();
                                                        });
                                                    },
                                                    fail: function (retcode, retmsg) {
                                                        layer.closeAll();
                                                    }
                                                });
                                            });
                                        } else {
                                            layer.alert('请先导入excel！', function (index) {
                                                layer.close(index);
                                            });
                                        }
                                    },
                                    'click .exportTableData': function (e, value, row, index) {
                                        e.stopPropagation();
                                        var data = row;
                                        if (data.documentId > 0) {
                                            $.ajaxPost({
                                                url: URL_ADMIN + '/rest/tagTableService/manager',
                                                cmdtype: 'tagTableServiceManager',
                                                cmd: 'exportAllTables',
                                                data: {
                                                    documentId: data.documentId,
                                                    projectId: 0
                                                },
                                                success: function (msgBody) {
                                                    var s;
                                                    if (msgBody.project_workjob) {
                                                        s = '导出岗位成功！共导出' + msgBody.project_workjob.length + '个岗位：' + msgBody.project_workjob.join(',');
                                                    } else {
                                                        var list = msgBody.list, $root = $('<div></div>'), i;
                                                        for (i = 0; i < list.length; i++) {
                                                            $root.append($('<p></p>').text(list[i]));
                                                        }
                                                        var tableNameHTML = $root.prop('outerHTML');
                                                        s = '导表成功！共导出' + list.length + '张表数据。' + tableNameHTML;
                                                    }
                                                    layer.alert(s, function (index) {
                                                        layer.close(index);
                                                    });
                                                }
                                            });
                                        } else {
                                            layer.alert('请先转换excel！', function (index) {
                                                layer.close(index);
                                            });
                                        }
                                    },
                                    'click .edit': function (e, value, row, index) {
                                        e.stopPropagation();
                                        var data = row;
                                        if (data.documentId > 0) {
                                            var params = ['?templateId=' + data.templateId, 'repositoryId=' + data.repositoryId].join('&');
                                            layer.open({
                                                type: 2,
                                                content: U.rootPath +
                                                    '/m/v/modules/projtemplate/doctemplate/edit.html' + params,
                                                maxmin: true,
                                                area: ['1200px', ' 800px']
                                            });
                                        } else {
                                            layer.alert('请先转换excel！', function (index) {
                                                layer.close(index);
                                            });
                                        }
                                    },
                                    'click .preview': function (e, value, row, index) {
                                        e.stopPropagation();
                                        var data = row;
                                        if (data.documentId > 0) {
                                            var params = ['?templateId=' + data.templateId, 'repositoryId=' + data.repositoryId].join('&');
                                            layer.open({
                                                type: 2,
                                                content: U.rootPath +
                                                    '/m/v/modules/projtemplate/doctemplate/preview.html' + params,
                                                maxmin: true,
                                                area: ['1200px', ' 800px']
                                            });
                                        } else {
                                            layer.alert('请先转换excel！', function (index) {
                                                layer.close(index);
                                            });
                                        }
                                    },
                                    'click .print': function (e, value, row, index) {

                                    },
                                    'click .download': function (e, value, row) {
                                        e.stopPropagation();
                                        var data = row;
                                        if (data.docXls > 0) {
                                            var reqOpt = {
                                                url: '/rest/template/download',
                                                cmdtype: 'templateDocument',
                                                cmd: 'download',
                                                data: {
                                                    documentId: data.docXls
                                                }
                                            };
                                            window.open($.getFileDownloadUrl(reqOpt));
                                        } else {
                                            layer.alert('请先导入excel！', function (index) {
                                                layer.close(index);
                                            });
                                        }
                                    }
                                }
                            }
                        ],
                        toolbar: tableToolbar,
                        search: true,
                        showRefresh: true,
                        showColumns: true,
                        onRefresh: function (e) {
                            //重新加载数据
                        },
                        onClickRow: function (row, $element, filed) {
                            tableClickRowCallback && tableClickRowCallback.apply(null, [row]);
                        },
                        data: data
                    });
                    vmThis.bsTableCache[tableSelector] = $bsIns;
                }
            },
            //文档模板添加
            docTemplateAdd: function (e) {
                var mustParams = {
                    repositoryId: this.curRepository.repositoryId,
                    docType: this.docType
                };
                var that = this;
                $.ajaxPost({
                    url: U.rootPath + '/rest/template',
                    cmdtype: 'repository',
                    cmd: 'addDocTemplate',
                    data: $.extend({}, mustParams, $(e.currentTarget).parseFormData()),
                    success: function () {
                        $('#modal-add-doc-template').modal('hide');
                        that.tab2refresh();
                    }
                });

            },
            //文档模板修改
            docTemplateModify: function (e) {
                var vmThis = this;
                var data = vmThis.docTplModifyData;
                $.ajaxPost({
                    url: U.rootPath + '/rest/template',
                    cmdtype: 'repository',
                    cmd: 'modifyDoctemplate',
                    data: $.extend({}, {
                        templateId: data.templateId
                    }, $(e.currentTarget).parseFormData()),
                    success: function (msgBody) {
                        $('#modal-modify-doc-template').modal('hide');
                        vmThis.tab2refresh();
                    }
                });
            },
            /**
             * 需求因子相关操作
             */
            //需求因子表格初始化
            xqyzTplTableInit: function () {
                var vmThis = this;
                //根据curXqsData ajax查数据
                var bsTableSel = '#xqyz-tpl-table';
                var loadTable = function (data) {
                    var $bsIns = vmThis.bsTableCache[bsTableSel];
                    if ($bsIns) {
                        $bsIns.bootstrapTable('load', data);
                    } else {
                        $bsIns = $(bsTableSel).bootstrapTable({
                            columns: [
                                {field: 'itemId', title: '需求因子ID', sortable: true},
                                {field: 'templateId', title: '需求模板ID', sortable: true, visible: false},
                                {field: 'templateName', title: '需求模板名称', sortable: true},
                                {field: 'reqItemNo', title: '编号', sortable: true},
                                {field: 'reqItemDesc', title: '标题', sortable: true},
                                {field: 'value', title: '取值', sortable: true},
                                {field: 'workJobId', title: '岗位ID', sortable: true},
                                {field: 'workJobName', title: '岗位名称', sortable: true},
                                {
                                    field: '', title: '操作', formatter: function (value, row, index) {
                                        var $toolbar = $('<div class="btn-toolbar"></div>');

                                        var $btnGroup1 = $([
                                            '<div class="btn-group">',
                                            '<button type="button" class="btn btn-default btn-sm modify">修改</button>',
                                            '</div>'
                                        ].join(''));

                                        $toolbar.append($btnGroup1);

                                        return $toolbar.prop('outerHTML');
                                    },
                                    events: {
                                        'click .modify': function (e, value, row, index) {
                                            e.stopPropagation();
                                            var data = row;
                                            vmThis.curReqItem = data;
                                            $('#modal-modify-req-item').modal('show');
                                        }
                                    }
                                }
                            ],
                            search: true,
                            showRefresh: true,
                            showColumns: true,
                            onRefresh: function (e) {
                                //重新加载数据
                            },
                            data: data
                        });
                        vmThis.bsTableCache[bsTableSel] = $bsIns;
                    }
                };
                $.ajaxPost({
                    url: U.rootPath + '/rest/template',
                    cmdtype: 'repository',
                    cmd: 'getReqItemList',
                    data: {
                        templateId: vmThis.curXqsData.templateId
                    },
                    success: function (msgBody) {
                        var data = msgBody.list;
                        vmThis.reqItemList = data;
                        loadTable(data);
                    }
                });
            }
            ,
            /**
             * 需求岗位真值约束相关操作
             */
            //需求岗位真值约束表格初始化
            xqsWorkJobTableInit: function () {
                var vmThis = this;
                //根据curXqsData ajax查数据
                var bsTableSel = '#xqs-workJob-table';
                var loadTable = function (data) {
                    var $bsIns = vmThis.bsTableCache[bsTableSel];
                    if ($bsIns) {
                        $bsIns.bootstrapTable('load', data);
                    } else {
                        $bsIns = $(bsTableSel).bootstrapTable({
                            columns: [
                                {field: 'checkId', title: '真值约束ID', sortable: true, visible: false},
                                {field: 'templateId', title: '需求模板ID', sortable: true, visible: false},
                                {field: 'templateName', title: '需求模板名称', sortable: true},
                                {field: 'reqItemId', title: '需求因子项ID', sortable: true},
                                {
                                    title: '需求因子项内容', sortable: true, formatter: function (value, row, index) {
                                        var data = row;
                                        return data.reqItemNo + data.reqItemDesc;
                                    }
                                },
                                {field: 'workJobId', title: '岗位Id', sortable: true, visible: false},
                                {field: 'workJobName', title: '岗位名称', sortable: true},
                                {
                                    field: '', title: '操作', formatter: function (value, row, index) {
                                        var $toolbar = $('<div class="btn-toolbar"></div>');

                                        var $btnGroup1 = $([
                                            '<div class="btn-group">',
                                            '<button type="button" class="btn btn-default btn-sm modify">修改</button>',
                                            '<button type="button" class="btn btn-default btn-sm remove">删除</button>',
                                            '</div>'
                                        ].join(''));

                                        $toolbar.append($btnGroup1);

                                        return $toolbar.prop('outerHTML');
                                    },
                                    events: {
                                        'click .modify': function (e, value, row, index) {
                                            e.stopPropagation();
                                            var data = row;
                                            vmThis.curWorkJobCheck = data;
                                            $('#modal-modify-xqs-workJobCheck').modal('show');
                                        },
                                        'click .remove': function (e, value, row, index) {
                                            e.stopPropagation();
                                            var data = row;
                                            layer.confirm('确认删除该条数据？', function (index) {
                                                $.ajaxPost({
                                                    url: U.rootPath + '/rest/template',
                                                    cmdtype: 'repository',
                                                    cmd: 'modifyWorkJobCheck',
                                                    data: {
                                                        checkId: data.checkId
                                                    },
                                                    success: function (msgBody) {
                                                        layer.close(index);
                                                        vmThis.tab2refresh();
                                                    }
                                                });
                                            });
                                        }
                                    }
                                }
                            ],
                            toolbar: '#xqs-workJob-table-toolbar',
                            search: true,
                            showRefresh: true,
                            showColumns: true,
                            onRefresh: function (e) {
                                //重新加载数据
                            },
                            data: data
                        });
                        vmThis.bsTableCache[bsTableSel] = $bsIns;
                    }
                };
                $.ajaxPost({
                    url: U.rootPath + '/rest/template',
                    cmdtype: 'repository',
                    cmd: 'getWorkJobCheckDetailsList',
                    data: {
                        templateId: vmThis.curXqsData.templateId
                    },
                    success: function (msgBody) {
                        var data = msgBody.list;
                        vmThis.curWorkJobCheck = data && data.length > 0 && data[0];
                        loadTable(data);
                    }
                });
            },
            tab3Click: function (e) {
                this.tab3Refresh();
            },
            tab3Refresh: function () {
                // this.xqsWorkJobTableInit();
                this.xqyzTplTableInit();
            },
            init: function () {
                var that = this;
                $.ajaxPost({
                    url: U.rootPath + '/rest/template',
                    cmdtype: 'repository',
                    cmd: 'getRepositoryData',
                    data: {},
                    success: function (msgBody) {
                        that.repositoryList = msgBody.repositoryList;
                        that.workJobTypeList = msgBody.workJobTypeList;
                        that.processData();
                        that.refreshDocTpl(0);
                    }
                });
            },
            /**
             * 修改需求因子信息
             */
            reqItemModify: function (e) {
                var that = this;
                var currentTarget = e.currentTarget;
                var formData = $(currentTarget).parseFormData();
                $.ajaxPost({
                    url: U.rootPath + '/rest/template',
                    cmdtype: 'repository',
                    cmd: 'modifyReqItem',
                    data: $.extend({}, formData, {value: 1}),
                    success: function (msgBody) {
                        $('#modal-modify-req-item').modal('hide');
                        that.tab2refresh();
                    }
                });
            }
        },
        mounted: function () {
            this.init();
        }
    });

    window.OUTER_API = {
        renderPage: function () {
            vm.tab2refresh();
        }
    }
});

