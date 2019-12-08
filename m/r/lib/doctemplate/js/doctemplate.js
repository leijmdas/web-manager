;$(function() {

  var tagText = function(obj) {
    var $root, $title, $value;
    $root = $('<div class="tagText"></div>');
    $title = $('<div class="title"></div>');
    $value = $('<div class="value"></div>');
    $root.append($title);
    $root.append($value);

    $title.text(obj.title);

    $.each(obj.value, function(i, item) {
      var child;
      if (item.hasOwnProperty('tag')) {
        child = tagAnalysis[item.tag](item);
      } else {
        child = tagText.defaultValue(item, obj);
      }
      $value.append(child);
    });
    return $root;
  };

  tagText.defaultValue = function(obj, tag) {
    var $defaultValue = $('<div class="default-value"></div>');
    var $input = $('<input type="text" value="" placeholder="">');
    $input.attr('value', obj.value);
    $input.attr('placeholder', obj.placeholder);
    $defaultValue.append($input);
    return $defaultValue;
  };

  var tagRadio = function(obj) {
    var $root, $value;
    $root = $('<div class="tagRadio"></div>');
    $value = $('<div class="value"></div>');
    $root.append($value);
    $.each(obj.value, function(i, item) {
      var child;
      if (item.hasOwnProperty('tag')) {
        child = tagAnalysis[item.tag](item);
      } else {
        child = tagRadio.defaultValue(item, obj);
      }
      $value.append(child);
    });
    return $root;
  };

  tagRadio.defaultValue = function(obj, tag) {
    var $defaultValue, $desc;
    $defaultValue = $('<div class="default-value"></div>');
    $desc = $('<span class="desc"></span>');
    $desc.text(obj.desc);
    $defaultValue.append($desc);

    var item, radio, label;
    item = '<div class="item">';
    radio = '<input type="radio" name="">';
    label = '<label>XXX</label>';
    $.each(obj.items, function(i, e) {
      var $item = $(item),
          $radio = $(radio),
          $label = $(label);
      $item.append($radio);
      $item.append($label);
      $defaultValue.append($item);

      $radio.attr('name', tag.key + '_' + obj.row);
      if (obj.selectedIndex === i) {
        $radio.prop('checked', true);
      }
      $label.text(obj.items[i]);
    });
    return $defaultValue;
  };

  var tagCheck = function(obj) {
    var $root, $value;
    $root = $('<div class="tagCheck"></div>');
    $value = $('<div class="value"></div>');
    $root.append($value);
    $.each(obj.value, function(i, item) {
      var child;
      if (item.hasOwnProperty('tag')) {
        child = tagAnalysis[item.tag](item);
      } else {
        child = tagCheck.defaultValue(item, obj);
      }
      $value.append(child);
    });
    return $root;
  };

  tagCheck.defaultValue = function(obj, tag) {
    var $defaultValue, $desc;
    $defaultValue = $('<div class="default-value"></div>');
    $desc = $('<span class="desc"></span>');
    $desc.text(obj.desc);
    $defaultValue.append($desc);

    var item, checkbox, label;
    item = '<div class="item">';
    checkbox = '<input type="checkbox" name="">';
    label = '<label>XXX</label>';
    $.each(obj.items, function(i, e) {
      var $item = $(item),
          $checkbox = $(checkbox),
          $label = $(label);
      $item.append($checkbox);
      $item.append($label);
      $defaultValue.append($item);

      $checkbox.attr('name', tag.key);
      if (obj.selecteds[i]) {
        $checkbox.prop('checked', true);
      }
      $label.text(obj.items[i]);
    });
    return $defaultValue;
  };

  var tagImage = function(obj) {
    var $root, $title, $value;
    $root = $('<div class="tagImage"></div>');
    $title = $('<div class="title"></div>');
    $value = $('<div class="value"></div>');
    $root.append($title);
    $root.append($value);

    $title.text(obj.title);

    $.each(obj.value, function(i, item) {
      var child;
      if (item.hasOwnProperty('tag')) {
        child = tagAnalysis[item.tag](item);
      } else {
        child = tagImage.defaultValue(item, obj);
      }
      $value.append(child);
    });
    return $root;
  };

  tagImage.defaultValue = function(obj, tag) {
    var $defaultValue;
    $defaultValue = $('<div class="default-value"></div>');

    var item, file, desc;
    item = '<div class="item">';
    file = '<input type="file" class="own-file">';
    desc = '<span class="desc"></span>';
    $.each(obj.items, function(i, e) {
      var $item = $(item),
          $file = $(file),
          $desc = $(desc);
      $item.append($file);
      $item.append($desc);
      $defaultValue.append($item);

      $desc.text(e.index + '/' + e.count + e.desc);
    });
    return $defaultValue;
  };

  var tagFile = function(obj) {
    var $root, $value;
    $root = $('<div class="tagFile"></div>');
    $value = $('<div class="value"></div>');
    $root.append($value);

    $.each(obj.value, function(i, item) {
      var child;
      if (item.hasOwnProperty('tag')) {
        child = tagAnalysis[item.tag](item);
      } else {
        child = tagFile.defaultValue(item, obj);
      }
      $value.append(child);
    });
    return $root;
  };

  tagFile.defaultValue = function(obj, tag) {
    var $defaultValue;
    $defaultValue = $('<div class="default-value"></div>');

    var $desc, $btn;
    $desc = $('<span class="desc"></span>');
    $btn = $('<button>上传</button>');
    $desc.text(obj.desc);
    $defaultValue.append($desc);
    $defaultValue.append($btn);

    return $defaultValue;
  };

  var tagTable$item = function(obj) {
    var $root, $table, $thead, $tbody, $tr, $td, $th, tr, td, th;
    $root = $('<div class="tagTable"></div>');
    $table = $('<table class="own-table">');
    $thead = $('<thead></thead>');
    $tbody = $('<tbody></tbody>');
    tr = '<tr></tr>';
    td = '<td></td>';
    th = '<th></th>';

    $table.append($thead);
    $table.append($tbody);
    $root.append($table);

    var titleArr, valueArr, i, j, e, row, column;

    titleArr = obj.title.split('|');
    $tr = $(tr);
    for (i = 0; i < titleArr.length; i++) {
      e = titleArr[i];
      $th = $(th);
      $th.text(e);
      $tr.append($th);
    }
    $thead.append($tr);

    valueArr = obj.value;
    for (i = 0; i < valueArr.length; i++) {
      row = valueArr[i];
      column = row.text.split('|');
      $tr = $(tr);
      for (j = 0; j < column.length; j++) {
        e = column[j];
        $td = $(td);
        $td.text(e);
        $tr.append($td);
      }
      $tbody.append($tr);
    }

    return $root;
  };

  //tag解析方法
  var tagAnalysis = {};
  tagAnalysis['tagText'] = tagText;
  tagAnalysis['tagRadio'] = tagRadio;
  tagAnalysis['tagCheck'] = tagCheck;
  tagAnalysis['tagImage'] = tagImage;
  tagAnalysis['tagFile'] = tagFile;
  tagAnalysis['tagTable:item'] = tagTable$item;

  //外部调用API
  var doctemplate = {};
  /**
   * 转换文档模板
   * @param content String/Object JSON对象 表示一个文档模板
   * @return HTML代码 表示一个文档模板
   */
  doctemplate.toHTML = function(content) {
    if (typeof content === 'string') {
      content = JSON.parse(content);
    }

    var $docTemplateWrap = $('<div class="doc-template-wrap"></div>');
    $.each(content, function(i, item) {
      $docTemplateWrap.append(tagAnalysis[item.tag](item));
    });
    return $docTemplateWrap.get();
  };

  window.doctemplate = doctemplate;

});