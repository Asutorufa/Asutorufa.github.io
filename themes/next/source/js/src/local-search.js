function localSearch(pathArg, root, topNPerArticle, trigger) {
    // Popup Window;
    var isfetched = false;
    var isXml = true;
    // Search DB path;
    var search_path = pathArg;
    if (search_path.length === 0) {
        search_path = "search.xml";
    } else if (/json$/i.test(search_path)) {
        isXml = false;
    }
    var path = root + search_path;
    // monitor main search box;

    var onPopupClose = function (e) {
        $('.popup').hide();
        $('#local-search-input').val('');
        $('.search-result-list').remove();
        $('#no-result').remove();
        $(".local-search-pop-overlay").remove();
        $('body').css('overflow', '');
    }

    function processSearch() {
        $("body")
            .append('<div class="search-popup-overlay local-search-pop-overlay" />')
            .css('overflow', 'hidden');
        $('.search-popup-overlay').click(onPopupClose);
        $('.popup').toggle();
        var $localSearchInput = $('#local-search-input');
        $localSearchInput.attr("autocapitalize", "none");
        $localSearchInput.attr("autocorrect", "off");
        $localSearchInput.focus();
    }

    // search function;
    var searchFunc = function (path, search_id, content_id) {
        'use strict';

        // start loading animation
        $("body")
            .append('<div class="search-popup-overlay local-search-pop-overlay"><div id="search-loading-icon"><i class="fa fa-spinner fa-pulse fa-5x fa-fw" /></div></div>').css('overflow', 'hidden');
        $("#search-loading-icon").css('margin', '20% auto 0 auto').css('text-align', 'center');

        $.ajax({
            url: path,
            dataType: isXml ? "xml" : "json",
            async: true,
            success: function (res) { processSearchDB(res, search_id, content_id) }
        });
    }

    function getIndexByWord(word, text, caseSensitive) {
        var wordLen = word.length;
        if (wordLen === 0) {
            return [];
        }
        var startPosition = 0, position = [], index = [];
        if (!caseSensitive) {
            text = text.toLowerCase();
            word = word.toLowerCase();
        }
        while ((position = text.indexOf(word, startPosition)) > -1) {
            index.push({ position: position, word: word });
            startPosition = position + wordLen;
        }
        return index;
    }



    // highlight title and content
    function highlightKeyword(text, slice) {
        var result = '';
        var prevEnd = slice.start;
        slice.hits.forEach(function (hit) {
            result += text.substring(prevEnd, hit.position);
            var end = hit.position + hit.length;
            result += '<b class="search-keyword">' + text.substring(hit.position, end) + '</b>';
            prevEnd = end;
        });
        result += text.substring(prevEnd, slice.end);
        return result;
    }

    function processSearchDB(res, search_id, content_id) {
        // get the contents from search data
        isfetched = true;
        $('.popup').detach().appendTo('.header-inner');
        var datas = isXml ? $("entry", res).map(function () {
            return {
                title: $("title", this).text(),
                content: $("content", this).text(),
                url: $("url", this).text()
            };
        }).get() : res;
        var input = document.getElementById(search_id);
        var resultContent = document.getElementById(content_id);
        const inputEventFunction = () => {
            var searchText = input.value.trim().toLowerCase();
            var keywords = searchText.split(/[\s\-]+/);

            if (keywords.length > 1) keywords.push(searchText);
            var resultItems = [];
            if (searchText.length > 0)
                // perform local searching
                datas.forEach(function (data) {
                    var isMatch = false;
                    var hitCount = 0;
                    var searchTextCount = 0;
                    var title = data.title.trim();
                    var titleInLowerCase = title.toLowerCase();
                    var content = data.content.trim().replace(/<[^>]+>/g, "");
                    var contentInLowerCase = content.toLowerCase();
                    var articleUrl = decodeURIComponent(data.url);
                    var indexOfTitle = [];
                    var indexOfContent = [];
                    // only match articles with not empty titles
                    if (title != '') {
                        keywords.forEach(function (keyword) {
                            indexOfTitle = indexOfTitle.concat(getIndexByWord(keyword, titleInLowerCase, false));
                            indexOfContent = indexOfContent.concat(getIndexByWord(keyword, contentInLowerCase, false));
                        });
                        if (indexOfTitle.length > 0 || indexOfContent.length > 0) {
                            isMatch = true;
                            hitCount = indexOfTitle.length + indexOfContent.length;
                        }
                    }

                    // merge hits into slices
                    function mergeIntoSlice(start, end, index, searchText) {
                        var item = index[index.length - 1];
                        var position = item.position;
                        var word = item.word;
                        var hits = [];
                        var searchTextCountInSlice = 0;
                        while (position + word.length <= end && index.length != 0) {
                            if (word === searchText) {
                                searchTextCountInSlice++;
                            }
                            hits.push({ position: position, length: word.length });
                            var wordEnd = position + word.length;

                            // move to next position of hit

                            index.pop();
                            while (index.length != 0) {
                                item = index[index.length - 1];
                                position = item.position;
                                word = item.word;
                                if (wordEnd > position) {
                                    index.pop();
                                } else {
                                    break;
                                }
                            }
                        }
                        searchTextCount += searchTextCountInSlice;
                        return {
                            hits: hits,
                            start: start,
                            end: end,
                            searchTextCount: searchTextCountInSlice
                        };
                    }

                    if (!isMatch) return;
                    // sort index by position of keyword

                    [indexOfTitle, indexOfContent].forEach(function (index) {
                        index.sort(function (itemLeft, itemRight) {
                            if (itemRight.position !== itemLeft.position) {
                                return itemRight.position - itemLeft.position;
                            } else {
                                return itemLeft.word.length - itemRight.word.length;
                            }
                        });
                    });

                    var slicesOfTitle = [];
                    if (indexOfTitle.length != 0) slicesOfTitle.push(mergeIntoSlice(0, title.length, indexOfTitle, searchText));

                    var slicesOfContent = [];
                    while (indexOfContent.length != 0) {
                        var item = indexOfContent[indexOfContent.length - 1];
                        var position = item.position;
                        var word = item.word;
                        // cut out 100 characters
                        var start = position - 20;
                        var end = position + 80;
                        if (start < 0) {
                            start = 0;
                        }
                        if (end < position + word.length) {
                            end = position + word.length;
                        }
                        if (end > content.length) {
                            end = content.length;
                        }
                        slicesOfContent.push(mergeIntoSlice(start, end, indexOfContent, searchText));
                    }

                    // sort slices in content by search text's count and hits' count

                    slicesOfContent.sort(function (sliceLeft, sliceRight) {
                        if (sliceLeft.searchTextCount !== sliceRight.searchTextCount) {
                            return sliceRight.searchTextCount - sliceLeft.searchTextCount;
                        } else if (sliceLeft.hits.length !== sliceRight.hits.length) {
                            return sliceRight.hits.length - sliceLeft.hits.length;
                        } else {
                            return sliceLeft.start - sliceRight.start;
                        }
                    });

                    // select top N slices in content

                    var upperBound = parseInt(topNPerArticle);
                    if (upperBound >= 0) {
                        slicesOfContent = slicesOfContent.slice(0, upperBound);
                    }


                    var resultItem = '';

                    if (slicesOfTitle.length != 0) {
                        resultItem += "<li><a href='" + articleUrl + "' class='search-result-title'>" + highlightKeyword(title, slicesOfTitle[0]) + "</a>";
                    } else {
                        resultItem += "<li><a href='" + articleUrl + "' class='search-result-title'>" + title + "</a>";
                    }

                    slicesOfContent.forEach(function (slice) {
                        resultItem += "<a href='" + articleUrl + "'><p class=\"search-result\">" + highlightKeyword(content, slice) + "...</p></a>";
                    });

                    resultItem += "</li>";
                    resultItems.push({
                        item: resultItem,
                        searchTextCount: searchTextCount,
                        hitCount: hitCount,
                        id: resultItems.length
                    });
                })

            if (keywords.length === 1 && keywords[0] === "") {
                resultContent.innerHTML = '<div id="no-result"><i class="fa fa-search fa-5x" /></div>'
            } else if (resultItems.length === 0) {
                resultContent.innerHTML = '<div id="no-result"><i class="fa fa-frown-o fa-5x" /></div>'
            } else {
                resultItems.sort(function (resultLeft, resultRight) {
                    if (resultLeft.searchTextCount !== resultRight.searchTextCount) {
                        return resultRight.searchTextCount - resultLeft.searchTextCount;
                    } else if (resultLeft.hitCount !== resultRight.hitCount) {
                        return resultRight.hitCount - resultLeft.hitCount;
                    } else {
                        return resultRight.id - resultLeft.id;
                    }
                });
                var searchResultList = '<ul class=\"search-result-list\">';
                resultItems.forEach(result => { searchResultList += result.item; })
                searchResultList += "</ul>";
                resultContent.innerHTML = searchResultList;
            }
        }

        if ('auto' === trigger) {
            input.addEventListener('input', inputEventFunction);
        } else {
            $('.search-icon').click(inputEventFunction);
            input.addEventListener('keypress', function (event) {
                if (event.code === "Enter") inputEventFunction();
            });
        }

        // remove loading animation
        $(".local-search-pop-overlay").remove();
        $('body').css('overflow', '');

        processSearch();
    }
    // handle and trigger popup window;
    $('.popup-trigger').click(function (e) {
        e.stopPropagation();
        if (!isfetched) searchFunc(path, 'local-search-input', 'local-search-result');
        else processSearch();
    });
    $('.popup-btn-close').click(onPopupClose);
    $('.popup').click(function (e) { e.stopPropagation(); });
    $(document).on('keyup', function (event) { if (event.which === 27 && $('.search-popup').is(':visible')) onPopupClose(); });
}
