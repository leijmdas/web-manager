var WORK_JOB_TYPE_STATE = {};
WORK_JOB_TYPE_STATE.DRAFT = 0;
WORK_JOB_TYPE_STATE.PUB = 1;
WORK_JOB_TYPE_STATE.STOP = 2;
WORK_JOB_TYPE_STATE.arr = ['草稿', '发布', '停用'];
$(function () {
    var element = layui.element, laytpl = layui.laytpl,
        form = layui.form, layer = layui.layer, table = layui.table;

    var store = {
        workJobTypeList: null,//岗位分类列表
        navTreeWorkJobTypeInfo: null,//导航菜单选中的岗位分类信息
        workJobTypeMap: [],//岗位分类map key=workJobTypeId value=对象
        tab1Page: [null, null],//记录tab组件每个页签当前显示的内容关联的岗位分类id
        workJobList: null,//岗位列表
        workJobInfo: null,//工作任务列表和文档模板列表内容关联的岗位信息
        tab2Page: [null, null],//记录tab组件每个页签当前显示的内容关联的岗位id
        tab2Cache: {
            index: null,
            params: null
        },
        //列表查询条件缓存
        tableCache: {},//key为table的layFilter,value为queryParams对象

        //真值表暂时不做
        constraintList: null,//真值约束列表
    };
    var rootPath = U.rootPath;


    var request = {
        /**
         * 真值约束表列表
         * @param workJobTypeId
         * @param callback
         */
        getConstraintsList: function (workJobTypeId, callback) {
            //模拟
            var arr = [], i = 1;
            for (; i <= 18; i++) {
                arr.push({
                    ConstraintId: i,
                    WorkJobTypeId: workJobTypeId,
                    WorkJobTypeName: '硬件类',
                    Title: '1,2,3,4,5',
                    IsValid: 0,
                    CreateBy: 1,
                    CreateTime: '2018/08/15',
                    TitleArr: ['电路设计', '软件设计', '机械设计', '界面UI设计', '产品造型设计'],
                });
            }
            store.constraintList = arr;
            callback();
        }
    };

    //***左侧导航菜单***
    var loadNavTree = function () {
        var $ul, $li, $a, i, e, arr = store.workJobTypeList;
        if (arr && arr.length > 0) {
            $ul = $(
                '<ul class="layui-nav layui-nav-tree" lay-filter="navTree" id="navTree"></ul>');
            for (i = 0; i < arr.length; i++) {
                e = arr[i];
                $li = $('<li class="layui-nav-item"></li>');
                $a = $('<a href="javascript:;"></a>');
                $a.text(e.workJobTypeName);
                $a.attr('wjtid', e.workJobTypeId);
                $li.append($a);
                $ul.append($li);
                if (i === 0) {
                    $li.addClass('layui-this');
                }
            }
            $('.navTreeContainer').empty().append($ul);
            element.render('nav', 'navTree');
            element.on('nav(navTree)', function (elem) {
                var workJobTypeId = $(elem).attr('wjtid');
                workJobTypeId = parseInt(workJobTypeId);
                if (store.navTreeWorkJobTypeInfo.workJobTypeId !== workJobTypeId) {
                    store.navTreeWorkJobTypeInfo = store.workJobTypeMap[workJobTypeId];
                    refreshTab1($('#tab1 li.layui-this').index());
                }
            });
            navTreeSelect(store.navTreeWorkJobTypeInfo.workJobTypeId);
        }
    };

    var navTreeSelect = function (workJobTypeId) {
        $('#navTree').find('[wjtid=' + workJobTypeId + ']').parent().addClass('layui-this').siblings().removeClass('layui-this');
        store.navTreeWorkJobTypeInfo = store.workJobTypeMap[workJobTypeId];
        // refreshTab1($('#tab1 li.layui-this').index());
    };

    //tab1 page1

    //***岗位分类添加/修改/删除按钮事件监听***
    /*$('#workJobType-modify-btn-group >button').on('click', function () {
        var index = $(this).index();
        if (index === 0) {//添加
            handleWorkJobTypeAddView();
        } else if (index === 1) {//修改
            $('#tpl1-form-submit').click();
        } else if (index === 2) {
            layer.confirm('确认删除此岗位分类信息吗？', function (index) {
                layer.close(index);
                $.ajaxPost({
                    url: U.rootPath + '/rest/template',
                    cmdtype: 'workJobType',
                    cmd: 'removeWorkJobType',
                    data: {
                        workJobTypeId: store.navTreeWorkJobTypeInfo.workJobTypeId,
                    },
                    success: function () {
                        layer.alert('删除成功！', function () {
                            layer.closeAll();
                            refreshNavTree(loadWorkJobTypeModifyView);
                        });
                    }
                });
            });
        }
    });*/

    //***岗位分类修改***
    var loadWorkJobTypeModifyView = function () {
        var d = store.navTreeWorkJobTypeInfo;
        if (!d) {
            throw Error('navTreeWorkJobTypeInfo is null');
        }
        $('#workJobType-modify-form').html(laytpl($('#tpl1').html()).render(d));
        form.render(null, 'tpl1-form');
        form.on('submit(tpl1-form-submit)', function (data) {
            $(data.form).ajaxSubmitForm({
                url: U.rootPath + '/rest/template',
                cmdtype: 'workJobType',
                cmd: 'modifyWorkJobType',
                success: function () {
                    layer.alert('修改成功！', function (index) {
                        layer.close(index);
                        loadNavTree();
                        loadWorkJobTypeModifyView();
                    });
                }
            });
            return false;
        });
    };

    //***岗位分类添加***
    var handleWorkJobTypeAddView = function () {
        var content = $('#tpl2').html();
        var index = layer.open({
            type: 1,
            content: content,
            area: ['400px', '230px']
        });
        form.render(null, 'tpl2-form');
        form.on('submit(tpl2-form-submit)', function (data) {
            $(data.form).ajaxSubmitForm({
                url: U.rootPath + '/rest/template',
                cmdtype: 'workJobType',
                cmd: 'addWorkJobType',
                success: function () {
                    layer.alert('添加成功！', function () {
                        layer.closeAll();
                        refreshNavTree();
                    });
                }
            });
            return false;
        });
        $('#tpl2-btn-cancel').on('click', function (e) {
            layer.close(index);
        });
    };

    //***岗位分类关联的真值约束列表***
    var loadConstraintListView = function () {
        var html = $('#layTplConstraintList').html();
        $('#constraint-list').html(html);
        var tableIns = table.render({
            elem: '#dataListConstraint',
            width: 1200,
            cols: [
                [
                    {
                        field: 'ConstraintId',
                        title: '真值约束ID',
                        width: 100,
                        fixed: 'left'
                    },
                    {field: 'WorkJobTypeName', title: '岗位分类', width: 150},
                    {
                        field: 'TitleArr',
                        title: '约束内容',
                        minWidth: 300,
                        templet: function (d) {
                            var s = '', i = 0;
                            for (; i < d.TitleArr.length; i++) {
                                s += '<span class="layui-badge-rim" style="margin-right: 10px;">' +
                                    d.TitleArr[i] +
                                    '</span>';
                            }
                            return s;
                        }
                    },
                    {
                        field: 'IsValid',
                        title: '是否有效',
                        width: 100,
                        templet: function (d) {
                            if (d.IsValid === 0) {
                                return '<span class="layui-badge-rim layui-bg-green">有效</span>';
                            } else if (d.IsValid === 1) {
                                return '<span class="layui-badge-rim layui-bg-black">无效</span>';
                            }
                        }
                    },
                    {field: 'CreateBy', title: '创建人', width: 100},
                    {field: 'CreateTime', title: '更改时间', width: 150},
                    {
                        fixed: 'right',
                        title: '操作',
                        width: 150,
                        align: 'center',
                        toolbar: '#dataListConstraintToolbar'
                    }
                ]],
            page: true,
            data: store.constraintList
        });
        table.on('tool(dataListConstraint)', function (obj) {
            var data = obj.data, layEvent = obj.event, dom = obj.tr;
            if (layEvent === 'modify') {
                loadConstraintModifyView(data);
            } else if (layEvent === 'remove') {
                layer.confirm('确认要删除id=' + data.ConstraintId + '的真值约束信息吗？',
                    function (index) {
                        layer.close(index);
                        layer.msg('删除成功！');
                        tableIns.reload();
                    });
            }
        });
        $('#btnAddConstraint').on('click', function () {
            loadAddConstraintView();
        });
    };

    //***岗位分类关联的真值约束 添加***
    var loadAddConstraintView = function () {
        var data = {
            workJobTypeId: store.navTreeWorkJobTypeInfo.workJobTypeId,
            wrkJobTypeName: store.navTreeWorkJobTypeInfo.workJobTypeName,
        };
        var html = laytpl($('#layTplAddConstraint').html()).render(data);
        var index = layer.open({
            type: 1,
            content: html,
            area: ['560px', '360px'],
        });
        form.render(null, 'formAddConstraint');
        form.on('submit(subBtnFormAddConstraint)', function (data) {
            layer.alert(JSON.stringify($(data.form).parseFormData()));
            return false;
        });
    };

    //***岗位分类关联的真值约束 修改***
    var loadConstraintModifyView = function (data) {
        var html = laytpl($('#layTplModifyConstraint').html()).render(data);
        var index = layer.open({
            type: 1,
            content: html,
            area: ['560px', '360px'],
        });
        form.render(null, 'formModifyConstraint');
        form.on('submit(subBtnFormModifyConstraint)', function (data) {
            layer.alert(JSON.stringify($(data.form).parseFormData()));
            return false;
        });
    };

    //tab1 page2

    //***岗位分类关联的岗位列表***
    var renderWorkJobListView = function () {
        table.render({
            elem: '#dataListWorkJob',
            cols: [
                [
                    {field: 'workJobId', title: '岗位ID', width: 100, fixed: 'left'},
                    {field: 'workJobTypeName', title: '岗位分类'},
                    {field: 'title', title: '岗位名称'},
                    {field: 'titleAlias', title: '岗位别名'},
                    {field: 'isDefault', title: '是否默认'},
                    {field: 'workJobNumber', title: '可重复次数', width: 100},
                    {
                        field: 'createTime',
                        title: '更新时间',
                        width: 200,
                        templet: function (d) {
                            return U.timeFormatString(d.createTime);
                        }
                    },
                    {
                        fixed: 'right',
                        title: '操作',
                        align: 'center',
                        width: 200,
                        templet: function () {
                            var btnArr = [
                                '<div class="layui-btn-container workJob-list-btn-group">',
                                '<button class="layui-btn layui-btn-xs layui-btn-warm" act-type="modify">修改</button>',
                                '<button class="layui-btn layui-btn-xs layui-btn-danger" act-type="remove">删除</button>',
                                '</div>'];
                            return btnArr.join('');
                        }
                    }
                ]],
            data: store.workJobList || [],
            limit: store.workJobList ? store.workJobList.length : 10,
            done: function (res) {
                var dataSource = res.data;
                //渲染完表格后为操作单元格中的按钮添加事件
                $('#dataListWorkJob').next('.layui-table-view').find('.workJob-list-btn-group').on('click', 'button', function (e) {
                    e.stopPropagation();
                    var index = $(this).closest('tr').attr('data-index');//行索引
                    var data = dataSource[index];
                    var actType = $(this).attr('act-type');
                    if (actType === 'modify') {
                        loadWorkJobModifyView(data);
                    } else if (actType === 'remove') {
                        layer.confirm('确认要删除此岗位信息吗？', function (index) {
                            $.ajaxPost({
                                url: U.rootPath + '/rest/template',
                                cmdtype: 'workJobType',
                                cmd: 'removeWorkJob',
                                data: {
                                    workJobId: data.workJobId,
                                },
                                success: function () {
                                    layer.close(index);
                                    layer.msg('删除成功！');
                                    loadWorkJobPage();
                                }
                            });
                        });
                    }
                });
            }
        });
        //监听行单击事件（单击事件为：rowDouble）
        table.on('row(dataListWorkJob)', function (obj) {
            var data = obj.data;
            //标注选中样式
            obj.tr.addClass('layui-table-click').siblings().removeClass('layui-table-click');
            if (store.workJobInfo.workJobId !== data.workJobId) {
                store.workJobInfo = data;
                var $item = $('#tab2_body >.layui-tab-item.layui-show');
                var index = $item.index();
                if (index === 0) {
                    loadTab2Page1(data.workJobId);
                } else if (index === 1 || index === 2 || index === 3) {
                    loadTab2Page234(data.workJobTypeId, index);
                }
            }
        });
    };

    //***岗位分类关联的岗位 添加***
    var loadWorkJobAddView = function () {
        var html = laytpl($('#tpl3').html()).render({workJobTypeId: store.navTreeWorkJobTypeInfo.workJobTypeId});
        var index = layer.open({
            type: 1,
            content: html,
            area: ['400px', '350px']
        });
        form.render(null, 'tpl3-form');
        form.on('submit(tpl3-form-submit)', function (data) {
            $(data.form).ajaxSubmitForm({
                url: U.rootPath + '/rest/template',
                cmdtype: 'workJobType',
                cmd: 'addWorkJob',
                success: function () {
                    layer.alert('添加成功！', function () {
                        layer.closeAll();
                        refreshTab1(1);
                    });
                }
            });
            return false;
        });
        $('#tpl3-btn-cancel').on('click', function () {
            layer.close(index);
        })
    };

    //***岗位分类关联的岗位 修改***
    var loadWorkJobModifyView = function (data) {
        var content = laytpl($('#tpl4').html()).render(data);
        var index = layer.open({
            type: 1,
            content: content,
            area: ['500px', '350px']
        });
        form.render(null, 'tpl4-form');
        form.on('submit(tpl4-form-submit)', function (data) {
            $(data.form).ajaxSubmitForm({
                url: U.rootPath + '/rest/template',
                cmdtype: 'workJobType',
                cmd: 'modifyWorkJob',
                success: function () {
                    layer.alert('修改成功！', function () {
                        layer.closeAll();
                        refreshTab1(1);
                    });
                }
            });
            return false;
        });
        $('#tpl4-btn-cancel').on('click', function () {
            layer.close(index);
        })
    };

    $('#btnAddWorkJob').on('click', function () {
        loadWorkJobAddView();
    });

    //***tab2 page 1 岗位任务列表 ***
    var renderTaskListView = function (data) {
        table.render({
            elem: '#dataListTask',
            cols: [
                [
                    {field: 'taskId', title: '任务ID', width: 100, fixed: 'left'},
                    {field: 'workJobName', title: '岗位名称', width: 200},
                    {
                        field: 'docType', title: '模板类型', width: 150, templet: function (d) {
                            return DOCTEMPLATE.parseDocTemplateType(d.docType);
                        },
                    },
                    {field: 'taskName', title: '任务内容', minWidth: 150},
                    {field: 'taskNameAlias', title: '任务内容XLS标识', minWidth: 150},
                    {
                        field: 'isDefault',
                        title: '是否默认',
                        width: 100,
                        templet: function (d) {
                            return d.isDefault === 1 ? '是' : '否';
                        },
                    },
                    {
                        field: 'isOptional',
                        title: '是否可选',
                        width: 100,
                        templet: function (d) {
                            return d.isOptional === 1 ? '可选' : '不可选';
                        },
                    },
                    {field: 'orderNo', title: '排序', width: 100},
                    {
                        fixed: 'right',
                        title: '操作',
                        width: 150,
                        align: 'center',
                        toolbar: '#dataListTaskToolbar',
                    },
                ]],
            data: data || [],
            limit: data ? data.length : 10,
        });
        table.on('tool(dataListTask)', function (obj) {
            var data = obj.data, layEvent = obj.event, dom = obj.tr;
            if (layEvent === 'modify') {
                loadTaskModifyView(data);
            } else if (layEvent === 'remove') {
                layer.confirm('确认要此工作任务信息吗？', function (index) {
                    $.ajaxPost({
                        url: U.rootPath + '/rest/template',
                        cmdtype: 'workJobType',
                        cmd: 'removeTask',
                        data: {
                            taskId: data.taskId,
                        },
                        success: function (index) {
                            layer.close(index);
                            layer.msg('删除成功！');
                            loadTab2Page1(store.workJobInfo.workJobId);
                        },
                    });
                });
            }
        });
    };

    //***tab2 page 1 岗位任务 添加事件 ***
    $('#btnAddTask').on('click', function () {
        loadTaskAddView();
    });

    //***tab2 page 1 岗位任务 修改 ***
    var loadTaskModifyView = function (data) {
        var content = laytpl($('#tpl6').html()).render(data);
        var index = layer.open({
            type: 1,
            content: content,
            area: ['890px', '500px']
        });
        form.render(null, 'tpl6-form');
        form.on('submit(tpl6-form-submit)', function (data) {
            $(data.form).ajaxSubmitForm({
                url: U.rootPath + '/rest/template',
                cmdtype: 'workJobType',
                cmd: 'modifyTask',
                success: function () {
                    layer.alert('修改成功！', function () {
                        layer.closeAll();
                        loadTab2Page1(store.workJobInfo.workJobId);
                    });
                }
            });
            return false;
        });
        $('#tpl6-btn-cancel').on('click', function () {
            layer.close(index);
        });
    };

    //***tab2 page 1 岗位任务 添加 ***
    var loadTaskAddView = function () {
        var content = laytpl($('#tpl5').html()).render({
            workJobId: store.workJobInfo.workJobId,
            workJobName: store.workJobInfo.title,
        });
        var index = layer.open({
            type: 1,
            content: content,
            area: ['660px', '520px'],
        });
        form.render(null, 'tpl5-form');
        form.on('submit(tpl5-form-submit)', function (data) {
            $(data.form).ajaxSubmitForm({
                url: U.rootPath + '/rest/template',
                cmdtype: 'workJobType',
                cmd: 'addTask',
                success: function () {
                    layer.alert('添加成功！', function () {
                        layer.closeAll();
                        loadTab2Page1(store.workJobInfo.workJobId);
                    });
                }
            });
            return false;
        });
        $('#tpl5-btn-cancel').on('click', function () {
            layer.close(index);
        });
    };

    //tab page load

    //***加载岗位分类页面***
    var loadWorkJobTypePage = function () {
        renderBtnGroupByState();
        loadWorkJobTypeModifyView();
    };

    //***加载岗位页面***
    var loadWorkJobPage = function () {
        var workJobTypeId = store.navTreeWorkJobTypeInfo.workJobTypeId;
        var $item = $('#tab2 > .layui-tab-title > li.layui-this');
        var index = $item.index();
        $.ajaxPost({
            url: U.rootPath + '/rest/template',
            cmdtype: 'workJobType',
            cmd: 'getWorkJobDetailsInfoList',
            data: {
                workJobTypeId: workJobTypeId
            },
            success: function (data) {
                store.workJobList = data.list;
                //刷新岗位列表
                renderWorkJobListView();
                //刷新工作任务列表
                store.workJobInfo = data.list[0];
                if (store.workJobInfo) {
                    if (index === 0) {
                        loadTab2Page1(store.workJobInfo.workJobId);
                    } else if (index === 1 || index === 2 || index === 3) {
                        loadTab2Page234(store.workJobInfo.workJobId, index);
                    }
                }
            }
        });
        if (index === 0) {
            renderTaskListView();
        } else if (index === 1 || index === 2 || index === 3) {
            var elem, layFilter;
            if (index === 1) {//设计文档
                elem = '#sjwd-list';
                layFilter = 'sjwd-list';
            } else if (index === 2) {//交付文档
                elem = '#jfwd-list';
                layFilter = 'jfwd-list';
            } else if (index === 3) {//其他文档
                elem = '#qtwd-list';
                layFilter = 'qtwd-list';
            }
            DOCTEMPLATE.renderList({
                table: table,
                form: form,
                layer: layer,
                laytpl: laytpl,
                elem: elem,
                layFilter: layFilter,
                data: []
            });
        }
    };

    //***tab1的第3个页面加载***
    var loadTab1Page3 = function (workJobTypeId) {
        request.getConstraintsList(workJobTypeId, function () {
            loadConstraintListView();
        });
    };

    //***tab2的第1个页面加载***
    var loadTab2Page1 = function (workJobId) {
        store.tab2Page[0] = workJobId;
        $.ajaxPost({
            url: U.rootPath + '/rest/template',
            cmdtype: 'workJobType',
            cmd: 'getTaskDetailsInfoList',
            data: {
                workJobId: workJobId,
            },
            success: function (data) {
                renderTaskListView(data.list);
            }
        });

    };

    //***tab2的第2/3/4个页面加载***
    var loadTab2Page234 = function (workJobId, index, queryParams) {
        store.tab2Page[index] = workJobId;
        store.tab2Cache = {
            index: index,
            queryParams: queryParams
        };
        var docTypeArr, elem, layFilter;
        if (index === 1) {//设计文档
            docTypeArr = [300, 301, 302, 303, 304];
            elem = '#sjwd-list';
            layFilter = 'sjwd-list';
            if (!queryParams) {
                queryParams = store.tableCache['sjwd-list'];
            } else {
                store.tableCache['sjwd-list'] = queryParams;
            }
        } else if (index === 2) {//交付文档
            docTypeArr = [400];
            elem = '#jfwd-list';
            layFilter = 'jfwd-list';
            if (!queryParams) {
                queryParams = store.tableCache['jfwd-list'];
            } else {
                store.tableCache['jfwd-list'] = queryParams;
            }
        } else if (index === 3) {//其他文档
            docTypeArr = [500];
            elem = '#qtwd-list';
            layFilter = 'qtwd-list';
            if (!queryParams) {
                queryParams = store.tableCache['qtwd-list'];
            } else {
                store.tableCache['qtwd-list'] = queryParams;
            }
        }
        $.ajaxPost({
            url: '/rest/template',
            cmdtype: 'workJobType',
            cmd: 'getDocTemplateDetailsInfo',
            data: $.extend({
                workJobId: store.workJobInfo.workJobId,
                repositoryId: 0,
                docTypeArr: docTypeArr
            }, queryParams),
            success: function (data) {
                DOCTEMPLATE.renderList({
                    table: table,
                    form: form,
                    layer: layer,
                    laytpl: laytpl,
                    elem: elem,
                    layFilter: layFilter,
                    data: data.list,
                    modifyStateSuccess: function () {
                        loadTab2Page234(store.workJobInfo.workJobId, index, queryParams);
                    },
                    modifySuccess: function () {
                        loadTab2Page234(store.workJobInfo.workJobId, index, queryParams);
                    },
                    removeSuccess: function () {
                        loadTab2Page234(store.workJobInfo.workJobId, index, queryParams);
                    },
                    parseSuccess: function () {
                        loadTab2Page234(store.workJobInfo.workJobId, index, queryParams);
                    }
                });
            }
        });
    };

    //***tab2 page 2/3/4 的添加文档模板按钮事件 ***
    $('#sjwd-btn-add,#jfwd-btn-add,#qtwd-btn-add').on('click', function () {
        var id = $(this).attr('id'), docType, index;
        var docTypeObj;
        if (id === 'sjwd-btn-add') {
            docTypeObj = DOCTEMPLATE.getDocTypeObjArr([300, 301, 302, 303, 304]);
            index = 1;
        } else if (id === 'jfwd-btn-add') {
            docTypeObj = DOCTEMPLATE.getDocTypeObjArr([400]);
            index = 2;
        } else if (id === 'qtwd-btn-add') {
            docTypeObj = DOCTEMPLATE.getDocTypeObjArr([500]);
            index = 3;
        }
        //需求书添加页面
        var d = {
            workJobId: store.workJobInfo.workJobId,
            workJobName: store.workJobInfo.title,
            docTypeObj: docTypeObj
        };
        DOCTEMPLATE.addForm(laytpl, form, layer, d, function () {
            loadTab2Page234(store.workJobInfo.workJobId, index);
        });
    });

    //***tab2 page 2 搜索按钮事件 ***
    form.on('submit(search-sjwd-submit)', function (data) {
        loadTab2Page234(store.workJobInfo.workJobId, 1,
            $(data.form).parseFormData());
        return false;
    });

    //***tab2 page 3 搜索按钮事件 ***
    form.on('submit(search-jfwd-submit)', function (data) {
        loadTab2Page234(store.workJobInfo.workJobId, 2,
            $(data.form).parseFormData());
        return false;
    });

    //***tab2 page 4 搜索按钮事件 ***
    form.on('submit(search-qtwd-submit)', function (data) {
        loadTab2Page234(store.workJobInfo.workJobId, 3,
            $(data.form).parseFormData());
        return false;
    });

    var modifyState = function (state) {
        if ([WORK_JOB_TYPE_STATE.DRAFT, WORK_JOB_TYPE_STATE.PUB, WORK_JOB_TYPE_STATE.STOP].indexOf(state) === -1) {
            throw Error('state not in [' + [WORK_JOB_TYPE_STATE.DRAFT, WORK_JOB_TYPE_STATE.PUB, WORK_JOB_TYPE_STATE.STOP].join(',') + ']');
        }
        layer.confirm('确认将该岗位分类的状态变更为' + WORK_JOB_TYPE_STATE.arr[state] + '？', function (index) {
            $.ajaxPost({
                url: rootPath + '/rest/template',
                cmdtype: 'workJobType',
                cmd: 'modifyState',
                data: {
                    workJobTypeId: store.navTreeWorkJobTypeInfo.workJobTypeId,
                    state: state
                },
                success: function () {
                    layer.close(index);
                    layer.alert('修改成功！', function (index) {
                        layer.close(index);
                        location.href = rootPath + '/m/v/modules/projtemplate/projtype/manager.html';
                    });
                }
            });
        });

    };
    var btnEventType = {
        'add': function (e) {
            handleWorkJobTypeAddView();
        },
        'modify': function (e) {
            $('#tpl1-form-submit').click();
        },
        'remove': function (e) {
            layer.confirm('确认删除此岗位分类信息吗？', function (index) {
                layer.close(index);
                $.ajaxPost({
                    url: U.rootPath + '/rest/template',
                    cmdtype: 'workJobType',
                    cmd: 'removeWorkJobType',
                    data: {
                        workJobTypeId: store.navTreeWorkJobTypeInfo.workJobTypeId
                    },
                    success: function () {
                        layer.alert('删除成功！', function () {
                            layer.closeAll();
                            refreshNavTree(function () {
                                loadWorkJobTypeModifyView();
                            });
                        });
                    }
                });
            });
        },
        'pub': function (e) {
            modifyState(WORK_JOB_TYPE_STATE.PUB);
        },
        'stop': function (e) {
            modifyState(WORK_JOB_TYPE_STATE.STOP);
        },
        'rePub': function (e) {
            modifyState(WORK_JOB_TYPE_STATE.PUB);
        }
    };
    var btnEventTypeArr = [];/*['add', 'modify', 'remove', 'pub', 'stop', 'rePub']*/
    $.each(btnEventType, function (k, v) {
        btnEventTypeArr.push(k);
    });
    var disabledBtn = function (arr) {
        $.each(btnEventTypeArr, function (i, item) {
            var $this = $('button[event-type=' + item + ']');
            $this.off('click');
            if (arr.indexOf(item) !== -1) {
                $this.addClass('layui-btn-disabled');
            } else {
                $this.removeClass('layui-btn-disabled');
                $this.on('click', function (e) {
                    btnEventType[item](e);
                });
            }
        });
    };
    var renderBtnGroupByState = function () {
        var workTypeInfo = store.navTreeWorkJobTypeInfo;
        var disabledArr;
        if (!workTypeInfo) {
            disabledBtn(['modify', 'remove', 'pub', 'stop', 'rePub']);
            return;
        }
        var state = workTypeInfo.state;
        if (state === WORK_JOB_TYPE_STATE.DRAFT) {//草稿
            disabledArr = ['rePub'];
        } else if (state === WORK_JOB_TYPE_STATE.PUB) {//发布
            disabledArr = ['modify', 'remove', 'pub', 'stop', 'rePub'];
        } else if (state === WORK_JOB_TYPE_STATE.STOP) {//停用
            disabledArr = ['pub', 'stop'];
        } else {
            throw Error('state not in range');
        }
        disabledBtn(disabledArr);
    };

    var refreshNavTree = function (fn) {
        $.ajaxPost({
            url: U.rootPath + '/rest/template',
            cmdtype: 'workJobType',
            cmd: 'getWorkJobTypeList',
            success: function (data) {
                store.workJobTypeList = data.list;
                if (data.list && data.list.length > 0) {
                    store.navTreeWorkJobTypeInfo = data.list[0];
                    $.each(data.list, function (i, e) {
                        store.workJobTypeMap[e.workJobTypeId] = e;
                    });
                }
                loadNavTree();
                fn && fn();
            }
        });
    };

    refreshNavTree(function () {
        loadWorkJobTypePage();
    });

    //*** tab1 bind ***
    element.tab({
        headerElem: '#tab1Header>li',
        bodyElem: '#tab1Body>div'
    });

    //*** tab1 监听切换 ***
    element.on('tab(tab1)', function (data) {
        if (!store.navTreeWorkJobTypeInfo) {
            return;
        }
        if (store.navTreeWorkJobTypeInfo.workJobTypeId !==
            store.tab1Page[data.index]) {
            refreshTab1(data.index);
        }
    });

    var loadAllDocTemplate = function () {
        var elem = '#all-doc-template-list';
        var layFilter = 'all-doc-template-list';
        $.ajaxPost({
            url: '/rest/template',
            cmdtype: 'workJobType',
            cmd: 'spFindAllTemplateByWorkjobType',
            data: {
                workJobTypeId: store.navTreeWorkJobTypeInfo.workJobTypeId
                // projectId: 9
            },
            success: function (msgBody) {
                DOCTEMPLATE.renderList({
                    table: table,
                    form: form,
                    layer: layer,
                    laytpl: laytpl,
                    elem: elem,
                    layFilter: layFilter,
                    data: msgBody.list,
                    modifyStateSuccess: function () {
                        // loadTab2Page234(store.workJobInfo.workJobId, index, queryParams);
                    },
                    modifySuccess: function () {
                        // loadTab2Page234(store.workJobInfo.workJobId, index, queryParams);
                    },
                    removeSuccess: function () {
                        // loadTab2Page234(store.workJobInfo.workJobId, index, queryParams);
                    },
                    parseSuccess: function () {
                        // loadTab2Page234(store.workJobInfo.workJobId, index, queryParams);
                    }
                });
            }
        });
    };

    var refreshTab1 = function (index) {
        store.tab1Page[index] = store.navTreeWorkJobTypeInfo.workJobTypeId;//记录当前页加载内容关联的岗位分类id
        if (index === 0) {//岗位分类
            loadWorkJobTypePage();
        } else if (index === 1) {//岗位
            loadWorkJobPage();
        } else if (index === 2) {//所有文档
            loadAllDocTemplate();
        }
    };

    //*** tab2 bind ***
    element.tab({
        headerElem: '#tab2_header>li',
        bodyElem: '#tab2_body>div'
    });

    //*** tab2 监听切换 ***
    element.on('tab(tab2)', function (data) {
        if (!store.workJobInfo) {
            return;
        }
        if (store.workJobInfo.workJobId !== store.tab2Page[data.index]) {
            var workJobId = store.workJobInfo.workJobId;
            if (data.index === 0) {
                loadTab2Page1(workJobId);
            } else if (data.index === 1 || data.index === 2 || data.index === 3) {
                loadTab2Page234(workJobId, data.index);
            }
        }
    });

    window.OUTER_API = {
        renderPage: function () {
            loadTab2Page234(store.workJobInfo.workJobId, store.tab2Cache.index, store.tab2Cache.queryParams);
        }
    }

});
