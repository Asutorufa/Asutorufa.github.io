!function(){var s={"cdnjs.cloudflare.com":{api:"https://api.cdnjs.com/libraries/mathjax?fields=version",version:"version",mathjax:"https://cdnjs.cloudflare.com/ajax/libs/mathjax/"},"cdn.rawgit.com":{api:"https://api.github.com/repos/mathjax/mathjax/releases/latest",version:"tag_name",mathjax:"https://cdn.rawgit.com/mathjax/MathJax/"},"cdn.jsdelivr.net":{api:"https://api.jsdelivr.com/v1/jsdelivr/libraries?name=mathjax&lastversion=*",version:"lastversion",mathjax:"https://cdn.jsdelivr.net/mathjax/"}};function o(t){console&&console.log&&console.log(t)}function e(){if(document.currentScript)return document.currentScript;for(var t=document.getElementsByTagName("script"),e=0,a=t.length;e<a;e++){var n,r=t[e];for(n in s)if(s.hasOwnProperty(n)){var c=s[n].mathjax;if(r.src&&r.src.substr(0,c.length)===c)return r}}}var a=/(?:^|;\s*)mjx\.latest=([^;]*)(?:;|$)/;function i(t){var e=document.createElement("script"),t=(e.type="text/javascript",e.async=!0,e.src=t,document.head||document.getElementsByTagName("head")[0]||document.body);t?t.appendChild(e):o("Can't find the document <head> element")}function t(){var t=e();t?i(t.src.replace(/\/latest\.js/,"/MathJax.js")):o("Can't determine the URL for loading MathJax")}function n(a,n,r){var c=function(){if(window.XMLHttpRequest)return new XMLHttpRequest;if(window.ActiveXObject){try{return new ActiveXObject("Msxml2.XMLHTTP")}catch(t){}try{return new ActiveXObject("Microsoft.XMLHTTP")}catch(t){}}}();c?(c.onreadystatechange=function(){if(4===c.readyState){if(200===c.status){var t=JSON.parse(c.responseText),e=(t=t instanceof Array?t[0]:t)[a.version];if("2."===e.substr(0,2)){cookie="mjx.latest="+e,(e=new Date).setDate(e.getDate()+7),cookie=cookie+("; expires="+e.toGMTString())+"; path=/";try{document.cookie=cookie}catch(t){}return void i(a.mathjax+t[a.version]+r+"/MathJax.js"+n)}}else o("Problem aquiring MathJax version: status = "+c.status);laodDefaultMathJax()}},c.open("GET",a.api,!0),c.send(null)):(o("Can't create XMLHttpRequest object"),t())}var r,c,u=e(),l=function(t){if(t)return t=t.src.replace(/https:\/\//,"").replace(/[\/\?].*/,""),s[t]}(u);l?(r=u.src.replace(/.*?(\?|$)/,"$1"),r+=(r?"&":"?")+"latest",u=u.src.match(/\/unpacked\/latest\.js/)?"/unpacked":"",(c=function(){var t;try{t=a.exec(document.cookie)}catch(t){}if(t&&""!==t[1])return t[1]}())?i(l.mathjax+c+u+"/MathJax.js"+r):n(l,r,u)):t()}();