{% extends '_layout.swig' %}
{% import '_macro/post.swig' as post_template %}
{% import '_macro/sidebar.swig' as sidebar_template %}

{% block title %}{{ config.title }}{% if theme.index_with_subtitle and config.subtitle %} - {{config.subtitle }}{% endif %}{% endblock %}

{% block page_class %}
  {% if is_home() %}page-home{% endif -%}
{% endblock %}

{% block content %}


  <section id="posts" class="posts-expand">
    {% for post in page.posts %}
      {{ post_template.render(post, true) }}
    {% endfor %}
  </section>


  {% include '_partials/pagination.swig' %}

<ins class="adsbygoogle"
     style="display:block;margin: 12px 0 12px 0;"
     data-ad-format="fluid"
     data-ad-layout-key="-h2+d+5c-9-3e"
     data-ad-client="ca-pub-8681435945442113"
     data-ad-slot="8241328770"></ins>
<script>
     (adsbygoogle = window.adsbygoogle || []).push({});
</script>

{% endblock %}

{% block sidebar %}
  {{ sidebar_template.render(false) }}
{% endblock %}
