{% if theme.mermaid.enable %}
  <script type="text/javascript" src="/lib/mermaid/mermaid.min.js"></script>
  <script type="text/javascript" src="{{ url_for(theme.js) }}/src/mermaid.js"></script>
{% endif %}
