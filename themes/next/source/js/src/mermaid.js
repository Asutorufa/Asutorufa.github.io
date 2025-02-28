/* global NexT, CONFIG, mermaid */

$(document).ready(function () {
    const mermaidElements = document.querySelectorAll('pre > .mermaid');
    if (mermaidElements.length) {
        mermaidElements.forEach(element => {
          const box = document.createElement('div');
          box.className = 'code-container';
          const newElement = document.createElement('div');
          newElement.innerHTML = element.innerHTML;
          newElement.className = 'mermaid';
          box.appendChild(newElement);
          const parent = element.parentNode;
          parent.parentNode.replaceChild(box, parent);
        });
        mermaid.initialize({
          theme    :  window.matchMedia('(prefers-color-scheme: dark)').matches ? CONFIG.mermaid.theme.dark : CONFIG.mermaid.theme.light,
          logLevel : 4,
          flowchart: { curve: 'linear' },
          gantt    : { axisFormat: '%m/%d/%Y' },
          sequence : { actorMargin: 50 }
        });
        mermaid.run();
    }
  });