;$(function () {

    var moduleName = 'bs-extend-modal';

    var modalCounter = 0;

    //opt参数 message, ok, show, hide
    var confirm = function (message, ok, opt) {
        modalCounter++;
        var s = moduleName + modalCounter;
        var id = '#' + s;
        var modalHtml = '<div class="modal fade" id="' + s + '">\n' +
            '        <div class="modal-dialog modal-sm">\n' +
            '            <div class="modal-content">\n' +
            '                <div class="modal-header">\n' +
            '                    <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span\n' +
            '                            aria-hidden="true">&times;</span>\n' +
            '                    </button>\n' +
            '                    <h4 class="modal-title">确认信息</h4>\n' +
            '                </div>\n' +
            '                <div class="modal-body">\n' +
            '                    <p>' + message + '</p>\n' +
            '                </div>\n' +
            '                <div class="modal-footer">\n' +
            '                    <button type="button" class="btn btn-primary">确定</button>\n' +
            '                    <button type="button" class="btn btn-default" data-dismiss="modal">取消</button>\n' +
            '                </div>\n' +
            '            </div>\n' +
            '        </div>\n' +
            '    </div>';
        var $modal = $(modalHtml);
        $modal.find('.modal-footer > button:eq(0)').on('click', function (e) {
            ok && ok.apply(null, [e, id]);
        });
        $modal.on('shown.bs.modal', function (e) {
            opt && opt.show && opt.show(e);
        });
        $modal.on('hidden.bs.modal', function (e) {
            opt && opt.hide && opt.hide(e);
        });
        $modal.modal();
    };


    var close = function (id) {
        $(id).modal('hide');
    };

    var api = {
        confirm: confirm,
        close: close
    };

    $.extend({
        bs: api
    })

});