{% if page.comments && theme.gitalk.enable %}
  <link rel="stylesheet" href="/lib/gitalk/gitalk.css">
  <script src="/lib/gitalk/gitalk.min.js"></script>
   <script type="text/javascript">
        var gitalk = new Gitalk({
          clientID: '{{ theme.gitalk.clientID }}',
          clientSecret: '{{ theme.gitalk.clientSecret }}',
          accessToken: '{{ theme.gitalk.accessToken }}',
          repo: '{{ theme.gitalk.repo }}',
          owner: '{{ theme.gitalk.githubID }}',
          admin: ['{{ theme.gitalk.adminUser }}'],
          id: location.pathname,
          distractionFreeMode: '{{ theme.gitalk.distractionFreeMode }}'
        })
        gitalk.render('gitalk-container')
       </script>
{% endif %}
