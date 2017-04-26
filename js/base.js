;(function(){
	'use strict';

	var $form_add_task = $('.add-task'),
	    $body = $('body'),
	    $window = $(window),
	    $form_button = $('.add-task').find('button'),
	    $delete_task ,
	    $detail_task ,
	    $detail_task_mask = $('.task-detail-mask'),
	    $task_detail = $('.task-detail'),
	    task_list = [],
	    current_index,
	    $update_form,
	    $task_detail_content,
	    $task_detail_content_input,
	    $task_complete,
	    $msg = $('.msg'),
	    $msg_content = $msg.find('.msg-content'),
	    $msg_confirm = $msg.find('.confirmed')
	    ;

	init();
	// pop('确定删除吗？')
	//   .then(function(r){
	//   	console.log(r);
	//   })
	function pop(arg){
       if(!arg){
       	console.error('pop title is required');
       }

		var conf = {}, 
			$box, 
			$mark, 
			$title, 
			$content,
            $confirm,
            $cancel,
            confirmed,
            dfd,
            timer
			;

			dfd = $.Deferred();
  
	       if(typeof arg == 'string'){
	          conf.title = arg;
	       }
	       else{
	       	conf = $.extend(conf, arg);
	       }

		$box = $('<div>'+
                   '<div class="pop-title">'+ conf.title +'</div>'+
                   '<div style="margin-top:10px;" class="pop-content"><button style="margin-right:5px;" class="primary confirm">确定</button>'+
                   '<button class="cancel">取消</button></div>'+
			    '</div>')
		       .css({
		       	color:'#444',
		       	position:'fixed',
		       	width:300,
		       	height:'auto',
		       	padding:'15px 10px',
		       	background:'#fff',
		       	'border-radius':3,
		       	'box-shadow':'0 1px 2px rgba(0,0,0,.5)'
		       })
        $mark = $('<div></div>')
                .css({
                 position:'fixed',
                 background:'rgba(0,0,0,.5)',
                 top:0,
                 left:0,
                 bottom:0,
                 right:0
                })
        $title = $box.find('.pop-title').css({
            padding:'5px 10px',
            'font-weight':900,
            'font-size':20,
            'text-align':'center'
        })
        $content = $box.find('.pop-content').css({
        	padding:'5px 10px',
        	'font-weight':400,
        	'text-align':'center'
        })

        $confirm = $box.find('.confirm');
        $cancel = $box.find('.cancel');

       function adjust_box_position(){
       	var window_width = $window.width(),
       	    window_height = $window.height(),
       	    box_width = $box.width(),
       	    box_height = $box.height(),
       	    off_x,
       	    off_y;
       	    off_x = (window_width - box_width)/2;
       	    off_y = (window_height - box_height)/2;

       	    $box.css({
       	    	left:off_x,
       	    	top:off_y
       	    })
       }
       
       timer = setInterval(function(){
          if(confirmed !== undefined){
          	dfd.resolve(confirmed);
          	clearInterval(timer);
          }
       }, 50)
       $confirm.on('click', function(){
       	confirmed = true;
       	dismiss();
       })

       $cancel.on('click', on_cancel);
       $mark.on('click', on_cancel);

       function on_cancel(){
       	confirmed = false;
       	dismiss();
       }

       $window.on('resize', function(){
       	  adjust_box_position();
       })

       function dismiss(){
       	$mark.remove();
       	$box.remove();
       }
               
       $mark.appendTo($body);
       $box.appendTo($body);
       $window.resize();
       return dfd.promise();
	}
    
    function listion_confirmed(){
    	$msg_confirm.on('click', function(){
    		hide_msg();
    	})
    }

    /*监听打开task详情事件*/
	function listion_detail_task(){

      var index;
      $('.task-item').on('dblclick',function(){
        index = $(this).data('index');
        show_detail(index);
      })

		$detail_task.on('click', function(){
			
			var $this = $(this);
			var $item = $this.parent().parent();
		    index = $item.data('index');
			show_detail(index);
		})
	}

   function listion_task_complete(){
   	
   	$task_complete.on('click', function(){
   		// alert(1);
   		var $this = $(this);
   		console.log($this);
   		var index = $this.parent().parent().data('index');
   		console.log(index);
   		var item = get(index);
   		// console.log(get(index));
   		if(item && item.complete){
   			update_task(index, {complete:false});
   			// $this.attr('checked', true);
   		}
   		else{
   			update_task(index,{complete:true});
   			// this.attr('checked',false);$
   		}
   	})
   }

   function get(index){
   var 	_task_list = JSON.parse(localStorage.getItem('task_list'));
   	return _task_list[index];
   }

   //渲染Task详情
    function render_task_detail(index){
    	if(index===undefined && !task_list[index]) return;
    	var item = task_list[index];

    	// console.log(item);
      var tpl =     
       ' <form>'+
		'<div class="content">'+(item.content||'')+'</div>'+
		'<div>'+
		'<input style="display:none" name="content" type="text" value="'+(item.content||'')+'" />'+
		'</div>'+
		  '<div>'+
			'<div class="desc">'+
				'<textarea  name = "desc">'+(item.desc||'')+'</textarea>'+
			'</div>'+
		'</div>'+
		'<div class="remind">'+
		    '<span>提醒时间</span>'+
			'<input class="datetime" type="text" value="'+(item.date || '')+'" >'+
			'<button type="submit">更新</button>'+
		'</div>'+
	 '</form>';
	 $task_detail.html(null);
	 $task_detail.html(tpl);
	 $update_form = $task_detail.find('form');
	 $task_detail_content_input= $update_form.find('[name=content]');
	 $task_detail_content = $update_form.find('.content');
	 $('.datetime').datetimepicker();
	 console.log($('.datetime'));
	 // console.log($task_detail_content);

     $task_detail_content.on('dblclick', function(){
     	$task_detail_content.hide();
     	$task_detail_content_input.show();
     })
     

     $update_form.on('submit', function(e){
     	e.preventDefault();
     	var data = {};
     	data.content = $(this).find('[name=content]').val();
     	data.desc = $(this).find('[name=desc]').val();
     	data.date = $(this).find('.datetime').val();
     	update_task(index, data);
     	hide_task_detail()
     })
    }
  //更新Task函数
    function update_task(index,data){
    	if(index===undefined || !task_list[index]) return;
    	// console.log(data);
    	task_list[index] = $.extend({},task_list[index],data);
    	refresh_task_list();
    	// console.log(task_list[index]);
    }

  /*显示详细内容*/
	function show_detail(index){
		render_task_detail(index);
		current_index = index;
		$detail_task_mask.show();
		$task_detail.show();
	}

	function hide_task_detail(){
		$detail_task_mask.hide();
		$task_detail.hide();
	}

	$form_button.on('click', on_add_task_form_submit);
	$detail_task_mask.on('click', hide_task_detail);

	function on_add_task_form_submit(e){
		var new_task = {};
	    var $input = $form_add_task.find('input[type=text]');
	    e.preventDefault();
	    new_task.content = $input.val();
	    if(!new_task.content) return;
	     console.log(new_task);
	     add_task(new_task); 
	    $input.val(null);	
	}

   // 查找并监听所有删除按钮事件
	function listion_task_delete(){

	    $delete_task.on('click', function(){
	    	var $this = $(this)
	   //找到删除按钮对的task
	    	var $item = $this.parent().parent();
	    	var index = $item.data('index');
	    	pop('确定删除吗？')
	    	   .then(function(r){
	    	   	r ? delete_task(index): null;
	    	   })  		
    	})	
	}

    function add_task(new_task){
	      task_list.push(new_task);
	       refresh_task_list();
    }

    function refresh_task_list(){
	      var task_list1 = JSON.stringify(task_list);
	      localStorage.setItem('task_list', task_list1);
	      render_task_list();
    }

  //删除task函数
    function delete_task(index){
    	if(index == undefined && task_list[index]) return;
    	delete task_list[index];

    	refresh_task_list();
    }

	function init(){
       // localStorage.clear();
       listion_confirmed();
		task_list = JSON.parse(localStorage.getItem('task_list')) || [];
		if(task_list.length){
		     render_task_list();
	        }   
	        task_remind_check();     
	}

    function task_remind_check(){
    	var current_timestamp,
    	    task_timestamp;
        setInterval(function(){
	    	for(var i = 0; i < task_list.length; i++){
	          var item = task_list[i];
	         if(!item || !item.date || item.informed) continue;

	         current_timestamp = (new Date()).getTime();
	         task_timestamp = (new Date(item.date)).getTime();

	         if(current_timestamp - task_timestamp > 1){
	         	update_task(i, {informed:true});
	         	show_msg(item.content);
	         }
    	    }        	
        },1000);

    }

    function show_msg(msg){
    	if(!msg) return;
    	$msg_content.html(msg);
    	$msg.fadeIn(3000);
        }

    function hide_msg(){
    	$msg.fadeOut(3000);
    }

//渲染全部模板列表
	function render_task_list(){		
			var $task_list = $('.task-list');
			$task_list.html('');
			var complete_items = [];
	      for(var i = 0; i < task_list.length; i++){
	      	var item = task_list[i];
	      	if(item && item.complete){
	      		complete_items[i] = item;
	      	}
	      	else{
	      		var $task=render_task_item(item, i);
	      	}
	      	// debugger
	      	$task_list.prepend($task);
	      }   	
          for(var j = 0; j < complete_items.length; j++){
          	 $task = render_task_item(complete_items[j], j);
          	  if(!$task) continue;
          	  $($task).addClass('completed');
          	  $task_list.append($task);
            }

	        $delete_task = $('.active.delete');
	        $detail_task = $('.active.detail');
	        $task_complete = $('.task-list .complete[type=checkbox]');
	        listion_task_delete();
	        listion_detail_task();
	        listion_task_complete();
	}

   //渲染单条模板
	function render_task_item(data, index){
		if(index == undefined || !data) return;
	var list_item_tpl =	'<div class="task-item" data-index="'+ index +'">' +
			'<span><input class="complete" '+(data.complete ? 'checked' : '')+' type="checkbox"></span>' +
			'<span class="task-content">' + data.content +'</span>'+
			'<span class="fr">'+
			'<span class="active delete">删除</span>'+
			'<span class="active detail">详情</span>'+
			'</span>'
		'</div>'
		return $(list_item_tpl);		
	}
})();