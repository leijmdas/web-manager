/**
 * bootstrap弹框 
 * @usage
 	 //$modal modal对象，$modal.header、$modal.content、$modal.footer
 	 //dialog 内置方法 dialog.loading(text) dialog.switchWarning(content) //切换Warning提示
   	 $.modalDialog({
	   title:'标题',
	   loadingText:'加载提示语',
	   size:'modal-sm',
	   width:'200px',
	   style:{ //header、body、footer
			header:{
				'color':'red'
			},
	   },
	   content:function(){ //内容
	   		return "<div>"
	   },
	   contentAsyn:function(callback){...callback(data)} 异步加载
	   openEvent:function(dialog,$modal){
			
	   },
	    closeEvent..., //关闭后事件
		appendEvent:... //插入后事件，
		buttons:[
			'cancel', //取消按钮 --内置
			{
				text:'确定',
				class:'btn btn-primary',
				click:function(dialog,$modal){
					
				}
			}
		]
 	})
 * 
 */

(function($){
	$.minAlert =function(options){
		var defaults = {
			content:'',
			delay:800,
			ico:''
		}
		if(typeof options == 'string'){
			var opts = {
					content:options,
					delay:1000,
				}
		}else{
			var opts =  $.extend({}, defaults,options);
		}
		var defaultsIco = {
			success:'<span class="label label-warning" style="padding:2px 2px;margin-right:2px"><i class="fa fa-check"></i></span> ',
			error:'<span class="label label-warning " style="padding: 2px 6px;margin-right:2px"><i class="fa fa-exclamation"></i></span> ',
			execute:function(flag){
				return defaultsIco[flag];
			}
		}
		var createAlert = {
			init:function(){
				$('#minAlert').remove();
				var $alert = $(createAlert.alertHtml(opts.content)).appendTo('body');

				$alert.css({
					'left':$(window).width()/2-$alert.width()/2,
					'top':$(window).height()/2-$alert.height()/2
				});
				if(opts.class){
					$alert.addClass(opts.class)
				}
				opts.style&&$alert.css(opts.style);
				$alert.show();
				setTimeout(function(){
					$alert.fadeOut('200',function(){
						$alert.remove();
					});
				},opts.delay)
			},
			alertHtml:function(text){
				if(opts&&opts.ico){
					text = defaultsIco.execute(opts.ico)+text;
				}
				return "<div style='position: fixed;background: rgba(0,0,0,0.5);z-index: 99999;padding: 12px;border-radius: 3px;color: #fff;display:none' id='minAlert'>"+text+"</div>"
			}
		}
		return createAlert.init(opts);
	}

	$.modalDialog = function(options){
		var defaults = {
			title:'',
			content:'',
			loadingText:'',
			openEvent: null,
			closeEvent: null,
			buttons:[]
		}
		var opts =  $.extend({}, defaults,options);
		var $modal;
		var methods = {
			loading:function(text){
				 $modal.body.html('<div class="" style="padding:40px 0"><div class="sk-spinner sk-spinner-chasing-dots"><div class="sk-dot1"></div> <div class="sk-dot2 m-b"></div></div><div class="text-center" style="margin-top:20px">'+text+'</div></div>');
				 $modal.footer&&$modal.footer.hide();
			},
			appendContent:function(content){
				$modal.body.html('');
				// methods.strRegExp(content);
				$modal.content = $(content).appendTo($modal.body);
				$modal.footer&&$modal.footer.show();
				setTimeout(function(){
					opts.appendEvent&&opts.appendEvent(methods,$modal);
					
				},0)
			},
			switchWarning:function(text){
				methods.appendContent('<div class="text-center" ><i class="fa fa-exclamation-circle text-warning fa-4x m-b"></i><<div>'+text+'</div></div>');
				$modal.footer&&$modal.footer.html("<button type='button' class='btn btn-primary' data-dismiss='modal'>确定</button>");
			},
			detach:function(){
				opts.detach = true;
				$modal.modal('hide');
			},
			autoDialog:function(){
				var dialogH = $modal.find('.modal-dialog').height();
				var windowH = $(window).height();
				if(dialogH+60>windowH){
					$modal.body.css({
						'max-height':windowH-185,
						'overflow-y': 'scroll'
					})
				}
			},
			strRegExp:function(content){
				var pattern = new RegExp("\\{(.| )+?\\}","igm");
				var replaceContent = {
					icoWarning:"213213",
				}
				console.log(content.match(pattern))
			},
			getContentTpls:{
				warninConfirm:function(text){
					return '<div class="center-block text-center"><i class="fa fa-exclamation-circle text-warning fa-4x m-b"></i><br />'+text+'</div>'
				}
			}

		}
		var createDialog = {
			init:function(){
				$modal = $(createDialog.wrap());
				var $modalWrap = $modal.find('.modal-content');
				if(opts.title){
					 $modal.header = $(createDialog.header()).appendTo($modalWrap);
					 opts.style && opts.style.header && $modal.header.css(opts.style.header)
				}
				if(opts.content||opts.contentAsyn){
					 $modal.body = $(createDialog.body()).appendTo($modalWrap);
					 opts.style && opts.style.body && $modal.body.css(opts.style.body)
				}
				if(opts.buttons&&opts.buttons.length>0){
					 $modal.footer = $(createDialog.footer()).appendTo($modalWrap);
					 opts.style && opts.style.footer && $modal.footer.css(opts.style.footer)
					 createDialog.bindFooterEvent($modal.footer);
				}
				createDialog.getBodyContent();
				opts.width && $modal.find('.modal-dialog').css('width',opts.width);
                opts.size && $modal.find('.modal-dialog').addClass(opts.size);
                $modal.extend = {};
				$modal.appendTo('body').modal('show').on('hidden.bs.modal', function(){
					if(opts.detach){
						$modal.detach();
					}else{
						$modal.remove();
					}
                     	
                      	opts.closeEvent&&opts.closeEvent(methods,$modal)
                   })
                 .on('shown.bs.modal', function () {
                     opts.openEvent&&opts.openEvent(methods,$modal);
                     methods.autoDialog()
                  });
			},
			wrap:function(){
				return "<div class='modal fade' tabindex='-1' role='dialog' >"+
					   "	<div class='modal-dialog ' role='document'>"+
					   "		<div class='modal-content'>"+
					   "		</div>"+
					   "	</div>"+
					   "</div>"
			},
			header:function(){
				return 	   "			<div class='modal-header'>"+
						   "				<button type='button' class='close' data-dismiss='modal' aria-label='Close'>"+
						   "					<span aria-hidden='true'>"+
						   "						×"+
						   "					</span>"+
						   "				</button>"+
						   "				<h3 class='modal-title' style='font-weight: normal;'>"+
						   						opts.title+
						   "				</h3>"+
						   "			</div>"
			},
			body:function(){
				return 	"<div class='modal-body'></div>";
			},
			footer:function(){
				var defaultsBtn = {
					cancel:function(){
						return "				<button type='button' class='btn btn-default' data-dismiss='modal'>"+
							   "					取消"+
							   "				</button>";
					},
					execute:function(flag){
						return defaultsBtn[flag]();
					}
				}
				var html = 	"<div class='modal-footer'>";
						for(var i = 0;i<opts.buttons.length;i++){
	   						var btnClass = opts.buttons[i].class || 'btn btn-primary';
		   				if(typeof opts.buttons[i] == 'object'){
						html+="	<button type='button' class='"+btnClass+"'>"+
								 						opts.buttons[i].text+
							  "	</button>"
							   		}else{
						html+=	defaultsBtn.execute(opts.buttons[i]);
							   	}
							}
				  html+=  "</div>"
				  return html;
			},
			bindFooterEvent:function($modelFooter){
				$modelFooter.find('button').each(function(index,value){
				 	if(opts.buttons[index].attr){
				 		for(var i in opts.buttons[index].attr){
				 			$(this).attr(i,opts.buttons[index].attr[i]);
				 		}
				 	}
				 	if(opts.buttons[index].click){
				 		$(this).on('click',function(){
				 			opts.buttons[index].click(methods,$modal);
				 		})
				 	}

				 });
			},
			getBodyContent:function(){
				if(opts.contentAsyn){
					methods.loading(opts.loadingText);
					opts.contentAsyn(function(result){
						methods.appendContent(result)
					})
				}else{
					var result = (typeof opts.content == 'function')?opts.content():opts.content
					if(typeof result == 'object'){
						if(result.tpl){
							if(methods.getContentTpls[result.tpl]){
								methods.appendContent(methods.getContentTpls[result.tpl](result.text))
							}
						}else{
							methods.appendContent(result)
						}

					}else{
						methods.appendContent(result)
					}


				}

			}

		}
		return createDialog.init();
	}
})(jQuery)
