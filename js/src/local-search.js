function localSearch(t,e,w,i){var c=!1,l=!0,t=t;0===t.length?t="search.xml":/json$/i.test(t)&&(l=!1);var n=e+t,o=function(t){$(".popup").hide(),$("#local-search-input").val(""),$(".search-result-list").remove(),$("#no-result").remove(),$(".local-search-pop-overlay").remove(),$("body").css("overflow","")};function h(){$("body").append('<div class="search-popup-overlay local-search-pop-overlay" />').css("overflow","hidden"),$(".search-popup-overlay").click(o),$(".popup").toggle();var t=$("#local-search-input");t.attr("autocapitalize","none"),t.attr("autocorrect","off"),t.focus()}function r(t,e,n){"use strict";$("body").append('<div class="search-popup-overlay local-search-pop-overlay"><div id="search-loading-icon"><i class="fa fa-spinner fa-pulse fa-5x fa-fw" /></div></div>').css("overflow","hidden"),$("#search-loading-icon").css("margin","20% auto 0 auto").css("text-align","center"),$.ajax({url:t,dataType:l?"xml":"json",async:!0,success:function(t){!function(t,e,n){c=!0,$(".popup").detach().appendTo(".header-inner");var o=l?$("entry",t).map(function(){return{title:$("title",this).text(),content:$("content",this).text(),url:$("url",this).text()}}).get():t,r=document.getElementById(e),s=document.getElementById(n);const a=()=>{var x=r.value.trim().toLowerCase(),C=x.split(/[\s\-]+/);1<C.length&&C.push(x);var e,m=[];0<x.length&&o.forEach(function(t){var e=!1,n=0,h=0,o=t.title.trim(),r=o.toLowerCase(),s=t.content.trim().replace(/<[^>]+>/g,""),a=s.toLowerCase(),i=decodeURIComponent(t.url),c=[],l=[];function u(t,e,n,o){for(var r=n[n.length-1],s=r.position,a=r.word,i=[],c=0;s+a.length<=e&&0!=n.length;){a===o&&c++,i.push({position:s,length:a.length});var l=s+a.length;for(n.pop();0!=n.length&&(s=(r=n[n.length-1]).position,a=r.word,s<l);)n.pop()}return h+=c,{hits:i,start:t,end:e,searchTextCount:c}}if(""!=o&&(C.forEach(function(t){c=c.concat(y(t,r,!1)),l=l.concat(y(t,a,!1))}),(0<c.length||0<l.length)&&(e=!0,n=c.length+l.length)),e){[c,l].forEach(function(t){t.sort(function(t,e){return e.position!==t.position?e.position-t.position:t.word.length-e.word.length})});t=[];0!=c.length&&t.push(u(0,o.length,c,x));for(var p=[];0!=l.length;){var f=l[l.length-1],d=f.position,g=f.word,v=d-20,f=d+80;v<0&&(v=0),(f=f<d+g.length?d+g.length:f)>s.length&&(f=s.length),p.push(u(v,f,l,x))}p.sort(function(t,e){return t.searchTextCount!==e.searchTextCount?e.searchTextCount-t.searchTextCount:t.hits.length!==e.hits.length?e.hits.length-t.hits.length:t.start-e.start});e=parseInt(w);0<=e&&(p=p.slice(0,e));var $="";0!=t.length?$+="<li><a href='"+i+"' class='search-result-title'>"+T(o,t[0])+"</a>":$+="<li><a href='"+i+"' class='search-result-title'>"+o+"</a>",p.forEach(function(t){$+="<a href='"+i+'\'><p class="search-result">'+T(s,t)+"...</p></a>"}),m.push({item:$+="</li>",searchTextCount:h,hitCount:n,id:m.length})}}),1===C.length&&""===C[0]?s.innerHTML='<div id="no-result"><i class="fa fa-search fa-5x" /></div>':0===m.length?s.innerHTML='<div id="no-result"><i class="fa fa-frown-o fa-5x" /></div>':(m.sort(function(t,e){return t.searchTextCount!==e.searchTextCount?e.searchTextCount-t.searchTextCount:t.hitCount!==e.hitCount?e.hitCount-t.hitCount:e.id-t.id}),e='<ul class="search-result-list">',m.forEach(t=>{e+=t.item}),s.innerHTML=e+="</ul>")};"auto"===i?r.addEventListener("input",a):($(".search-icon").click(a),r.addEventListener("keypress",function(t){"Enter"===t.code&&a()}));$(".local-search-pop-overlay").remove(),$("body").css("overflow",""),h()}(t,e,n)}})}function y(t,e,n){var o=t.length;if(0===o)return[];var r,s=0,a=[];for(n||(e=e.toLowerCase(),t=t.toLowerCase());-1<(r=e.indexOf(t,s));)a.push({position:r,word:t}),s=r+o;return a}function T(n,t){var o="",r=t.start;return t.hits.forEach(function(t){o+=n.substring(r,t.position);var e=t.position+t.length;o+='<b class="search-keyword">'+n.substring(t.position,e)+"</b>",r=e}),o+=n.substring(r,t.end)}$(".popup-trigger").click(function(t){t.stopPropagation(),c?h():r(n,"local-search-input","local-search-result")}),$(".popup-btn-close").click(o),$(".popup").click(function(t){t.stopPropagation()}),$(document).on("keyup",function(t){27===t.which&&$(".search-popup").is(":visible")&&o()})}