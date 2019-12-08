$(function() {
	EditeMenu();
	$("#userAdd").click(function() {
		$("#myModalUser").modal(); //显示新增模态框
	})
 

})

function EditeMenu() {
 
	/**
	 * 绑定数据字典删除点击事件
	 */
	 
	$(".forbidden").bind("click", function() {
		$("#delModal").modal();
		$("#text").empty();
		$("#text").html("确定禁用用户吗");
	});
 
}

/**
 * 提示
 */
function minAlert(info) {
	$.minAlert({
		ico: "error",
		delay: 2000,
		content: info
	});
}