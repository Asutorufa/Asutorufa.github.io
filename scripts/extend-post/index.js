hexo.extend.filter.register("new_post_path",
    function (data, replace) { data["abbrlink"] = Date.now().toString(); }, 1);

hexo.extend.filter.register('post_permalink', function (data) {
    if (!data.abbrlink) {
        data.abbrlink = Date.parse(data.date.replace(' ', 'T')).toString()
        hexo.log.warn('post_permalink not found abbrlink, covert date to abbrlink', data.abbrlink);
    }
}, 1);
