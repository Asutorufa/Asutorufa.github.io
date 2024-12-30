!function(e,r){if("object"==typeof exports&&"object"==typeof module)module.exports=r(require("katex"));else if("function"==typeof define&&define.amd)define(["katex"],r);else{var a,t="object"==typeof exports?r(require("katex")):r(e.katex);for(a in t)("object"==typeof exports?exports:e)[a]=t[a]}}("undefined"!=typeof self?self:this,function(w){return function(){"use strict";var a={771:function(e){e.exports=w}},t={};function o(e){var r=t[e];if(void 0!==r)return r.exports;r=t[e]={exports:{}};return a[e](r,r.exports,o),r.exports}o.n=function(e){var r=e&&e.__esModule?function(){return e.default}:function(){return e};return o.d(r,{a:r}),r},o.d=function(e,r){for(var a in r)o.o(r,a)&&!o.o(e,a)&&Object.defineProperty(e,a,{enumerable:!0,get:r[a]})},o.o=function(e,r){return Object.prototype.hasOwnProperty.call(e,r)};var e={};{var r=o(771),n=o.n(r);const s={"(":"left parenthesis",")":"right parenthesis","[":"open bracket","]":"close bracket","\\{":"left brace","\\}":"right brace","\\lvert":"open vertical bar","\\rvert":"close vertical bar","|":"vertical bar","\\uparrow":"up arrow","\\Uparrow":"up arrow","\\downarrow":"down arrow","\\Downarrow":"down arrow","\\updownarrow":"up down arrow","\\leftarrow":"left arrow","\\Leftarrow":"left arrow","\\rightarrow":"right arrow","\\Rightarrow":"right arrow","\\langle":"open angle","\\rangle":"close angle","\\lfloor":"open floor","\\rfloor":"close floor","\\int":"integral","\\intop":"integral","\\lim":"limit","\\ln":"natural log","\\log":"log","\\sin":"sine","\\cos":"cosine","\\tan":"tangent","\\cot":"cotangent","\\sum":"sum","/":"slash",",":"comma",".":"point","-":"negative","+":"plus","~":"tilde",":":"colon","?":"question mark","'":"apostrophe","\\%":"percent"," ":"space","\\ ":"space","\\$":"dollar sign","\\angle":"angle","\\degree":"degree","\\circ":"circle","\\vec":"vector","\\triangle":"triangle","\\pi":"pi","\\prime":"prime","\\infty":"infinity","\\alpha":"alpha","\\beta":"beta","\\gamma":"gamma","\\omega":"omega","\\theta":"theta","\\sigma":"sigma","\\lambda":"lambda","\\tau":"tau","\\Delta":"delta","\\delta":"delta","\\mu":"mu","\\rho":"rho","\\nabla":"del","\\ell":"ell","\\ldots":"dots","\\hat":"hat","\\acute":"acute"},u={prime:"prime",degree:"degrees",circle:"degrees",2:"squared",3:"cubed"},l={"|":"open vertical bar",".":""},i={"|":"close vertical bar",".":""},c={"+":"plus","-":"minus","\\pm":"plus minus","\\cdot":"dot","*":"times","/":"divided by","\\times":"times","\\div":"divided by","\\circ":"circle","\\bullet":"bullet"},p={"=":"equals","\\approx":"approximately equals","≠":"does not equal","\\geq":"is greater than or equal to","\\ge":"is greater than or equal to","\\leq":"is less than or equal to","\\le":"is less than or equal to",">":"is greater than","<":"is less than","\\leftarrow":"left arrow","\\Leftarrow":"left arrow","\\rightarrow":"right arrow","\\Rightarrow":"right arrow",":":"colon"},d={"\\underleftarrow":"left arrow","\\underrightarrow":"right arrow","\\underleftrightarrow":"left-right arrow","\\undergroup":"group","\\underlinesegment":"line segment","\\utilde":"tilde"},b=(r,a,t)=>{if(r){let e;e="open"===a?r in l?l[r]:s[r]||r:"close"===a?r in i?i[r]:s[r]||r:"bin"===a?c[r]||r:"rel"===a?p[r]||r:s[r]||r,/^\d+$/.test(e)&&0<t.length&&/^\d+$/.test(t[t.length-1])?t[t.length-1]+=e:e&&t.push(e)}},h=(e,r)=>{var a=[];e.push(a),r(a)},m=(t,r,o)=>{switch(t.type){case"accent":h(r,e=>{f(t.base,e,o),e.push("with"),b(t.label,"normal",e),e.push("on top")});break;case"accentUnder":h(r,e=>{f(t.base,e,o),e.push("with"),b(d[t.label],"normal",e),e.push("underneath")});break;case"accent-token":break;case"atom":var e=t["text"];switch(t.family){case"bin":b(e,"bin",r);break;case"close":b(e,"close",r);break;case"inner":b(t.text,"inner",r);break;case"open":b(e,"open",r);break;case"punct":b(e,"punct",r);break;case"rel":b(e,"rel",r);break;default:throw t.family,new Error('"'+t.family+'" is not a valid atom type')}break;case"color":{const s=t.color.replace(/katex-/,"");h(r,e=>{e.push("start color "+s),f(t.body,e,o),e.push("end color "+s)});break}case"color-token":break;case"delimsizing":t.delim&&"."!==t.delim&&b(t.delim,"normal",r);break;case"genfrac":h(r,e=>{var{leftDelim:r,rightDelim:a}=t;t.hasBarLine?(e.push("start fraction"),r&&b(r,"open",e),f(t.numer,e,o),e.push("divided by"),f(t.denom,e,o),a&&b(a,"close",e),e.push("end fraction")):(e.push("start binomial"),r&&b(r,"open",e),f(t.numer,e,o),e.push("over"),f(t.denom,e,o),a&&b(a,"close",e),e.push("end binomial"))});break;case"hbox":f(t.body,r,o);break;case"kern":break;case"leftright":h(r,e=>{b(t.left,"open",e),f(t.body,e,o),b(t.right,"close",e)});break;case"leftright-right":break;case"lap":f(t.body,r,o);break;case"mathord":b(t.text,"normal",r);break;case"op":var{body:a,name:n}=t;a?f(a,r,o):n&&b(n,"normal",r);break;case"op-token":b(t.text,o,r);break;case"ordgroup":f(t.body,r,o);break;case"overline":h(r,function(e){e.push("start overline"),f(t.body,e,o),e.push("end overline")});break;case"pmb":r.push("bold");break;case"phantom":r.push("empty space");break;case"raisebox":f(t.body,r,o);break;case"rule":r.push("rectangle");break;case"sizing":f(t.body,r,o);break;case"spacing":r.push("space");break;case"styling":f(t.body,r,o);break;case"sqrt":h(r,e=>{var{body:r,index:a}=t;if(a)return"3"===y(f(a,[],o)).join(",")?(e.push("cube root of"),f(r,e,o),void e.push("end cube root")):(e.push("root"),e.push("start index"),f(a,e,o),void e.push("end index"));e.push("square root of"),f(r,e,o),e.push("end square root")});break;case"supsub":{const{base:l,sub:i,sup:c}=t;let e=!1;if(l&&(f(l,r,o),e="op"===l.type&&"\\log"===l.name),i){const p=e?"base":"subscript";h(r,function(e){e.push("start "+p),f(i,e,o),e.push("end "+p)})}c&&h(r,function(e){var r=y(f(c,[],o)).join(",");r in u?e.push(u[r]):(e.push("start superscript"),f(c,e,o),e.push("end superscript"))});break}case"text":if("\\textbf"===t.font){h(r,function(e){e.push("start bold text"),f(t.body,e,o),e.push("end bold text")});break}h(r,function(e){e.push("start text"),f(t.body,e,o),e.push("end text")});break;case"textord":b(t.text,o,r);break;case"smash":f(t.body,r,o);break;case"enclose":if(/cancel/.test(t.label)){h(r,function(e){e.push("start cancel"),f(t.body,e,o),e.push("end cancel")});break}if(/box/.test(t.label)){h(r,function(e){e.push("start box"),f(t.body,e,o),e.push("end box")});break}if(/sout/.test(t.label)){h(r,function(e){e.push("start strikeout"),f(t.body,e,o),e.push("end strikeout")});break}if(/phase/.test(t.label)){h(r,function(e){e.push("start phase angle"),f(t.body,e,o),e.push("end phase angle")});break}throw new Error("KaTeX-a11y: enclose node with "+t.label+" not supported yet");case"vcenter":f(t.body,r,o);break;case"vphantom":throw new Error("KaTeX-a11y: vphantom not implemented yet");case"hphantom":throw new Error("KaTeX-a11y: hphantom not implemented yet");case"operatorname":f(t.body,r,o);break;case"array":throw new Error("KaTeX-a11y: array not implemented yet");case"raw":throw new Error("KaTeX-a11y: raw not implemented yet");case"size":break;case"url":throw new Error("KaTeX-a11y: url not implemented yet");case"tag":throw new Error("KaTeX-a11y: tag not implemented yet");case"verb":b("start verbatim","normal",r),b(t.body,"normal",r),b("end verbatim","normal",r);break;case"environment":throw new Error("KaTeX-a11y: environment not implemented yet");case"horizBrace":b("start "+t.label.slice(1),"normal",r),f(t.base,r,o),b("end "+t.label.slice(1),"normal",r);break;case"infix":break;case"includegraphics":throw new Error("KaTeX-a11y: includegraphics not implemented yet");case"font":f(t.body,r,o);break;case"href":throw new Error("KaTeX-a11y: href not implemented yet");case"cr":throw new Error("KaTeX-a11y: cr not implemented yet");case"underline":h(r,function(e){e.push("start underline"),f(t.body,e,o),e.push("end underline")});break;case"xArrow":throw new Error("KaTeX-a11y: xArrow not implemented yet");case"cdlabel":throw new Error("KaTeX-a11y: cdlabel not implemented yet");case"cdlabelparent":throw new Error("KaTeX-a11y: cdlabelparent not implemented yet");case"mclass":{const o=t.mclass.slice(1);f(t.body,r,o);break}case"mathchoice":f(t.text,r,o);break;case"htmlmathml":f(t.mathml,r,o);break;case"middle":b(t.delim,o,r);break;case"internal":break;case"html":f(t.body,r,o);break;default:throw t.type,new Error("KaTeX a11y un-recognized type: "+t.type)}},f=function(r,a,t){if(void 0===a&&(a=[]),r instanceof Array)for(let e=0;e<r.length;e++)f(r[e],a,t);else m(r,a,t);return a},y=function(e){let r=[];return e.forEach(function(e){e instanceof Array?r=r.concat(y(e)):r.push(e)}),r};e.default=function(e,r){e=n().__parse(e,r),r=f(e,[],"normal");return y(r).join(", ")}}return e=e.default}()});