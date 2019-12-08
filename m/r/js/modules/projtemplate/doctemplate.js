$(function () {

    var docTypeObj = {
        100: '需求模板',
        200: '工作组计划模板',

        300: '设计模板',
        301: '加工模板',
        302: '采购模板',
        303: '加工报价单',
        304: '采购报价单',

        400: '交付模板',
        500: '其它模板'
    };

    /**
     *
     * @param codeArr 模板类型代码数组
     */
    var getDocTypeObjArr = function (codeArr) {
        var docTypeObjClone = $.extend({}, docTypeObj);
        var key;
        for (key in docTypeObjClone) {
            if (docTypeObjClone.hasOwnProperty(key) && codeArr.indexOf(Number(key)) === -1) {
                delete docTypeObjClone[key];
            }
        }
        return docTypeObjClone;
    };

    var parseDocTemplateType = function (type) {
        return docTypeObj[type];
        /*if (type === 100) {
            return '需求模板';
        } else if (type === 200) {
            return '工作组计划模板';
        } else if (type === 300) {
            return '设计模板';
        } else if (type === 400) {
            return '交付模板';
        } else if (type === 500) {
            return '其它模板';
        } else {
            return '';
        }*/
    };

    //添加文档模板
    var addForm = function (laytpl, form, layer, data, callback) {
        var html = '<form class="layui-form" action="" lay-filter="doctemplate-form-add">\n' +
            '        <div class="layui-form-item">\n' +
            '            <label class="layui-form-label">模板名称：</label>\n' +
            '            <div class="layui-input-block">\n' +
            '                <input type="text" name="title" class="layui-input" autocomplete="off">\n' +
            '            </div>\n' +
            '        </div>\n' +
            '        <div class="layui-form-item">\n' +
            '            <label class="layui-form-label">别名：</label>\n' +
            '            <div class="layui-input-block">\n' +
            '                <input type="text" name="alias" class="layui-input" autocomplete="off">\n' +
            '            </div>\n' +
            '        </div>\n' +
            '        {{# if(d.projectTypeId>0){ }}\n' +
            '        <div class="layui-form-item">\n' +
            '            <label class="layui-form-label">项目类别名称：</label>\n' +
            '            <div class="layui-input-block">\n' +
            '                <span>{{=d.projectTypeName}}</span>\n' +
            '                <input type="hidden" name="projectTypeId" value="{{=d.projectTypeId}}">\n' +
            '            </div>\n' +
            '        </div>\n' +
            '        {{# } }}\n' +
            '        {{# if(d.workJobId>0){ }}\n' +
            '        <div class="layui-form-item">\n' +
            '            <label class="layui-form-label">岗位名称：</label>\n' +
            '            <div class="layui-input-block">\n' +
            '                <span>{{=d.workJobName}}</span>\n' +
            '                <input type="hidden" name="workJobId" value="{{=d.workJobId}}">\n' +
            '            </div>\n' +
            '        </div>\n' +
            '        {{# } }}\n' +
            '\n' +
            '        <div class="layui-form-item">\n' +
            '            <label class="layui-form-label">模板类型：</label>\n' +
            '            <div class="layui-input-block">\n' +
            /*'        docTypeObj        <span>{{ DOCTEMPLATE.parseDocTemplateType(d.docType) }}</span>\n' +
            '                <input type="hidden" name="docType" value="{{=d.docType}}">\n' +*/
            '                <select name="docType">\n' +
            '                  {{# $.each(d.docTypeObj,function(k,v){ }}' +
            '                    <option value="{{=k}}">{{=v}}</option>' +
            '                  {{# }) }}' +
            '                </select>\n' +
            '            </div>\n' +
            '        </div>\n' +
            /*'        <div class="layui-form-item">\n' +
            '            <label class="layui-form-label">模板状态：</label>\n' +
            '            <div class="layui-input-block">\n' +
            '                <select name="state">\n' +
            '                    <option value="0">草稿</option>\n' +
            '                    <option value="1">发布</option>\n' +
            '                    <option value="2">停用</option>\n' +
            '                </select>\n' +
            '            </div>\n' +
            '        </div>\n' +*/
            '        <div class="layui-form-item">\n' +
            '            <div class="layui-input-block">\n' +
            '                <button class="layui-btn" lay-filter="doctemplate-form-add-submit" lay-submit>添加</button>\n' +
            '                <button class="layui-btn layui-btn-primary" type="button" id="doctemplate-form-add-btn-cancel" >取消</button>\n' +
            '            </div>\n' +
            '        </div>\n' +
            '    </form>';
        var content = laytpl(html).render(data);
        var index = layer.open({
            type: 1,
            content: content,
            area: ['660px', '520px'],
        });
        form.render(null, 'doctemplate-form-add');
        form.on('submit(doctemplate-form-add-submit)', function (data) {
            $(data.form).ajaxSubmitForm({
                url: U.rootPath + '/rest/template',
                cmdtype: data.projectTypeId > 0 ? 'projType' : 'workJobType',
                cmd: 'addDocTemplate',
                success: function () {
                    layer.alert('添加成功！', function () {
                        layer.closeAll();
                        callback && callback();
                    });
                },
            });
            return false;
        });
        $('#doctemplate-form-add-btn-cancel').on('click', function () {
            layer.close(index);
        });
    };

    //修改文档模板
    var modifyForm = function (laytpl, form, layer, data, callback) {
        var html = '<form class="layui-form" action="" lay-filter="doctemplate-form-modify">\n' +
            '        <div class="layui-form-item">\n' +
            '            <label class="layui-form-label">模板名称：</label>\n' +
            '            <div class="layui-input-block">\n' +
            '                <input type="text" name="title" value="{{=d.title}}" class="layui-input" autocomplete="off">\n' +
            '            </div>\n' +
            '        </div>\n' +
            '        <div class="layui-form-item">\n' +
            '            <label class="layui-form-label">别名：</label>\n' +
            '            <div class="layui-input-block">\n' +
            '                <input type="text" name="alias" value="{{=d.alias}}" class="layui-input" autocomplete="off">\n' +
            '            </div>\n' +
            '        </div>\n' +
            '        {{# if(d.projectTypeId>0){ }}\n' +
            '        <div class="layui-form-item">\n' +
            '            <label class="layui-form-label">项目类别：</label>\n' +
            '            <div class="layui-input-block">\n' +
            '                <span>{{=d.projectTypeName}}</span>\n' +
            '            </div>\n' +
            '        </div>\n' +
            '        {{# } }}\n' +
            '        {{# if(d.workJobId>0){ }}\n' +
            '        <div class="layui-form-item">\n' +
            '            <label class="layui-form-label">岗位：</label>\n' +
            '            <div class="layui-input-block">\n' +
            '                <span>{{=d.workJobName}}</span>\n' +
            '            </div>\n' +
            '        </div>\n' +
            '        {{# } }}\n' +
            '        <div class="layui-form-item">\n' +
            '            <label class="layui-form-label">模板类型：</label>\n' +
            '            <div class="layui-input-block">\n' +
            '                <span>{{ DOCTEMPLATE.parseDocTemplateType(d.docType) }}</span>\n' +
            '            </div>\n' +
            '        </div>\n' +
            /*'        <div class="layui-form-item">\n' +
            '            <label class="layui-form-label">模板状态：</label>\n' +
            '            <div class="layui-input-block">\n' +
            '                <select name="state">\n' +
            '                    <option value="0" {{# if(d.state===0){ }} selected {{# } }}>草稿</option>\n' +
            '                    <option value="1" {{# if(d.state===1){ }} selected {{# } }}>发布</option>\n' +
            '                    <option value="2" {{# if(d.state===2){ }} selected {{# } }}>停用</option>\n' +
            '                </select>\n' +
            '            </div>\n' +
            '        </div>\n' +*/
            '        <div class="layui-form-item">\n' +
            '            <div class="layui-input-block">\n' +
            '                <button class="layui-btn" lay-filter="doctemplate-form-modify-submit" lay-submit>修改</button>\n' +
            '                <button class="layui-btn layui-btn-primary" type="button" id="doctemplate-form-modify-btn-cancel" >取消</button>\n' +
            '            </div>\n' +
            '        </div>\n' +
            '        <input type="hidden" name="templateId" value="{{=d.templateId}}">\n' +
            '    </form>';
        var content = laytpl(html).render(data);
        var index = layer.open({
            type: 1,
            content: content,
            area: ['660px', '520px'],
        });
        form.render(null, 'doctemplate-form-modify');
        form.on('submit(doctemplate-form-modify-submit)', function (data) {
            $(data.form).ajaxSubmitForm({
                url: U.rootPath + '/rest/template',
                cmdtype: data.projectTypeId > 0 ? 'projType' : 'workJobType',
                cmd: 'modifyDocTemplate',
                success: function () {
                    layer.alert('修改成功！', function () {
                        layer.closeAll();
                        callback && callback();
                    });
                }
            });
            return false;
        });
        $('#doctemplate-form-modify-btn-cancel').on('click', function () {
            layer.close(index);
        });
    };

    //刷新文档模板列表
    //table,form,layer,laytpl,elem,layFilter,removeSuccess,modifySuccess,modifyStateSuccess
    var renderList = function (opt) {
        var table = opt.table, elem = opt.elem, layFilter = opt.layFilter,
            data = opt.data, removeSuccess = opt.removeSuccess,
            modifySuccess = opt.modifySuccess, form = opt.form, layer = opt.layer,
            laytpl = opt.laytpl, modifyStateSuccess = opt.modifyStateSuccess,
            parseSuccess = opt.parseSuccess;
        var tableIns = table.render({
            elem: elem,
            cols: [
                [ //表头
                    {field: 'templateId', title: '模板ID', fixed: 'left', width: 80},
                    {field: 'title', title: '模板名称', fixed: 'left', width: 200},
                    {field: 'alias', title: '别名', width: 200},
                    // {field: 'projectTypeName', title: '项目分类名称', width: 200},
                    {field: 'workJobName', title: '岗位名称', width: 100},
                    // {field: 'documentPath', title: '文档路径',width:100},
                    {field: 'docXls', title: 'Excel标识', width: 120},
                    {field: 'documentId', title: '内容标识', width: 120},
                    {
                        field: 'docType', title: '模板类型', width: 100, templet: function (d) {
                            return DOCTEMPLATE.parseDocTemplateType(d.docType);
                        },
                    },
                    // {field: 'uuid', title: '批次'},
                    /*{
                        field: 'state', title: '模板状态', width: 100, templet: function (d) {
                            if (d.state === 0) {
                                return '<span class="layui-badge-rim">草稿</span>';
                            } else if (d.state === 1) {
                                return '<span class="layui-badge-rim layui-bg-green">发布</span>';
                            } else if (d.state === 2) {
                                return '<span class="layui-badge-rim layui-bg-black">停用</span>';
                            }
                        },
                    },*/
                    {
                        title: '操作',
                        fixed: 'right',
                        align: 'left',
                        templet: function (d) {
                            //如果是草稿0 可更改为发布
                            //如果是发布1 可以更改为停用
                            //如果是停用2 不可操作发布和停用按钮

                            var $btnRootWrap = $('<div class="layui-btn-container template-list-btn-group"></div>');
                            var $btnPublish = $('<button class="layui-btn layui-btn-xs" act-type="publish">发布</button>');
                            var $btnStop = $('<button class="layui-btn layui-btn-warm layui-btn-xs" act-type="stop">停用</button>');

                            if (d.state === 0) {
                                $btnRootWrap.append($btnPublish);
                            } else if (d.state === 1) {
                                $btnRootWrap.append($btnStop);
                            }


                            var $btnGroup = $([
                                '<button class="layui-btn layui-btn-primary layui-btn-xs" act-type="import">导入Excel</button>',
                                '<button class="layui-btn layui-btn-primary layui-btn-xs" act-type="parse">文档模板转换</button>',
                                '<button class="layui-btn layui-btn-primary layui-btn-xs" act-type="exportTableData">导出表</button>',
                                '<button class="layui-btn layui-btn-primary layui-btn-xs" act-type="edit">编辑</button>',
                                '<button class="layui-btn layui-btn-primary layui-btn-xs" act-type="preview">预览</button>',
                                '<button class="layui-btn layui-btn-primary layui-btn-xs" act-type="print">打印</button>',
                                '<button class="layui-btn layui-btn-warm layui-btn-xs" act-type="modify">修改</button>',
                                '<button class="layui-btn layui-btn-danger layui-btn-xs" act-type="remove">删除</button>'
                            ].join(''));
                            $btnRootWrap.append($btnGroup);

                            return $btnRootWrap.prop('outerHTML');
                        },
                    },
                ]],
            data: data || [],
            limit: data ? data.length : 10,
            text: {
                none: '暂无数据',
            },
            done: function (res) {
                var dataSource = res.data;
                //渲染完表格后为操作单元格中的按钮添加事件
                $(elem).next('.layui-table-view').find('.template-list-btn-group').on('click', 'button', function (e) {
                    var index = $(this).closest('tr').attr('data-index');//行索引
                    var data = dataSource[index];
                    var actType = $(this).attr('act-type');//获取动作类型
                    switch (actType) {
                        case 'publish': {
                            //点击发布按钮 只有草稿状态才能更改为发布状态
                            if (data.state === 0) {
                                $.ajaxPost({
                                    url: U.rootPath + '/rest/template',
                                    cmdtype: 'projType',
                                    cmd: 'modifyTemplateState',
                                    data: {
                                        templateId: data.templateId,
                                        docType: data.docType,
                                        projectTypeId: data.projectTypeId,
                                        state: 1,
                                    },
                                    success: function () {
                                        layer.alert('修改状态成功！', function (index) {
                                            layer.close(index);
                                            modifyStateSuccess && modifyStateSuccess();
                                        });
                                    },
                                });
                            }
                            break;
                        }
                        case 'stop': {
                            //点击停用按钮 只有发布状态才能更改为停用状态
                            if (data.state === 1) {
                                $.ajaxPost({
                                    url: U.rootPath + '/rest/template',
                                    cmdtype: 'projType',
                                    cmd: 'modifyTemplateState',
                                    data: {
                                        templateId: data.templateId,
                                        docType: data.docType,
                                        projectTypeId: data.projectTypeId,
                                        state: 2,
                                    },
                                    success: function () {
                                        layer.alert('修改状态成功！', function (index) {
                                            layer.close(index);
                                            modifyStateSuccess && modifyStateSuccess();
                                        });
                                    },
                                });
                            }
                            break;
                        }
                        case 'import':
                            var params = '?templateId=' + data.templateId;
                            layer.open({
                                type: 2,
                                content: U.rootPath +
                                    '/m/v/modules/projtemplate/doctemplate/import.html' + params,
                                area: ['768px', '500px']
                            });
                            break;
                        case 'parse': {
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
                                                parseSuccess && parseSuccess();
                                            });
                                        },
                                    });
                                });
                            } else {
                                layer.alert('请先导入excel！', function (index) {
                                    layer.close(index);
                                });
                            }
                            break;
                        }
                        case 'exportTableData': {
                            if (data.documentId > 0) {
                                $.ajaxPost({
                                    url: U.admin_domain + '/rest/tagTableService/manager',
                                    cmdtype: 'tagTableServiceManager',
                                    cmd: 'exportAllTables',
                                    data: {
                                        documentId: data.docNew,
                                        projectId: 0
                                    },
                                    success: function (msgBody) {
                                        var list = msgBody.list, $root = $('<div></div>'), i;
                                        for (i = 0; i < list.length; i++) {
                                            $root.append($('<p></p>').text(list[i]));
                                        }
                                        var tableNameHTML = $root.prop('outerHTML');
                                        layer.alert('导表成功！共导出' + list.length + '张表数据。' + tableNameHTML, function (index) {
                                            layer.close(index);
                                        });
                                    }
                                });
                            } else {
                                layer.alert('请先转换excel！', function (index) {
                                    layer.close(index);
                                });
                            }
                            break;
                        }
                        case 'edit':
                            if (data.documentId > 0) {
                                var params = ['?templateId=' + data.templateId, 'workJobId=' + data.workJobId].join('&');
                                layer.open({
                                    type: 2,
                                    content: U.rootPath +
                                        '/m/v/modules/projtemplate/doctemplate/edit.html' + params,
                                    maxmin: true,
                                    area: ['1000px', ' 800px'],
                                });
                            } else {
                                layer.alert('请先转换excel！', function (index) {
                                    layer.close(index);
                                });
                            }
                            break;
                        case 'preview': {
                            if (data.documentId > 0) {
                                var params = ['?templateId=' + data.templateId, 'workJobId=' + data.workJobId].join('&');
                                layer.open({
                                    type: 2,
                                    content: U.rootPath +
                                        '/m/v/modules/projtemplate/doctemplate/preview.html' + params,
                                    maxmin: true,
                                    area: ['1000px', ' 800px']
                                });
                            } else {
                                layer.alert('请先转换excel！', function (index) {
                                    layer.close(index);
                                });
                            }
                            break;
                        }
                        case 'modify': {
                            DOCTEMPLATE.modifyForm(laytpl, form, layer, data,
                                modifySuccess);
                            break;
                        }
                        case 'remove': {
                            layer.confirm('确认删除该需求书模板数据吗？', function () {
                                $.ajaxPost({
                                    url: U.rootPath + '/rest/template',
                                    cmdtype: data.projectTypeId > 0 ?
                                        'projType' :
                                        'workJobType',
                                    cmd: 'removeDocTemplate',
                                    data: {
                                        templateId: data.templateId,
                                    },
                                    success: function () {
                                        layer.msg('删除成功！');
                                        removeSuccess && removeSuccess();
                                    },
                                });
                            });
                            break;
                        }

                    }
                });
            },
        });
        return tableIns;
    };

    window.DOCTEMPLATE = {
        parseDocTemplateType: parseDocTemplateType,
        addForm: addForm,
        renderList: renderList,
        modifyForm: modifyForm,
        getDocTypeObjArr: getDocTypeObjArr
    };

});