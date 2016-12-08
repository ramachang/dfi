$(document).ready(function(){
    $(window).scroll(function(){
    	if($(window).scrollTop() < $('#head').outerHeight()){
    		$('body').addClass('header-visible');
    		$('#header').css('top', '-'+$(window).scrollTop()+'px');
    	}
    	else{
    		$('body').removeClass('header-visible');
    		$('#header').css('top', '-'+$('#head').outerHeight()+'px');
    	}
    });
});

$(window).load(function(){
	
});
