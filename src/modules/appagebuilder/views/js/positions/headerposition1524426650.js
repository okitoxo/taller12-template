/*
 *  @Website: apollotheme.com - prestashop template provider
 *  @author Apollotheme <apollotheme@gmail.com>
 *  @copyright Apollotheme
 *  @description: ApPageBuilder is module help you can build content for your shop
 */
function processFloatHeader(headerAdd, scroolAction){
  if(headerAdd){
    $("#header").addClass( "navbar-fixed-top" );
    var hideheight =  $("#header").height()+120;
    $("#page").css( "padding-top", $("#header").height() );
    setTimeout(function(){
      $("#page").css( "padding-top", $("#header").height() );
    },200);
  }else{
    $("#header").removeClass( "navbar-fixed-top" );
    $("#page").css( "padding-top", '');
  }

  var pos = $(window).scrollTop();
  if( scroolAction && pos >= hideheight ){
    $(".header-banner").addClass('hide-bar');
    $(".hide-bar").css( "margin-top", - $(".header-banner").height() );
    $("#header").addClass("mini-navbar");
  }else {
    $(".header-banner").removeClass('hide-bar');
    $(".header-banner").css( "margin-top", 0 );
    $("#header").removeClass("mini-navbar");
  }
}