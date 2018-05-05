		/**
		 * 倒计时
		 */
		function getShowTime(val){
		    var h = Math.floor(val/3600);
		    var m = Math.floor((val - h*3600)/60);
		    var s = Math.floor(val - h*3600 - m*60);
		    h = h<10?"0"+h:h;
		    m = m<10?"0"+m:m;
		    s = s<10?"0"+s:s;
		    //判断为00,是因为上面进行了字符串的拼接
		    if(h == "00"){
		        return m+":"+s;
		    }else{
		        return h+":"+m+":"+s;
		    }
		}

		function init(){
			var $video = $('.video');
			var height = $video.siblings('.customized-step').eq(0).height()
			$video.height(height);
		}


		//控制视频播放(只有使用window.onload这个才能获取播放总时长)
		window.onload = function(){
			init();
			new Video()($('.video-container'));

			$('.video-container .fullscreen').on("click",function(){
				var $clone_video = $('.video-container');
				var $madal = $('<div class="video-madal"><div class="close"></div></div>').appendTo('body').show().append( $clone_video);
				//暂停视频
				$madal.find('.fullscreen').hide();
				$madal.find('video').get(0).play();
				$madal.find('.controls').addClass('active');
				$madal.find('.close').one('click', function(){
					$madal.find('video').get(0).pause();
					$madal.find('.controls').removeClass('active');
					$madal.find('.fullscreen').show();
					$('#video').append($madal.find('.video-container'));
					$('.video-madal').remove();
				})
		    });

		    $(window).resize(function(){
		    	init();
		    })
		};

		var Video = function(){
			function initVideo(obj){

				var $progressWrap = obj.find('.progressWrap');
				var $progressPass = obj.find('.progressPass');
				var $controls = obj.find('.controls');
				var $video = obj.find('video');
				var $progressBuffer = obj.find('.progressBuffer');
				var $currentTime = obj.find('.currentTime');
				var $spinner = obj.find('.spinner');
				var $time = obj.find('.time');
				var $playTags = obj.find('.playTags');

			    var medias = $video.get(0);
			    var duration = $video.get(0).duration;  //获取总时间
			    var vw = $video.width();  //视频宽高
			    var vh = $video.height();
			    var sw = screen.width;       //浏览器宽高
			    var sh = screen.height;
			    //点击视频区域的播放暂停
			    obj.find("video,.playBtn").on("click",function(){
			        if(medias.paused){
			            //$(".playBtn").html('2');
			            $controls.addClass('active')
			            medias.play();
			        }else{
			            //$(".playBtn").html('1');
			            $controls.removeClass('active');
			            medias.pause();
			        }
			    });
			    
			    //鼠标拖动进度条
			    $progressWrap.bind("mousedown",function(e){
			        var _event = window.event||e;
			        var that = $(this);
			        var left = _event.offsetX;
			        var progressLen = $progressWrap.width();  
			        $progressPass.width(left-10);
			        var progresstimes = parseInt(duration*left/progressLen);  //判断缓冲
			        medias.currentTime = progresstimes;
			        //鼠标按下后绑定鼠标滑动事件
			        that.bind("mousemove",function(e){
			            var _event = window.event||e;
			            var x = _event.offsetX;
			            $progressWrap.width(x-10);
			            moveTimes = parseInt(duration*x/progressLen);  //判断缓冲
			            medias.currentTime = moveTimes;
			        });
			        //鼠标弹起后取消滑动事件
			        that.mouseup(function(e){
			            that.unbind("mousemove"); 
			        });
			        that.mouseleave(function(e){
			            that.unbind("mousemove");
			        });
			    });
			    
			    //全屏
			    /*$(".fullScreen").on("click",function(){
			        if(IsFullScreen() == false){ //非全屏状态变全屏
			            if(getBrowser() == "Firefox"){
			                $(".container").get(0).mozRequestFullScreen();  //火狐
			            }else{
			                videoWidthandHeight(sw,sh);
			                $(".container").get(0).webkitRequestFullScreen();  //谷歌
			            }
			        }else{  //全屏状态变非全屏
			            if(getBrowser() == "Firefox"){
			                document.mozCancelFullScreen();  //火狐 
			            }else{
			                videoWidthandHeight(vw,vh);
			                document.webkitCancelFullScreen();  //谷歌
			            }
			        }
			    });*/
			    
			    //esc键盘退出全屏恢复video宽高(针对谷歌)
			    /*$(document).keyup(function(event){
			        if(IsFullScreen() == false){
			            videoWidthandHeight(vw,vh);
			        }
			    });*/
			    
			    //一直执行的一个（timeupdate 事件在音频/视频（audio/video）的播放位置发生改变时触发。）
			    medias.addEventListener("timeupdate",updateData,true);
			    //计算当前播放的时间、进度条控制
			    function updateData(){
			        //获取进度条总宽度
			        onprogress();//缓冲
			        var progressBar = $playTags.width(); 
			        var curTime = medias.currentTime;
			        //计算已播放与未播放的比值
			        var percent = parseInt(progressBar*curTime/duration);
			        //控制进度条
			        $progressWrap.width(percent);
			        //获取到当前播放的时间
			        var goWhere = parseInt($progressPass.width()-(-10));  //判断缓冲
			        var goPercent = parseInt(duration*goWhere/progressBar);
			        for(var n = 0; n < medias.buffered.length; n++){ 
			            if(goPercent-0.05>medias.buffered.end(n)){  //正在缓冲
			                $spinner.show();
			            }else{  //缓冲完毕
			                $spinner.hide();
			                var curTime = medias.currentTime;
			            }
			        }
			        //显示当前播放的时间
			       	$time.html(getShowTime(curTime));
			        isEndvideo();  //是否结束播放
			    }
			    
			    /**
			     * 控制video的宽高
			     * 
			     */
			    /*function videoWidthandHeight(width,height){
			        $(".container").width(width);
			        $(".container").height(height);
			        $video.width(width);
			        $video.height(height);
			    }*/
			    
			    /**
			     * 是否播放结束
			     * 控制播放按钮   进度条
			     */
			    function isEndvideo(){
			        //播放完毕恢复初始状态
			        if(medias.ended){
			            $spinner.hide();
			            //$(".playBtn").html('2');
			            $controls.addClass('active');
			            $progressWrap.width("0");
			            $currentTime.html("00:00");
			        }
			    }

			    //获取缓冲的进度条
			    function onprogress(){ 
			        //获得buffered数据 
			        var ranges = []; 
			        for(var k = 0; k < medias.buffered.length; k++){ 
			            ranges.push([ 
			                medias.buffered.start(k), 
			                medias.buffered.end(k) 
			            ]); 
			        }
			        //获得在容器中的当前缓冲进度 
			        var playtag = $progressBuffer;
			        var spans = playtag.find("span");
			        if(spans.length < medias.buffered.length) 
			        { 
			            playtag.append('<span></span>'); 
			        } 
			        if(spans.length > medias.buffered.length) 
			        { 
			            playtag.children("span:last-child").remove();
			        }
			        for(var j = 0; j < medias.buffered.length; j++){ 
			            spans[j].style.left = Math.round((100 / medias.duration)*ranges[j][0])+ '%';
			            spans[j].style.width = Math.round((100 / medias.duration)*(ranges[j][1] - ranges[j][0]))+ '%'; 
			        }
			    }
			}
			return initVideo;
		}
		