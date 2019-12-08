$(function(){
	//EditeMenu();
	$("#userAdd").click(function(){
		$("#myModalUser").modal();//显示新增模态框
	})
//	var  deleModal=new Vue({
//		template:''
//	})
 
})
 
function EditeMenu() {
	 
	//绑定用户管理 - 删除点击事件
	$(".del").bind("click", function() {
		var name=$(this).attr("name");//获取按钮的name
		$("#text").empty();
		if(name=="user"){//用户管理-删除
			    $("#text").attr("name",$(this).parent().siblings("td").eq(1).text());//用户id
			    $("#text").attr("A", $(this).parent().parent().index())
				$("#text").html("确定删除用户吗");
		}else if(name=="manager"){//菜单管理-删除
				$("#text").html("确定删除菜单吗");
		}else if(name=="list"){//菜单管理-接口列表-删除
			    $("#text").html("确定删除接口列表吗");
		}
		
		$(this).parent().siblings("td").each(function(index) {
			if(index == 0) {
				name = $(this).text();
			}
		})
		$("#delModal").attr("name", name);
		$("#delModal").modal();
	});
		$(".edit").bind("click", function() {
			var name=$(this).attr("name");//获取按钮的name
		if(name=="user"){//用户管理-编辑
			$("#EditUserModal").modal();
			$("#user_id").val($(this).parent().siblings("td").eq(1).text());//userid
			$("#User_input_name").val($(this).parent().siblings("td").eq(2).text());//用户名
			$("#user_input_email").val($(this).parent().siblings("td").eq(0).find("span").text());//用户密码
			$("#user_input_tel").val($(this).parent().siblings("td").eq(3).text());//用户手机号

		}  
//		if(urlOne.indexOf("GetUserData") > 0) { //用户管理编辑
//			EditeCN = $(this).attr("name");
//			userNa = $(this).attr("value");
		
		var name="";
		name=$(this).attr("name");//获取按钮name
		if(name=="role"){//角色管理
			
		}else if(name=="user"){//用户管理
			
		}
		});
		/**
		 * 禁用
		 */
		$(".forbidden").bind("click",function(){
	 
				$("#delModal").modal();
				   $("#text").attr("name",$(this).parent().siblings("td").eq(1).text());//用户id
			    $("#text").attr("A", $(this).parent().parent().index())
				$("#text").empty();
				$("#text").html("确定禁用用户吗");
		});
		/**
		 * 启用
		 */
		$(".forShow").bind("click",function(){
 
				$("#delModal").modal();
				$("#text").attr("name",$(this).parent().siblings("td").eq(1).text());//用户id
			    $("#text").attr("A", $(this).parent().parent().index())
				$("#text").empty();
				$("#text").html("确定启用用户吗");
		})

}

/**
 * 提示
 */
function  minAlert(info){	
	$.minAlert({
				ico: "error",
				delay: 2000,
				content:info
			});
		}


	/**
	 * 全选或者不选
	 * id全选的复选框id
	 * allId是 tbody的id
	 */
	function checkAll(id,allId){
      if($(id).is(":checked")){
      	$(allId).find("tr").each(function(){
			$(this).find("td").eq(0).find("input").prop("checked",true)
		})
      }else{
      	$(allId).find("tr").each(function(){
			$(this).find("td").eq(0).find("input").prop("checked",false)
		})
      }
		
	}