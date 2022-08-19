{% if theme.local_search.enable %}
<script type="text/javascript" src="/js/src/local-search.js"></script>
<script>localSearch("{{ config.search.path }}", "{{ config.root }}", "{{ theme.local_search.top_n_per_article }}", "{{ theme.local_search.trigger }}")</script>
{% endif %}
