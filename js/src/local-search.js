function localSearch(t,e,w,l){function o(t){$(".popup").hide(),$("#local-search-input").val(""),$(".search-result-list").remove(),$("#no-result").remove(),$(".local-search-pop-overlay").remove(),$("body").css("overflow","")}var h=!1,u=!0,n=(0===t.length?t="search.xml":/json$/i.test(t)&&(u=!1),e+t);function p(){$("body").append('<div class="search-popup-overlay local-search-pop-overlay" />').css("overflow","hidden"),$(".search-popup-overlay").click(o),$(".popup").toggle();var t=$("#local-search-input");t.attr("autocapitalize","none"),t.attr("autocorrect","off"),t.focus()}function r(t,i,c){"use strict";$("body").append('<div class="search-popup-overlay local-search-pop-overlay"><div id="search-loading-icon"><i class="fa fa-spinner fa-pulse fa-5x fa-fw" /></div></div>').css("overflow","hidden"),$("#search-loading-icon").css("margin","20% auto 0 auto").css("text-align","center"),$.ajax({url:t,dataType:u?"xml":"json",async:!0,success:function(t){{var e=i,o=c,n=(h=!0,$(".popup").detach().appendTo(".header-inner"),u?$("entry",t).map(function(){return{title:$("title",this).text(),content:$("content",this).text(),url:$("url",this).text()}}).get():t),r=document.getElementById(e),s=document.getElementById(o);const a=()=>{var e,x=r.value.trim().toLowerCase(),C=x.split(/[\s\-]+/),m=(1<C.length&&C.push(x),[]);0<x.length&&n.forEach(function(t){var e=!1,o=0,h=0,n=t.title.trim(),r=n.toLowerCase(),s=t.content.trim().replace(/<[^>]+>/g,""),a=s.toLowerCase(),i=decodeURIComponent(t.url),c=[],l=[];function u(t,e,o,n){for(var r=o[o.length-1],s=r.position,a=r.word,i=[],c=0;s+a.length<=e&&0!=o.length;){a===n&&c++,i.push({position:s,length:a.length});var l=s+a.length;for(o.pop();0!=o.length&&(s=(r=o[o.length-1]).position,a=r.word,s<l);)o.pop()}return h+=c,{hits:i,start:t,end:e,searchTextCount:c}}if(""!=n&&(C.forEach(function(t){c=c.concat(y(t,r,!1)),l=l.concat(y(t,a,!1))}),(0<c.length||0<l.length)&&(e=!0,o=c.length+l.length)),e){[c,l].forEach(function(t){t.sort(function(t,e){return e.position!==t.position?e.position-t.position:t.word.length-e.word.length})});for(var t=[],p=(0!=c.length&&t.push(u(0,n.length,c,x)),[]);0!=l.length;){var f=l[l.length-1],d=f.position,f=f.word,g=d-20,v=d+80;g<0&&(g=0),(v=v<d+f.length?d+f.length:v)>s.length&&(v=s.length),p.push(u(g,v,l,x))}p.sort(function(t,e){return t.searchTextCount!==e.searchTextCount?e.searchTextCount-t.searchTextCount:t.hits.length!==e.hits.length?e.hits.length-t.hits.length:t.start-e.start});var e=parseInt(w),$=(0<=e&&(p=p.slice(0,e)),"");0!=t.length?$+="<li><a href='"+i+"' class='search-result-title'>"+T(n,t[0])+"</a>":$+="<li><a href='"+i+"' class='search-result-title'>"+n+"</a>",p.forEach(function(t){$+="<a href='"+i+'\'><p class="search-result">'+T(s,t)+"...</p></a>"}),$+="</li>",m.push({item:$,searchTextCount:h,hitCount:o,id:m.length})}}),1===C.length&&""===C[0]?s.innerHTML='<div id="no-result"><i class="fa fa-search fa-5x" /></div>':0===m.length?s.innerHTML='<div id="no-result"><i class="fa fa-frown-o fa-5x" /></div>':(m.sort(function(t,e){return t.searchTextCount!==e.searchTextCount?e.searchTextCount-t.searchTextCount:t.hitCount!==e.hitCount?e.hitCount-t.hitCount:e.id-t.id}),e='<ul class="search-result-list">',m.forEach(t=>{e+=t.item}),e+="</ul>",s.innerHTML=e)};return"auto"===l?r.addEventListener("input",a):($(".search-icon").click(a),r.addEventListener("keypress",function(t){"Enter"===t.code&&a()})),$(".local-search-pop-overlay").remove(),$("body").css("overflow",""),void p()}}})}function y(t,e,o){var n=t.length;if(0===n)return[];var r,s=0,a=[];for(o||(e=e.toLowerCase(),t=t.toLowerCase());-1<(r=e.indexOf(t,s));)a.push({position:r,word:t}),s=r+n;return a}function T(o,t){var n="",r=t.start;return t.hits.forEach(function(t){n+=o.substring(r,t.position);var e=t.position+t.length;n+='<b class="search-keyword">'+o.substring(t.position,e)+"</b>",r=e}),n+=o.substring(r,t.end)}$(".popup-trigger").click(function(t){t.stopPropagation(),h?p():r(n,"local-search-input","local-search-result")}),$(".popup-btn-close").click(o),$(".popup").click(function(t){t.stopPropagation()}),$(document).on("keyup",function(t){27===t.which&&$(".search-popup").is(":visible")&&o()})}