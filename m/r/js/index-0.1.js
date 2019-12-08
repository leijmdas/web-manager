$(function() {
  var element = layui.element;

  element.on('tab(layPageTab)', function(data) {
    $('#tabBody >div:eq(' + data.index + ')').
        addClass('layui-show').
        siblings().
        removeClass('layui-show');
  });

  element.on('tabDelete(layPageTab)', function(data) {
    $('#tabBody >div:eq(' + data.index + ')').remove();
  });

  element.on('nav(layNav)', function($this) {
    var href = $this.attr('lay-href'),
        title = $this.attr('title'),
        $pageBody, $pageItem, $pageItemIframe;
    if (!href || !title) {
      return;
    }
    var $tabTitle = $('#tabHeader');
    var isAdd = false;
    $tabTitle.children('li').each(function(i, ele) {
      if ($(ele).attr('lay-id') === href) {
        isAdd = true;
        return false;
      }
    });
    if (isAdd) {
      element.tabChange('layPageTab', href);
      return;
    }

    element.tabAdd('layPageTab', {
      title: title,
      id: href,
    });
    $pageBody = $('#tabBody');
    $pageItem = $('<div class="page-item"></div>');
    $pageItemIframe = $('<iframe src="' + href +
        '" class="page-item-iframe"></iframe>');
    $pageItem.append($pageItemIframe);
    $pageBody.append($pageItem);
    element.tabChange('layPageTab', href);
  });
});

