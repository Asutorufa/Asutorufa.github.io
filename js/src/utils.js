NexT.utils=NexT.$u={wrapImageWithFancyBox:function(){$(".content img").not("[hidden]").not(".group-picture img, .post-gallery img").each(function(){var e=$(this),i=e.attr("title"),t=e.parent("a");if(t.size()<1){var n=e.attr("data-original")?this.getAttribute("data-original"):this.getAttribute("src");t=e.wrap('<a href="'+n+'"></a>').parent("a")}t.addClass("fancybox fancybox.image"),t.attr("rel","group"),i&&(t.append('<p class="image-caption">'+i+"</p>"),t.attr("title",i))}),$(".fancybox").fancybox({helpers:{overlay:{locked:!1}}})},lazyLoadPostsImages:function(){$("#posts").find("img").lazyload({effect:"fadeIn",threshold:0})},registerTabsTag:function(){var i=".tabs ul.nav-tabs ";$(function(){$(window).bind("hashchange",function(){var e=location.hash;""!==e&&($(i+'li:has(a[href="'+e+'"])').addClass("active").siblings().removeClass("active"),$(e).addClass("active").siblings().removeClass("active"))}).trigger("hashchange")}),$(i+".tab").on("click",function(e){if(e.preventDefault(),!$(this).hasClass("active")){$(this).addClass("active").siblings().removeClass("active");var i=$(this).find("a").attr("href");$(i).addClass("active").siblings().removeClass("active"),""!==location.hash&&history.pushState("",document.title,window.location.pathname+window.location.search)}})},registerESCKeyEvent:function(){$(document).on("keyup",function(e){27===e.which&&$(".search-popup").is(":visible")&&($(".search-popup").hide(),$(".search-popup-overlay").remove(),$("body").css("overflow",""))})},registerBackToTop:function(){var n=$(".back-to-top");$(window).on("scroll",function(){n.toggleClass("back-to-top-on",50<window.pageYOffset);var e=$(window).scrollTop()/NexT.utils.getContentVisibilityHeight(),i=Math.round(100*e),t=100<i?100:i;$("#scrollpercent>span").html(t)}),n.on("click",function(){$("body").velocity("scroll")})},embeddedVideoTransformer:function(){var e=$("iframe"),o=new RegExp(["www.youtube.com","player.vimeo.com","player.youku.com","music.163.com","www.tudou.com"].join("|"));function r(e){return{width:e.width(),height:e.height()}}function c(e,i){return i/e*100}e.each(function(){var e,i=this,t=$(this),n=r(t);if(0<this.src.search(o)){var a=c(n.width,n.height);t.width("100%").height("100%").css({position:"absolute",top:"0",left:"0"});var s=document.createElement("div");if(s.className="fluid-vids",s.style.position="relative",s.style.marginBottom="20px",s.style.width="100%",s.style.paddingTop=a+"%",""===s.style.paddingTop&&(s.style.paddingTop="50%"),i.parentNode.insertBefore(s,i),s.appendChild(i),0<this.src.search("music.163.com"))((e=r(t)).width>n.width||e.height<n.height)&&(s.style.paddingTop=c(e.width,n.height)+"%")}})},addActiveClassToMenuItem:function(){var e=window.location.pathname;e="/"===e?e:e.substring(0,e.length-1),$('.menu-item a[href^="'+e+'"]:first').parent().addClass("menu-item-active")},hasMobileUA:function(){var e=window.navigator.userAgent;return/iPad|iPhone|Android|Opera Mini|BlackBerry|webOS|UCWEB|Blazer|PSP|IEMobile|Symbian/g.test(e)},isTablet:function(){return window.screen.width<992&&767<window.screen.width&&this.hasMobileUA()},isMobile:function(){return window.screen.width<767&&this.hasMobileUA()},isDesktop:function(){return!this.isTablet()&&!this.isMobile()},escapeSelector:function(e){return e.replace(/[!"$%&'()*+,.\/:;<=>?@[\\\]^`{|}~]/g,"\\$&")},displaySidebar:function(){!this.isDesktop()||this.isPisces()||this.isGemini()||$(".sidebar-toggle").trigger("click")},isMist:function(){return"Mist"===CONFIG.scheme},isPisces:function(){return"Pisces"===CONFIG.scheme},isGemini:function(){return"Gemini"===CONFIG.scheme},getScrollbarWidth:function(){var e=$("<div />").addClass("scrollbar-measure").prependTo("body"),i=e[0],t=i.offsetWidth-i.clientWidth;return e.remove(),t},getContentVisibilityHeight:function(){var e=$("#content").height(),i=$(window).height();return i<e?e-i:$(document).height()-i},getSidebarb2tHeight:function(){return CONFIG.sidebar.b2t?$(".back-to-top").height():0},getSidebarSchemePadding:function(){var e="block"==$(".sidebar-nav").css("display")?$(".sidebar-nav").outerHeight(!0):0,i=$(".sidebar-inner"),t=i.innerWidth()-i.width();return this.isPisces()||this.isGemini()?2*t+e+2*CONFIG.sidebar.offset+this.getSidebarb2tHeight():2*t+e/2}},$(document).ready(function(){function t(e){e=e||"auto",$(".site-overview, .post-toc").css("max-height",e)}!function(){var e;$(window).on("resize",function(){e&&clearTimeout(e),e=setTimeout(function(){t(document.body.clientHeight-NexT.utils.getSidebarSchemePadding())},0)});var i=NexT.utils.getScrollbarWidth();$(".sidebar-panel").height()>document.body.clientHeight-NexT.utils.getSidebarSchemePadding()&&$(".site-overview").css("width","calc(100% + "+i+"px)");$(".post-toc").css("width","calc(100% + "+i+"px)"),t(document.body.clientHeight-NexT.utils.getSidebarSchemePadding())}()});