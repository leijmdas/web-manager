;$(function () {

    var $doc = {};

    var counter = 0;

    $doc.utils = {
        cloneDeep: function (obj) {
            if ($.type(obj) === 'array') {
                return $.extend(true, [], obj);
            } else if ($.type(obj) === 'object') {
                return $.extend(true, {}, obj);
            } else {
                return obj;
            }
        },
        generateEleId: function () {
            return 'doc_ele_global_id' + (++counter);
        }
    };

    //tagText编号操作
    $doc.tagText = {
        getNumStr: function (tagText) {//获取编号
            return tagText.tagTitle[0].items[0].text;
        },
        getNumArr: function (tagText) {//获取数字编号数组
            var numArr, numText, newNumText;
            numText = tagText.tagTitle[0].items[0].text;
            numArr = numText.split('.');
            if (numArr[numArr.length - 1] === '') {
                numArr.pop();
            }
            return numArr;
        },
        numAddAtIndex: function (tagText, position, increment) {
            var numArr = $doc.tagText.getNumArr(tagText);
            numArr[position] = parseInt(numArr[position]) + increment;//+increment
            return numArr.join('.') + '.';
        },
        numSubAtIndex: function (tagText, position, increment) {
            var numArr = $doc.tagText.getNumArr(tagText);
            numArr[position] = parseInt(numArr[position]) - increment;//+increment
            return numArr.join('.') + '.';
        },
        lastNumAdd: function (tagText, increment) {
            var position = $doc.tagText.getNumArr(tagText).length - 1;
            return $doc.tagText.numAddAtIndex(tagText, position, increment);
        },
        lastNumSub: function (tagText, increment) {
            var position = $doc.tagText.getNumArr(tagText).length - 1;
            return $doc.tagText.numSubAtIndex(tagText, position, increment);
        },
        lastNumLetterAdd: function (tagText, increment) {
            var numLetterStr = tagText.tagTitle[0].items[0].text;
            var firstCharCode = numLetterStr.charCodeAt(0);
            var lastChar = numLetterStr.charAt(numLetterStr.length - 1);
            return String.fromCharCode(firstCharCode + 1) + lastChar;
        },
        lastNumLetterSub: function (tagText, increment) {
            var numLetterStr = tagText.tagTitle[0].items[0].text;
            var firstCharCode = numLetterStr.charCodeAt(0);
            var lastChar = numLetterStr.charAt(numLetterStr.length - 1);
            return String.fromCharCode(firstCharCode - 1) + lastChar;
        }
    };

    //动态增删目录
    $doc.dynamicAddDelDir = {
        updateNum: function (tagText, tag, child) {//tag 被点击的tagText
            var letterDir = tag.letterDir;
            tagText.tagTitle[0].items[0].text = tag.tagTitle[0].items[0].text;
            if (letterDir) {//字母
                tagText.tagTitle[0].items[0].text = $doc.tagText.lastNumLetterAdd(tagText, 1);
            } else {//数字
                if (child) {//多加一位数字1
                    var numArr = $doc.tagText.getNumArr(tagText);
                    numArr.push(1);
                    tagText.tagTitle[0].items[0].text = numArr.join('.') + '.';
                } else {//最后一位数字+1
                    tagText.tagTitle[0].items[0].text = $doc.tagText.lastNumAdd(tagText, 1);
                }
            }
        },
        updateKey: function (state, tag, separator, counter) {
            tag.key = tag.key + separator + counter;
            //更新tagMap
            state.tagMap[tag.key] = tag;
            if (tag.value.length > 0) {
                for (var i = 0; i < tag.value.length; i++) {
                    var childTag = tag.value[i];
                    if (childTag.hasOwnProperty('tagType')) {
                        $doc.dynamicAddDelDir.updateKey(state, childTag, separator, counter);
                    }
                }
            }
        },
        /**
         * 更新后面编号
         * @param letterDir
         * @param value
         * @param rowIndex
         * @param position
         * @param isAdd true:+1操作 false:-1操作
         */
        updateAfterNum: function (letterDir, value, rowIndex, position, isAdd) {
            var updateInnerNum = function (tagText, position) {
                var result;
                if (isAdd) {
                    result = $doc.tagText.numAddAtIndex(tagText, position, 1);
                } else {
                    result = $doc.tagText.numSubAtIndex(tagText, position, 1);
                }
                tagText.tagTitle[0].items[0].text = result;
                var value = tagText.value, i, tagValue;
                for (i = 0; i < value.length; i++) {
                    tagValue = value[i];
                    if (tagValue.hasOwnProperty('tagType') && tagValue.tagType === 'tagText') {
                        updateInnerNum(tagValue, position);
                    }
                }
            };
            var i = rowIndex, tagValue;
            if (letterDir) {
                for (; i < value.length; i++) {
                    tagValue = value[i];
                    if (tagValue.hasOwnProperty('tagType') && tagValue.tagType === 'tagText') {
                        var result;
                        if (isAdd) {
                            result = $doc.tagText.lastNumLetterAdd(tagValue, 1);
                        } else {
                            result = $doc.tagText.lastNumLetterSub(tagValue, 1);
                        }
                        tagValue.tagTitle[0].items[0].text = result;
                    }
                }
            } else {
                for (; i < value.length; i++) {
                    tagValue = value[i];
                    if (tagValue.hasOwnProperty('tagType') && tagValue.tagType === 'tagText') {
                        updateInnerNum(tagValue, position);
                    }
                }
            }
        },
        /**
         * 更新后面编号 +1
         * @param letterDir
         * @param value
         * @param rowIndex
         * @param position
         */
        updateAfterNumAdd1: function (letterDir, value, rowIndex, position) {
            $doc.dynamicAddDelDir.updateAfterNum(letterDir, value, rowIndex, position, true);//+1
        },
        /**
         * 更新后面编号 -1
         * @param letterDir
         * @param value
         * @param rowIndex
         * @param position
         */
        updateAfterNumSub1: function (letterDir, value, rowIndex, position) {
            $doc.dynamicAddDelDir.updateAfterNum(letterDir, value, rowIndex, position, false);//-1
        },
        /**
         *
         * @param value 点击的tag的 父tag的value 或者 body数组
         * @param rowIndex 从第几行开始找
         * @param tag 要插入的tag
         */
        insertTagText: function (value, rowIndex, tag) {
            /**
             * 从rowIndex开始找tagText
             * 如果找到 插入tag前面
             * 如果没找 插入value最后一个位置
             */
            var insertIndex = -1;
            for (var i = rowIndex; i < value.length; i++) {
                var tagValue = value[i];
                if (tagValue.hasOwnProperty('tagType') && tagValue.tagType === 'tagText') {
                    insertIndex = i;
                    break;
                }
            }
            if (insertIndex >= 0) {
                value.splice(insertIndex, 0, tag);
            } else {
                value.push(tag);
            }
        },
        //维护tagMap tagParentMap radioRefMap 删除或添加
        updateMapData: function (state, tag) {
            var update = function (tag) {
                if (state.tagMap[tag.key]) {
                    delete state.tagMap[tag.key];
                }
                if (state.tagParentMap[tag.key]) {
                    delete state.tagParentMap[tag.key];
                }
                if (tag.refString && state.radioRefMap[tag.refString]) {
                    var refTagKey = state.radioRefMap[tag.refString], index = -1;
                    $.each(refTagKey, function (i, k) {
                        if (k === tag.key) {
                            index = i;
                            return false;
                        }
                    });
                    index >= 0 && refTagKey.splice(index, 1);
                }
            };
            update(tag);
        }
    };

    $doc.table = {};
    $doc.table.computed = {
        formulas: {
            row_exp: /^row_exp\(.+\)$/,//行计算row_exp(表达式)
            column_sum: /^column_sum\(((?!column_sum)[^\(\)])+,((?!column_sum)[^\(\)])+\)$/,//列计算column_sum(tableKey,exp)
            complex: /^complex\((.+)\)$/,///复杂计算 complex(表达式) 例：complex(column_sum(f1)/column_sum(f2))

            field_ref: /^field_ref(.+)$/,
            table_field_ref: /^table\(.+\)_field_ref\(.+\)$/
        }
    };
    $doc.table.computed.mapHandle = {};
    $doc.table.computed.mapHandle[$doc.table.computed.formulas.row_exp.source] = function (s, rowIndex) {
        var that = this;
        var expression = s.replace('row_exp(', '').replace(')', '');
        var expFieldArr = expression.match(/\w+/g);
        var rowData = that.data.value[rowIndex], items = rowData.items, item, i = 0;
        for (; i < items.length; i++) {
            item = items[i];
            index = expFieldArr.indexOf(item.fieldName);
            if (index !== -1) {
                expression = expression.replace(item.fieldName, isNaN(Number(item.text)) ? 0 : Number(item.text));
            }
        }
        return eval(expression).toFixed(2);
    };
    $doc.table.computed.mapHandle[$doc.table.computed.formulas.column_sum.source] = function (s) {
        var that = this;
        var key, exp;//tagTable key 表达式
        //提取表达式
        var tmp = s.replace('column_sum(', '').replace(')', '');
        tmp = tmp.split(',');
        key = tmp[0];
        exp = tmp[1];

        //提取表达式的列字段
        var expFieldArr = exp.match(/\w+/g);

        var tagTable = that.tagMap[key];
        var values = tagTable.value, rowData, items, item, i, j, tmpExp, sum = 0, tmpNum;

        //计算
        for (i = 0; i < values.length; i++) {
            rowData = values[i];//每行
            items = rowData.items;//每行数据
            tmpExp = exp;//临时存储表达式,重复使用
            for (j = 0; j < items.length; j++) {
                item = items[j];//每个字段
                index = expFieldArr.indexOf(item.fieldName);//字段是否在表达式中存在
                if (index !== -1) {//存在 替换值
                    tmpNum = Number(item.text);
                    tmpExp = tmpExp.replace(item.fieldName, isNaN(tmpNum) ? 0 : tmpNum);
                }
            }
            sum += eval(tmpExp);//计算
        }
        return sum.toFixed(2);
    };
    $doc.table.computed.mapHandle[$doc.table.computed.formulas.complex.source] = function (s, rowIndex, columnIndex, cell) {
        var that = this;
        var exp;

        //提取表达式
        var tmp = s.match($doc.table.computed.formulas.complex);
        exp = tmp[1];

        var mapHandle = $doc.table.computed.mapHandle;

        //计算 count值
        exp = exp.replace(/count\([^()]+\)/g, function (substring) {
            var tagTableKey = substring.replace(/count\(|\)/g, '');
            var tagTable = that.tagMap[tagTableKey];
            return tagTable.value.length;
        });

        //计算column_sum
        var column_sum_source = $doc.table.computed.formulas.column_sum.source;
        exp = exp.replace(new RegExp(column_sum_source.substring(1, column_sum_source.length - 1), 'g'), function (substring) {
            return mapHandle[column_sum_source].call(that, substring);
        });

        //处理ref(tagTableKey,filedName) refFilter为查找条件
        var refFilter = cell.refFilter;
        if (refFilter) {
            var localFieldName, remoteFieldName, operator, localCellData, tmpCellData;
            var arr = [];
            //获取当前行条件字段 引用表格的条件字段 运算符
            if (/^equals/.test(refFilter)) {
                arr = refFilter.replace(/equals\(|\)/g, '').split(',');//条件
                localFieldName = arr[0];
                remoteFieldName = arr[1];
                operator = 'equals';
            } else {
                throw 'refFilter exist not operator';
            }

            var i;
            //获取当前行条件字段CellData
            for (i = 0; i < that.data.value[rowIndex].items.length; i++) {
                tmpCellData = that.data.value[rowIndex].items[i];
                if (tmpCellData.fieldName === localFieldName) {
                    localCellData = tmpCellData;
                    break;
                }
            }
            //替换ref公式值
            exp = exp.replace(/ref\([^()]+\)/g, function (substring) {
                var arr = substring.replace(/ref\(|\)/g, '').split(',');
                var refTagKey = arr[0];
                var refFieldName = arr[1];
                var refTag = that.tagMap[refTagKey];
                var i, j, refRowData, refCellData = {}, t;
                //找到符合表达式的数据行
                var isFind = false;
                for (i = 0; i < refTag.value.length; i++) {
                    for (j = 0; j < refTag.value[i].items.length; j++) {
                        t = refTag.value[i].items[j];
                        if (t.fieldName === remoteFieldName) {//遍历所有行,找到字段名为remoteFieldName的单元格
                            if (t.refField && localCellData.refField) {//如果存在关联字段,则比较关联字段的值是否相等
                                if (operator === 'equals' && localCellData.refValue === t.refValue) {
                                    refRowData = refTag.value[i];
                                    isFind = true;
                                    break;
                                }
                            } else {
                                throw '';
                                /*if (t.text === localCellData.text) {
                                    refRowData = refTag.value[i];
                                    isFind = true;
                                    break;
                                }*/
                            }
                        }
                    }
                    if (isFind) {
                        break;
                    }
                }
                if (refRowData) {//找到了符合表达式的数据行,获取引用字段的值
                    $.each(refRowData.items, function (i, e) {
                        if (e.fieldName === refFieldName) {
                            refCellData = e;
                            return false;
                        }
                    });
                    return refCellData.text;
                } else {
                    console.log("not find refRowData");
                    return 0;
                }
            });

        }

        //替换表达式 当前表格的字段值
        /*exp = exp.replace(/[a-zA-Z][^+\-*!/%]+/g, function (substring) {
            var fieldName = substring;
            var rowData = that.data.value[rowIndex];
            var val = '0';
            $.each(rowData.items, function (i, e) {
                if (e.fieldName === fieldName) {
                    val = e.text;
                    return false;
                }
            });
            return val;
        });*/
        var expFieldArr = exp.match(/\w+/g);
        var rowData = that.data.value[rowIndex], items = rowData.items, item, tmpNum;
        for (i = 0; i < items.length; i++) {
            item = items[i];
            index = expFieldArr.indexOf(item.fieldName);
            if (index !== -1) {
                tmpNum = Number(item.text);
                exp = exp.replace(item.fieldName, isNaN(tmpNum) ? 0 : tmpNum);
            }
        }

        var result = eval(exp).toFixed(2);
        return isNaN(result) ? 0 : result;
    };
    /*$doc.table.computed.mapHandle[$doc.table.computed.formulas.complex.source] = function (s, rowIndex, columnIndex, cell) {
        var refFilter = cell.refFilter;
        if (refFilter) {
            var arr = [];
            if (/^equals/.test(refFilter)) {
                arr = refFilter.replace(/equals\(|\)/g, '').split(',');//条件
            }
            var localFieldName = arr[0], localCellData;
            var refTableFieldName = arr[1], refCellData;
            var i, j, cellData;

            for (i = 0; i < that.data.value[rowIndex].items.length; i++) {
                cellData = that.data.value[rowIndex].items[i];
                if (cellData.fieldName === localFieldName) {
                    localCellData = cellData;
                    break;
                }
            }
        }

        var expression = s.replace(/^complex\(|\)$/g, '');//表达式

        var expressionArr = expression.split('&');//表达式数组 目前应用在合同总金额的计算上(组长和组员计算不一致,需要2个表达式)


        var tmp;

        if (expressionArr.length === 1) {//一个表达式
            tmp = expressionArr[0];
        } else {//多个表达式
            //在合同总金额的计算上,组长和组员计算不一致,第一个表达式给组长用,第二个表达式给组员用(暂时)
            if (rowIndex === 0) {//组长
                tmp = expressionArr[0];
            } else {//组员
                tmp = expressionArr[1];
            }
        }

        //替换表达式 替换 refSum值 ref值 count值 @@值

        //替换表达式 替换 refSum值
        tmp = tmp.replace(/refSum\([^()]+\)/g, function (substring) {
            var arr = substring.replace(/refSum\(|\)/g, '').split(',');
            var refTagKey = arr[0];
            var refFieldName = arr[1];
            var refTag = that.tagMap[refTagKey];
            var sum = 0, i, j, rowData, cellData;
            for (i = 0; i < refTag.value.length; i++) {
                rowData = refTag.value[i];
                for (j = 0; j < rowData.items.length; j++) {
                    cellData = rowData.items[j];
                    if (cellData.fieldName === refFieldName) {
                        sum += Number(cellData.text);
                    }
                }
            }
            return sum + '';
        });

        //替换表达式 替换ref值
        tmp = tmp.replace(/ref\([^()]+\)/g, function (substring) {
            var arr = substring.replace(/ref\(|\)/g, '').split(',');
            var refTagKey = arr[0];
            var refFieldName = arr[1];
            var refTag = that.tagMap[refTagKey];
            var i, j, refRowData, refCellData = {}, t;
            if (refTag.tagType === 'tagTableSum' || !refFilter) {//引用的是合计表格的某字段 或 不存在表达式
                refRowData = refTag.value[0];
            } else {
                //找到符合表达式的数据行
                var isFind = false;
                for (i = 0; i < refTag.value.length; i++) {
                    for (j = 0; j < refTag.value[i].items.length; j++) {
                        t = refTag.value[i].items[j];
                        if (refFilter) {//存在条件表达式
                            if (t.fieldName === refTableFieldName) {//遍历所有行,找到字段名为refTableFieldName的单元格
                                if (t.refField && localCellData.refField) {//如果存在引用字段,则比较引用字段的值是否相等
                                    if (localCellData.refValue === t.refValue) {
                                        refRowData = refTag.value[i];
                                        isFind = true;
                                        break;
                                    }
                                } else {
                                    if (t.text === localCellData.text) {
                                        refRowData = refTag.value[i];
                                        isFind = true;
                                        break;
                                    }
                                }
                            }
                        }
                    }
                    if (isFind) {
                        break;
                    }
                }
            }
            if (refRowData) {//找到了符合表达式的数据行,获取引用字段的值
                $.each(refRowData.items, function (i, e) {
                    if (e.fieldName === refFieldName) {
                        refCellData = e;
                        return false;
                    }
                });
                return refCellData.text;
            } else {
                console.log("not find " + substring);
                return 0;
            }
        });

        //替换表达式 count值
        tmp = tmp.replace(/count\([^()]+\)/g, function (substring) {
            var c_LocalfieldName = substring.replace(/count\(|\)/g, '');
            var workGroupCount = that.data.value.length;
            return workGroupCount;
        });

        //替换表达式 @@值
        tmp = tmp.replace(/@@\w+/g, function (substring) {
            var globalVar = substring.replace(/@/g, '');
            var globalVarValue = that.docNewModelDocument.header.params[globalVar];
            return globalVarValue;
        });

        //替换表达式 当前表格的字段值
        tmp = tmp.replace(/[a-zA-Z][^+\-*!/%]+/g, function (substring) {
            var fieldName = substring;
            var rowData = that.data.value[rowIndex];
            var val = '0';
            $.each(rowData.items, function (i, e) {
                if (e.fieldName === fieldName) {
                    val = e.text;
                    return false;
                }
            });
            return val;
        });

        var savePointNum = 2;
        if (parseInt(cell.fieldFormat) === 2) {//百分比保留4位小数
            savePointNum = 4;
        }

        try {
            return eval(tmp).toFixed(savePointNum);
        } catch (e) {
            throw e;
        }
    };*/
    $doc.table.computed.mapHandle[$doc.table.computed.formulas.field_ref.source] = function (s, rowIndex) {
        var field = s.replace(/^field_ref\(|\)/g, '');
        var rowData = this.data.value[rowIndex], items = rowData.items, item, i;
        for (i = 0; i < items.length; i++) {
            item = items[i];
            if (item.fieldName === field) {
                return item.text;
            }
        }
        return '';
    };
    $doc.table.computed.mapHandle[$doc.table.computed.formulas.table_field_ref.source] = function (s, rowIndex) {
        var field = '';
        var tmp = s.replace(/_field_ref\(.+\)/, function (substring) {
            field = substring.replace(/_field_ref\(|\)/g, '');
            return '';
        });
        tmp = tmp.replace(/table\(|\)/g, '');
        var refTableKey = tmp;

        //获取key对应的tagTable数据
        var tagTable = this.tagMap[refTableKey];
        var value = tagTable.value, rowData = value[0], items = rowData.items, item, i;
        for (i = 0; i < items.length; i++) {
            item = items[i];
            if (item.fieldName === field) {
                return item.text;
            }
        }
        return '';
    };
    $doc.table.computed.rformulas = [
        {
            r: $doc.table.computed.formulas.row_exp,
            handle: $doc.table.computed.mapHandle[$doc.table.computed.formulas.row_exp.source]
        },
        {
            r: $doc.table.computed.formulas.column_sum,
            handle: $doc.table.computed.mapHandle[$doc.table.computed.formulas.column_sum.source]
        }, {
            r: $doc.table.computed.formulas.complex,
            handle: $doc.table.computed.mapHandle[$doc.table.computed.formulas.complex.source]
        },
        {
            r: /^complex\(.+\)$/, //复杂计算
            handle: function (s, rowIndex, columnIndex, cell) {
                var that = this;
                var refFilter = cell.refFilter;
                if (refFilter) {
                    var arr = [];
                    if (/^equals/.test(refFilter)) {
                        arr = refFilter.replace(/equals\(|\)/g, '').split(',');//条件
                    }
                    var localFieldName = arr[0], localCellData;
                    var refTableFieldName = arr[1], refCellData;
                    var i, j, cellData;

                    for (i = 0; i < that.data.value[rowIndex].items.length; i++) {
                        cellData = that.data.value[rowIndex].items[i];
                        if (cellData.fieldName === localFieldName) {
                            localCellData = cellData;
                            break;
                        }
                    }
                }

                var expression = s.replace(/^complex\(|\)$/g, '');//表达式

                var expressionArr = expression.split('&');//表达式数组 目前应用在合同总金额的计算上(组长和组员计算不一致,需要2个表达式)


                var tmp;

                if (expressionArr.length === 1) {//一个表达式
                    tmp = expressionArr[0];
                } else {//多个表达式
                    //在合同总金额的计算上,组长和组员计算不一致,第一个表达式给组长用,第二个表达式给组员用(暂时)
                    if (rowIndex === 0) {//组长
                        tmp = expressionArr[0];
                    } else {//组员
                        tmp = expressionArr[1];
                    }
                }

                //替换表达式 替换 refSum值 ref值 count值 @@值

                //替换表达式 替换 refSum值
                tmp = tmp.replace(/refSum\([^()]+\)/g, function (substring) {
                    var arr = substring.replace(/refSum\(|\)/g, '').split(',');
                    var refTagKey = arr[0];
                    var refFieldName = arr[1];
                    var refTag = that.tagMap[refTagKey];
                    var sum = 0, i, j, rowData, cellData;
                    for (i = 0; i < refTag.value.length; i++) {
                        rowData = refTag.value[i];
                        for (j = 0; j < rowData.items.length; j++) {
                            cellData = rowData.items[j];
                            if (cellData.fieldName === refFieldName) {
                                sum += Number(cellData.text);
                            }
                        }
                    }
                    return sum + '';
                });

                //替换表达式 替换ref值
                tmp = tmp.replace(/ref\([^()]+\)/g, function (substring) {
                    var arr = substring.replace(/ref\(|\)/g, '').split(',');
                    var refTagKey = arr[0];
                    var refFieldName = arr[1];
                    var refTag = that.tagMap[refTagKey];
                    var i, j, refRowData, refCellData = {}, t;
                    if (refTag.tagType === 'tagTableSum' || !refFilter) {//引用的是合计表格的某字段 或 不存在表达式
                        refRowData = refTag.value[0];
                    } else {
                        //找到符合表达式的数据行
                        var isFind = false;
                        for (i = 0; i < refTag.value.length; i++) {
                            for (j = 0; j < refTag.value[i].items.length; j++) {
                                t = refTag.value[i].items[j];
                                if (refFilter) {//存在条件表达式
                                    if (t.fieldName === refTableFieldName) {//遍历所有行,找到字段名为refTableFieldName的单元格
                                        if (t.refField && localCellData.refField) {//如果存在引用字段,则比较引用字段的值是否相等
                                            if (localCellData.refValue === t.refValue) {
                                                refRowData = refTag.value[i];
                                                isFind = true;
                                                break;
                                            }
                                        } else {
                                            if (t.text === localCellData.text) {
                                                refRowData = refTag.value[i];
                                                isFind = true;
                                                break;
                                            }
                                        }
                                    }
                                }
                            }
                            if (isFind) {
                                break;
                            }
                        }
                    }
                    if (refRowData) {//找到了符合表达式的数据行,获取引用字段的值
                        $.each(refRowData.items, function (i, e) {
                            if (e.fieldName === refFieldName) {
                                refCellData = e;
                                return false;
                            }
                        });
                        return refCellData.text;
                    } else {
                        console.log("not find " + substring);
                        return 0;
                    }
                });

                //替换表达式 count值
                tmp = tmp.replace(/count\([^()]+\)/g, function (substring) {
                    var c_LocalfieldName = substring.replace(/count\(|\)/g, '');
                    var workGroupCount = that.data.value.length;
                    return workGroupCount;
                });

                //替换表达式 @@值
                tmp = tmp.replace(/@@\w+/g, function (substring) {
                    var globalVar = substring.replace(/@/g, '');
                    var globalVarValue = that.docNewModelDocument.header.params[globalVar];
                    return globalVarValue;
                });

                //替换表达式 当前表格的字段值
                tmp = tmp.replace(/[a-zA-Z][^+\-*/%]+/g, function (substring) {
                    var fieldName = substring;
                    var rowData = that.data.value[rowIndex];
                    var val = '0';
                    $.each(rowData.items, function (i, e) {
                        if (e.fieldName === fieldName) {
                            val = e.text;
                            return false;
                        }
                    });
                    return val;
                });

                var savePointNum = 2;
                if (parseInt(cell.fieldFormat) === 2) {//百分比保留4位小数
                    savePointNum = 4;
                }

                try {
                    return eval(tmp).toFixed(savePointNum);
                } catch (e) {
                    throw e;
                }
            }
        },
        {
            r: /^field_ref(.+)$/,
            handle: function (s, rowIndex) {
                var field = s.replace(/^field_ref\(|\)/g, '');
                var rowData = this.data.value[rowIndex], items = rowData.items, item, i;
                for (i = 0; i < items.length; i++) {
                    item = items[i];
                    if (item.fieldName === field) {
                        return item.text;
                    }
                }
                return '';
            }
        },
        {
            r: /^table\(.+\)_field_ref\(.+\)$/,
            handle: function (s, rowIndex) {
                var field = '';
                var tmp = s.replace(/_field_ref\(.+\)/, function (substring) {
                    field = substring.replace(/_field_ref\(|\)/g, '');
                    return '';
                });
                tmp = tmp.replace(/table\(|\)/g, '');
                var refTableKey = tmp;

                //获取key对应的tagTable数据
                var tagTable = this.tagMap[refTableKey];
                var value = tagTable.value, rowData = value[0], items = rowData.items, item, i;
                for (i = 0; i < items.length; i++) {
                    item = items[i];
                    if (item.fieldName === field) {
                        return item.text;
                    }
                }
                return '';
            }
        }
    ];

    $doc.tagTableParam = {};
    $doc.tagTableParam.update = function (state, fieldName, text) {
        var tagTableParam = state.docNewModelDocument.tagTableParam;
        var row = tagTableParam.value[0], i;
        for (i = 0; i < row.items.length; i++) {
            if (row.items[i].fieldName === fieldName) {
                row.items[i].text = text;
                break;
            }
        }
    };

    $doc.ueditor = {};
    $doc.ueditor.generateId = function () {
        return $doc.utils.generateEleId();
    };
    $doc.ueditor.create = function (id) {
        return UE.getEditor(id);
    };

    //编辑模式 tag组件
    var editTagComponents = {};

    editTagComponents['edit-tag-text'] = {
        props: {
            data: Object,
            /**
             * tag组件和tag内容行默认值组件的获取调用的是同一个方法使用同一个getTagOrDefaultComponent(tagDefaultValue,tag)
             * 由于tag组件不接受第二个参数,所以页面HTML代码中的Tag代码块存在tag=[object Object]
             * 添加tag参数,去掉tag="[object Object]"
             * 添加row参数,去掉row="1"
             */
            tag: Object,
            row: Number
        },
        template: [
            '<div class="tagText">',

            '<div class="title" :id="generateTitleId(data)">',

            '<span class="item" v-for="(t,index) in title.items">',

            '<template v-if="index===0">',
            '<span class="tagText-num">',
            '<span class="num-item" v-for="(e,numIndex) in getNumArr(t)" :class="getClassObj(numIndex,getNumArr(t).length)" @click="addDir($event,numIndex,getNumArr(t).length)">{{e}}</span>',
            '<span class="num-item num-item-click" v-if="canAddDirChildLevel" @click="addChildDir">&nbsp;</span>',
            '</span>',
            '</template>',

            '<template v-else>',
            '<span v-if="!isEdit(t)">{{t.text}}</span>',
            '<input v-else @input="onInput($event.target.value)" :value="t.text" :placeholder="t.placeholder">',
            '</template>',

            '</span>',

            '<a v-if="data.canRemoveDir" href="javascript:;" class="del-icon" @click="removeDir"></a>',

            '</div>',

            '<div class="value">',
            '<component :is="getTagOrDefaultComponent(tagValue,data)" v-for="(tagValue,row) in data.value" v-show="tagIsShow(tagValue)" :data="tagValue" :tag="data" :row="row" :key="getKey(tagValue,data,row)"></component>',
            '</div>',
            '</div>'].join(''),
        computed: {
            title: function () {
                return this.data.tagTitle[0];
            },
            canAddDir: function () {
                return this.data.canAddDir;
            },
            canAddDirChildLevel: function () {
                return this.data.canAddDirChildLevel;
            }
        },
        methods: {
            removeDir: function () {
                this.$store.dispatch("editDocTemplate/modifyTagTextRemoveDir", {
                    key: this.data.key,
                    row: this.row
                });
            },
            addDir: function (e, numIndex, arrLen) {
                //添加目录
                if (this.canAddDir && this.isLastNum(numIndex, arrLen)) {
                    this.$store.dispatch("editDocTemplate/modifyTagTextAddDir", {
                        key: this.data.key,
                        row: this.row,
                        child: false
                    });
                }
            },
            addChildDir: function () {
                //添加子集目录
                if (this.canAddDirChildLevel) {
                    this.$store.dispatch("editDocTemplate/modifyTagTextAddDir", {
                        key: this.data.key,
                        row: this.row,
                        child: true
                    });
                }
            },
            isLastNum: function (numIndex, arrLen) {
                return this.data.canAddDir && numIndex === arrLen - 1;
            },
            getClassObj: function (numIndex, arrLen) {
                return {
                    'num-item-click': this.canAddDir && this.isLastNum(numIndex, arrLen)
                };
            },
            getNumArr: function (t) {
                var arr = [], splitLetter = '';
                var numText = t.text;
                if (numText.indexOf('.') !== -1) {
                    arr = numText.split('.');
                    splitLetter = '.';
                } else if (numText.indexOf('）') !== -1) {
                    arr = numText.split('）');
                    splitLetter = '）';
                }
                if (arr[arr.length - 1] === '') {
                    arr.pop();
                }
                for (var i = 0; i < arr.length; i++) {
                    arr[i] += splitLetter;
                }
                return arr;
            },
            isEdit: function (c) {
                return c.edit;
            },
            onInput: function (value) {
                this.$store.dispatch('editDocTemplate/modifyTagTextTitleInput', {
                    key: this.data.key,
                    value: value
                });
            }
        }
    };
    editTagComponents['edit-tag-text-default-value'] = {
        props: {
            data: Object,
            tag: Object,
            row: Number
        },
        data: function () {
            return {
                textareaId: ''
            }
        },
        template: [
            '<div class="default-value">',
            // '<textarea class="tw" v-if="isInput" :placeholder="data.metadata.placeholder" @input="onInput">{{data.metadata.value}}</textarea>',
            '<textarea v-if="isInput()" :id="getTextareaId()">{{data.metadata.value}}</textarea>',
            '<span v-else>{{data.metadata.text}}</span>',
            '</div>'
        ].join(''),
        computed: {},
        methods: {
            isInput: function () {
                return this.data.metadata.type === 'input';
            },
            getTextareaId: function () {
                var id = $doc.ueditor.generateId();
                this.textareaId = id;
                return id;
            },
            onInput: function (e) {
                var target = e.target;
                target.style.height = 'auto';
                var height = target.scrollHeight;//= clientHeight + scrollTop  包括border padding height
                target.style.height = height + 'px';
                this.$store.dispatch('editDocTemplate/modifyTagTextDefaultValueInput', {
                    key: this.tag.key,
                    row: this.row,
                    value: target.value
                });
            }
        },
        mounted: function () {
            if (this.isInput()) {
                $doc.ueditor.create(this.textareaId);
            }
        }
    };

    editTagComponents['edit-tag-text-box'] = {
        props: {
            data: Object,
            tag: Object,
            row: Number
        },
        template: [
            '<div class="tagTextBox">',
            '<div class="value">',
            '<component :is="getTagOrDefaultComponent(tagValue,data)" v-for="(tagValue,row) in data.value" v-show="tagIsShow(tagValue)" :data="tagValue" :tag="data" :row="row" :key="getKey(tagValue,data,row)"></component>',
            '</div>',
            '</div>'].join('')
    };
    editTagComponents['edit-tag-text-box-default-value'] = {
        props: {
            data: Object,
            tag: Object,
            row: Number
        },
        template: [
            '<div class="default-value">',
            '<span class="item-column" v-for="(cell,column) in data.items">',
            '<span class="item-cell" v-for="(e,index) in cell.items">',
            '<input v-if="isInput(e)" :value="e.value" :placeholder="e.placeholder" @input="onInput(column,index,$event.target.value)" :readonly="isTagTableParamRef()">',
            '<span v-else>{{e.text}}</span>',
            '</span>',
            '</span>',
            '</div>'].join(''),
        methods: {
            isTagTableParamRef: function () {
                return this.tag.tagType === 'tagTableParamRef';
            },
            isInput: function (e) {
                return e.type === 'input';
            },
            onInput: function (column, index, value) {
                this.$store.dispatch('editDocTemplate/modifyTagTextBoxDefaultValueInput', {
                    key: this.tag.key,
                    row: this.row,
                    column: column,
                    index: index,
                    value: value
                });
            }
        }
    };

    editTagComponents['edit-tag-radio'] = {
        props: {
            data: Object,
            tag: Object,
            row: Number
        },
        template: [
            '<div class="tagRadio">',
            '<div class="value">',
            '<component :is="getTagOrDefaultComponent(tagValue,data)" v-for="(tagValue,row) in data.value" v-show="tagIsShow(tagValue)" :data="tagValue" :tag="data" :row="row" :key="getKey(tagValue,data,row)"></component>',
            '</div>',
            '</div>'
        ].join('')
    };
    editTagComponents['edit-tag-radio-default-value'] = {
        props: {
            data: Object,
            tag: Object,
            row: Number
        },
        template: [
            '<div class="default-value">',

            '<div class="item-row">',
            '<span class="item-column" v-for="(cell,column) in data.items">',

            '<span class="text-wrap" v-if="isText(cell)">{{cell.text}}</span>',

            '<span class="radio-wrap" v-else>',
            '<input type="radio" :name="getRadioName()" @change="onChange(column,$event)" :checked="cell.checked">',
            '<span class="desc">{{cell.desc}}</span>',
            '</span>',

            '</span>',
            '</div>',

            '</div>'
        ].join(''),
        methods: {
            isText: function (cell) {
                return cell.type === 'text';
            },
            getRadioName: function () {
                if (this.tag.horizontal) {
                    return this.tag.key + '_' + this.row;
                } else {
                    return this.tag.key;
                }
            },
            onChange: function (column, $event) {
                this.$store.dispatch('editDocTemplate/modifyTagRadioDefaultValueRadio', {
                    key: this.tag.key,
                    row: this.row,
                    column: column,
                    checked: $event.target.checked
                });
            }
        }
    };

    editTagComponents['edit-tag-check'] = {
        props: {
            data: Object,
            tag: Object,
            row: Number
        },
        template: [
            '<div class="tagCheck">',
            '<div class="value">',
            '<component :is="getTagOrDefaultComponent(tagValue,data)" v-for="(tagValue,row) in data.value" v-show="tagIsShow(tagValue)" :data="tagValue" :tag="data" :row="row" :key="getKey(tagValue,data,row)"></component>',
            '</div>',
            '</div>'].join('')
    };
    editTagComponents['edit-tag-check-default-value'] = {
        props: {
            data: Object,
            tag: Object,
            row: Number
        },
        template: [
            '<div class="default-value">',
            '<div class="item-row">',
            '<span class="item-column" v-for="(cell,column) in data.items">',

            '<span class="text-wrap" v-if="isText(cell)">{{cell.text}}</span>',

            '<span class="check-wrap" v-else>',
            '<input type="checkbox" :name="getCheckName()" @change="onChange(column,$event)" :checked="cell.checked">',
            '<span class="desc">{{cell.desc}}</span>',
            '</span>',

            '</span>',
            '</div>',
            '</div>'
        ].join(''),
        methods: {
            isText: function (cell) {
                return cell.type === 'text';
            },
            getCheckName: function () {
                return this.tag.key + '_' + this.row;
            },
            onChange: function (column, $event) {
                this.$store.dispatch('editDocTemplate/modifyTagCheckDefaultValueCheck', {
                    key: this.tag.key,
                    row: this.row,
                    column: column,
                    checked: $event.target.checked
                });
            }
        }
    };

    editTagComponents['edit-tag-table'] = {
        props: {
            data: Object,
            tag: Object,
            row: Number
        },
        template: [
            '<div class="tagTable" :class="getClass()">',

            '<table class="own-tagTable" :style="{width:tableWidth}">',

            '<thead v-if="titleArr.length>0">',

            '<tr v-for="rowTitle in titleArr">',
            '<th v-for="cell in rowTitle.items" v-if="!cell.hide" :rowspan="cell.rowSpan" :colspan="cell.colSpan" @mouseenter="onMouseEnterHindTh($event,cell)" @mouseleave="onMouseLeaveHindTh($event,cell)">',

            '<span class="content-wrap">{{cell.text}}</span>',
            '<span class="title-hint" v-if="cell.hint"></span>',
            '<span class="title-hint-panel" v-if="cell.hint">',
            '<span>{{cell.hint}}</span>',
            '<span class="title-hint-panel-line"></span>',
            '</span>',

            '</th>',
            '</tr>',
            '</thead>',

            '<tbody>',

            '<tr v-for="(row,rowIndex) in rowArr" @mouseenter="onTrMouseEnter($event,row,rowIndex)" @mouseleave="onTrMouseLeave($event,row)">',

            '<td v-for="(cell,columnIndex) in cellArr(row)" v-if="!cell.hide" :rowspan="cell.rowSpan" :colspan="cell.colSpan" :style="{width:cellWidth(cell,columnIndex)}">',


            //没有与数据表关联
            '<span v-if="!data.tableDict">',
            '<input v-if="cell.edit" type="text" @input="onInput(rowIndex,columnIndex,$event.target.value)" :value="cell.text" :placeholder="cell.placeholder">',
            '<span v-else>{{cell.text}}</span>',
            '</span>',

            //有与数据表关联
            '<span v-else>',

            '<span v-if="isButton(cell)">',

            '<div style="text-align: left;padding-left: 20px;" v-if="isOpenTaskPanel(cell)">',
            '<button type="button" @click="buttonClick(row,cell,rowIndex,columnIndex)" v-if="canAddTask(row)">添加任务</button>',
            '<div style="display: inline-block;">',
            '<div v-for="task in taskList(cell)" style="display: inline-block;">{{task}}</div>',
            '</div>',
            '</div>',

            '<div style="text-align: left;padding-left: 20px;" v-if="isOpenSelMemberPanel(cell,rowIndex)">',
            '<button type="button" @click="buttonClick(row,cell,rowIndex,columnIndex)" v-if="canAddMember(row)">添加组员</button>',
            '<div style="display: inline-block;">{{cell.text}}</div>',
            '</div>',

            '</span>',

            '<span v-else-if="isRestCalculate(cell,columnIndex)">{{restCalculate(cell,columnIndex,row,rowIndex)}}</span>',

            '<template v-else-if="isSelect(cell,columnIndex)">',
            '<template v-if="getDataList(cell).length>0">',
            '<select @change="onSelectChange($event,rowIndex,columnIndex,row,cell)" :disabled="cell.fieldReadonly">',
            '<option value="0">请选择</option>',
            '<option v-for="o in getDataList(cell)" :value="optKey(o,columnIndex,cell)" :selected="isSelected(o,columnIndex,cell)">{{optValue(o,columnIndex,cell)}}</option>',
            '</select>',
            '</template>',
            '<template v-else>',
            '<input type="text" @input="onInput(rowIndex,columnIndex,$event.target.value)" :value="format(cell.text,cell)" :placeholder="cell.placeholder" :disabled="cell.fieldReadonly">',
            '</template>',
            '</template>',

            '<span v-else-if="isCheckbox(cell)">',
            '<input type="checkbox" :checked="cell.text==1" @change="onCheckboxChange(rowIndex,columnIndex,$event)" style="height: 12px;">',
            '</span>',

            '<span v-else-if="isText(columnIndex)">',
            '<template v-if="isFormula(columnIndex)">{{format(formulaValue(cell,rowIndex,columnIndex),cell)}}</template>',
            '<template v-else>{{format(cell.text,cell)}}</template>',
            '</span>',

            '<span v-else-if="isInput(columnIndex)">',
            '<template v-if="isFormula(columnIndex)">',
            '<input type="text" @input="onInput(rowIndex,columnIndex,$event.target.value)" :value="format(formulaValue(cell,rowIndex,columnIndex),cell)" :placeholder="cell.placeholder" :disabled="cell.fieldReadonly">',
            '</template>',
            '<template v-else>',
            '<input type="text" @input="onInput(rowIndex,columnIndex,$event.target.value)" :value="format(cell.text,cell)" :placeholder="cell.placeholder" :disabled="cell.fieldReadonly">',
            '</template>',
            '</span>',


            '</span>',

            '</td>',

            '</tr>',

            '</tbody>',

            '</table>',

            '<ytb-dialog v-if="showWorkGroupTaskPanel" title="邀请好友" width="580px" :visible.sync="inviteFriendPanelInfo.dialogVisible">',
            '<ytb-invite-friend :data-obj="inviteFriendPanelInfo.dataObj" :result="inviteFriendPanelInfo.result"></ytb-invite-friend>',
            '<span slot="header">',
            '<button type="button" class="btnBlue" @click="inviteFriendBtnOk">确定</button>',
            '<button type="button" @click="inviteFriendBtnCancel">取消</button>',
            '</span>',
            '</ytb-dialog>',

            '</div>'
        ].join(''),
        data: function () {
            return {
                inviteFriendPanelInfo: {
                    dialogVisible: false,//是否弹出面板
                    dataObj: {//好友和群组数据

                    },
                    result: [],//最终选择的结果
                    row: null,
                    cell: null,
                    rowIndex: 0,
                    columnIndex: 0
                }
            };
        },
        computed: {
            restApiDataCache: function () {
                return this.$store.getters['editDocTemplate/restApiDataCache'];
            },
            docNewModelDocument: function () {
                return this.$store.getters['editDocTemplate/docNewModelDocument'];
            },
            tagMap: function () {
                return this.$store.getters[this.$root.mode + 'DocTemplate/tagMap'];
            },
            //获取title数组
            titleArr: function () {
                return this.data.tagTitle || [];
            },
            //获取value数组
            rowArr: function () {
                return this.data.value;
            },
            tableWidth: function () {
                if (this.data.tableDict) {
                    var fields = this.data.tableDict.fields, i, widthSum = 0;
                    for (i = 0; i < fields.length; i++) {
                        widthSum += fields[i].fieldDisplaysize;
                    }
                    return widthSum + 'px';
                }
                return '100%';
            },
            //计算公式结果
            formulaValue: function () {
                var that = this;
                return function (cell, rowIndex, columnIndex) {
                    var fieldData = this.data.tableDict.fields[columnIndex];
                    var formulaStr = fieldData.refParameter;
                    // var refFilter = fieldData.refFilter;
                    var result = 0;
                    var flag = false;
                    var rSource;
                    for (rSource in $doc.table.computed.mapHandle) {
                        if (new RegExp(rSource).test(formulaStr)) {
                            result = $doc.table.computed.mapHandle[rSource].call(that, formulaStr, rowIndex, columnIndex, cell);
                            flag = true;
                            break;
                        }
                    }
                    if (!flag) {
                        // throw Error('formula not found');
                        return;
                    }
                    //key rowIndex columnIndex sum 修改第rowIndex行第columnIndex的值
                    that.onInput(rowIndex, columnIndex, result);
                    return result;
                }
            },
            showWorkGroupTaskPanel: function () {
                var tableDict = this.data.tableDict;
                return tableDict && tableDict.tableName === 'work_group_task';
            }
        },
        methods: {
            onMouseEnterHindTh: function (e, cell) {
                if (!cell.hint) {
                    return;
                }
                var target = $(e.currentTarget);
                var $panel = target.find('.title-hint-panel');
                var width = target.find('.content-wrap').width();
                $panel.css({'left': width + 10 + 'px', 'top': '-10px'});
                $panel.show();
            },
            onMouseLeaveHindTh: function (e, cell) {
                if (!cell.hint) {
                    return;
                }
                var target = $(e.currentTarget);
                var $panel = target.find('.title-hint-panel');
                $panel.hide();
            },
            inviteFriendBtnOk: function () {
                var vmThis = this;
                var panelInfo = vmThis.inviteFriendPanelInfo;
                panelInfo.dialogVisible = false;
                var row = panelInfo.row;
                var cell = panelInfo.cell;
                var rowIndex = panelInfo.rowIndex;
                var columnIndex = panelInfo.columnIndex;

                var user = panelInfo.result[0];

                var modifyData = function () {
                    //刷新费用一览表的rest api data
                    vmThis.$store.dispatch('editDocTemplate/refreshTagTableRestApiDataCache', {
                        tableName: 'cost'
                    });

                    var modifyStoreData = function (value, text) {
                        vmThis.$store.dispatch('editDocTemplate/modifyTagTableDefaultValueSelect', {
                            key: vmThis.data.key,
                            rowIndex: rowIndex,
                            columnIndex: columnIndex,
                            value: value,
                            text: text
                        });
                        //选择下拉框 如果是工作组任务表 选择人员 则更新监视者的表格
                        if (vmThis.data.tableDict.tableName === 'work_group_task' && (cell.fieldName === 'work_job' || cell.fieldName === 'user_name')) {
                            var workCellData;//岗位单元格数据
                            var userNameCellData;//人员单元格数
                            if (cell.fieldName === 'work_job') {
                                workCellData = cell;
                                $.each(row.items, function (i, item) {
                                    if (item.fieldName === 'user_name') {
                                        userNameCellData = item;
                                    }
                                });
                            }
                            if (cell.fieldName === 'user_name') {
                                userNameCellData = cell;
                                $.each(row.items, function (i, item) {
                                    if (item.fieldName === 'work_job') {
                                        workCellData = item;
                                    }
                                });
                            }
                            //判断人员 岗位 ID 大于 0
                            if (workCellData[workCellData.refField] > 0 && userNameCellData[userNameCellData.refField] > 0) {
                                //通知监视者表格更新
                                var watcherTagTableKey = cell.watcherTagTableKey;
                                vmThis.$store.dispatch('editDocTemplate/modifyTagTableRefRefresh', {
                                    key: watcherTagTableKey
                                });
                            }
                        }
                    };
                    var list = vmThis.getDataList(cell, true);//不缓存
                    $.each(list, function (i, item) {
                        if (item.user_id == user.userId) {
                            modifyStoreData(user.userId, item.user_name);
                            return false;
                        }
                    });
                };

                var header = vmThis.docNewModelDocument.header;
                //邀请接口
                $.ajaxPost({
                    url: '//project.youtobon.com/rest/projectCenter',
                    cmdtype: 'projectRelease',
                    cmd: 'inviteMember',
                    data: {
                        projectId: header.projectId,
                        userId: user.userId,
                        documentId: header.documentId,
                        talkId: header.talkId
                    },
                    success: function (msgBody) {
                        modifyData();
                    }
                });
            },
            inviteFriendBtnCancel: function () {
                this.inviteFriendPanelInfo.dialogVisible = false;
            },
            showSel: function (cell) {
                return cell.b_check;
            },
            getWorkJobTaskList: function (workJobId) {

            },
            canAddTask: function (row) {
                if (this.data.tableDict.tableName === 'work_group_task') {
                    var workJobCell, i;
                    for (i = 0; i < row.items.length; i++) {
                        if (row.items[i].fieldName === 'work_job') {
                            workJobCell = row.items[i];
                            break;
                        }
                    }
                    return workJobCell.is_default != 1;
                }
                return false;
            },
            canAddMember: function (row) {
                return this.canAddTask(row);
                /*if (this.data.tableDict.tableName === 'work_group_task') {
                    var workJobCell, i;
                    for (i = 0; i < row.items.length; i++) {
                        if (row.items[i].fieldName === 'work_job') {
                            workJobCell = row.items[i];
                            break;
                        }
                    }
                    return workJobCell.is_default != 1;
                }
                return false;*/
            },
            openSelMemberPanel: function (cell, rowIndex, columnIndex) {
                var that = this;
                this.inviteFriendPanelInfo.dialogVisible = true;
                var reqOps = {
                    url: '//project.youtobon.com/projectBangBangRest/bangBangRestAjax',
                    cmdtype: 'FriendsManger',
                    cmd: 'getUsersGroups',
                    success: function (msgBody) {
                        var data = {
                            friendList: msgBody.friendList,
                            groupList: msgBody.groupList
                        };
                        if (data) {
                            that.inviteFriendPanelInfo.dataObj = data;
                        }
                    }
                };
                $.ajaxPost(reqOps);
                //获取好友列表
                //显示面板
            },
            openTaskPanel: function (row, cell, rowIndex, columnIndex) {
                var vmThis = this;
                //获取数据
                var dataList = [];
                var list = [];
                if (cell.fieldSrc === 5) {//rest接口
                    list = vmThis.getDataList(cell);
                }
                if (cell.fieldSrc === 2) {//数据来自table的接口 接口数据会在初始加载时存入与body同级位置
                    list = this.docNewModelDocument.tagTableRestDataList[this.data.key];
                }

                var workJobCell;
                $.each(row.items, function (i, cell) {
                    if (cell.fieldName === 'work_job') {
                        workJobCell = cell;
                        return false;
                    }
                });


                //条件字段 找到条件字段所在的单元格（当前行）
                var refFilter = cell.refFilter;//条件字段
                var rowData = this.data.value[rowIndex];
                var refCellData = null;
                $.each(rowData.items, function (i, item) {
                    if (item.refField === refFilter) {
                        refCellData = item;
                        return false;
                    }
                });

                if (refCellData.refValue === 0) {
                    layer.alert('请先选择岗位', function (index) {
                        layer.close(index);
                    });
                    return;
                }

                var i;
                //筛选数据
                for (i = 0; i < list.length; i++) {
                    if (list[i][refFilter] == refCellData.refValue) {
                        dataList.push($.extend(true, {}, list[i]));
                    }
                }
                //打开面板

                var refField = cell.refField;//引用字段 work_task_json
                var refValue = cell.refValue;//引用字段work_task_json的值
                var refDisplayid = cell.refDisplayid;//显示字段

                //之前选择的
                var work_taks_json_obj = JSON.parse(refValue);
                var map = {};
                $.each(work_taks_json_obj.defaultTaskList, function (i, e) {
                    map[e.task_id] = e;
                });
                $.each(work_taks_json_obj.optionalTaskList, function (i, e) {
                    map[e.task_id] = e;
                });
                /*$.each(work_taks_json_obj.customTaskList, function (i, e) {
                    map[e.task_id] = e;
                });*/

                //页面上展示的
                var work_task_json_obj_page = {
                    defaultTaskList: [],//默认任务
                    optionalTaskList: [],//可选任务
                    customTaskList: []//自定义任务（不可选）
                };

                for (i = 0; i < dataList.length; i++) {
                    var taskItem = dataList[i];
                    taskItem.checked = !!map[taskItem.task_id];
                    if (taskItem.is_optional === 0) {//不可选  默认任务
                        work_task_json_obj_page.defaultTaskList.push(taskItem);
                    } else if (taskItem.is_optional === 1) {//可选 可选任务
                        work_task_json_obj_page.optionalTaskList.push(taskItem);
                    }
                }

                if (work_taks_json_obj.customTaskList.length > 0) {//之前有选择自定义任务
                    for (i = 0; i < work_taks_json_obj.customTaskList.length; i++) {
                        var item = $.extend(true, {}, work_taks_json_obj.customTaskList[i]);
                        work_task_json_obj_page.customTaskList.push({
                            index: i,
                            taskItem: item
                        });
                    }

                } else {
                    //构造空白的自定义任务
                    work_task_json_obj_page.customTaskList.push({
                        index: 0,
                        taskItem: {
                            task_id: 0,
                            task_name: '',
                            work_job_id: parseInt(refCellData.refValue),
                            checked: false
                        }
                    });
                }

                //构造添加任务页面
                var $root = $('<div></div>'), $wrap, $item, $label;

                var $defaultTaskWrap = $('<div><div>默认任务：</div></div>');
                var $optionalTaskWrap = $('<div><div>可选任务：</div></div>');
                var customTaskWrapId = '#custom-task-container';
                var $customTaskWrap = $('<div id="custom-task-container"><p>自定义任务：</p></div>');

                $root.append($defaultTaskWrap).append($optionalTaskWrap).append($customTaskWrap);

                $.each(work_task_json_obj_page.defaultTaskList, function (i, e) {
                    $wrap = $('<div></div>');
                    $item = $('<input type="checkbox" checked disabled>');
                    $label = $('<label></label>').text(e[refDisplayid]);
                    $wrap.append($item).append($label);

                    $defaultTaskWrap.append($wrap);
                });

                var checkboxIdArr = [];
                $.each(work_task_json_obj_page.optionalTaskList, function (i, e) {
                    $wrap = $('<div></div>');
                    $item = $('<input type="checkbox">');
                    $item.attr('checked', e.checked);
                    var id = 'select-optional-task-' + i;
                    $item.attr('id', id);
                    checkboxIdArr.push({
                        id: id,
                        taskItem: e
                    });
                    $label = $('<label></label>').text(e[refDisplayid]);
                    $wrap.append($item).append($label);
                    $optionalTaskWrap.append($wrap);
                });

                var inputIdArr = [];
                var btnAddIdArr = [];
                var btnRemoveIdArr = [];
                $.each(work_task_json_obj_page.customTaskList, function (i, e) {
                    $wrap = $('<div></div>');
                    $item = $('<input type="text" placeholder="请输入自定义任务名称" autocomplete="off">');
                    $label = $('<label></label>').text('-' + workJobCell.title_alias);
                    $item.attr('value', e.taskItem.task_name);
                    var id = 'select-custom-task-' + i;
                    $item.attr('id', id);
                    inputIdArr.push({
                        id: id,
                        taskItem: e.taskItem
                    });
                    var $btnAdd = $('<button type="button">添加</button>');
                    id = 'select-custom-task-btn-add-' + i;
                    $btnAdd.attr('id', id);
                    btnAddIdArr.push({
                        id: id,
                        index: e.index,
                        taskItem: e.taskItem
                    });
                    var $btnRemove = $('<button type="button">删除</button>');
                    id = 'select-custom-task-btn-remove-' + i;
                    $btnRemove.attr('id', id);
                    btnRemoveIdArr.push({
                        id: id,
                        index: e.index,
                        taskItem: e.taskItem
                    });
                    $wrap.append($item).append($label).append($btnAdd).append($btnRemove);
                    $customTaskWrap.append($wrap);
                });

                var btnAddClickHandler = function (e, item) {
                    var cloneItem = $.extend(true, {}, item);
                    cloneItem.taskItem.checked = false;
                    cloneItem.taskItem.task_name = '';
                    var curIndex = cloneItem.index;
                    cloneItem.index = curIndex + 1;
                    //添加一行数据
                    if (cloneItem.index === work_task_json_obj_page.customTaskList.length) {
                        work_task_json_obj_page.customTaskList.push(cloneItem);
                    } else {
                        work_task_json_obj_page.customTaskList.splice(cloneItem.index, 0, cloneItem);
                    }
                    //更新后面的index值
                    for (i = cloneItem.index + 1; i < work_task_json_obj_page.customTaskList.length; i++) {
                        work_task_json_obj_page.customTaskList[i].index += 1;
                    }
                    //添加一行HTML
                    $wrap = $('<div></div>');
                    $item = $('<input type="text" placeholder="请输入自定义任务名称" autocomplete="off">');
                    $label = $('<label></label>').text('-' + workJobCell.title_alias);
                    $item.attr('value', e.task_name);
                    $item.on('input', function (e) {
                        var val = $(this).prop('value');
                        cloneItem.taskItem.task_name = val;
                        cloneItem.taskItem.checked = !!val;
                    });
                    var $btnAdd = $('<button type="button">添加</button>');
                    $btnAdd.on('click', function (e) {
                        btnAddClickHandler(e, cloneItem);
                    });
                    var $btnRemove = $('<button type="button">删除</button>');
                    $btnRemove.on('click', function (e) {
                        btnRemoveClickHandler(e, cloneItem);
                    });
                    $wrap.append($item).append($label).append($btnAdd).append($btnRemove);
                    $(customTaskWrapId).children('div:eq(' + curIndex + ')').after($wrap);
                };

                var btnRemoveClickHandler = function (e, item) {
                    var curIndex = item.index;
                    //更新index值
                    //更新后面的index值
                    for (i = curIndex + 1; i < work_task_json_obj_page.customTaskList.length; i++) {
                        work_task_json_obj_page.customTaskList[i].index -= 1;
                    }
                    //删除
                    work_task_json_obj_page.customTaskList.splice(curIndex, 1);
                    //删除页面上的HTML
                    $(customTaskWrapId).children('div:eq(' + curIndex + ')').remove();
                };

                layer.alert($root.prop('outerHTML'), {
                    title: '选择岗位任务',
                    area: ['500px', '600px'],
                    success: function (layero, index) {//成功回调
                        //添加事件
                        //为checkbox添加事件
                        $.each(checkboxIdArr, function (i, item) {
                            $('#' + item.id).on('change', function (e) {
                                item.taskItem.checked = $(this).prop('checked');
                            });
                        });
                        //为input添加事件
                        $.each(inputIdArr, function (i, item) {
                            $('#' + item.id).on('input', function (e) {
                                var val = $(this).prop('value');
                                item.taskItem.task_name = val;
                                item.taskItem.checked = !!val;
                            });
                        });
                        //为btn add添加事件
                        $.each(btnAddIdArr, function (i, item) {
                            $('#' + item.id).on('click', function (e) {
                                btnAddClickHandler(e, item);
                            });
                        });
                        //为btn remove添加事件
                        $.each(btnRemoveIdArr, function (i, item) {
                            $('#' + item.id).on('click', function (e) {
                                btnRemoveClickHandler(e, item);
                            });
                        });
                    }
                }, function (index) {
                    layer.close(index);
                    var resultObj = {
                        defaultTaskList: [],//默认任务
                        optionalTaskList: [],//可选任务
                        customTaskList: []//自定义任务（不可选）
                    };
                    var resultText = [];
                    var dataObj = work_task_json_obj_page;
                    $.each(dataObj.defaultTaskList, function (i, e) {
                        if (e.checked) {
                            resultObj.defaultTaskList.push(e);
                            resultText.push(e.task_name + ';');
                        }
                    });
                    $.each(dataObj.optionalTaskList, function (i, e) {
                        if (e.checked) {
                            resultObj.optionalTaskList.push(e);
                            resultText.push(e.task_name + ';');
                        }
                    });
                    $.each(dataObj.customTaskList, function (i, e) {
                        if (e.taskItem.checked) {
                            resultObj.customTaskList.push(e.taskItem);
                            resultText.push(e.taskItem.task_name + '-' + workJobCell.title_alias + ';');
                        }
                    });
                    //保存数据
                    vmThis.$store.dispatch('editDocTemplate/modifyTagTableDefaultValueSelect', {
                        key: vmThis.data.key,
                        rowIndex: rowIndex,
                        columnIndex: columnIndex,
                        value: JSON.stringify(resultObj),
                        text: resultText.join('')
                    });
                });
            },
            isOpenSelMemberPanel: function (cell) {
                return cell.refPool == 2;
            },
            isOpenTaskPanel: function (cell) {
                return cell.refPool == 1;
            },
            buttonClick: function (row, cell, rowIndex, columnIndex) {
                var vmThis = this;
                if (cell.refPool == 1) {//选任务面板  工作组计划-工作组任务
                    this.openTaskPanel(row, cell, rowIndex, columnIndex);
                } else if (cell.refPool == 2) {//选人员 工作组计划-工作组
                    vmThis.inviteFriendPanelInfo.row = row;
                    vmThis.inviteFriendPanelInfo.cell = cell;
                    vmThis.inviteFriendPanelInfo.rowIndex = rowIndex;
                    vmThis.inviteFriendPanelInfo.columnIndex = columnIndex;
                    this.openSelMemberPanel(row, cell, rowIndex, columnIndex);
                }
            },
            taskList: function (cell) {
                if (cell.text) {
                    var taskList = cell.text.split(/;|；/);
                    /*for (var i = 0; i < taskList.length; i++) {
                        if (taskList[i]) {
                            taskList[i] = taskList[i] + '；';
                        }
                    }*/
                    return taskList.join(';');
                }
                return [];
            },
            isButton: function (cell) {
                return cell.fieldComponent === 1;
            },
            getClass: function () {
                if (this.data.tagType === 'tagTableSum') {
                    return 'tagTableSum';
                }
                return '';
            },
            isCheckbox: function (cell) {
                return cell.fieldComponent === 1;
            },
            onCheckboxChange: function (rowIndex, columnIndex, e) {
                this.$store.dispatch('editDocTemplate/modifyTagTableDefaultValueCheckbox', {
                    key: this.data.key,
                    rowIndex: rowIndex,
                    columnIndex: columnIndex,
                    value: $(e.target).prop('checked')
                });
            },
            restCalculate: function (cell, index, row, rowIndex) {
                var that = this;
                var titleData = this.data.tableDict.fields[index];
                var url = titleData.refObject;
                var refParameter = JSON.parse(titleData.refParameter);
                var refFilter = titleData.refFilter;
                var refDisplayid = titleData.refDisplayid;//显示字段
                if (url && !$.isEmptyObject(refParameter) && refFilter) {
                    var cmdtype = refParameter.cmdtype;
                    var cmd = refParameter.cmd;
                    var list = [];

                    //做rest接口缓存
                    var tagTableKey = this.data.key;
                    var fieldName = cell.fieldName;
                    var cacheKey = tagTableKey + '_' + fieldName;
                    if (this.restApiDataCache[cacheKey]) {
                        list = this.restApiDataCache[cacheKey];
                    } else {
                        $.ajaxPost({
                            url: url,
                            cmdtype: cmdtype,
                            cmd: cmd,
                            data: this.$root.docNewModelDocument.header,
                            async: false,
                            success: function (msgBody) {
                                list = msgBody.list;
                            }
                        });
                        this.$store.dispatch('editDocTemplate/modifyRestApiDataCache', {
                            key: cacheKey,
                            value: list
                        });
                    }

                    //通过条件字段,获取值,存在引用则使用refField
                    var refCellData = {};
                    if (refFilter) {
                        $.each(this.cellArr(row), function (i, e) {
                            if (e.fieldName === refFilter) {
                                refCellData = e;
                                return false;
                            }
                        });
                    }
                    //关联条件筛选出数据,再用关联显示字段返回页面显示,再延迟修改数据(key,value),视图再更新
                    var key, dataObj = {};
                    if (refCellData.refField) {
                        key = refCellData.refField;
                        $.each(list, function (i, obj) {
                            if (obj[key] == refCellData.refValue) {
                                dataObj = obj;
                                return false;
                            }
                        });

                        that.$store.dispatch('editDocTemplate/modifyTagTableDefaultValueSelect', {
                            key: that.data.key,
                            rowIndex: rowIndex,
                            columnIndex: index,
                            value: dataObj[refCellData.refField],
                            text: dataObj[refDisplayid]
                        });

                        return dataObj[refDisplayid];
                    }
                }
                return '';
            },
            isRestCalculate: function (cell, columnIndex) {
                try {
                    var fieldData = this.data.tableDict.fields[columnIndex];
                    if (fieldData) {
                        return fieldData.fieldSrc === 7;
                    }
                    return false;
                } catch (e) {
                    console.log(e);
                }
            },
            //格式化显示
            format: function (val, cell) {
                var fieldFormat = parseInt(cell.fieldFormat);
                if (fieldFormat === 2) {//%
                    // return Math.round(Number(val * 100)).toFixed(0) + '%';
                    return Number(val * 100).toFixed(2) + '%';
                } else if (fieldFormat === 1) {//￥
                    return '￥' + val;
                } else {
                    return val;
                }
            },
            //判断是否有公式
            isFormula: function (columnIndex) {
                try {
                    var fieldData = this.data.tableDict.fields[columnIndex];
                    return fieldData && fieldData.fieldIscal && fieldData.fieldIscal;
                } catch (e) {
                    console.log("isFormula uncaught");
                }
            },
            cellWidth: function (cell, columnIndex) {
                if (this.data.tableDict) {
                    try {
                        if (cell.hide) {
                            return;
                        }
                        var fieldData = this.data.tableDict.fields[columnIndex];
                        if (fieldData) {
                            return fieldData.fieldDisplaysize + 'px' || 'auto';
                        } else {
                            return '100px';
                        }
                    } catch (e) {
                        console.log(e);
                        return 'auto';
                    }
                }
                return '';
            },
            //获取每行单元格数组
            cellArr: function (row) {
                var result = [], i;
                if (this.data.tagType === 'tagTableSum') {
                    for (i = 0; i < row.items.length; i++) {
                        if (!row.items[i].hide) {
                            result.push(row.items[i]);
                        }
                    }
                    return result;
                } else {
                    return row.items;
                }

            },
            isSelect: function (cell, columnIndex) {
                /*try {
                    var fieldData = this.data.tableDict.fields[columnIndex];
                    if (fieldData) {
                        return fieldData.fieldSrc === 5;
                    }
                    return false;
                } catch (e) {
                    console.log(e);
                }*/
                return cell.fieldComponent === 2;
            },
            isText: function (columnIndex) {
                try {
                    var fieldData = this.data.tableDict.fields[columnIndex];
                    if (fieldData) {
                        return fieldData.fieldReadonly;
                    }
                    return false;
                } catch (e) {
                    console.log(e);
                }

            },
            isInput: function (columnIndex) {
                try {
                    var fieldData = this.data.tableDict.fields[columnIndex];
                    if (fieldData) {
                        return !fieldData.fieldReadonly;
                    }
                    return false;
                } catch (e) {
                    console.log(e);
                }
            },
            isSelected: function (o, columnIndex, cell) {
                if (cell.fieldSrc === 5) {//Rest接口
                    var fieldData = this.data.tableDict.fields[columnIndex];
                    return parseInt(cell[fieldData.refField]) === o[fieldData.refField];
                } else if (cell.fieldSrc === 1) {//pool
                    return o.value === cell.text;
                }
            },
            //表格下拉框数据变更
            onSelectChange: function (e, rowIndex, columnIndex, row, cell) {
                var $target = $(e.target);
                var refFieldValue = $target.val();
                var text = $target.find("option:selected").text();
                var vmThis = this;
                vmThis.$store.dispatch('editDocTemplate/modifyTagTableDefaultValueSelect', {
                    key: vmThis.data.key,
                    rowIndex: rowIndex,
                    columnIndex: columnIndex,
                    value: refFieldValue,
                    text: text
                });
                //选择下拉框 如果是工作组任务表 选择人员 则更新监视者的表格
                if (vmThis.data.tableDict.tableName === 'work_group_task' && (cell.fieldName === 'work_job' || cell.fieldName === 'user_name')) {
                    var workCellData;//岗位单元格数据
                    var userNameCellData;//人员单元格数
                    if (cell.fieldName === 'work_job') {
                        workCellData = cell;
                        $.each(row.items, function (i, item) {
                            if (item.fieldName === 'user_name') {
                                userNameCellData = item;
                            }
                        });
                    }
                    if (cell.fieldName === 'user_name') {
                        userNameCellData = cell;
                        $.each(row.items, function (i, item) {
                            if (item.fieldName === 'work_job') {
                                workCellData = item;
                            }
                        });
                    }
                    //判断人员 岗位 ID 大于 0
                    if (workCellData[workCellData.refField] > 0 && userNameCellData[userNameCellData.refField] > 0) {
                        //通知监视者表格更新
                        var watcherTagTableKey = cell.watcherTagTableKey;
                        vmThis.$store.dispatch('editDocTemplate/modifyTagTableRefRefresh', {
                            key: watcherTagTableKey
                        });
                    }
                }
            },
            getDataList: function (cell, notCache) {
                var refObject = cell.refObject;
                var refParameter;
                var fieldSrc = cell.fieldSrc;
                var fieldName = cell.fieldName;
                var cmdtype, cmd, tableName, list, url, valueArr;
                //做接口数据缓存
                var tagTableKey = this.data.key;
                var cacheKey = tagTableKey + '_' + fieldName;
                if (!notCache && this.restApiDataCache[cacheKey]) {
                    return this.restApiDataCache[cacheKey];
                } else {
                    list = [];
                    if (fieldSrc === 5) {//REST接口
                        url = refObject;
                        refParameter = JSON.parse(cell.refParameter);
                        if (url && !$.isEmptyObject(refParameter)) {
                            cmdtype = refParameter.cmdtype;
                            cmd = refParameter.cmd;
                            tableName = refParameter.tableName || '';
                            $.ajaxPost({
                                url: url,
                                cmdtype: cmdtype,
                                cmd: cmd,
                                data: $.extend(true, {}, this.$root.docNewModelDocument.header, {tableName: tableName}),
                                async: false,
                                success: function (msgBody) {
                                    list = msgBody.list;
                                }
                            });
                        }
                    } else if (fieldSrc === 1) {//pool
                        valueArr = refObject.split('/');
                        $.each(valueArr, function (i, val) {
                            list.push({
                                key: i + 1,
                                value: val
                            })
                        });
                    }
                    if (!notCache) {
                        this.$store.dispatch('editDocTemplate/modifyRestApiDataCache', {
                            key: cacheKey,
                            value: list
                        });
                    }
                    return list;
                }

            },
            optKey: function (o, columnIndex, cell) {
                if (cell.fieldSrc === 5) {//rest接口
                    var fieldData = this.data.tableDict.fields[columnIndex];
                    return o[fieldData.refField];
                } else if (cell.fieldSrc === 1) {//pool
                    return o.key;
                }
            },
            optValue: function (o, columnIndex, cell) {
                if (cell.fieldSrc === 5) {//rest接口
                    var fieldData = this.data.tableDict.fields[columnIndex];
                    return o[fieldData.refDisplayid];
                } else if (cell.fieldSrc === 1) {//pool
                    return o.value;
                }
            },
            onInput: function (rowIndex, columnIndex, value) {
                this.$store.dispatch('editDocTemplate/modifyTagTableDefaultValueInput', {
                    key: this.data.key,
                    rowIndex: rowIndex,
                    columnIndex: columnIndex,
                    value: value
                });
            },
            onTrMouseEnter: function (e, data, rowIndex) {
                var currentTarget = e.currentTarget;
                var $currentTarget = $(currentTarget);
                var offset = $currentTarget.offset();
                var domRect = currentTarget.getBoundingClientRect();
                var vmThis = this;
                if (data.addable) {
                    var $toolbarPre = $('<div class="tagTable-toolbar-pre"></div>');
                    var $btn = $('<button type="button">+</button>');
                    $toolbarPre.append($btn);
                    $toolbarPre.css({
                        'top': domRect.top + 'px',
                        'left': (domRect.left - 100) + 'px'
                    });
                    $btn.on('click', function (e) {
                        vmThis.$store.dispatch('editDocTemplate/modifyTagTableDefaultValueAddRow', {
                            key: vmThis.data.key,
                            rowIndex: rowIndex
                        });
                    });
                    $toolbarPre.on('mouseleave', function (e) {
                        $(this).remove();
                    });
                    $toolbarPre.appendTo('body');
                    $currentTarget.data('toolbarPre', $toolbarPre.get(0));
                }
                if (data.removeable) {
                    var $toolbarSuf = $('<div class="tagTable-toolbar-suf"></div>');
                    var $btn = $('<button type="button">-</button>');
                    $toolbarSuf.append($btn);
                    $toolbarSuf.css({
                        'top': domRect.top + 'px',
                        'left': (domRect.left + $currentTarget.outerWidth()) + 'px'
                    });
                    $btn.on('click', function (e) {
                        vmThis.$store.dispatch('editDocTemplate/modifyTagTableDefaultValueRemoveRow', {
                            key: vmThis.data.key,
                            rowIndex: rowIndex
                        });
                        $toolbarSuf.remove();
                    });
                    $toolbarSuf.on('mouseleave', function (e) {
                        $(this).remove();
                    });
                    $toolbarSuf.appendTo('body');
                    $currentTarget.data('toolbarSuf', $toolbarSuf.get(0));
                }
            },
            onTrMouseLeave: function (e, data) {
                var currentTarget = e.currentTarget;
                var $currentTarget = $(currentTarget);
                if (data.addable) {
                    var toolbarPreEle = $currentTarget.data('toolbarPre');
                    var domRect = toolbarPreEle.getBoundingClientRect();
                    var $toolbarPreEle = $(toolbarPreEle);
                    var outerHeight = $toolbarPreEle.outerHeight();
                    var outerWidth = $toolbarPreEle.outerWidth();
                    var x1 = domRect.left;
                    var x2 = domRect.left + outerWidth;
                    var y1 = domRect.top;
                    var y2 = domRect.top + outerHeight;
                    if (e.clientX >= x1 && e.clientX <= x2 && e.clientY >= y1 && e.clientY <= y2) {//落在工具栏内,不移除工具栏
                    } else {
                        $toolbarPreEle.remove();
                    }
                }
                if (data.removeable) {
                    var toolbarSufEle = $currentTarget.data('toolbarSuf');
                    var domRect = toolbarSufEle.getBoundingClientRect();
                    var $toolbarSufEle = $(toolbarSufEle);
                    var outerHeight = $toolbarSufEle.outerHeight();
                    var outerWidth = $toolbarSufEle.outerWidth();
                    var x1 = domRect.left;
                    var x2 = domRect.left + outerWidth;
                    var y1 = domRect.top;
                    var y2 = domRect.top + outerHeight;
                    if (e.clientX >= x1 && e.clientX <= x2 && e.clientY >= y1 && e.clientY <= y2) {//落在工具栏内,不移除工具栏

                    } else {
                        $toolbarSufEle.remove();
                    }
                }
            }
        },
        created: function () {
            var vm = this, fields, i, fieldData, refObject, data, key, filedName, refTag;
            //检测当前表格是否引用其它表格数据
            if (this.data.tableDict) {
                fields = this.data.tableDict.fields;
                for (i = 0; i < fields.length; i++) {
                    fieldData = fields[i];
                    if (fieldData.fieldSrc === 6) {//引用表格
                        refObject = fieldData.refObject;
                        if (/^refTableColumn/.test(refObject)) {//引用表格列 refTableColumn(tagTable@work_group_task$A4,user_name)
                            data = refObject.replace(/refTableColumn\(|\)/g, '').split(',');
                            key = data[0];//表key值
                            filedName = data[1];//表字段名
                            if (vm.tagMap[key].tableDict.tableName === 'work_group_task') {//工作组任务表
                                //监视对象为工作组任务表 暂时不监视 由select事件替换 初始化的时候如果遇到监视对象时工作组任务表时，将监视者表格的key存入cellData.watcherTagTableKey
                            } else {
                                vm.$watch(function () {
                                    return vm.tagMap[key];
                                }, function () {
                                    vm.$store.dispatch('editDocTemplate/modifyTagTableRefRefresh', {
                                        key: vm.data.key
                                    });
                                }, {
                                    deep: true
                                    // immediate: true
                                });
                            }
                        }
                    }
                }
            }
        }
    };

    editTagComponents['edit-tag-file'] = {
        props: {
            data: Object,
            tag: Object,
            row: Number
        },
        template: [
            '<div class="tagFile">',
            '<div class="value">',
            '<component :is="getTagOrDefaultComponent(tagValue,data)" v-for="(tagValue,row) in data.value" v-show="tagIsShow(tagValue)" :data="tagValue" :tag="data" :row="row" :key="getKey(tagValue,data,row)"></component>',
            '</div>',
            '</div>'
        ].join('')
    };
    editTagComponents['edit-tag-file-default-value'] = {
        props: {
            data: Object,
            tag: Object,
            row: Number
        },
        template: [
            '<div class="default-value">',
            '<div class="item-row">',
            '<div class="item-column" v-for="(cell,columnIndex) in data.items">',

            '<div class="container-fluid" v-if="isImage(cell)">',

            '<template v-if="groupNumber(cell)>0">',
            '<div class="row" v-for="g in groupNumber(cell)">',
            '<div class="col-md-4 text-center" v-for="i in 3">',
            '<span class="image-item">',
            '<img :src="previewImage(getDocumentId(cell,g,i))" class="own-image">',
            '<span class="btn-del" @click="removeImage($event,getDocumentId(cell,g,i),columnIndex)">x</span>',
            '</span>',
            '</div>',
            '</div>',
            '</template>',

            '<div class="row" v-if="otherCount(cell)===1">',
            '<div class="col-md-12 text-center">',
            '<span class="image-item">',
            '<img :src="previewImage(getDocumentId(cell,groupNumber(cell)+1,1))" class="own-image">',
            '<span class="btn-del" @click="removeImage($event,getDocumentId(cell,groupNumber(cell)+1,1),columnIndex)">x</span>',
            '</span>',
            '</div>',
            '</div>',

            '<div class="row" v-if="otherCount(cell)===2">',
            '<div class="col-md-6 text-center" v-for="i in 2">',
            '<span class="image-item">',
            '<img :src="previewImage(getDocumentId(cell,groupNumber(cell)+1,i))" class="own-image">',
            '<span class="btn-del" @click="removeImage($event,getDocumentId(cell,groupNumber(cell)+1,i),columnIndex)">x</span>',
            '</span>',
            '</div>',
            '</div>',

            '<div class="row">',
            '<div class="col-md-12">',
            '<span class="upload-btn" v-if="cell.curIndex-1<cell.limit">',
            '<span class="desc">{{getDesc(cell)}}</span>',
            '<input type="file" class="own-file" @change="uploadImage($event,columnIndex)" accept="image/png,image/jpg,image/jpeg">',
            '</span>',
            '</div>',
            '</div>',

            '</div>',

            '<span class="file-wrap" v-else>',
            '<span class="desc">{{cell.desc}}：</span>',
            '<span class="file-list-wrap"><a v-if="cell.documentId>0" :href="downloadFile(cell.documentId)">{{cell.filename}}</a></span>',
            '<span class="upload-btn">',
            '<span class="upload-btn-text">上传</span>',
            '<input type="file" class="own-file" @change="uploadFile($event,columnIndex)" accept="application/zip">',
            '</span>',
            '</span>',

            '</div>',
            '</div>',
            '</div>'
        ].join(''),
        data: function () {
            return {}
        },
        computed: {},
        methods: {
            otherCount: function (cell) {
                return cell.documentIdList.length % 3;
            },
            groupNumber: function (cell) {
                return Math.floor(cell.documentIdList.length / 3);
            },
            getDocumentId: function (cell, g, i) {//i based-1
                return cell.documentIdList[(g - 1) * 3 + i - 1];
            },
            isImage: function (cell) {
                return cell.type === 'image';
            },
            getDesc: function (cell) {
                return cell.curIndex + '/' + cell.limit + cell.desc;
            },
            uploadImage: function (e, columnIndex) {
                var vmThis = this;

                var image = this.tag.value[this.row].items[columnIndex];
                if (image.curIndex - 1 >= image.limit) {//已达上传数量上限
                    var tips = '最多上传' + image.limit + '张图片！';
                    layer.alert(tips, function (index) {
                        layer.close(index);
                    });
                    return;
                }

                var target = e.target;

                var addImage = function (documentId) {
                    vmThis.$store.dispatch('editDocTemplate/modifyTagFileDefaultValueImageAdd', {
                        key: vmThis.tag.key,
                        rowIndex: vmThis.row,
                        columnIndex: columnIndex,
                        documentId: documentId
                    });
                };

                var reqOpt = {
                    url: '/rest/upload',
                    cmdtype: 'templateDocument',
                    cmd: 'uploadPIC',
                    data: {
                        file: target.files[0]
                    },
                    success: function (msgBody) {
                        var documentId = msgBody.documentId;
                        addImage(documentId);
                    },
                    fail: function (retcode, retmsg) {
                    },
                    verifyFail: function (failType, p1, p2) {
                        var s;
                        if (failType === 'accept') {
                            s = '图片类型验证不通过,允许上传的图片类型为：' + p1.replace(/image\//g, '') + '。当前图片类型为：' + p2.replace(/image\//g, '');
                        } else {
                            s = '图片大小验证不通过,允许上传的图片大小为：' + U.fileSizeToString(p1) + '。当前图片大小为：' + U.fileSizeToString(p2);
                        }
                        layer.alert(s, function (index) {
                            layer.close(index);
                        });
                    },
                    accept: 'image/png,image/jpg,image/jpeg',
                    size: 3 * 1024 * 1024,
                    complete: function () {
                        $(target).val('');
                    }
                };
                $.fileUpload(reqOpt);
            },
            previewImage: function (documentId) {
                var reqOps = {
                    url: '/rest/template/previewImage',
                    cmdtype: 'templateDocument',
                    cmd: 'previewJson',
                    data: {
                        documentId: documentId
                    }
                };
                return $.previewImage(reqOps);

            },
            removeImage: function ($event, documentId, columnIndex) {
                var vmThis = this;
                var delImage = function () {
                    vmThis.$store.dispatch('editDocTemplate/modifyTagFileDefaultValueImageDelete', {
                        key: vmThis.tag.key,
                        rowIndex: vmThis.row,
                        columnIndex: columnIndex,
                        documentId: documentId
                    });
                };
                $.ajaxPost({
                    url: '/rest/template',
                    cmdtype: 'templateDocument',
                    cmd: 'delReDocument',
                    data: {
                        documentId: documentId
                    },
                    success: function (msgBody) {
                        delImage();
                    }
                });
            },
            uploadFile: function (e, columnIndex) {
                var vmThis = this;

                var target = e.target;

                var modifyFile = function (documentId, filename) {
                    vmThis.$store.dispatch('editDocTemplate/modifyTagFileDefaultValueFileAdd', {
                        key: vmThis.tag.key,
                        rowIndex: vmThis.row,
                        columnIndex: columnIndex,
                        documentId: documentId,
                        filename: filename
                    });
                };

                var reqOpt = {
                    url: '/rest/upload',
                    cmdtype: 'templateDocument',
                    cmd: 'upload',
                    data: {
                        file: target.files[0]
                    },
                    success: function (msgBody) {
                        var documentId = msgBody.documentId;
                        var filename = msgBody.fileName;
                        modifyFile(documentId, filename);
                    },
                    fail: function (retcode, retmsg) {
                    },
                    verifyFail: function (failType, p1, p2) {
                        var s;
                        if (failType === 'accept') {
                            s = '文件类型验证不通过,允许上传的文件名后缀为：' + p1 + '。当前文件类型为：' + p2;
                        } else {
                            s = '文件大小验证不通过,允许上传的文件大小为：' + U.fileSizeToString(p1) + '。当前文件大小为：' + U.fileSizeToString(p2);
                        }
                        layer.alert(s, function (index) {
                            layer.close(index);
                        });
                    },
                    accept: 'zip',
                    size: 3 * 1024 * 1024,
                    complete: function () {
                        e.target.value = '';
                    }
                };
                $.fileUpload(reqOpt);
            },
            downloadFile: function (documentId) {
                var reqOpt = {
                    url: '/rest/template/download',
                    cmdtype: 'templateDocument',
                    cmd: 'download',
                    data: {
                        documentId: documentId
                    }
                };
                return $.getFileDownloadUrl(reqOpt);
            }
        }
    };

    editTagComponents['edit-tag-table-param'] = {
        props: {
            data: Object,
            tag: Object,
            row: Number
        },
        template: [
            '<div class="tagTableParam">',
            '<div class="value">',
            '<component :is="getTagOrDefaultComponent(tagValue,data)" v-for="(tagValue,row) in data.value" v-show="tagIsShow(tagValue)" :data="tagValue" :tag="data" :row="row" :key="getKey(tagValue,data,row)"></component>',
            '</div>',
            '</div>'].join('')
    };
    editTagComponents['edit-tag-table-param-default-value'] = {
        props: {
            data: Object,
            tag: Object,
            row: Number
        },
        template: [
            '<div class="default-value">',
            '<span class="item-column">',
            '<span class="item-cell" v-for="(e,index) in cellData.textBox.items">',
            '<input v-if="isInput(e)" :value="e.value" :placeholder="e.placeholder" @input="onInput(index,$event.target.value)">',
            '<span v-else>{{e.text}}</span>',
            '</span>',
            '</span>',
            '</div>'].join(''),
        computed: {
            cellData: function () {
                return this.data.items[0];
            }
        },
        methods: {
            isInput: function (e) {
                return e.type === 'input' && !this.cellData.fieldReadonly;
            },
            onInput: function (index, value) {
                this.$store.dispatch('editDocTemplate/modifyTagTableParamDefaultValueInput', {
                    key: this.tag.key,
                    index: index,
                    value: value
                });
            }
        }
    };

    editTagComponents['edit-tag-title'] = {
        props: {
            data: Object,
            tag: Object,
            row: Number
        },
        template: [
            '<div class="tagTitle">',
            '<div class="title">',

            '<h1>{{firstCellData.text}}</h1>',

            '</div>',
            '</div>'
        ].join(''),
        computed: {
            firstCellData: function () {
                return this.data.tagTitle[0].items[0];
            }
        }
    };

    editTagComponents['edit-tag-title-red'] = {
        props: {
            data: Object,
            tag: Object,
            row: Number
        },
        template: [
            '<div class="tagTitleRed">',
            '<div class="title">',
            '<h3 style="color: #f00; text-align: center;">{{firstCellData.text}}</h3>',
            '</div>',
            '</div>'
        ].join(''),
        computed: {
            firstCellData: function () {
                return this.data.tagTitle[0].items[0];
            }
        }
    };

    //编辑模式tag类型与tag组件名称映射
    var editTagTypeMap = {};
    editTagTypeMap['edit-tagText'] = 'edit-tag-text';
    editTagTypeMap['edit-tagTextDefaultValue'] = 'edit-tag-text-default-value';
    editTagTypeMap['edit-tagTableTextRef'] = 'edit-tag-text';
    editTagTypeMap['edit-tagTableTextRefDefaultValue'] = 'edit-tag-text-default-value';

    editTagTypeMap['edit-tagTextBox'] = 'edit-tag-text-box';
    editTagTypeMap['edit-tagTextBoxDefaultValue'] = 'edit-tag-text-box-default-value';
    editTagTypeMap['edit-tagTableParamRef'] = 'edit-tag-text-box';
    editTagTypeMap['edit-tagTableParamRefDefaultValue'] = 'edit-tag-text-box-default-value';

    editTagTypeMap['edit-tagRadio'] = 'edit-tag-radio';
    editTagTypeMap['edit-tagRadioDefaultValue'] = 'edit-tag-radio-default-value';
    editTagTypeMap['edit-tagTableParamRadio'] = 'edit-tag-radio';
    editTagTypeMap['edit-tagTableParamRadioDefaultValue'] = 'edit-tag-radio-default-value';

    editTagTypeMap['edit-tagCheck'] = 'edit-tag-check';
    editTagTypeMap['edit-tagCheckDefaultValue'] = 'edit-tag-check-default-value';
    editTagTypeMap['edit-tagTableParamCheck'] = 'edit-tag-check';
    editTagTypeMap['edit-tagTableParamCheckDefaultValue'] = 'edit-tag-check-default-value';

    editTagTypeMap['edit-tagFile'] = 'edit-tag-file';
    editTagTypeMap['edit-tagFileDefaultValue'] = 'edit-tag-file-default-value';

    editTagTypeMap['edit-tagTable'] = 'edit-tag-table';
    editTagTypeMap['edit-tagTableRef'] = 'edit-tag-table';

    editTagTypeMap['edit-tagTableSum'] = 'edit-tag-table';

    //已废弃
    editTagTypeMap['edit-tagTableIrregular'] = 'edit-tag-table';

    editTagTypeMap['edit-tagTableParam'] = 'edit-tag-table-param';
    editTagTypeMap['edit-tagTableParamDefaultValue'] = 'edit-tag-table-param-default-value';

    editTagTypeMap['edit-tagTitle'] = 'edit-tag-title';

    editTagTypeMap['edit-tagTitleRed'] = 'edit-tag-title-red';

    //混入对象 公共代码
    var mixin = {
        data: function () {
            return {
                //编辑模式tag类型与tag组件名称映射
                editTagTypeMap: editTagTypeMap,
                //预览模式tag类型与tag组件名称映射
                previewTagTypeMap: previewTagTypeMap
            };
        },
        methods: {
            //获取tag组件或tag default组件
            getTagOrDefaultComponent: function (tagValue, tag) {
                var mode = this.$root.mode;
                if (mode === 'edit') {
                    if (tagValue.hasOwnProperty('tagType')) {
                        return editTagTypeMap[mode + '-' + tagValue.tagType];
                    } else {
                        return editTagTypeMap[mode + '-' + tag.tagType + 'DefaultValue'];
                    }
                } else if (mode === 'preview') {
                    if (tagValue.hasOwnProperty('tagType')) {
                        return previewTagTypeMap[mode + '-' + tagValue.tagType];
                    } else {
                        return previewTagTypeMap[mode + '-' + tag.tagType + 'DefaultValue'];
                    }
                }
            },
            //获取tag的key和默认内容行组件的key
            getKey: function (tagValue, tag, row) {
                var mode = this.$root.mode;
                if (mode === 'edit' || mode === 'preview') {
                    if (tagValue.hasOwnProperty('tagType')) {
                        return mode + '_' + tagValue.key;
                    } else {
                        return mode + tag.key + '_' + row;
                    }
                }
                return '';
            },
            //组件是否显示 如果是tag组件则判断show字段 如果是tag值组件直接返回true
            tagIsShow: function (tag) {
                if (tag.hasOwnProperty('tagType')) {
                    return tag.show;
                } else {
                    return true;
                }
            },
            //生成tagText title的ID
            generateTitleId: function (tag) {
                return 'doc-template-id-title' + tag.key.split("$")[1].substr(1);
            }
        }
    };

    //注册编辑模式tag组件
    for (var key in editTagComponents) {
        editTagComponents[key].mixins = [mixin];
        Vue.component(key, editTagComponents[key]);
    }

    //编辑模式需要的存储
    var editStore = {
        namespaced: true,
        state: {
            templateModel: {},
            docNewModelDocument: {},//编辑后所存的文档内容对象
            tags: [],//提取docNewModelDocument中body内容
            tagMap: {},//映射key tag
            reqItemMap: {},//提取docNewModelDocument中header中的reqItemList需求因子列表内容
            tagParentMap: {},//映射key tag(父tag,根节点的父tag会直接是一个body,数组类型)
            restApiDataCache: {},//表名key+列名:[{},{}]数据 缓存接口数据
            radioRefMap: {},//radio关联显示map key:refString(引用字符串"sheet"$E15) value:refTagKey(Tag集合)
            tagTableArr: []
        },
        mutations: {
            init: function (state, payload) {
                var that = this;
                if (!payload) {
                    return;
                }
                state.templateModel = payload;
                var documentModel = payload.documentModel;
                if (typeof documentModel.document === 'string') {
                    var sDocument = Base64.decode(documentModel.document);
                    state.docNewModelDocument = JSON.parse(sDocument);
                } else {
                    state.docNewModelDocument = documentModel.document;
                }
                state.tags = state.docNewModelDocument.body;

                var tagProcessor = function (tag) {
                    var i, j, k;
                    state.tagMap[tag.key] = tag;

                    //tagTableParamRef tagTableTextRef
                    var tagTableParamRefHandler = function (tag, msgBody) {
                        if (msgBody.value !== undefined) {
                            if (msgBody.value.length > 0) {
                                var cellData = tag.value[0].items[0];
                                $.each(cellData.items, function (i, data) {
                                    if (data.type === 'input') {
                                        data.value = msgBody.value;
                                        return false;
                                    }
                                });
                            }
                        }
                    };
                    var tagTableTextRefHandler = function (tag, msgBody) {
                        var rootThis = that;
                        var visible = msgBody.visible;
                        tag.show = !!visible;
                        if (!tag.show) {
                            return;
                        }
                        if (!msgBody.list || msgBody.list.length === 0) {
                            return;
                        }

                        var key = tag.key;
                        var list = msgBody.list, val;
                        var i, j, itemTag, n;

                        if (key.indexOf('.岗位名称') !== -1) {
                            val = list[0].name;
                            tag.tagTitle[0].items[1].text = val;
                        } else if (key.indexOf('.任务名称') !== -1) {
                            var pTag = state.tagParentMap[tag.key];
                            var parentValue = pTag.value;
                            var childCount = parentValue.length;
                            var length = list.length;
                            if (length <= childCount) {
                                for (i = 0; i < length; i++) {
                                    itemTag = parentValue[i];
                                    if (itemTag.hasOwnProperty('tagType') && itemTag.tagType === 'tagTableTextRef') {
                                        val = list[i].name;
                                        itemTag.tagTitle[0].items[1].text = val;
                                    }
                                }
                                if (length < childCount) {//删掉多余的tagTableTextRef
                                    for (i = length; i < childCount; i++) {
                                        itemTag = parentValue[i];
                                        rootThis.dispatch("editDocTemplate/modifyTagTextRemoveDir", {
                                            key: itemTag.key,
                                            row: i
                                        });
                                    }
                                }
                            } else {
                                for (i = 0; i < childCount; i++) {
                                    itemTag = parentValue[i];
                                    if (itemTag.hasOwnProperty('tagType') && itemTag.tagType === 'tagTableTextRef') {
                                        val = list[i].name;
                                        itemTag.tagTitle[0].items[1].text = val;
                                    }
                                }
                                //增加
                                var proxyTag;
                                for (i = childCount; i < length; i++) {
                                    proxyTag = parentValue[i - 1];//模拟点击此tag编号增加目录
                                    rootThis.dispatch("editDocTemplate/modifyTagTextAddDir", {
                                        key: proxyTag.key,
                                        row: i - 1,
                                        child: false
                                    });
                                    parentValue[i].tagTitle[0].items[1].text = list[i].name;
                                    parentValue[i].canAddDir = false;
                                    parentValue[i].canAddDirChildLevel = false;
                                    parentValue[i].canRemoveDir = false;
                                }
                            }
                        }
                    };
                    var tagTableParamRefHandlerMap = {
                        'tagTableParamRef': tagTableParamRefHandler,
                        'tagTableTextRef': tagTableTextRefHandler
                    };
                    if (tag.tagType === 'tagTableParamRef' || tag.tagType === 'tagTableTextRef') {
                        $.ajaxPost({
                            url: '//project.youtobon.com/rest/tagTableService/manager',
                            cmdtype: 'tagTableServiceManager',
                            cmd: 'refTagTableParam',
                            data: $.extend(true, {tag: tag.key}, state.docNewModelDocument.header),
                            success: function (msgBody) {
                                tagTableParamRefHandlerMap[tag.tagType](tag, msgBody);
                            }
                        });
                    }

                    //可点击的编号初始化 和 tagTableTextRef(extends tagText)可能会被动态增删目录
                    if (!state.docNewModelDocument.modify && (tag.canAddDir || tag.tagType === 'tagTableTextRef')) {
                        tag.copyDirModule = {
                            selfCopy: $.extend(true, {}, tag),//拷贝的原型
                            counter: 0,//计数器 更新key值需求 包持组件key唯一 也代表第几次拷贝
                            separator: '_dir_copy_'//更新key值需要 更新后的tag key值为tag.key + separator + counter
                        };
                        tag.copySrcTagKey = tag.key;//记录源tag的key值 进而找到copyDirModule对象的counter计数器
                    }
                    //radio 关联显示 refTagKey -> refTagKeyMap(key为tagRadio.key)
                    if (tag.tagType === 'tagRadio') {
                        for (i = 0; i < tag.value.length; i++) {
                            if (!tag.value[i].hasOwnProperty('tagType')) {
                                for (j = 0; j < tag.value[i].items.length; j++) {
                                    var refString = tag.value[i].items[j].refString;
                                    var refTagKey = tag.value[i].items[j].refTagKey;
                                    if (refString && refTagKey) {
                                        state.radioRefMap[refString] = refTagKey;
                                    }
                                }
                            }
                        }
                    }

                    //配有接口的tagTable
                    if (tag.tagType === 'tagTable' && tag.tableDict && tag.tableDict.refSrc === 1) {
                        //调接口获取数据列表
                        var dataList = [];
                        /*//模拟工作组岗位任务数据 等接口配置好后 直接从接口中读取
                        dataList.push({task_id: 1, task_name: '电路设计', work_job_id: 50}, {
                            task_id: 2,
                            task_name: '软件设计',
                            work_job_id: 50
                        });*/
                        var refObject = tag.tableDict.refObject;
                        var refParam = JSON.parse(tag.tableDict.refParam);
                        $.ajaxPost({
                            url: refObject,
                            cmdtype: refParam.cmdtype,
                            cmd: refParam.cmd,
                            data: state.docNewModelDocument.header,
                            success: function (msgBody) {
                                dataList = msgBody.list;
                                state.docNewModelDocument.tagTableRestDataList[tag.key] = dataList;
                            }
                        });
                    }

                    //
                    if (tag.tagType === 'tagTable') {
                        state.tagTableArr.push(tag);
                        //检测当前表格是否引用其它表格数据
                        var fields, fieldData, refObj, data, fieldName, cellData;
                        if (tag.tableDict) {
                            fields = tag.tableDict.fields;
                            for (i = 0; i < fields.length; i++) {
                                fieldData = fields[i];
                                if (fieldData.fieldSrc === 6) {//文档内引用表格
                                    refObj = fieldData.refObject;
                                    if (/^refTableColumn/.test(refObj)) {//引用表格列 refTableColumn(tagTable@work_group_task$A4,user_name)
                                        data = refObj.replace(/refTableColumn\(|\)/g, '').split(',');
                                        key = data[0];//引用表key值
                                        fieldName = data[1];//引用表字段名
                                        var refTagTable = state.tagMap[key];//引用表
                                        if (refTagTable.tableDict.tableName === 'work_group_task') {//工作组任务表
                                            //监视对象为工作组任务表 暂时不监视 由select事件替换 初始化的时候如果遇到监视对象时工作组任务表时，将监视者表格的key存入cellData.watcherTagTableKey

                                            for (j = 0; j < refTagTable.value.length; j++) {
                                                for (k = 0; k < refTagTable.value[j].items.length; k++) {
                                                    cellData = refTagTable.value[j].items[k];
                                                    if (cellData.fieldName === 'work_job' || cellData.fieldName === 'user_name') {
                                                        if (!cellData.watcherTagTableKey) {
                                                            cellData.watcherTagTableKey = [tag.key];
                                                        } else {
                                                            cellData.watcherTagTableKey.indexOf(tag.key) === -1 && cellData.watcherTagTableKey.push(tag.key);
                                                        }
                                                    }
                                                }
                                            }

                                        }
                                    }
                                } else if (fieldData.fieldSrc === 9) {//9--表格列引用标题-文件外引用
                                    var url = fieldData.refObject;
                                    refParam = fieldData.refParameter;
                                    var params = JSON.parse(refParam);
                                    var refDisplayid = fieldData.refDisplayid;//显示字段
                                    var fieldName = fieldData.fieldName;//字段名称

                                    var modifyTableData = function (list) {
                                        var dataList = list;
                                        var valueArr = tag.value;
                                        var dataListSize = list.length;
                                        var valueSize = valueArr.length;
                                        var i, j, data, rowData;
                                        var findCellByFieldName = function (rowData, fieldName) {//根据字段名找到单元格
                                            for (j = 0; j < rowData.items.length; j++) {
                                                if (rowData.items[j].fieldName === fieldName) {
                                                    return rowData.items[j];
                                                }
                                            }
                                            return null;
                                        };
                                        if (dataListSize <= valueSize) {//表格行数小于现有表格行数
                                            for (i = 0; i < dataListSize; i++) {
                                                data = dataList[i];
                                                cellData = findCellByFieldName(valueArr[i], fieldName);
                                                cellData.text = data[refDisplayid];
                                            }
                                            valueArr.splice(dataListSize, valueSize - dataListSize);
                                        } else {//数据行数大于现有表格行数
                                            for (i = 0; i < valueSize; i++) {
                                                data = dataList[i];
                                                cellData = findCellByFieldName(valueArr[i], fieldName);
                                                cellData.text = data[refDisplayid];
                                            }
                                            for (i = valueSize; i < dataListSize; i++) {
                                                data = dataList[i];
                                                rowData = $.extend(true, {}, valueArr[0]);
                                                cellData = findCellByFieldName(rowData, fieldName);
                                                cellData.text = data[refDisplayid];
                                                valueArr.push(rowData);
                                            }
                                        }
                                    };

                                    $.ajaxPost({
                                        url: url,
                                        cmdtype: params.cmdtype,
                                        cmd: params.cmd,
                                        data: state.docNewModelDocument.header,
                                        success: function (msgBody) {
                                            modifyTableData(msgBody.list);
                                        }
                                    });


                                }
                            }
                        }
                    }

                    if (tag.value.length > 0) {
                        for (i = 0; i < tag.value.length; i++) {
                            var ele = tag.value[i];
                            if (ele && ele.hasOwnProperty('tagType')) {
                                state.tagParentMap[ele.key] = tag;//父节点
                                tagProcessor(ele);
                            }
                        }
                    }
                };
                for (var i = 0; i < state.tags.length; i++) {
                    var tag = state.tags[i];
                    if (tag.hasOwnProperty('tagType')) {
                        state.tagParentMap[tag.key] = state.docNewModelDocument.body;//根节点的父节点是一个数组类型的body
                        tagProcessor(tag);
                    }
                }
                //itemId > reqItem
                var reqItemList = state.docNewModelDocument.reqItemList || [];
                for (i = 0; i < reqItemList.length; i++) {
                    state.reqItemMap[reqItemList[i].itemId] = reqItemList[i];
                }

            },
            modifyTagTextAddDir: function (state, payload) {
                var key = payload.key;
                var rowIndex = payload.row;
                var child = payload.child;

                var tag = state.tagMap[key];
                var copySrcTagKey = tag.copySrcTagKey;

                var srcTag = state.tagMap[copySrcTagKey];
                var copyDirModule = srcTag.copyDirModule;//功能模块数据
                var selfCopy = copyDirModule.selfCopy;
                var counter = copyDirModule.counter;
                var separator = copyDirModule.separator;

                //克隆
                var newSelfCopy = $.extend(true, {}, selfCopy);
                newSelfCopy.canAddDir = true;
                newSelfCopy.canAddDirChildLevel = true;
                newSelfCopy.canRemoveDir = true;
                newSelfCopy.copySrcTagKey = copySrcTagKey;
                copyDirModule.counter = counter = counter + 1;

                //更新编号
                $doc.dynamicAddDelDir.updateNum(newSelfCopy, tag, child);
                //更新内部key值 同时更新tagMap
                $doc.dynamicAddDelDir.updateKey(state, newSelfCopy, separator, counter);
                //更新后面编号
                var _letterDir, _value, _rowIndex, _position, _parentTag, _insertStartRowIndex;
                _parentTag = state.tagParentMap[key];
                if ($.isArray(_parentTag)) {//body:Array
                    _value = _parentTag;
                } else {//tag:Object
                    _value = _parentTag.value;
                }
                if (tag.letterDir) {
                    _letterDir = true;
                    _insertStartRowIndex = _rowIndex = rowIndex + 1;
                    _position = 0;
                    newSelfCopy.canAddDirChildLevel = false;
                } else {
                    _letterDir = false;
                    if (child) {
                        _value = tag.value;
                        _insertStartRowIndex = _rowIndex = 0;
                        _position = $doc.tagText.getNumArr(tag).length;
                    } else {
                        _insertStartRowIndex = _rowIndex = rowIndex + 1;
                        _position = $doc.tagText.getNumArr(tag).length - 1;
                    }
                }
                $doc.dynamicAddDelDir.updateAfterNumAdd1(_letterDir, _value, _rowIndex, _position);
                //插入
                $doc.dynamicAddDelDir.insertTagText(_value, _insertStartRowIndex, newSelfCopy);
                //更新tagMapParent  tagMap在updateKey函数中更新
                state.tagParentMap[newSelfCopy.key] = child ? tag : _parentTag;
                if (/^"sheet"/.test(newSelfCopy.refString)) {//拷贝的TagText有关联显示到Radio
                    state.radioRefMap[newSelfCopy.refString].push(newSelfCopy.key);
                    newSelfCopy.show = true;
                }
            },
            modifyTagTextRemoveDir: function (state, payload) {
                var key = payload.key;
                var rowIndex = payload.row;

                var tag = state.tagMap[key];
                var parentTag = state.tagParentMap[key];

                var value;
                if ($.isArray(parentTag)) {//body:Array
                    value = parentTag;
                } else {//tag:Object
                    value = parentTag.value;
                }

                var _letterDir = !!tag.letterDir;
                var _value = value;
                var _rowIndex = rowIndex + 1;
                var _position = $doc.tagText.getNumArr(tag).length - 1;


                //更新后面编号
                $doc.dynamicAddDelDir.updateAfterNumSub1(_letterDir, _value, _rowIndex, _position);

                //维护tagMap tagParentMap radioRefMap
                $doc.dynamicAddDelDir.updateMapData(state, tag);

                //删除 需要放到最后一个步骤
                value.splice(rowIndex, 1);

            },
            modifyTagTextTitleInput: function (state, payload) {
                var key = payload.key;
                var value = payload.value;
                var tag = state.tagMap[key];
                var t = tag.tagTitle[0].items[1];
                if (t.edit) {
                    t.text = value;
                }
            },
            modifyTagTextDefaultValueInput: function (state, payload) {
                var key = payload.key;
                var row = payload.row;
                var value = payload.value;
                var tagDefaultValue = state.tagMap[key].value[row];
                tagDefaultValue.metadata.value = value;
            },
            modifyTagTextBoxDefaultValueInput: function (state, payload) {
                var key = payload.key;
                var row = payload.row;
                var column = payload.column;
                var index = payload.index;
                var value = payload.value;
                var obj = state.tagMap[key].value[row];
                obj.items[column].items[index].value = value;
            },
            modifyTagRadioDefaultValueRadio: function (state, payload) {
                var key, row, column, checked, tag, tagDefaultValue, tagDefaultValueTmp, i, j, k;
                key = payload.key;
                row = payload.row;
                column = payload.column;
                checked = payload.checked;
                tag = state.tagMap[key];
                tagDefaultValue = tag.value[row];

                //关联显示的内容块的显示或隐藏
                var radioHideOrShowRefTag = function (m, isShow) {
                    for (k = 0; k < m.refTagKey.length; k++) {
                        state.tagMap[m.refTagKey[k]].show = isShow;
                    }
                };
                var updateReqItem = function (m, val) {
                    state.reqItemMap[m.reqItemId].value = val;
                };
                /**
                 * 如果tagRadio的默认值(一个内容行)是独立一块单选按钮组(tag.horizontal=true),
                 * 则每次改变单选按钮组的一项时,当前内容行中的所有的项要先设为不选中状态(checked=false),再设置当前项的为选中状态(checked=true)
                 *
                 * 如果tag.horizontal=false,表示当前的tagRadio的所有内容行的单选按钮组成1个单选按钮组
                 * 则每次改变单选按钮组的一项时,所有的内容行中的单选按钮的要先设为不选中状态(checked=false),再设置当前项的为选中状态(checked=true)
                 *
                 * 实际上改变radio的值,是在用户点击没有选中的单选按钮时(change 事件)触发的,每次传进来要修改的是选中状态值都为true
                 */
                if (tag.horizontal) {
                    for (i = 0; i < tagDefaultValue.items.length; i++) {
                        var m = tagDefaultValue.items[i];
                        if (m.type === 'radio') {
                            m.checked = false;
                            if (m.reqItemId > 0) {//需求因子项
                                updateReqItem(m, 0);
                            }
                            //关联显示的内容块的隐藏
                            radioHideOrShowRefTag(m, false);
                        }
                    }
                } else {
                    for (i = 0; i < tag.value.length; i++) {
                        tagDefaultValueTmp = tag.value[i];
                        //是一个tag组件,跳过,不处理
                        //当前tagRadio的默认值(一个内容行)
                        if (!tagDefaultValueTmp.hasOwnProperty('tagType')) {
                            for (j = 0; j < tagDefaultValueTmp.items.length; j++) {
                                m = tagDefaultValueTmp.items[j];
                                if (m.type === 'radio') {
                                    m.checked = false;
                                    if (m.reqItemId > 0) {//需求因子项
                                        updateReqItem(m, 0);
                                    }
                                    //关联显示的内容块的隐藏
                                    radioHideOrShowRefTag(m, false);
                                }
                            }
                        }
                    }
                }
                tagDefaultValue.items[column].checked = checked;
                if (tagDefaultValue.items[column].reqItemId > 0) {//需求因子项
                    updateReqItem(tagDefaultValue.items[column], checked ? 1 : 0);
                }
                //关联显示的内容块的显示
                radioHideOrShowRefTag(tagDefaultValue.items[column], true);

                //如果是tagTableParamRadio 则更新state.docNewModelDocument.tagTableParam值
                if (tag.tagType === 'tagTableParamRadio') {
                    $doc.tagTableParam.update(state, tag.fieldName, tagDefaultValue.items[column].desc);
                }
            },
            modifyTagCheckDefaultValueCheck: function (state, payload) {
                var key, row, column, checked, tag, tagDefaultValue, i, tmpMetadata, selText = [];
                key = payload.key;
                row = payload.row;
                column = payload.column;
                checked = payload.checked;
                tag = state.tagMap[key];
                tagDefaultValue = tag.value[row];
                tagDefaultValue.items[column].checked = checked;
                //如果是tagTableParamCheck 则更新state.docNewModelDocument.tagTableParam值
                if (tag.tagType === 'tagTableParamCheck') {
                    for (i = 0; i < tagDefaultValue.items.length; i++) {
                        tmpMetadata = tagDefaultValue.items[i];
                        if (tmpMetadata.type === 'check' && tmpMetadata.checked) {
                            selText.push(tmpMetadata.desc);
                        }
                    }
                    $doc.tagTableParam.update(state, tag.fieldName, selText.join('|'));
                }
            },
            modifyTagTableDefaultValueInput: function (state, payload) {
                var key, rowIndex, columnIndex, value, tag, tagDefaultValue;
                key = payload.key;
                rowIndex = payload.rowIndex;
                columnIndex = payload.columnIndex;
                value = payload.value;
                tag = state.tagMap[key];
                tagDefaultValue = tag.value[rowIndex];
                if (tag.tagType === 'tagTableSum') {
                    var count = -1;//实际第几列
                    for (var i = 0; i < tagDefaultValue.items.length; i++) {
                        var e = tagDefaultValue.items[i];
                        if (!e.hide) {
                            count++;
                            if (count === columnIndex) {
                                e.text = value;
                                break;
                            }
                        }
                    }
                } else {
                    tagDefaultValue.items[columnIndex].text = value;
                }
            },
            modifyTagTableDefaultValueCheckbox: function (state, payload) {
                var key, rowIndex, columnIndex, value, tag, tagDefaultValue;
                key = payload.key;
                rowIndex = payload.rowIndex;
                columnIndex = payload.columnIndex;
                value = payload.value;
                tag = state.tagMap[key];
                tagDefaultValue = tag.value[rowIndex];
                if (tag.tagType === 'tagTableSum') {
                    var count = -1;//实际第几列
                    for (var i = 0; i < tagDefaultValue.items.length; i++) {
                        var e = tagDefaultValue.items[i];
                        if (!e.hide) {
                            count++;
                            if (count === columnIndex) {
                                e.text = value ? 1 : 0;
                                break;
                            }
                        }
                    }
                } else {
                    tagDefaultValue.items[columnIndex].text = value ? 1 : 0;
                }
            },
            modifyTagTableDefaultValueAddRow: function (state, payload) {
                var key, rowIndex, tag, tagDefaultValue;
                key = payload.key;
                rowIndex = payload.rowIndex;
                tag = state.tagMap[key];
                tagDefaultValue = tag.value[rowIndex];
                var addRowData = $.extend(true, {}, tagDefaultValue), i, j, rowData, items, item;

                if (tag.containsNoColumn) {//表格包含序号列

                    for (j = 0; j < addRowData.items.length; j++) {
                        item = addRowData.items[j];
                        if (item.fieldFormat === '3') {
                            item.text = rowIndex + 2;
                        }
                    }

                    if (rowIndex + 1 === tag.value.length) {//触发添加动作的行是表格最后一行
                    } else {
                        for (i = rowIndex + 1; i < tag.value.length; i++) {
                            rowData = tag.value[i];
                            items = rowData.items;
                            for (j = 0; j < items.length; j++) {
                                item = items[j];
                                if (item.fieldFormat === '3') {
                                    item.text = parseInt(item.text) + 1;//+1
                                }
                            }
                        }
                    }
                }

                if (tag.tableDict && tag.tableDict.tableName === 'work_group_task') {
                    //清空人员ID
                    item = addRowData.items[1];
                    item.refValue = 0;
                    item[item.refField] = 0;
                    item.text = '';
                }

                //在后面添加的行 可添加 可删除
                addRowData.addable = true;
                addRowData.removeable = true;
                tag.value.splice(rowIndex + 1, 0, addRowData);
            },
            modifyTagTableDefaultValueRemoveRow: function (state, payload) {
                var key, rowIndex, tag;
                key = payload.key;
                rowIndex = payload.rowIndex;
                tag = state.tagMap[key];
                var i, j, rowData, items, item;

                if (tag.containsNoColumn) {//表格包含序号列

                    if (rowIndex + 1 === tag.value.length) {//触发删除动作的行是表格最后一行
                    } else {
                        for (i = rowIndex + 1; i < tag.value.length; i++) {
                            rowData = tag.value[i];
                            items = rowData.items;
                            for (j = 0; j < items.length; j++) {
                                item = items[j];
                                if (item.fieldFormat === '3') {
                                    item.text = parseInt(item.text) - 1;//-1
                                }
                            }
                        }
                    }
                }

                //删除当前行
                tag.value.splice(rowIndex, 1);
            },
            modifyTagTableDefaultValueSelect: function (state, payload) {
                var key, rowIndex, columnIndex, tag, value, tagDefaultValue, cellData, text;
                key = payload.key;
                rowIndex = payload.rowIndex;
                columnIndex = payload.columnIndex;
                value = payload.value;
                text = payload.text;
                tag = state.tagMap[key];
                tagDefaultValue = tag.value[rowIndex];
                cellData = tagDefaultValue.items[columnIndex];
                //修改cell中的引用字段的值
                var titleData = tag.tableDict.fields[columnIndex];
                if (titleData.refField) {
                    cellData[titleData.refField] = value;
                    cellData['refValue'] = value;
                }
                cellData.text = text;

                //工作组计划 乙方工作组 岗位 修改时 要清空 工作内容
                if (tag.tableDict.tableName === 'work_group_task' && cellData.fieldName === 'work_job') {
                    for (var i = 0; i < tagDefaultValue.items.length; i++) {
                        var item = tagDefaultValue.items[i];
                        if (item.fieldName === 'work_task') {

                            var refFilter = item.refFilter;

                            var refCellData = null;
                            $.each(tagDefaultValue.items, function (i, e) {
                                if (e.refField === refFilter) {
                                    refCellData = e;
                                    return false;
                                }
                            });

                            var showText = [];
                            var work_task_json_obj = {
                                defaultTaskList: [],//不可选 默认任务
                                optionalTaskList: [],//可选 可选任务
                                customTaskList: []// 自定义任务
                            };

                            var dataList = state.docNewModelDocument.tagTableRestDataList[tag.key];
                            $.each(dataList, function (i, e) {
                                if (e[refFilter] == refCellData.refValue && e.is_optional === 0) {//不可选 就是默认任务
                                    work_task_json_obj.defaultTaskList.push($.extend(true, {checked: true}, e));
                                    showText.push(e[item.refDisplayid] + ';');
                                }
                            });

                            item.text = showText.join('');

                            item.refValue = JSON.stringify(work_task_json_obj);

                            break;
                        }
                    }
                }

            },
            modifyTagTableRefRefresh: function (state, payload) {
                var key, tag, fields, i, j, k, l, m, fieldData, refObject, refParameter, data, refKey, refFiledName,
                    refTag,
                    refTagFields,
                    columnIndex, refColumnIndex, tableRows, refTableRows, tableRowsChangeAble, saveAfterRows,
                    tagRowData, tagCellData, refCellData, cloneCellData, refreshData, needAddRows, lastRowDataArr,
                    lastRowData, cloneLastRowData, lastRowCellData, lastRowDataIndex, needSubRows, startDelIndex,
                    mergeCellDataArr;
                key = payload.key;//数组 n 个 key

                var modifyTagTableData = function (key) {
                    tag = state.tagMap[key];
                    //刷新当前表格数据
                    fields = tag.tableDict.fields;
                    for (i = 0; i < fields.length; i++) {
                        fieldData = fields[i];
                        if (fieldData.fieldSrc === 6) {//引用表格
                            refObject = fieldData.refObject;
                            refParameter = fieldData.refParameter;
                            if (/^refTableColumn/.test(refObject)) {//引用表格列 refTableColumn(tagTable@work_group_task$A4,user_name)
                                data = refObject.replace(/refTableColumn\(|\)/g, '').split(',');
                                refKey = data[0];//引用表key值
                                refFiledName = data[1];//引用表字段名
                                refTag = state.tagMap[refKey];
                                //当前表格字段名的列索引
                                columnIndex = i;
                                //引用字段名对应的列索引
                                refTagFields = refTag.tableDict.fields;
                                for (j = 0; j < refTagFields.length; j++) {
                                    if (refTagFields[j].fieldName === refFiledName) {
                                        refColumnIndex = j;
                                        break;
                                    }
                                }
                                if (refColumnIndex === undefined) {//引用的字段找不到
                                    return;
                                }
                                //当前表格的行数
                                tableRows = tag.value.length;
                                //当前表格的可变行数
                                if (/^after/.test(refParameter)) {
                                    //当前表格保留行数
                                    saveAfterRows = refParameter.split('_')[1];
                                    tableRowsChangeAble = tableRows - saveAfterRows;
                                } else {
                                    tableRowsChangeAble = tableRows;
                                }

                                //如果引用的表格字段是关联了引用字段,这关联的引用字段必须大于0,下面计算行数需要过滤<=0的
                                var filterValues = [];
                                var refField = refTagFields[refColumnIndex].refField;
                                if (refField) {
                                    for (m = 0; m < refTag.value.length; m++) {
                                        if (Number(refTag.value[m].items[refColumnIndex][refField]) > 0) {
                                            filterValues.push(refTag.value[m]);
                                        }
                                    }
                                } else {
                                    filterValues = refTag.value;
                                }

                                //引用表格的行数
                                refTableRows = filterValues.length;

                                //刷新数据
                                refreshData = function (rowNum) {
                                    for (k = 0; k < rowNum; k++) {
                                        tagRowData = tag.value[k];
                                        tagCellData = tagRowData.items[columnIndex];
                                        refCellData = filterValues[k].items[refColumnIndex];
                                        tagCellData.text = refCellData.text;
                                        if (refCellData.refField && refCellData.refValue) {
                                            tagCellData.refField = refCellData.refField;
                                            tagCellData.refValue = refCellData.refValue;
                                        }
                                    }
                                };

                                /**
                                 * 找到当前行受影响的合并单元格
                                 * @param tag
                                 * @param rowData
                                 * @param rowIndex
                                 * @returns Array
                                 */
                                var findMergeCellData = function (tag, rowData, rowIndex) {
                                    var mergeCellMark, i, j, m, cellData, tmpRowIndex, tmpColumnIndex;
                                    //被当前行受影响合并单元格
                                    var mergeCellDataArr = [];
                                    var allMergeCellDataArr = [];//{own:cellData,rowIndex,columnIndex}
                                    //合并单元格数据
                                    var mergeCellDataObj;

                                    //表格的所有合并单元格
                                    allMergeCellDataArr = function () {
                                        var i, j, arr = [];
                                        for (i = 0; i < tag.value.length; i++) {
                                            for (j = 0; j < tag.value[i].items.length; j++) {
                                                cellData = tag.value[i].items[j];
                                                if (!cellData.hide && (cellData.rowSpan > 1 || cellData.colSpan > 1)) {
                                                    arr.push({
                                                        own: cellData,
                                                        rowIndex: i,
                                                        columnIndex: j
                                                    });
                                                }
                                            }
                                        }
                                        return arr;
                                    }();

                                    //获取当前单元格所在的合并单元格对象 会在原有的对象上扩展rowIndex,columnIndex
                                    var getMergeCellDataObj = function (cellDataObj) {
                                        var i, mergeCellDataObj, contain;
                                        var isInMergeRange = function (mergeCellDataObj, cellDataObj) {
                                            var startRowIndex = mergeCellDataObj.rowIndex;
                                            var endRowIndex = mergeCellDataObj.rowIndex + mergeCellDataObj.own.rowSpan - 1;
                                            var startColumnIndex = mergeCellDataObj.columnIndex;
                                            var endColumnIndex = mergeCellDataObj.columnIndex + mergeCellDataObj.own.colSpan - 1;
                                            var oRowIndex = cellDataObj.rowIndex;
                                            var oColumnIndex = cellDataObj.columnIndex;
                                            return (oRowIndex >= startRowIndex && oRowIndex <= endRowIndex && oColumnIndex >= startColumnIndex && oColumnIndex <= endColumnIndex);
                                        };
                                        for (i = 0; i < allMergeCellDataArr.length; i++) {
                                            mergeCellDataObj = allMergeCellDataArr[i];
                                            contain = isInMergeRange(mergeCellDataObj, cellDataObj);
                                            if (contain) {
                                                return mergeCellDataObj;
                                            }
                                        }
                                        return null;
                                    };
                                    mergeCellMark = {};
                                    for (m = 0; m < rowData.items.length; m++) {
                                        cellData = rowData.items[m];
                                        mergeCellDataObj = getMergeCellDataObj({
                                            own: cellData,
                                            rowIndex: rowIndex,
                                            columnIndex: m
                                        });
                                        if (mergeCellDataObj) {
                                            tmpRowIndex = mergeCellDataObj.rowIndex;
                                            tmpColumnIndex = mergeCellDataObj.columnIndex;
                                            if (!mergeCellMark[tmpRowIndex]) {
                                                mergeCellMark[tmpRowIndex] = {};
                                            }
                                            if (!mergeCellMark[tmpRowIndex][tmpColumnIndex]) {
                                                mergeCellDataArr.push(mergeCellDataObj.own);
                                                mergeCellMark[tmpRowIndex][tmpColumnIndex] = true;
                                            }
                                        } else if (cellData.isMergeCell) {//曾经是合并单元格
                                            mergeCellDataArr.push(cellData);
                                        }
                                    }
                                    return mergeCellDataArr || [];
                                };


                                //当前表格行数与引用表格函数3种情况判断
                                if (tableRowsChangeAble === refTableRows) {
                                    refreshData(tableRowsChangeAble);
                                } else if (tableRowsChangeAble > refTableRows) {//减少行
                                    //需要减少的行数
                                    needSubRows = tableRowsChangeAble - refTableRows;
                                    //获取开始删除的位置索引值
                                    startDelIndex = tableRowsChangeAble - needSubRows;

                                    //调整合并单元格所占行数(通过克隆的源行,查看是否有合并的单元格,再进行处理)
                                    tagRowData = tag.value[startDelIndex];
                                    mergeCellDataArr = findMergeCellData(tag, tagRowData, startDelIndex);
                                    for (m = 0; m < mergeCellDataArr.length; m++) {
                                        mergeCellDataArr[m].rowSpan -= needSubRows;
                                    }

                                    //删除行
                                    tag.value.splice(startDelIndex, needSubRows);
                                    //刷新数据
                                    refreshData(refTableRows);

                                } else {//增加行
                                    //需要增加的行数
                                    needAddRows = refTableRows - tableRowsChangeAble;
                                    //克隆后的行数组
                                    lastRowDataArr = [];
                                    //最后一行
                                    lastRowDataIndex = tableRowsChangeAble - 1;
                                    lastRowData = tag.value[lastRowDataIndex];
                                    l = 0;
                                    while (l++ < needAddRows) {
                                        //克隆最后一行
                                        cloneLastRowData = $.extend(true, {}, lastRowData);
                                        lastRowDataArr.push(cloneLastRowData);
                                        //处理克隆后的数据取值为默认值
                                        for (m = 0; m < cloneLastRowData.items.length; m++) {
                                            cloneCellData = cloneLastRowData.items[m];
                                            if (!cloneCellData.hide) {
                                                try {
                                                    cloneCellData.text = fields[m].fieldDefault;
                                                } catch (e) {
                                                    console.log(e);
                                                }
                                            }
                                            if (cloneCellData.rowSpan > 1 || cloneCellData.isMergeCell) {//占多行 hide 或者 //曾经是合并单元格
                                                cloneCellData.hide = true;
                                            }
                                        }
                                    }

                                    //克隆后的行数组添加到可变行后面
                                    if (tableRowsChangeAble < tag.value.length) {
                                        for (m = 0; m < lastRowDataArr.length; m++) {
                                            tag.value.splice(tableRowsChangeAble, 0, lastRowDataArr[m]);
                                        }
                                    } else {
                                        for (m = 0; m < lastRowDataArr.length; m++) {
                                            tag.value.push(lastRowDataArr[m]);
                                        }
                                    }

                                    //刷新值
                                    refreshData(refTableRows);

                                    //调整合并单元格所占行数(通过克隆的源行,查看是否有合并的单元格,再进行处理)
                                    mergeCellDataArr = findMergeCellData(tag, lastRowData, lastRowDataIndex);
                                    for (m = 0; m < mergeCellDataArr.length; m++) {
                                        if (mergeCellDataArr[m].rowSpan > 1) {//占多行的合并单元格
                                            mergeCellDataArr[m].rowSpan += needAddRows;
                                        }
                                    }

                                }
                            }
                        }
                    }

                };

                $.each(key, function (i, k) {
                    modifyTagTableData(k);
                });

            },
            modifyTagFileDefaultValueImageAdd: function (state, payload) {
                var key, rowIndex, columnIndex, tag, documentId, tagDefaultValue, image;
                key = payload.key;
                rowIndex = payload.rowIndex;
                columnIndex = payload.columnIndex;
                documentId = payload.documentId;
                tag = state.tagMap[key];
                tagDefaultValue = tag.value[rowIndex];
                image = tagDefaultValue.items[columnIndex];
                image.documentIdList.push(documentId);
                image.curIndex = image.documentIdList.length + 1;
            },
            modifyTagFileDefaultValueImageDelete: function (state, payload) {
                var key, rowIndex, columnIndex, tag, documentId, tagDefaultValue, image, index;
                key = payload.key;
                rowIndex = payload.rowIndex;
                columnIndex = payload.columnIndex;
                documentId = payload.documentId;
                tag = state.tagMap[key];
                tagDefaultValue = tag.value[rowIndex];
                image = tagDefaultValue.items[columnIndex];
                index = image.documentIdList.indexOf(documentId);
                if (index !== -1) {
                    image.documentIdList.splice(index, 1);
                    image.curIndex = image.documentIdList.length + 1;
                }
            },
            modifyTagFileDefaultValueFileAdd: function (state, payload) {
                var key, rowIndex, columnIndex, tag, documentId, filename, tagDefaultValue, file;
                key = payload.key;
                rowIndex = payload.rowIndex;
                columnIndex = payload.columnIndex;
                documentId = payload.documentId;
                filename = payload.filename;
                tag = state.tagMap[key];
                tagDefaultValue = tag.value[rowIndex];
                file = tagDefaultValue.items[columnIndex];
                file.documentId = documentId;
                file.filename = filename;
            },
            modifyTagTableParamDefaultValueInput: function (state, payload) {
                var index, value, key, tag, tagDefaultValue, cellData, tagTableParam, param_tagDefaultValue, i;
                index = payload.index;
                value = payload.value;
                key = payload.key;
                tag = state.tagMap[key];
                tagDefaultValue = tag.value[0];
                cellData = tagDefaultValue.items[0];
                cellData.text = value;

                //input value
                cellData.textBox.items[index].value = value;

                //修改与header同级的tagTableParam值
                tagTableParam = state.docNewModelDocument.tagTableParam;
                param_tagDefaultValue = tagTableParam.value[0];
                for (i = 0; i < param_tagDefaultValue.items.length; i++) {
                    if (param_tagDefaultValue.items[i].fieldName === cellData.fieldName) {
                        param_tagDefaultValue.items[i].text = value;
                        break;
                    }
                }
            },
            modifyRestApiDataCache: function (state, payload) {
                state.restApiDataCache[payload.key] = payload.value;
            },
            refreshTagTableRestApiDataCache: function (state, payload) {
                var tableName = payload.tableName;
                if (!tableName) {
                    return;
                }
                var tagTable;
                $.each(state.tagTableArr, function (i, tag) {
                    if (tag && tag.hasOwnProperty('tagType') && tag.tableDict && tag.tableDict.tableName === tableName) {
                        tagTable = tag;
                        return false;
                    }
                });
                if (!tagTable) {
                    return;
                }
                var fields = tagTable.tableDict.fields;
                var tagTableKey = tagTable.key, fieldName;
                $.each(fields, function (i, field) {
                        if (field.fieldSrc === 7) {
                            var url = field.refObject;
                            var refParameter = JSON.parse(field.refParameter);
                            fieldName = field.fieldName;
                            if (url && !$.isEmptyObject(refParameter)) {
                                var cmdtype = refParameter.cmdtype;
                                var cmd = refParameter.cmd;
                                var list = [];
                                var cacheKey = tagTableKey + '_' + fieldName;
                                $.ajaxPost({
                                    url: url,
                                    cmdtype: cmdtype,
                                    cmd: cmd,
                                    data: state.docNewModelDocument.header,
                                    async: false,
                                    success: function (msgBody) {
                                        list = msgBody.list;
                                    }
                                });
                                state.restApiDataCache[cacheKey] = list;
                            }
                        }
                    }
                );
            }
        },
        actions: {
            init: function (context, payload) {
                context.commit('init', payload);
            },
            //编辑TagText 添加目录
            modifyTagTextAddDir: function (context, payload) {
                context.commit('modifyTagTextAddDir', payload);
            },
            //编辑TagText 删除目录
            modifyTagTextRemoveDir: function (context, payload) {
                context.commit('modifyTagTextRemoveDir', payload);
            },
            //编辑TagText标题中的Input
            modifyTagTextTitleInput: function (context, payload) {
                context.commit('modifyTagTextTitleInput', payload);
            },
            //编辑TagTextDefaultValue中的Input
            modifyTagTextDefaultValueInput: function (context, payload) {
                context.commit('modifyTagTextDefaultValueInput', payload);
            },
            //编辑TagTextBoxDefaultValue中的Input
            modifyTagTextBoxDefaultValueInput: function (context, payload) {
                context.commit('modifyTagTextBoxDefaultValueInput', payload);
            },
            //编辑TagRadioDefaultValue中的Radio
            modifyTagRadioDefaultValueRadio: function (context, payload) {
                context.commit('modifyTagRadioDefaultValueRadio', payload);
            },
            //编辑TagCheckDefaultValue中的check
            modifyTagCheckDefaultValueCheck: function (context, payload) {
                context.commit('modifyTagCheckDefaultValueCheck', payload);
            },
            //编辑TagTableDefaultValue中的input
            modifyTagTableDefaultValueInput: function (context, payload) {
                context.commit('modifyTagTableDefaultValueInput', payload);
            },
            //编辑TagTableDefaultValue中的checkbox
            modifyTagTableDefaultValueCheckbox: function (context, payload) {
                context.commit('modifyTagTableDefaultValueCheckbox', payload);
            },
            //编辑TagTableDefaultValue 添加一行
            modifyTagTableDefaultValueAddRow: function (context, payload) {
                context.commit('modifyTagTableDefaultValueAddRow', payload);
            },
            //编辑TagTableDefaultValue 删除一行
            modifyTagTableDefaultValueRemoveRow: function (context, payload) {
                context.commit('modifyTagTableDefaultValueRemoveRow', payload);
            },
            //编辑TagTableDefaultValueSelect
            modifyTagTableDefaultValueSelect: function (context, payload) {
                context.commit('modifyTagTableDefaultValueSelect', payload);
            },
            //引用刷新TagTableRefRefresh
            modifyTagTableRefRefresh: function (context, payload) {
                context.commit('modifyTagTableRefRefresh', payload);
            },
            /**
             *
             * 图片上传
             *
             * 文件上传
             */
            modifyTagFileDefaultValueImageAdd: function (context, payload) {
                context.commit('modifyTagFileDefaultValueImageAdd', payload);
            },
            modifyTagFileDefaultValueImageDelete: function (context, payload) {
                context.commit('modifyTagFileDefaultValueImageDelete', payload);
            },
            modifyTagFileDefaultValueFileAdd: function (context, payload) {
                context.commit('modifyTagFileDefaultValueFileAdd', payload);
            },
            //编辑TagTableParamDefaultValueInput
            modifyTagTableParamDefaultValueInput: function (context, payload) {
                context.commit('modifyTagTableParamDefaultValueInput', payload);
            },
            modifyRestApiDataCache: function (context, payload) {
                context.commit('modifyRestApiDataCache', payload);
            },
            refreshTagTableRestApiDataCache: function (context, payload) {
                context.commit('refreshTagTableRestApiDataCache', payload);
            }
        },
        getters: {
            tags: function (state) {
                return state.tags;
            },
            templateModel: function (state) {
                return state.templateModel;
            },
            docNewModelDocument: function (state) {
                return state.docNewModelDocument;
            },
            tagMap: function (state) {
                return state.tagMap;
            },
            restApiDataCache: function (state) {
                return state.restApiDataCache;
            }
        }
    };

    //预览模式 tag组件
    var previewTagComponents = {};
    previewTagComponents['preview-tag-text'] = {
        props: {
            data: Object,
            /**
             * tag组件和tag内容行默认值组件的获取调用的是同一个方法使用同一个getTagOrDefaultComponent(tagDefaultValue,tag)
             * 由于tag组件不接受第二个参数,所以页面HTML代码中的Tag代码块存在tag=[object Object]
             * 添加tag参数,去掉tag="[object Object]"
             * 添加row参数,去掉row="1"
             */
            tag: Object,
            row: Number
        },
        template: [
            '<div class="tagText">',

            '<div class="title" :id="generateTitleId(data)">',

            '<span class="item" v-for="t in title.items">',
            '<span>{{t.text}}</span>',
            '</span>',

            '</div>',

            '<div class="value">',
            '<component :is="getTagOrDefaultComponent(tagValue,data)" v-for="(tagValue,row) in data.value" v-show="tagIsShow(tagValue)" :data="tagValue" :tag="data" :row="row" :key="getKey(tagValue,data,row)"></component>',
            '</div>',
            '</div>'].join(''),
        computed: {
            title: function () {
                return this.data.tagTitle[0];
            }
        }
    };
    previewTagComponents['preview-tag-text-default-value'] = {
        props: {
            data: Object,
            tag: Object,
            row: Number
        },
        template: [
            '<div class="default-value">',
            '<span v-if="isInput">{{data.metadata.value}}</span>',
            '<span v-else>{{data.metadata.text}}</span>',
            '</div>'
        ].join(''),
        computed: {
            isInput: function () {
                return this.data.metadata.type === 'input';
            }
        }
    };

    previewTagComponents['preview-tag-text-box'] = {
        props: {
            data: Object,
            tag: Object,
            row: Number
        },
        template: [
            '<div class="tagTextBox">',
            '<div class="value">',
            '<component :is="getTagOrDefaultComponent(tagValue,data)" v-for="(tagValue,row) in data.value" v-show="tagIsShow(tagValue)" :data="tagValue" :tag="data" :row="row" :key="getKey(tagValue,data,row)"></component>',
            '</div>',
            '</div>'].join('')
    };
    previewTagComponents['preview-tag-text-box-default-value'] = {
        props: {
            data: Object,
            tag: Object,
            row: Number
        },
        template: [
            '<div class="default-value">',
            '<span class="item-column" v-for="(cell,column) in data.items">',
            '<span class="item-cell" v-for="(e,index) in cell.items">',
            '<span v-if="isInput(e)">{{e.value}}</span>',
            '<span v-else>{{e.text}}</span>',
            '</span>',
            '</span>',
            '</div>'].join(''),
        methods: {
            isInput: function (e) {
                return e.type === 'input';
            }
        }
    };

    previewTagComponents['preview-tag-radio'] = {
        props: {
            data: Object,
            tag: Object,
            row: Number
        },
        template: [
            '<div class="tagRadio">',
            '<div class="value">',
            '<component :is="getTagOrDefaultComponent(tagValue,data)" v-for="(tagValue,row) in data.value" v-show="tagIsShow(tagValue)" :data="tagValue" :tag="data" :row="row" :key="getKey(tagValue,data,row)"></component>',
            '</div>',
            '</div>'
        ].join('')
    };
    previewTagComponents['preview-tag-radio-default-value'] = {
        props: {
            data: Object,
            tag: Object,
            row: Number
        },
        template: [
            '<div class="default-value">',

            '<div class="item-row">',
            '<span class="item-column" v-for="(cell,column) in data.items">',

            '<span class="text-wrap" v-if="isText(cell)">{{cell.text}}</span>',

            '<span class="radio-wrap" v-else>',
            '<input type="radio" :name="getRadioName()"  :checked="cell.checked" disabled>',
            '<span class="desc">{{cell.desc}}</span>',
            '</span>',

            '</span>',
            '</div>',

            '</div>'
        ].join(''),
        methods: {
            isText: function (cell) {
                return cell.type === 'text';
            },
            getRadioName: function () {
                if (this.tag.horizontal) {
                    return this.tag.key + '_' + this.row;
                } else {
                    return this.tag.key;
                }
            }
        }
    };

    previewTagComponents['preview-tag-check'] = {
        props: {
            data: Object,
            tag: Object,
            row: Number
        },
        template: [
            '<div class="tagCheck">',
            '<div class="value">',
            '<component :is="getTagOrDefaultComponent(tagValue,data)" v-for="(tagValue,row) in data.value" v-show="tagIsShow(tagValue)" :data="tagValue" :tag="data" :row="row" :key="getKey(tagValue,data,row)"></component>',
            '</div>',
            '</div>'].join('')
    };
    previewTagComponents['preview-tag-check-default-value'] = {
        props: {
            data: Object,
            tag: Object,
            row: Number
        },
        template: [
            '<div class="default-value">',
            '<div class="item-row">',
            '<span class="item-column" v-for="(cell,column) in data.items">',

            '<span class="text-wrap" v-if="isText(cell)">{{cell.text}}</span>',

            '<span class="check-wrap" v-else>',
            '<input type="checkbox" :name="getCheckName()" :checked="cell.checked" disabled>',
            '<span class="desc">{{cell.desc}}</span>',
            '</span>',

            '</span>',
            '</div>',
            '</div>'
        ].join(''),
        methods: {
            isText: function (cell) {
                return cell.type === 'text';
            },
            getCheckName: function () {
                return this.tag.key + '_' + this.row;
            }
        }
    };

    previewTagComponents['preview-tag-table'] = {
        props: {
            data: Object,
            tag: Object,
            row: Number
        },
        template: [
            '<div class="tagTable" :class="getClass()">',
            '<table class="own-tagTable" :style="{width:tableWidth}">',

            '<thead v-if="titleArr.length>0">',

            '<tr v-for="rowTitle in titleArr">',
            '<th v-for="cell in rowTitle.items" v-if="!cell.hide" :rowspan="cell.rowSpan" :colspan="cell.colSpan">',

            '<span class="content-wrap">{{cell.text}}</span>',

            '</th>',
            '</tr>',
            '</thead>',

            '<tbody>',

            '<tr v-for="(row,rowIndex) in rowArr">',

            '<td v-for="(cell,columnIndex) in cellArr(row)" v-if="!cell.hide" :rowspan="cell.rowSpan" :colspan="cell.colSpan" :style="{width:cellWidth(cell,columnIndex)}">',


            //没有与数据表关联
            '<span v-if="!data.tableDict">',
            '<span>{{cell.text}}</span>',
            '</span>',

            //有与数据表关联
            '<span v-else>',

            '<span v-if="isButton(cell)">',

            '<div style="text-align: left;padding-left: 20px;" v-if="isOpenTaskPanel(cell)">',
            '<div style="display: inline-block;">',
            '<div v-for="task in taskList(cell)" style="display: inline-block;">{{task}}</div>',
            '</div>',
            '</div>',

            '<div style="text-align: left;padding-left: 20px;" v-if="isOpenSelMemberPanel(cell,rowIndex)">',
            '<div style="display: inline-block;">{{cell.text}}</div>',
            '</div>',

            '</span>',

            '<select v-else-if="isSelect(cell,columnIndex)" disabled>',
            '<option>{{cell.text}}</option>',
            '</select>',
            '<span v-else-if="isCheckbox(cell)">',
            '<input type="checkbox" :checked="cell.text==1" disabled style="height: 12px;">',
            '</span>',
            '<span v-else>{{format(cell.text,cell)}}</span>',
            '</span>',

            '</td>',

            '</tr>',

            '</tbody>',

            '</table>',
            '</div>'
        ].join(''),
        data: function () {
            return {};
        },
        computed: {
            //获取title数组
            titleArr: function () {
                return this.data.tagTitle || [];
            },
            //获取value数组
            rowArr: function () {
                return this.data.value;
            },
            tableWidth: function () {
                if (this.data.tableDict) {
                    var fields = this.data.tableDict.fields, i, widthSum = 0;
                    for (i = 0; i < fields.length; i++) {
                        widthSum += fields[i].fieldDisplaysize;
                    }
                    return widthSum + 'px';
                }
                return '100%';
            },
        },
        methods: {
            isOpenSelMemberPanel: function (cell) {
                return cell.refPool == 2;
            },
            isOpenTaskPanel: function (cell) {
                return cell.refPool == 1;
            },
            taskList: function (cell) {
                if (cell.text) {
                    var taskList = cell.text.split(/;|；/);
                    for (var i = 0; i < taskList.length; i++) {
                        if (taskList[i]) {
                            taskList[i] = taskList[i] + '；';
                        }
                    }
                    return taskList;
                }
                return [];
            },
            isButton: function (cell) {
                return cell.fieldComponent === 1;
            },
            getClass: function () {
                if (this.data.tagType === 'tagTableSum') {
                    return 'tagTableSum';
                }
                return '';
            },
            cellWidth: function (cell, columnIndex) {
                if (this.data.tableDict) {
                    try {
                        if (cell.hide) {
                            return;
                        }
                        var fieldData = this.data.tableDict.fields[columnIndex];
                        if (fieldData) {
                            return fieldData.fieldDisplaysize + 'px' || 'auto';
                        } else {
                            return '100px';
                        }
                    } catch (e) {
                        console.log(e);
                        return 'auto';
                    }
                }
                return '';
            },
            //获取每行单元格数组
            cellArr: function (row) {
                var result = [], i;
                if (this.data.tagType === 'tagTableSum') {
                    for (i = 0; i < row.items.length; i++) {
                        if (!row.items[i].hide) {
                            result.push(row.items[i]);
                        }
                    }
                    return result;
                } else {
                    return row.items;
                }

            },
            isSelect: function (cell, columnIndex) {
                try {
                    var fieldData = this.data.tableDict.fields[columnIndex];
                    if (fieldData) {
                        return fieldData.fieldSrc === 5;
                    }
                    return false;
                } catch (e) {
                    console.log(e);
                }
            },
            isCheckbox: function (cell) {
                return cell.fieldComponent === 1;
            },
            //格式化显示
            format: function (val, cell) {
                if (Number(cell.fieldFormat) === 2) {//%
                    return Math.round(Number(val * 100)).toFixed(0) + '%';
                } else {
                    return val;
                }
            }
        }
    };

    //文件上传 编辑模式赞无处理 此处预览模式咱不处理
    previewTagComponents['preview-tag-file'] = {
        props: {
            data: Object,
            tag: Object,
            row: Number
        },
        template: [
            '<div class="tagFile">',
            '<div class="value">',
            '<component :is="getTagOrDefaultComponent(tagValue,data)" v-for="(tagValue,row) in data.value" v-show="tagIsShow(tagValue)" :data="tagValue" :tag="data" :row="row" :key="getKey(tagValue,data,row)"></component>',
            '</div>',
            '</div>'
        ].join('')
    };
    previewTagComponents['preview-tag-file-default-value'] = {
        props: {
            data: Object,
            tag: Object,
            row: Number
        },
        template: [
            '<div class="default-value">',
            '<div class="item-row">',
            '<div class="item-column" v-for="(cell,columnIndex) in data.items">',

            '<div class="container-fluid" v-if="isImage(cell)">',

            '<template v-if="groupNumber(cell)>0">',
            '<div class="row" v-for="g in groupNumber(cell)">',
            '<div class="col-md-4 text-center" v-for="i in 3">',
            '<span class="image-item">',
            '<img :src="previewImage(getDocumentId(cell,g,i))" class="own-image">',
            '</span>',
            '</div>',
            '</div>',
            '</template>',

            '<div class="row" v-if="otherCount(cell)===1">',
            '<div class="col-md-12 text-center">',
            '<span class="image-item">',
            '<img :src="previewImage(getDocumentId(cell,groupNumber(cell)+1,1))" class="own-image">',
            '</span>',
            '</div>',
            '</div>',

            '<div class="row" v-if="otherCount(cell)===2">',
            '<div class="col-md-6 text-center" v-for="i in 2">',
            '<span class="image-item">',
            '<img :src="previewImage(getDocumentId(cell,groupNumber(cell)+1,i))" class="own-image">',
            '</span>',
            '</div>',
            '</div>',

            '</div>',

            '<span class="file-wrap" v-else>',
            '<span class="desc">{{cell.desc}}：</span>',
            '<span class="file-list-wrap"><a v-if="cell.documentId>0" :href="downloadFile(cell.documentId)">{{cell.filename}}</a></span>',
            '</span>',

            '</div>',
            '</div>',
            '</div>'
        ].join(''),
        computed: {},
        methods: {
            isImage: function (cell) {
                return cell.type === 'image';
            },
            groupNumber: function (cell) {
                return Math.floor(cell.documentIdList.length / 3);
            },
            getDocumentId: function (cell, g, i) {//i based-1
                return cell.documentIdList[(g - 1) * 3 + i - 1];
            },
            previewImage: function (documentId) {
                var restApi = '/rest/template/previewImage';
                var msgBody = $.paramsToBase64({
                    cmdtype: 'templateDocument',
                    cmd: 'previewJson',
                    data: {
                        documentId: documentId
                    }
                });
                return restApi + '?msgBody=' + msgBody;
            },
            otherCount: function (cell) {
                return cell.documentIdList.length % 3;
            },
            getDesc: function (cell) {
                return cell.curIndex + '/' + cell.limit + cell.desc;
            },
            downloadFile: function (documentId) {
                var restApi = '/rest/template/download';
                var msgBody = $.paramsToBase64({
                    cmdtype: 'templateDocument',
                    cmd: 'download',
                    data: {
                        documentId: documentId
                    }
                });
                return restApi + '?msgBody=' + msgBody;
            }
        }
    };

    previewTagComponents['preview-tag-table-param'] = {
        props: {
            data: Object,
            tag: Object,
            row: Number
        },
        template: [
            '<div class="tagTableParam">',
            '<div class="value">',
            '<component :is="getTagOrDefaultComponent(tagValue,data)" v-for="(tagValue,row) in data.value" v-show="tagIsShow(tagValue)" :data="tagValue" :tag="data" :row="row" :key="getKey(tagValue,data,row)"></component>',
            '</div>',
            '</div>'].join('')
    };
    previewTagComponents['preview-tag-table-param-default-value'] = {
        props: {
            data: Object,
            tag: Object,
            row: Number
        },
        template: [
            '<div class="default-value">',
            '<span class="item-column">',
            '<span class="item-cell" v-for="(e,index) in cellData.textBox.items">',
            '<span>',
            '<template v-if="isInput(e)">{{e.value}}</template>',
            '<template v-else>{{e.text}}</template>',
            '</span>',

            '</span>',
            '</span>',
            '</div>'].join(''),
        computed: {
            cellData: function () {
                return this.data.items[0];
            }
        },
        methods: {
            isInput: function (e) {
                return e.type === 'input' && !this.cellData.fieldReadonly;
            }
        }
    };

    previewTagComponents['preview-tag-title'] = {
        props: {
            data: Object,
            tag: Object,
            row: Number
        },
        template: [
            '<div class="tagTitle">',
            '<div class="title">',

            '<h1>{{firstCellData.text}}</h1>',

            '</div>',
            '</div>'
        ].join(''),
        computed: {
            firstCellData: function () {
                return this.data.tagTitle[0].items[0];
            }
        }
    };

    previewTagComponents['preview-tag-title-red'] = {
        props: {
            data: Object,
            tag: Object,
            row: Number
        },
        template: [
            '<div class="tagTitleRed">',
            '<div class="title">',
            '<h3 style="color: #f00; text-align: center;">{{firstCellData.text}}</h3>',
            '</div>',
            '</div>'
        ].join(''),
        computed: {
            firstCellData: function () {
                return this.data.tagTitle[0].items[0];
            }
        }
    };


    //预览模式tag类型与tag组件名称映射
    var previewTagTypeMap = {};
    previewTagTypeMap['preview-tagText'] = 'preview-tag-text';
    previewTagTypeMap['preview-tagTextDefaultValue'] = 'preview-tag-text-default-value';
    previewTagTypeMap['preview-tagTableTextRef'] = 'preview-tag-text';
    previewTagTypeMap['preview-tagTableTextRefDefaultValue'] = 'preview-tag-text-default-value';

    previewTagTypeMap['preview-tagTextBox'] = 'preview-tag-text-box';
    previewTagTypeMap['preview-tagTextBoxDefaultValue'] = 'preview-tag-text-box-default-value';
    previewTagTypeMap['preview-tagTableParamRef'] = 'preview-tag-text-box';

    previewTagTypeMap['preview-tagRadio'] = 'preview-tag-radio';
    previewTagTypeMap['preview-tagRadioDefaultValue'] = 'preview-tag-radio-default-value';
    previewTagTypeMap['preview-tagTableParamRadio'] = 'preview-tag-radio';
    previewTagTypeMap['preview-tagTableParamRadioDefaultValue'] = 'preview-tag-radio-default-value';

    previewTagTypeMap['preview-tagCheck'] = 'preview-tag-check';
    previewTagTypeMap['preview-tagCheckDefaultValue'] = 'preview-tag-check-default-value';
    previewTagTypeMap['preview-tagTableParamCheck'] = 'preview-tag-check';
    previewTagTypeMap['preview-tagTableParamCheckDefaultValue'] = 'preview-tag-check-default-value';

    previewTagTypeMap['preview-tagFile'] = 'preview-tag-file';
    previewTagTypeMap['preview-tagFileDefaultValue'] = 'preview-tag-file-default-value';

    previewTagTypeMap['preview-tagTable'] = 'preview-tag-table';//表格
    previewTagTypeMap['preview-tagTableRef'] = 'preview-tag-table';//表格

    previewTagTypeMap['preview-tagTableSum'] = 'preview-tag-table';//合计表格

    //已废弃
    previewTagTypeMap['preview-tagTableIrregular'] = 'preview-tag-table';//不规则表格

    previewTagTypeMap['preview-tagTableParam'] = 'preview-tag-table-param';//参数表格
    previewTagTypeMap['preview-tagTableParamDefaultValue'] = 'preview-tag-table-param-default-value';

    previewTagTypeMap['preview-tagTitle'] = 'preview-tag-title';

    previewTagTypeMap['preview-tagTitleRed'] = 'preview-tag-title-red';

    //注册编辑模式tag组件
    for (var key in previewTagComponents) {
        previewTagComponents[key].mixins = [mixin];
        Vue.component(key, previewTagComponents[key]);
    }

    //预览模式需要的存储
    var previewStore = {
        namespaced: true,//开启命名空间 访问时['xxx/templateModel']
        state: {
            templateModel: {},
            docNewModelDocument: {},//编辑后所存的文档内容对象
            tags: [],//提取docNewModelDocument中body内容
            tagMap: {}//映射key tag
        },
        mutations: {
            init: function (state, payload) {
                if (!payload) {
                    return;
                }
                state.templateModel = payload;

                var docNewModel = payload.documentModel;
                if (typeof docNewModel.document === 'string') {
                    var sDocument = Base64.decode(docNewModel.document);
                    state.docNewModelDocument = JSON.parse(sDocument);
                } else {
                    state.docNewModelDocument = docNewModel.document;
                }
                state.tags = state.docNewModelDocument.body;
                var tagProcessor = function (tag) {
                    state.tagMap[tag.key] = tag;
                    if (tag.value.length > 0) {
                        for (var i = 0; i < tag.value.length; i++) {
                            var ele = tag.value[i];
                            if (ele.hasOwnProperty('tagType')) {
                                tagProcessor(ele);
                            }
                        }
                    }
                };
                for (var i = 0; i < state.tags.length; i++) {
                    var tag = state.tags[i];
                    if (tag.hasOwnProperty('tagType')) {
                        tagProcessor(tag);
                    }
                }
            }
        },
        actions: {
            init: function (context, payload) {
                context.commit('init', payload);
            }
        },
        getters: {
            tags: function (state) {
                return state.tags;
            },
            templateModel: function (state) {
                return state.templateModel;
            },
            docNewModelDocument: function (state) {
                return state.docNewModelDocument;
            },
            tagMap: function (state) {
                return state.tagMap;
            }
        }
    };


    //===向外暴露的组件

    //文档模板核心组件
    Vue.component('doc-template-core', {
        mixins: [mixin],
        props: {
            mode: '',//edit or preview
            templateModel: {}
        },
        watch: {
            templateModel: function (val, oldValue) {
                this.isWorkPlan = (this.templateModel.docType === 200);
                this.$store.dispatch(this.namespaced + 'init', this.templateModel);
            }
        },
        data: function () {
            return {
                isWorkPlan: false,
                rootClassObject: {
                    'doc-template-edit': this.mode === 'edit',
                    'doc-template-preview': this.mode === 'preview'
                }
            };
        },
        computed: {
            //store中Module命名空间
            namespaced: function () {
                return this.mode + 'DocTemplate/';
            },
            tags: function () {
                return this.$store.getters[this.namespaced + 'tags'];
            },
            wrapWidth: function () {
                if (this.isWorkPlan) {
                    return 'auto';
                }
                return '';
            }
        },
        template: [
            '<div :class="rootClassObject">',
            '<div class="doc-template-wrap" :style="{width:wrapWidth}">',
            '<component :is="getTagOrDefaultComponent(tag)" v-for="tag in tags" v-show="tagIsShow(tag)" :data="tag" :key="getKey(tag)"></component>',
            '</div>',
            '</div>'
        ].join('')

    });


    window.$DocTemplateVue = {
        storeModule: {
            //dispatcher('editDocTemplate/xxx')
            editDocTemplate: editStore,
            previewDocTemplate: previewStore
        }
    };


    //===目录树组件

    var mixinDir = {
        methods: {
            getDirKey: function (dir) {
                var mode = this.$root.mode;
                return mode + '_dir_' + dir.key;
            },
            isTagText: function (dir) {
                return dir.hasOwnProperty('tagType') && dir.tagType === 'tagText';
            }
        }
    };

    Vue.component('doc-template-dir', {
        mixins: [mixin, mixinDir],
        props: {
            dir: {
                type: Object,
                default: function () {
                    return {};
                }
            }
        },
        template: [
            '<div class="doc-template-dir" :class="dirClassArr(dir)">',
            '<a class="doc-template-dir-title" :href="\'#\'+generateTitleId(dir)">',
            '<span class="dcd-num">{{dirNum}}</span>',
            '<span class="dcd-text">{{dirText}}</span>',
            '</a>',
            '<div class="doc-template-dir-value">',
            '<doc-template-dir v-for="child in dir.value" :dir="child" v-if="isTagText(child) && tagIsShow(child)" :key="getDirKey(child)"></doc-template-dir>',
            '</div>',
            '</div>'
        ].join(''),
        computed: {
            dirNum: function () {
                return this.dir.tagTitle[0].items[0].text;
            },
            dirText: function () {
                var items = this.dir.tagTitle[0].items, i, s = '';
                for (i = 1; i < items.length; i++) {
                    s += items[i].text ? items[i].text : '';
                }
                return s;
            }
        },
        methods: {
            dirClassArr: function (dir) {
                return [
                    dir.topLevelDir ? 'doc-template-dir-top' : 'doc-template-dir-normal'
                ]
            }

        }
    });

    Vue.component('doc-template-dirs', {
        mixins: [mixin, mixinDir],
        props: {
            dirs: {
                type: Array,
                default: function () {
                    return []
                }
            }
        },
        template: [
            '<div class="doc-template-dir-root">',
            '<div class="doc-template-dir-wrap">',
            '<doc-template-dir v-for="dir in dirs" :dir="dir" v-if="isTagText(dir) && tagIsShow(dir)" :key="getDirKey(dir)"></doc-template-dir>',
            '</div>',
            '</div>'
        ].join('')
    });


    //文档模板编辑和预览组件
    Vue.component('doc-template', {
        props: {
            templateModel: Object,
            mode: String,
            styleContainer: Object
        },
        data: function () {
            return {
                menuList: [],
                toolbarList: []
            };
        },
        template: [
            '<div class="doc-template-container" :style="styleContainer">',

            '<div class="dt-header" :class="isPreview()?\'dt-header-disabled\':\'\'">',
            '<div class="dt-title">',
            '<div class="dt-menu">',
            '<span v-for="e in menuList" :class="[e.iconCls]" :title="e.title"></span>',
            '</div>',
            '</div>',
            '<div class="dt-toolbar">',
            '<div class="dt-toolbar-item" v-for="e in toolbarList">',
            '<span :class="[\'icon\',e.iconCls]"></span>',
            '<p class="title">{{e.title}}</p>',
            '</div>',
            '</div>',
            '</div>',

            '<div class="dt-dir-wrap" :style="styleDirs">',
            '<p class="title">目录</p>',
            '<div class="content">',
            '<doc-template-dirs :dirs="tags"></doc-template-dirs>',
            '</div>',
            '</div>',

            '<div class="dt-content-wrap">',
            '<doc-template-core :template-model="templateModel" :mode="mode"></doc-template-core>',
            '</div>',

            '</div>'
        ].join(''),
        computed: {
            tags: function () {
                return this.$store.getters[this.mode + 'DocTemplate/tags'];
            },
            styleDirs: function () {
                var obj = {};

            }
        },
        methods: {
            isPreview: function () {
                return this.mode === 'preview';
            }
        },
        mounted: function () {
            this.menuList = [
                {
                    iconCls: 'dt-icon-save',
                    title: '保存',
                    exec: function () {

                    }
                },
                {
                    iconCls: 'dt-icon-undo',
                    title: '撤销',
                    exec: function () {

                    }
                },
                {
                    iconCls: 'dt-icon-redo',
                    title: '重做',
                    exec: function () {

                    }
                },
                {
                    iconCls: 'dt-icon-print',
                    title: '打印',
                    exec: function () {

                    }
                }
            ];
            this.toolbarList = [
                {
                    iconCls: 'dt-icon-paste',
                    title: '粘贴',
                    exec: function () {

                    }
                },
                {
                    iconCls: 'dt-icon-copy',
                    title: '复制',
                    exec: function () {

                    }
                },
                {
                    iconCls: 'dt-icon-cut',
                    title: '剪切',
                    exec: function () {

                    }
                },
                {
                    iconCls: 'dt-icon-upimg',
                    title: '图片',
                    exec: function () {

                    }
                }
            ];
        }
    });


});