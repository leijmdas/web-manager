var PROJECT_STATE = {};
PROJECT_STATE.DRAFT = 0;
PROJECT_STATE.PUB = 1;
PROJECT_STATE.STOP = 2;
PROJECT_STATE.arr = ['草稿', '发布', '停用'];
$(function () {
    var PROJECT_TYPE_LIST = {
        0: '0--测试项目',
        1: '1--开发设计',
        2: '2--采购',
        3: '3--加工',
        4: '4--资讯类',
        5: '5--毕业设计'
    };

    var form = layui.form, layer = layui.layer,
        element = layui.element, laytpl = layui.laytpl, table = layui.table;

    var store = {
        projTypeDetailsInfoList: null,
        projTypeMap: [],//key为projectTypeId,value为对象
        navTreeProjTypeDetailsInfo: null,//当前导航树菜单选中的项目分类详细信息
        workJobTypeList: null,//岗位分类列表
        tabCache: [null, null, null]//存每个页面关联的项目分类id
    };

    var rootPath = U.rootPath;

    //*** 左侧导航菜单树 ***
    //渲染navTree list 已排序的项目分类节点数组
    var renderNavTree = function (list) {
        var $root = $('<div></div>'), arr = list, i, e, $parent = null, $li,
            $a, $dl, $dd;
        for (i in arr) {
            e = arr[i];
            if (e.parentId === 0) {//一级项目类
                // $li = $('<li class="layui-nav-item layui-nav-itemed"></li>');
                $li = $('<li class="layui-nav-item"></li>');
                $a = $('<a href="javascript:;"></a>');
                $a.text(e.title);
                $a.attr('ptid', e.projectTypeId);
                $dl = $('<dl class="layui-nav-child"></dl>');
                $li.append($a);
                $li.append($dl);
                $root.append($li);
                $parent = $dl;
            } else {//二级项目类
                $dd = $('<dd></dd>');
                $a = $('<a href="javascript:;"></a>');
                $a.text(e.title);
                $a.attr('ptid', e.projectTypeId);
                $dd.append($a);
                $parent.append($dd);
            }
        }
        $('#navTree').html($root);
    };

    //*** 左侧导航菜单树 ***
    var handleNavTree = function (arr) {
        renderNavTree(arr);
        element.render('nav', 'navTree');
        element.on('nav(navTree)', function (elem) {
            var projTypeId = $(elem).attr('ptid'), $item, index;
            projTypeId = parseInt(projTypeId);
            if (store.navTreeProjTypeDetailsInfo.projectTypeId !== projTypeId) {
                store.navTreeProjTypeDetailsInfo = store.projTypeMap[projTypeId];
                handleBreadCrumb();
                $item = $('#tabBody >.layui-tab-item.layui-show'),
                    index = $item.index();
                if (index === 0) {
                    // renderState();
                    renderBtnGroupByState();
                    handleProjTypeModifyView(projTypeId);
                } else if (index === 1 || index === 2) {
                    handleTabDocPage(projTypeId, index);
                }

            }
        });
    };

    //*** 顶部面包屑 ***
    var handleBreadCrumb = function () {
        var data = store.navTreeProjTypeDetailsInfo, $breadcrumb = $('#breadcrumb'),
            a, $a;
        if (!data) {
            return;
        }
        $breadcrumb.empty();
        a = '<a href="javascript:;"></a>';
        $a = $(a).text(data.title);
        $a.attr('ptid', data.projectTypeId);
        $breadcrumb.append($a);
        if (data.parentId > 0) {
            $a = $(a).text(data.parentName);
            $a.attr('ptid', data.parentId);
            $breadcrumb.prepend($a);
        }
        element.render('breadcrumb', 'breadcrumb');
    };

    //*** 项目分类 修改 ***
    var handleProjTypeModifyView = function (projTypeId) {
        store.tabCache[0] = projTypeId;
        var data = {
            projTypeDetailsInfo: store.projTypeMap[projTypeId],
            // workJobTypeList: store.workJobTypeList,
            repositoryList: store.repositoryList,
            PROJECT_TYPE_LIST: PROJECT_TYPE_LIST
        };
        var html = laytpl($('#tpl1').html()).render(data);
        $('#tabBody .layui-tab-item:eq(0)>.form').html(html);
        form.render(null, 'tpl1-form');
        form.on('submit(tpl1-subBtn)', function (data) {
            $(data.form).ajaxSubmitForm({
                url: rootPath + '/rest/template',
                cmdtype: 'projType',
                cmd: 'modifyProjType',
                success: function () {
                    layer.alert('修改成功！', function (index) {
                        layer.close(index);
                        location.href = rootPath + '/m/v/modules/projtemplate/projtype/manager.html';
                    });
                }
            });
            return false;
        });
    };

    //*** 项目分类 添加 ***
    var handlerProjTypeAddView = function () {
        var projTypeDetailsInfo = store.navTreeProjTypeDetailsInfo;
        var parentId = projTypeDetailsInfo.parentId;
        if (parentId > 0) {
            projTypeDetailsInfo['parentName'] = store.projTypeMap[parentId].title;
        }
        var data = {
            projTypeDetailsInfo: projTypeDetailsInfo,
            // workJobTypeList: store.workJobTypeList,
            repositoryList: store.repositoryList,
            PROJECT_TYPE_LIST: PROJECT_TYPE_LIST
        };
        var content = laytpl($('#tpl2').html()).render(data);
        layer.open({
            type: 1,
            content: content,
            area: ['660px', '620px'],
        });
        form.render(null, 'tpl2-form');
        form.on('radio(opt)', function (data) {
            if (data.value === '1') {
                $('#tpl2-optBlock').hide();
            } else {
                $('#tpl2-optBlock').show();
            }
        });
        form.on('submit(tpl2-subBtn)', function (data) {
            $(data.form).ajaxSubmitForm({
                url: rootPath + '/rest/template',
                cmdtype: 'projType',
                cmd: 'addProjType',
                success: function () {
                    layer.alert('添加成功！', function () {
                        location.href = rootPath + '/m/v/modules/projtemplate/projtype/manager.html';
                    });
                },
                filter: function (formData) {
                    if (formData.opt === '1') {
                        delete formData.parentId;
                    }
                    delete formData.opt;
                }
            });
            return false;
        });
    };

    //*** 页面初始化 ***

    var processData = function (data) {
        store.projTypeDetailsInfoList = data.projTypeDetailsInfoList || [];
        if (data.projTypeDetailsInfoList && data.projTypeDetailsInfoList.length > 0) {
            store.navTreeProjTypeDetailsInfo = data.projTypeDetailsInfoList[0];
        }
        store.workJobTypeList = data.workJobTypeList || [];
        store.repositoryList = data.repositoryList || [];
        $.each(data.projTypeDetailsInfoList, function (i, e) {
            store.projTypeMap[e.projectTypeId] = e;
        });

    };

    var renderPage = function () {
        handleNavTree(store.projTypeDetailsInfoList);
        handleBreadCrumb();
        store.navTreeProjTypeDetailsInfo && handleProjTypeModifyView(store.navTreeProjTypeDetailsInfo.projectTypeId);
        renderBtnGroupByState();
    };

    var modifyState = function (state) {
        if ([PROJECT_STATE.DRAFT, PROJECT_STATE.PUB, PROJECT_STATE.STOP].indexOf(state) === -1) {
            throw Error('state not in [' + [PROJECT_STATE.DRAFT, PROJECT_STATE.PUB, PROJECT_STATE.STOP].join(',') + ']');
        }
        layer.confirm('确认将该项目分类的状态变更为' + PROJECT_STATE.arr[state] + '？', function (index) {
            $.ajaxPost({
                url: rootPath + '/rest/template',
                cmdtype: 'projType',
                cmd: 'modifyState',
                data: {
                    projectTypeId: store.navTreeProjTypeDetailsInfo.projectTypeId,
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
            handlerProjTypeAddView();
        },
        'modify': function (e) {
            $('#tpl1-subBtn').click();
        },
        'remove': function (e) {
            layer.confirm('确认删除该项目分类？', function (index) {
                $.ajaxPost({
                    url: rootPath + '/rest/template',
                    cmdtype: 'projType',
                    cmd: 'removeProjType',
                    data: {
                        projectTypeId: store.tabCache[0]
                    },
                    success: function () {
                        layer.close(index);
                        layer.msg('删除成功！');
                        location.href = rootPath + '/m/v/modules/projtemplate/projtype/manager.html';
                    }
                });
            });
        },
        'pub': function (e) {
            modifyState(PROJECT_STATE.PUB);
        },
        'stop': function (e) {
            modifyState(PROJECT_STATE.STOP);
        },
        'rePub': function (e) {
            modifyState(PROJECT_STATE.PUB);
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
        var projType = store.navTreeProjTypeDetailsInfo;
        var disabledArr;
        if (!projType) {
            disabledBtn(['modify', 'remove', 'pub', 'stop', 'rePub']);
            return;
        }
        var state = projType.state;
        if (state === PROJECT_STATE.DRAFT) {//草稿
            disabledArr = ['rePub'];
        } else if (state === PROJECT_STATE.PUB) {//发布
            disabledArr = ['modify', 'remove', 'pub', 'stop', 'rePub'];
        } else if (state === PROJECT_STATE.STOP) {//停用
            disabledArr = ['pub', 'stop'];
        } else {
            throw Error('state not in range');
        }
        disabledBtn(disabledArr);
    };

    $.ajaxPost({
        url: U.rootPath + '/rest/template',
        cmdtype: 'projType',
        cmd: 'getProjTypeListData',
        success: function (data) {
            processData(data);
            renderPage();
        }
    });

    //tab bind
    element.tab({
        headerElem: '#tabHeader>li' //指定tab头元素项
        , bodyElem: '#tabBody>.layui-tab-item' //指定tab主体元素项
    });

    //tab 监听切换
    element.on('tab(layTab)', function (data) {
        var index = data.index;
        if (!store.navTreeProjTypeDetailsInfo) {
            return;
        }
        if (store.tabCache[index] !==
            store.navTreeProjTypeDetailsInfo.projectTypeId) {
            if (index === 0) {
                handleProjTypeModifyView(
                    store.navTreeProjTypeDetailsInfo.projectTypeId);
            } else if (index === 1 || index === 2) {
                handleTabDocPage(store.navTreeProjTypeDetailsInfo.projectTypeId, index);
            }
        }
    });

    /*
    树形项目分类JSON对象递归生成导航树
    var getTree = function(data) {
      var i = 0, $navTree = $('#navTree');
      for (; i < data.length; i++) {
        $navTree.append(getTreeNode(data[i]));
      }
    };

    var getTreeNode = function(e) {
      if (e.depth === 0) {
        var $li = $('<li class="layui-nav-item layui-nav-itemed"></li>'),
            $a = $('<a href="javascript:;"></a>'), i;
        $a.text(e.title);
        $li.append($a);
        if (e.child && e.child.length > 0) {
          var $dl = $('<dl class="layui-nav-child"></dl>');
          $li.append($dl);
          for (i = 0; i < e.child.length; i++) {
            $dl.append(getTreeNode(e.child[i]));
          }
        }
        return $li;
      } else {
        var $dd = $('<dd></dd>'),
            $a = $('<a href="javscript:;"></a>');
        $a.text(e.title);
        $dd.append($a);
        if (e.child && e.child.length > 0) {
          var $dl = $('<dl class="layui-nav-child"></dl>');
          $dd.append($dl);
          for (i = 0; i < e.child.length; i++) {
            $dl.append(getTreeNode(e.child[i]));
          }
        }
        return $dd;
      }
    };*/

    /*

    //*** 需求书和工作组计划模板区域 添加按钮事件 ***
    $('#xqs-btn-add,#gzz-btn-add').on('click', function () {
        //需求书添加页面
        var d = {
            projectTypeId: store.navTreeProjTypeDetailsInfo.projectTypeId,
            projectTypeName: store.navTreeProjTypeDetailsInfo.title,
            docType: $(this).attr('id') === 'xqs-btn-add' ? 100 : 200,
        };
        DOCTEMPLATE.addForm(laytpl, form, layer, d, function () {
            handleTabDocPage(d.projectTypeId, d.docType === 100 ? 1 : 2);
        });
    });

    //*** 需求书模板搜索事件 ***
    form.on('submit(search-xqs-submit)', function (data) {
        handleTabDocPage(store.navTreeProjTypeDetailsInfo.projectTypeId, 1,
            $(data.form).parseFormData());
        return false;
    });

    //*** 工作组模板搜索事件 ***
    form.on('submit(search-ggz-submit)', function (data) {
        handleTabDocPage(store.navTreeProjTypeDetailsInfo.projectTypeId, 2,
            $(data.form).parseFormData());
        return false;
    });

    //*** 加载需求书模板/工作组计划模板列表 ***
    var handleTabDocPage = function (projTypeId, index, queryParams) {
        store.tabCache[index] = projTypeId;
        store.tabIndex = index;
        var layFilter = index === 1 ? 'xqs-list' : 'gzz-list';
        var docType, elem;
        if (index === 1) {//需求书模板
            docType = 100;
            elem = '#xqs-list';
        } else if (index === 2) {//工作组计划模板
            docType = 200;
            elem = '#gzz-list';
        }
        $.ajaxPost({
            url: U.rootPath + '/rest/template',
            cmdtype: 'projType',
            cmd: 'getDocTemplateDetailsInfo',
            data: $.extend({
                projectTypeId: projTypeId,
                docType: docType
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
                    removeSuccess: function () {
                        handleTabDocPage(
                            store.navTreeProjTypeDetailsInfo.projectTypeId,
                            index);
                    },
                    modifySuccess: function () {
                        handleTabDocPage(
                            store.navTreeProjTypeDetailsInfo.projectTypeId,
                            index);
                    },
                    modifyStateSuccess: function () {
                        handleTabDocPage(
                            store.navTreeProjTypeDetailsInfo.projectTypeId,
                            index);
                    },
                    parseSuccess: function () {
                        handleTabDocPage(
                            store.navTreeProjTypeDetailsInfo.projectTypeId,
                            index);
                    }
                });
            }
        });
    };



    window.OUTER_API = {
        renderPage: function () {
            handleTabDocPage(store.navTreeProjTypeDetailsInfo.projectTypeId, store.tabIndex);
        }
    }

    */
});