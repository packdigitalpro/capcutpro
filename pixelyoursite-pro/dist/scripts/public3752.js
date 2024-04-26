/* global pysOptions */

// https://bitbucket.org/pixelyoursite/pys_pro_7/issues/7/possible-ie-11-error
// https://tc39.github.io/ecma262/#sec-array.prototype.includes
if (!Array.prototype.includes) {
    Object.defineProperty(Array.prototype, 'includes', {
        value: function (searchElement, fromIndex) {

            if (this == null) {
                throw new TypeError('"this" is null or not defined');
            }

            // 1. Let O be ? ToObject(this value).
            var o = Object(this);

            // 2. Let len be ? ToLength(? Get(O, "length")).
            var len = o.length >>> 0;

            // 3. If len is 0, return false.
            if (len === 0) {
                return false;
            }

            // 4. Let n be ? ToInteger(fromIndex).
            //    (If fromIndex is undefined, this step produces the value 0.)
            var n = fromIndex | 0;

            // 5. If n ≥ 0, then
            //  a. Let k be n.
            // 6. Else n < 0,
            //  a. Let k be len + n.
            //  b. If k < 0, let k be 0.
            var k = Math.max(n >= 0 ? n : len - Math.abs(n), 0);

            function sameValueZero(x, y) {
                return x === y || (typeof x === 'number' && typeof y === 'number' && isNaN(x) && isNaN(y));
            }

            // 7. Repeat, while k < len
            while (k < len) {
                // a. Let elementK be the result of ? Get(O, ! ToString(k)).
                // b. If SameValueZero(searchElement, elementK) is true, return true.
                if (sameValueZero(o[k], searchElement)) {
                    return true;
                }
                // c. Increase k by 1.
                k++;
            }

            // 8. Return false
            return false;
        }
    });
}

if (!String.prototype.startsWith) {
    Object.defineProperty(String.prototype, 'startsWith', {
        enumerable: false,
        configurable: false,
        writable: false,
        value: function (searchString, position) {
            position = position || 0;
            return this.indexOf(searchString, position) === position;
        }
    });
}

if (!String.prototype.trim) {
    (function () {
        String.prototype.trim = function () {
            return this.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
        };
    })();
}

! function ($, options) {

    if (options.debug) {
        console.log('PYS:', options);
    }

    var dummyPinterest = function () {

        /**
         * Public API
         */
        return {
            tag: function() {
                return "pinterest";
            },
            isEnabled: function () {},

            disable: function () {},

            loadPixel: function () {},

            fireEvent: function (name, data) {
                return false;
            },

            onAdSenseEvent: function (event) {},

            onClickEvent: function (params) {},

            onWatchVideo: function (params) {},

            onCommentEvent: function (event) {},

            onFormEvent: function (params) {},

            onDownloadEvent: function (params) {},

            onWooAddToCartOnButtonEvent: function (product_id) {},

            onWooAddToCartOnSingleEvent: function (product_id, qty, product_type, is_external, $form) {},

            onWooRemoveFromCartEvent: function (cart_item_hash) {},

            onWooAffiliateEvent: function (product_id) {},

            onWooPayPalEvent: function (event) {},

            onEddAddToCartOnButtonEvent: function (download_id, price_index, qty) {},

            onEddRemoveFromCartEvent: function (item) {},

            onPageScroll: function (event) {},
            onTime: function (event) {

            },

        }

    }();

    var dummyBing = function () {

        /**
         * Public API
         */
        return {
            tag: function() {
                return "bing";
            },
            isEnabled: function () {},

            disable: function () {},

            loadPixel: function () {},

            fireEvent: function (name, data) {
                return false;
            },

            onAdSenseEvent: function (event) {},

            onClickEvent: function (params) {},

            onWatchVideo: function (params) {},

            onCommentEvent: function (event) {},

            onFormEvent: function (params) {},

            onDownloadEvent: function (params) {},

            onWooAddToCartOnButtonEvent: function (product_id) {},

            onWooAddToCartOnSingleEvent: function (product_id, qty, product_type, is_external, $form) {},

            onWooRemoveFromCartEvent: function (cart_item_hash) {},

            onWooAffiliateEvent: function (product_id) {},

            onWooPayPalEvent: function (event) {},

            onEddAddToCartOnButtonEvent: function (download_id, price_index, qty) {},

            onEddRemoveFromCartEvent: function (item) {},
            onPageScroll: function (event) {},
            onTime: function (event) {

            },
        }

    }();

    var Utils = function (options) {


        var Pinterest = dummyPinterest;

        var Bing = dummyBing;

        var gtag_loaded = false;



        function loadPixels() {

            if (!options.gdpr.all_disabled_by_api) {

                if (!options.gdpr.facebook_disabled_by_api) {
                    Facebook.loadPixel();
                }

                if (!options.gdpr.analytics_disabled_by_api) {
                    Analytics.loadPixel();
                }

                if (!options.gdpr.google_ads_disabled_by_api) {
                    GAds.loadPixel();
                }

                if (!options.gdpr.pinterest_disabled_by_api) {
                    Pinterest.loadPixel();
                }

                if (!options.gdpr.bing_disabled_by_api) {
                    Bing.loadPixel();
                }

            }

        }

        /**
         * WATCHVIDEO UTILS
         */

        function isJSApiAttrEnabled(url) {
            return url.indexOf('enablejsapi') > -1;
        }

        function isOriginAttrEnabled(url) {
            return url.indexOf('origin') > -1;
        }

        // Returns key/value pairs of percentages: number of seconds to achieve
        function getVideoCompletionMarks(duration) {

            var marks = {};
            var points = [0, 10, 50, 90, 100];

            for (var i = 0; i < points.length; i++) {

                var _point = points[i];
                var _mark = _point + '%';
                var _time = duration * _point / 100;

                if (_point === 100) {
                    _time = _time - 1;
                }

                // 10% => 123
                marks[_mark] = Math.floor(_time);

            }

            return marks;

        }

        // Determine if the element is a YouTube video or not
        function tagIsYouTubeVideo(tag) {
            var src = tag.src || '';
            return src.indexOf('youtube.com/embed/') > -1 || src.indexOf('youtube.com/v/') > -1;
        }

        // Turn embed objects into iframe objects and ensure they have the right parameters
        function normalizeYouTubeIframe(tag) {

            var loc = window.location;
            var a = document.createElement('a');
            a.href = tag.src;
            a.hostname = 'www.youtube.com';
            a.protocol = loc.protocol;
            var tmpPathname = a.pathname.charAt(0) === '/' ? a.pathname : '/' + a.pathname; // IE10 shim

            if (!isJSApiAttrEnabled(a.search)) {
                a.search = (a.search.length > 0 ? a.search + '&' : '') + 'enablejsapi=1';
            }

            // for security reasons, YouTube wants an origin parameter set that matches our hostname
            if (!isOriginAttrEnabled(a.search) && loc.hostname.indexOf('localhost') === -1) {

                var port = loc.port ? ':' + loc.port : '';
                var origin = loc.protocol + '%2F%2F' + loc.hostname + port;

                a.search = a.search + '&origin=' + origin;

            }

            if (tag.type === 'application/x-shockwave-flash') {

                var newIframe = document.createElement('iframe');
                newIframe.height = tag.height;
                newIframe.width = tag.width;
                tmpPathname = tmpPathname.replace('/v/', '/embed/');

                tag.parentNode.parentNode.replaceChild(newIframe, tag.parentNode);

                tag = newIframe;

            }

            a.pathname = tmpPathname;

            if (tag.src !== a.href + a.hash) {
                tag.src = a.href + a.hash;
            }

            return tag;

        }

        // Add event handlers for events emitted by the YouTube API
        function addYouTubeEvents(iframe) {

            var player = YT.get(iframe.id);

            if (!player) {
                player = new YT.Player(iframe, {});
            }

            if (typeof iframe.pauseFlag === 'undefined') {

                iframe.pauseFlag = false;
                player.addEventListener('onStateChange', function (evt) {
                    onYouTubePlayerStateChange(evt, iframe);
                });

            }

        }

        // Event handler for events emitted from the YouTube API
        function onYouTubePlayerStateChange(evt, iframe) {

            var stateIndex = evt.data;
            var player = evt.target;
            var targetVideoUrl = player.getVideoUrl();
            var targetVideoId = targetVideoUrl.match(/[?&]v=([^&#]*)/)[1]; // Extract the ID
            var playerState = player.getPlayerState();
            var marks = getVideoCompletionMarks(player.getDuration());

            iframe.playTracker = iframe.playTracker || {};

            if (playerState === YT.PlayerState.PLAYING && !iframe.timer) {

                clearInterval(iframe.timer);

                // check every second to see if we've hit any of our percentage viewed marks
                iframe.timer = setInterval(function () {
                    checkYouTubeCompletion(player, marks, iframe.videoId);
                }, 1000);

            } else {

                clearInterval(iframe.timer);
                iframe.timer = false;

            }

            // playlist edge-case handler
            if (stateIndex === YT.PlayerState.PLAYING) {
                iframe.playTracker[targetVideoId] = true;
                iframe.videoId = targetVideoId;
                iframe.pauseFlag = false;
            }

            if (!iframe.playTracker[iframe.videoId]) {
                return false; // this video hasn't started yet, so this is spam
            }

            if (stateIndex === YT.PlayerState.PAUSED) {

                if (!iframe.pauseFlag) {
                    iframe.pauseFlag = true;
                } else {
                    return false; // we don't want to fire consecutive pause events
                }

            }

        }

        // Trigger event if YouTube video mark was reached
        function checkYouTubeCompletion(player, marks, videoId) {

            var currentTime = player.getCurrentTime();

            player[videoId] = player[videoId] || {};

            for (var key in marks) {

                if (marks[key] <= currentTime && !player[videoId][key]) {
                    player[videoId][key] = true;

                    var data = player.getVideoData();

                    if (key === '0%') {
                        key = 'play';
                    }

                    var params = {
                        video_type: 'youtube',
                        video_id: videoId,
                        video_title: data.title,
                    };

                    var pixels = Object.keys(options.dynamicEvents.signal_watch_video);

                    for(var i = 0;i<pixels.length;i++) {
                        var event = Utils.clone( options.dynamicEvents.signal_watch_video[pixels[i]]);
                        event.params.event_action += key
                        Utils.copyProperties(params,event.params)
                        Utils.copyProperties(Utils.getRequestParams(), event.params);
                        getPixelBySlag(pixels[i]).onWatchVideo(event);
                    }

                    if(key == "play") {

                        $.each(options.triggerEventTypes, function (triggerType, events) {
                            $.each(events, function (eventId, triggers) {
                                switch (triggerType) {
                                    case 'video_play':
                                        Utils.fireTriggerEvent(eventId);
                                        break;
                                }

                            });
                        });
                    }

                }

            }

        }

        // Determine if the element is a Vimeo video or not
        function tagIsVimeoVideo(tag) {
            var src = tag.src || '';
            return src.indexOf('player.vimeo.com/video/') > -1;
        }

        // Trigger event if Vimeo video mark was reached
        function checkVimeoCompletion(player) {

            player.getCurrentTime().then(function (seconds) {

                for (var key in player.pysMarks) {

                    if (player.pysMarks[key] <= seconds && !player.pysCompletedMarks[key]) {

                        player.pysCompletedMarks[key] = true;

                        if (key === '0%') {
                            key = 'play';
                        }

                        var params = {
                            video_type: 'vimeo',
                            video_id: player.pysVideoId,
                            video_title: player.pysVideoTitle,
                        };

                        var pixels = Object.keys(options.dynamicEvents.signal_watch_video);
                        for(var i = 0;i<pixels.length;i++) {
                            var event = Utils.clone(options.dynamicEvents.signal_watch_video[pixels[i]]);
                            event.params.event_action += key
                            Utils.copyProperties( params,event.params,);
                            Utils.copyProperties(Utils.getRequestParams(), event.params);
                            getPixelBySlag(pixels[i]).onWatchVideo(event);
                        }

                        if(key == "play") {
                            $.each(options.triggerEventTypes, function (triggerType, events) {
                                $.each(events, function (eventId, triggers) {
                                    switch (triggerType) {
                                        case 'video_play':
                                            Utils.fireTriggerEvent(eventId);
                                            break;
                                    }

                                });
                            });
                        }
                    }

                }

            });

        }

        /**
         * COOKIES UTILS
         */

        var utmTerms = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'];

        var requestParams = [];

        function validateEmail(email) {
            var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            return re.test(email);
        }

        function getTrafficSource() {

            try {

                var referrer = document.referrer.toString(),
                    source;

                var direct = referrer.length === 0;
                var internal = direct ? false : referrer.indexOf(options.siteUrl) === 0;
                var external = !direct && !internal;
                var cookie = typeof Cookies.get('pysTrafficSource') === 'undefined' ? false : Cookies.get('pysTrafficSource');

                if (external === false) {
                    source = cookie ? cookie : 'direct';
                } else {
                    source = cookie && cookie === referrer ? cookie : referrer;
                }

                if (source !== 'direct') {

                    var url = document.createElement('a');
                    url.href = source;

                    // leave only domain (Issue #70)
                    return url.hostname;

                } else {
                    return source;
                }

            } catch (e) {
                console.error(e);
                return 'direct';
            }

        }

        /**
         * Return query variables object with where property name is query variable
         * and property value is query variable value.
         */
        function getQueryVars() {

            try {

                var result = {},
                    tmp = [];

                window.location.search
                    .substr(1)
                    .split("&")
                    .forEach(function (item) {

                        tmp = item.split('=');

                        if (tmp.length > 1) {
                            result[tmp[0]] = tmp[1];
                        }

                    });

                return result;

            } catch (e) {
                console.error(e);
                return {};
            }

        }

        function getLandingPage() {
            if(Cookies.get('pys_landing_page') === 'undefined') {
                return "";
            } else {
                return Cookies.get('pys_landing_page');
            }
        }

        /**
         * Return UTM terms from request query variables or from cookies.
         */
        function getUTMs() {

            try {

                var terms = [];
                var queryVars = getQueryVars();

                $.each(utmTerms, function (index, name) {

                    var value;

                    if (Cookies.get('pys_' + name)) {
                        value = Cookies.get('pys_' + name);
                        // do not allow email in request params (Issue #70)
                        terms[name] = filterEmails(value);
                    } else if (queryVars.hasOwnProperty(name)) {
                        value = queryVars[name];
                        // do not allow email in request params (Issue #70)
                        terms[name] = filterEmails(value);
                    }

                });

                return terms;

            } catch (e) {
                console.error(e);
                return [];
            }

        }

        function getDateTime() {
            var dateTime = new Array();
            var date = new Date(),
                days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
                months = ['January', 'February', 'March', 'April', 'May', 'June',
                    'July', 'August', 'September', 'October', 'November', 'December'
                ],
                hours = ['00-01', '01-02', '02-03', '03-04', '04-05', '05-06', '06-07', '07-08',
                    '08-09', '09-10', '10-11', '11-12', '12-13', '13-14', '14-15', '15-16', '16-17',
                    '17-18', '18-19', '19-20', '20-21', '21-22', '22-23', '23-24'
                ];
            dateTime.push(hours[date.getHours()]);
            dateTime.push(days[date.getDay()]);
            dateTime.push(months[date.getMonth()]);
            return dateTime;
        }

        function filterEmails(value) {
            return validateEmail(value) ? undefined : value;
        }

        /**
         * PUBLIC API
         */
        return {

            PRODUCT_SIMPLE : 0,
            PRODUCT_VARIABLE : 1,
            PRODUCT_BUNDLE : 2,
            PRODUCT_GROUPED : 3,

             fireEventForAllPixel:function(functionName,events){
                if (events.hasOwnProperty(Facebook.tag()))
                    Facebook[functionName](events[Facebook.tag()]);
                if (events.hasOwnProperty(Analytics.tag()))
                    Analytics[functionName](events[Analytics.tag()]);
                if (events.hasOwnProperty(GAds.tag()))
                    GAds[functionName](events[GAds.tag()]);
                if (events.hasOwnProperty(Pinterest.tag()))
                    Pinterest[functionName](events[Pinterest.tag()]);
                if (events.hasOwnProperty(Bing.tag()))
                    Bing[functionName](events[Bing.tag()]);
            },

            getQueryValue:function (name){
                return getQueryVars()[name];
            },

            filterEmails: function (value) {
                return filterEmails(value);
            },

            setupPinterestObject: function () {
                Pinterest = window.pys.Pinterest || Pinterest;
                return Pinterest;
            },

            setupBingObject: function () {
                Bing = window.pys.Bing || Bing;
                return Bing;
            },

            // Clone all object members to another and return it
            copyProperties: function (from, to) {
                for (var key in from) {
                    if("function" == typeof from[key]) {
                        continue;
                    }
                    to[key] = from[key];
                }
                return to;
            },

            clone: function(obj) {
                var copy;

                // Handle the 3 simple types, and null or undefined
                if (null == obj || "object" != typeof obj) return obj;

                // Handle Date
                if (obj instanceof Date) {
                    copy = new Date();
                    copy.setTime(obj.getTime());
                    return copy;
                }

                // Handle Array
                if (obj instanceof Array) {
                    copy = [];
                    for (var i = 0, len = obj.length; i < len; i++) {
                        if("function" == typeof obj[i]) {
                            continue;
                        }
                        copy[i] = Utils.clone(obj[i]);
                    }
                    return copy;
                }

                // Handle Object
                if (obj instanceof Object) {
                    copy = {};
                    for (var attr in obj) {
                        if (obj.hasOwnProperty(attr)) {
                            if("function" == typeof obj[attr]) {
                                continue;
                            }
                            copy[attr] = Utils.clone(obj[attr]);
                        }
                    }
                    return copy;
                }

                return obj;
            },

            // Returns array of elements with given tag name
            getTagsAsArray: function (tag) {
                return [].slice.call(document.getElementsByTagName(tag));
            },

            /**
             * Load and initialize YouTube API
             *
             * @link: https://developers.google.com/youtube/iframe_api_reference
             */
            initYouTubeAPI: function () {

                // maybe load YouTube JS API
                if (typeof window.YT === 'undefined') {
                    var tag = document.createElement('script');
                    tag.src = '//www.youtube.com/iframe_api';
                    var firstScriptTag = document.getElementsByTagName('script')[0];
                    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
                }

                // initialize when API is ready
                window.onYouTubeIframeAPIReady = function () {

                    // collect all possible YouTube tags
                    var potentialVideos = Utils.getTagsAsArray('iframe').concat(Utils.getTagsAsArray('embed'));

                    // turn videos into trackable videos with events
                    for (var i = 0; i < potentialVideos.length; i++) {
                        if (tagIsYouTubeVideo(potentialVideos[i])) {
                            var iframe = normalizeYouTubeIframe(potentialVideos[i]);
                            addYouTubeEvents(iframe);
                        }
                    }

                    // bind to dynamically added videos
                    $(document).on("load",function () {
                        var el = evt.target || evt.srcElement;
                        var isYT = checkIfYouTubeVideo(el);

                        // We only bind to iFrames with a YouTube URL with the enablejsapi=1 and
                        // origin=<<hostname>> parameters
                        if (el.tagName === 'IFRAME' && isYT && isJSApiAttrEnabled(el.src) && isOriginAttrEnabled(el.src)) {
                            addYouTubeEvents(el);
                        }
                    });

                };

            },

            /**
             * Load and initialize Vimeo API
             *
             * @link: https://github.com/vimeo/player.js
             */
            initVimeoAPI: function () {

                $(document).ready(function () {

                    var potentialVideos = Utils.getTagsAsArray('iframe').concat(Utils.getTagsAsArray('embed'));

                    for (var i = 0; i < potentialVideos.length; i++) {

                        if (!tagIsVimeoVideo(potentialVideos[i])) {
                            continue;
                        }

                        var player = new Vimeo.Player(potentialVideos[i]);

                        player.getDuration().then(function (pl,seconds) {
                            pl.pysMarks = getVideoCompletionMarks(seconds);
                        }.bind(null,player));

                        player.getVideoTitle().then(function (pl,title) {
                            pl.pysVideoTitle = title;
                        }.bind(null,player));

                        player.getVideoId().then(function (pl,id) {
                            pl.pysVideoId = id;
                        }.bind(null,player));

                        player.pysCompletedMarks = {};

                        player.on('play', function () {

                            if (this.pysTimer) {
                                return;
                            }

                            clearInterval(this.pysTimer);

                            var player = this;

                            this.pysTimer = setInterval(function () {
                                checkVimeoCompletion(player);
                            }, 1000);

                        });

                        player.on('pause', function () {
                            clearInterval(this.pysTimer);
                            this.pysTimer = false;
                        });

                        player.on('ended', function () {
                            clearInterval(this.pysTimer);
                            this.pysTimer = false;
                        });

                    }

                });

            },

            manageCookies: function () {

                try {

                    var expires = 0.5; // half day
                    var source = getTrafficSource();

                    // manage traffic source cookie
                    if (source !== 'direct') {
                        Cookies.set('pysTrafficSource', source, { expires: expires });
                    } else {
                        Cookies.remove('pysTrafficSource');
                    }

                    var queryVars = getQueryVars();

                    // manage utm cookies
                    $.each(utmTerms, function (index, name) {

                        if (Cookies.get('pys_' + name) === undefined && queryVars.hasOwnProperty(name)) {
                            Cookies.set('pys_' + name, queryVars[name], { expires: expires });
                        }

                    });

                    // manage landing cookies
                    if(Cookies.get('pys_landing_page') === undefined){
                        var landing = window.location.href;
                        Cookies.set('pys_landing_page',landing);
                    }

                } catch (e) {
                    console.error(e);
                }

            },

            initializeRequestParams: function () {

                if (options.trackTrafficSource) {
                    requestParams.traffic_source = getTrafficSource();
                }

                if (options.trackUTMs) {

                    var utms = getUTMs();

                    $.each(utmTerms, function (index, term) {
                        if (term in utms) {
                            requestParams[term] = utms[term];
                        }
                    });

                }


                var dateTime = getDateTime();
                requestParams.event_time = dateTime[0];
                requestParams.event_day = dateTime[1];
                requestParams.event_month = dateTime[2];
                if(options.enable_lading_page_param)
                    requestParams.landing_page = getLandingPage();

            },

            getRequestParams: function () {
                return requestParams;
            },

            /**
             * DOWNLOAD DOCS
             */

            getLinkExtension: function (link) {

                // Remove anchor, query string and everything before last slash
                link = link.substring(0, (link.indexOf("#") === -1) ? link.length : link.indexOf("#"));
                link = link.substring(0, (link.indexOf("?") === -1) ? link.length : link.indexOf("?"));
                link = link.substring(link.lastIndexOf("/") + 1, link.length);

                // If there's a period left in the URL, then there's a extension
                if (link.length > 0 && link.indexOf('.') !== -1) {
                    link = link.substring(link.indexOf(".") + 1); // Remove everything but what's after the first period
                    return link;
                } else {
                    return "";
                }
            },

            getLinkFilename: function (link) {

                // Remove anchor, query string and everything before last slash
                link = link.substring(0, (link.indexOf("#") === -1) ? link.length : link.indexOf("#"));
                link = link.substring(0, (link.indexOf("?") === -1) ? link.length : link.indexOf("?"));
                link = link.substring(link.lastIndexOf("/") + 1, link.length);

                // If there's a period left in the URL, then there's a extension
                if (link.length > 0 && link.indexOf('.') !== -1) {
                    return link;
                } else {
                    return "";
                }
            },

            /**
             * CUSTOM EVENTS
             */

            setupMouseOverClickEvents: function (eventId, triggers) {

                // Non-default binding used to avoid situations when some code in external js
                // stopping events propagation, eg. returns false, and our handler will never called
                $(document).onFirst('mouseover', triggers.join(','), function () {

                    // do not fire event multiple times
                    if ($(this).hasClass('pys-mouse-over-' + eventId)) {
                        return true;
                    } else {
                        $(this).addClass('pys-mouse-over-' + eventId);
                    }

                    Utils.fireTriggerEvent(eventId);

                });

            },

            setupCSSClickEvents: function (eventId, triggers) {

                // Non-default binding used to avoid situations when some code in external js
                // stopping events propagation, eg. returns false, and our handler will never called

                $(triggers.join(',')).onFirst('click',  function () {
                    Utils.fireTriggerEvent(eventId);
                });

            },

            setupURLClickEvents: function () {

                // Non-default binding used to avoid situations when some code in external js
                // stopping events propagation, eg. returns false, and our handler will never called
                $('a[data-pys-event-id]').onFirst('click', function (evt) {

                    $(this).attr('data-pys-event-id').split(',').forEach(function (eventId) {

                        eventId = parseInt(eventId);

                        if (isNaN(eventId) === false) {
                            Utils.fireTriggerEvent(eventId);
                        }

                    });

                });

            },

            setupScrollPosEvents: function (eventId, triggers) {

                var scrollPosThresholds = {},
                    docHeight = $(document).height() - $(window).height();

                // convert % to absolute positions
                $.each(triggers, function (index, scrollPos) {

                    // convert % to pixels
                    scrollPos = docHeight * scrollPos / 100;
                    scrollPos = Math.round(scrollPos);

                    scrollPosThresholds[scrollPos] = eventId;

                });

                $(document).on("scroll",function () {

                    var scrollPos = $(window).scrollTop();

                    $.each(scrollPosThresholds, function (threshold, eventId) {

                        // position has not reached yes
                        if (scrollPos <= threshold) {
                            return true;
                        }

                        // fire event only once
                        if (eventId === null) {
                            return true;
                        } else {
                            scrollPosThresholds[threshold] = null;
                        }

                        Utils.fireTriggerEvent(eventId);

                    });

                });

            },
            setupCommentEvents : function (eventId,triggers) {
                $('form.comment-form').on("submit",function () {
                    Utils.fireTriggerEvent(eventId);
                });
            },
            /**
             * Events
             */

            isEventInTimeWindow: function (eventName, event, prefix) {

                if(event.hasOwnProperty("hasTimeWindow") && event.hasTimeWindow) {
                    var cookieName = prefix+"_"+eventName;
                    var now = new Date().getTime();

                    if(Cookies.get(cookieName) !== undefined) {

                        var lastTimeFire = Cookies.get(cookieName);
                        var fireTime = event.timeWindow * 60*60*1000;

                        if( now - lastTimeFire > fireTime) {
                            Cookies.set(cookieName,now, { expires: event.timeWindow / 24.0} );
                        } else {
                            return false;
                        }
                    } else {
                        Cookies.set(cookieName,now, { expires: event.timeWindow / 24.0} );
                    }
                }
                return true
            },

            fireTriggerEvent: function (eventId) {

                if (!options.triggerEvents.hasOwnProperty(eventId)) {
                    return;
                }

                var event = {};
                var events = options.triggerEvents[eventId];

                if (events.hasOwnProperty('facebook')) {
                    event = events.facebook;
                    if(Utils.isEventInTimeWindow(event.name,event,"dyn_facebook_"+eventId)) {
                        Facebook.fireEvent(event.name, event);
                    }
                }

                if (events.hasOwnProperty('ga')) {
                    event = events.ga;
                    if(Utils.isEventInTimeWindow(event.name,event,"dyn_ga_"+eventId)) {
                        Analytics.fireEvent(event.name, event);
                    }
                }

                if (events.hasOwnProperty('google_ads')) {
                    event = events.google_ads;
                    if(Utils.isEventInTimeWindow(event.name,event,"dyn_google_ads_"+eventId)) {
                        GAds.fireEvent(event.name, event);
                    }
                }

                if (events.hasOwnProperty('pinterest')) {
                    event = events.pinterest;
                    if(Utils.isEventInTimeWindow(event.name,event,"dyn_pinterest_"+eventId)) {
                        Pinterest.fireEvent(event.name, event);;
                    }
                }

                if (events.hasOwnProperty('bing')) {
                    event = events.bing;
                    if(Utils.isEventInTimeWindow(event.name,event,"dyn_bing_"+eventId)) {
                        Bing.fireEvent(event.name, event);;
                    }
                }

            },

            isFirstPurchaseFire: function ($eventName,orderId,pixel) {

                if(Cookies.get("pys_"+$eventName+"_order_id_"+pixel) == orderId) {
                    return false;
                } else {
                    Cookies.set("pys_"+$eventName+"_order_id_"+pixel, orderId, { expires: 1 });
                }
                return true;
            },

            fireStaticEvents: function (pixel) {

                if (options.staticEvents.hasOwnProperty(pixel)) {

                    $.each(options.staticEvents[pixel], function (eventId, events) {

                        //skip purchase event if this order was fired
                        if( options.woo.hasOwnProperty('woo_purchase_on_transaction') &&
                            options.woo.woo_purchase_on_transaction &&
                            (eventId === "woo_purchase" || eventId === "woo_purchase_category") ) {
                            if(!Utils.isFirstPurchaseFire(eventId,events[0].woo_order,pixel)) {
                                return;
                            }
                        }

                        if( options.edd.hasOwnProperty('edd_purchase_on_transaction') &&
                            options.edd.edd_purchase_on_transaction &&
                            (eventId === "edd_purchase" || eventId === "edd_purchase_category") ) {
                            if(!Utils.isFirstPurchaseFire(eventId,events[0].edd_order,pixel)) {
                                return;
                            }
                        }


                        $.each(events, function (index, event) {

                            event.fired = event.fired || false;

                            if (!event.fired && Utils.isEventInTimeWindow(event.name,event,'static_' + pixel+"_")) {


                                var fired = false;

                                // fire event
                                if ('facebook' === pixel) {
                                    fired = Facebook.fireEvent(event.name, event);
                                } else if ('ga' === pixel) {
                                    fired = Analytics.fireEvent(event.name, event);
                                } else if ('google_ads' === pixel) {
                                    fired = GAds.fireEvent(event.name, event);
                                } else if ('pinterest' === pixel) {
                                    fired = Pinterest.fireEvent(event.name, event);
                                } else if ('bing' === pixel) {
                                    fired = Bing.fireEvent(event.name, event);
                                }

                                // prevent event double event firing
                                event.fired = fired;
                            }

                        });
                    });

                }

            },

            /**
             * Load tag's JS
             *
             * @link: https://developers.google.com/analytics/devguides/collection/gtagjs/
             * @link: https://developers.google.com/analytics/devguides/collection/gtagjs/custom-dims-mets
             */
            loadGoogleTag: function (id) {

                if (!gtag_loaded) {

                    (function (window, document, src) {
                        var a = document.createElement('script'),
                            m = document.getElementsByTagName('script')[0];
                        a.async = 1;
                        a.src = src;
                        m.parentNode.insertBefore(a, m);
                    })(window, document, '//www.googletagmanager.com/gtag/js?id=' + id);

                    window.dataLayer = window.dataLayer || [];
                    window.gtag = window.gtag || function gtag() {
                        dataLayer.push(arguments);
                    };

                    gtag('js', new Date());

                    gtag_loaded = true;

                }

            },

            /**
             * GDPR
             */

            loadPixels: function () {

                if (options.gdpr.ajax_enabled) {

                    // retrieves actual PYS GDPR filters values which allow to avoid cache issues
                    $.get({
                        url: options.ajaxUrl,
                        dataType: 'json',
                        data: {
                            action: 'pys_get_gdpr_filters_values'
                        },
                        success: function (res) {

                            if (res.success) {

                                options.gdpr.all_disabled_by_api = res.data.all_disabled_by_api;
                                options.gdpr.facebook_disabled_by_api = res.data.facebook_disabled_by_api;
                                options.gdpr.analytics_disabled_by_api = res.data.analytics_disabled_by_api;
                                options.gdpr.google_ads_disabled_by_api = res.data.google_ads_disabled_by_api;
                                options.gdpr.pinterest_disabled_by_api = res.data.pinterest_disabled_by_api;
                                options.gdpr.bing_disabled_by_api = res.data.bing_disabled_by_api;

                            }

                            loadPixels();

                        }
                    });

                } else {
                    loadPixels();
                }

            },

            consentGiven: function (pixel) {

                /**
                 * Cookiebot
                 */
                if (options.gdpr.cookiebot_integration_enabled && typeof Cookiebot !== 'undefined') {

                    var cookiebot_consent_category = options.gdpr['cookiebot_' + pixel + '_consent_category'];

                    if (options.gdpr[pixel + '_prior_consent_enabled']) {
                        if (Cookiebot.consented === false || Cookiebot.consent[cookiebot_consent_category]) {
                            return true;
                        }
                    } else {
                        if (Cookiebot.consent[cookiebot_consent_category]) {
                            return true;
                        }
                    }

                    return false;

                }

                /**
                 * Ginger – EU Cookie Law
                 */
                if (options.gdpr.ginger_integration_enabled) {

                    var ginger_cookie = Cookies.get('ginger-cookie');

                    if (options.gdpr[pixel + '_prior_consent_enabled']) {
                        if (typeof ginger_cookie === 'undefined' || ginger_cookie === 'Y') {
                            return true;
                        }
                    } else {
                        if (ginger_cookie === 'Y') {
                            return true;
                        }
                    }

                    return false;

                }

                /**
                 * Cookie Notice
                 */
                if (options.gdpr.cookie_notice_integration_enabled && typeof cnArgs !== 'undefined') {

                    var cn_cookie = Cookies.get(cnArgs.cookieName);

                    if (options.gdpr[pixel + '_prior_consent_enabled']) {
                        if (typeof cn_cookie === 'undefined' || cn_cookie === 'true') {
                            return true;
                        }
                    } else {
                        if (cn_cookie === 'true') {
                            return true;
                        }
                    }

                    return false;

                }

                /**
                 * Cookie Law Info
                 */
                if (options.gdpr.cookie_law_info_integration_enabled) {

                    var cli_cookie = Cookies.get('viewed_cookie_policy');

                    if (options.gdpr[pixel + '_prior_consent_enabled']) {
                        if (typeof cli_cookie === 'undefined' || cli_cookie === 'yes') {
                            return true;
                        }
                    } else {
                        if (cli_cookie === 'yes') {
                            return true;
                        }
                    }

                    return false;

                }

                return true;

            },

            setupGdprCallbacks: function () {

                /**
                 * Cookiebot
                 */
                if (options.gdpr.cookiebot_integration_enabled && typeof Cookiebot !== 'undefined') {

                    Cookiebot.onaccept = function () {

                        if (Cookiebot.consent[options.gdpr.cookiebot_facebook_consent_category]) {
                            Facebook.loadPixel();
                        }

                        if (Cookiebot.consent[options.gdpr.cookiebot_analytics_consent_category]) {
                            Analytics.loadPixel();
                        }

                        if (Cookiebot.consent[options.gdpr.cookiebot_google_ads_consent_category]) {
                            GAds.loadPixel();
                        }

                        if (Cookiebot.consent[options.gdpr.cookiebot_pinterest_consent_category]) {
                            Pinterest.loadPixel();
                        }

                        if (Cookiebot.consent[options.gdpr.cookiebot_bing_consent_category]) {
                            Bing.loadPixel();
                        }

                    };

                    Cookiebot.ondecline = function () {
                        Facebook.disable();
                        Analytics.disable();
                        GAds.disable();
                        Pinterest.disable();
                        Bing.disable();
                    };

                }

                /**
                 * Cookie Notice
                 */
                if (options.gdpr.cookie_notice_integration_enabled) {

                    $(document).onFirst('click', '.cn-set-cookie', function () {

                        if ($(this).data('cookie-set') === 'accept') {
                            Facebook.loadPixel();
                            Analytics.loadPixel();
                            GAds.loadPixel();
                            Pinterest.loadPixel();
                            Bing.loadPixel();
                        } else {
                            Facebook.disable();
                            Analytics.disable();
                            GAds.disable();
                            Pinterest.disable();
                            Bing.disable();
                        }

                    });

                    $(document).onFirst('click', '.cn-revoke-cookie', function () {
                        Facebook.disable();
                        Analytics.disable();
                        GAds.disable();
                        Pinterest.disable();
                        Bing.disable();
                    });

                }

                /**
                 * Cookie Law Info
                 */
                if (options.gdpr.cookie_law_info_integration_enabled) {

                    $(document).onFirst('click', '#cookie_action_close_header', function () {
                        Facebook.loadPixel();
                        Analytics.loadPixel();
                        GAds.loadPixel();
                        Pinterest.loadPixel();
                        Bing.loadPixel();
                    });

                    $(document).onFirst('click', '#cookie_action_close_header_reject', function () {
                        Facebook.disable();
                        Analytics.disable();
                        GAds.disable();
                        Pinterest.disable();
                        Bing.disable();
                    });

                }

            },

            /**
             * Enrich
             */
            isCheckoutPage: function () {
                return $('body').hasClass('woocommerce-checkout') ||
                    $('body').hasClass('edd-checkout');
            },
            fillCheckoutFields : function() {
                $("#pys_source_field input").val(getTrafficSource())
                var utm = "";
                var utms = getUTMs()
                $.each(utmTerms, function (index, name) {
                    if(index > 0) {
                        utm+="|";
                    }
                    utm+=name+":"+utms[name];
                });

                $("#pys_utm_field input").val(utm);

                var dateTime = getDateTime();
                $("#pys_browser_time_field input").val(dateTime.join("|"))

                var landing = Cookies.get('pys_landing_page');
                $("#pys_landing_field input").val(landing);
            }
        };

    }(options);

    var Facebook = function (options) {

        var defaultEventTypes = [
            'PageView',
            'ViewContent',
            'Search',
            'AddToCart',
            'AddToWishlist',
            'InitiateCheckout',
            'AddPaymentInfo',
            'Purchase',
            'Lead',

            'Subscribe',
            'CustomizeProduct',
            'FindLocation',
            'StartTrial',
            'SubmitApplication',
            'Schedule',
            'Contact',
            'Donate'
        ];

        var initialized = false;
        var configuredPixels = new Array();
        function fireEvent(name, event) {

            var data = event.params;
            var ids = event.pixelIds;
            var actionType = defaultEventTypes.includes(name) ? 'trackSingle' : 'trackSingleCustom';

            var params = {};
            var args = {};
            Utils.copyProperties(data, params);
            Utils.copyProperties(Utils.getRequestParams(), params);

            if(options.facebook.serverApiEnabled) {



                if(event.e_id === "woo_add_to_cart_on_button_click" ) {
                    Facebook.updateEventId(event.name);
                    event.eventID = Facebook.getEventId(event.name);
                } else {
                    var isApiDisabled = options.gdpr.all_disabled_by_api ||
                        options.gdpr.facebook_disabled_by_api ||
                        options.gdpr.cookiebot_integration_enabled ||
                        options.gdpr.ginger_integration_enabled ||
                        options.gdpr.cookie_notice_integration_enabled ||
                        options.gdpr.cookie_law_info_integration_enabled;
                    // Update eventID
                    if( options.facebook.ajaxForServerEvent || event.type !== "static") {
                        event.eventID = pys_generate_token(36);
                    }

                    // send event from server if they was bloc by gdpr or need send with delay
                    if( options.facebook.ajaxForServerEvent || isApiDisabled || event.delay > 0 || event.type !== "static" ){

                        var json = {
                            action: 'pys_api_event',
                            pixel: 'facebook',
                            event: name,
                            ids: ids,
                            data:data,
                            eventID:event.eventID,
                        };

                        if(event.hasOwnProperty('woo_order')) {
                            json['woo_order'] = event.woo_order;
                        }

                        if(event.hasOwnProperty('edd_order')) {
                            json['edd_order'] = event.edd_order;
                        }

                        jQuery.ajax( {
                            type: 'POST',
                            url: options.ajaxUrl,
                            data: json,
                            headers: {
                                'Cache-Control': 'no-cache'
                            },
                            success: function(){},
                        });
                    }

                    if( name == "CompleteRegistration" && options.facebook.wooCRSendFromServer ) {
                        return;
                    }
                }



                // add eventID for deduplicate events @see https://developers.facebook.com/docs/marketing-api/conversions-api/deduplicate-pixel-and-server-events/
                if(event.hasOwnProperty('eventID')) {
                    args.eventID = event.eventID;
                }
            }

            if (options.debug) {
                console.log('[Facebook] ' + name, params,"pixel_ids",ids,"eventID",event.eventID);
            }
            // fire event for each pixel id
            ids.forEach(function (pixelId) {
                Facebook.maybeInitPixel(pixelId);
                fbq(actionType,pixelId, name, params,args);
            });

        }

        /**
         * Public API
         */
        return {
            tag: function() {
              return "facebook";
            },
            isEnabled: function () {
                return options.hasOwnProperty('facebook');
            },

            initEventIdCookies: function () {
                var ids = {
                    'AddToCart':pys_generate_token(36)
                };
                Cookies.set('pys_fb_event_id', ids);
            },

            updateEventId:function(key) {
                var data = JSON.parse(Cookies.get("pys_fb_event_id"));
                if(data === undefined) {
                    this.initEventIdCookies();
                } else {
                    data[key] = pys_generate_token(36);
                    Cookies.set('pys_fb_event_id', data);
                }
            },

            getEventId:function (key) {
                var data = Cookies.get("pys_fb_event_id");
                if(data === undefined) {
                    this.initEventIdCookies();
                    data = Cookies.get("pys_fb_event_id");
                }
                return JSON.parse(data)[key];
            },

            disable: function () {
                initialized = false;
            },

            /**
             * Load pixel's JS
             */
            loadPixel: function () {

                if (initialized || !this.isEnabled() || !Utils.consentGiven('facebook')) {
                    return;
                }
                this.initEventIdCookies();
                ! function (f, b, e, v, n, t, s) {
                    if (f.fbq) return;
                    n = f.fbq = function () {
                        n.callMethod ?
                            n.callMethod.apply(n, arguments) : n.queue.push(arguments)
                    };
                    if (!f._fbq) f._fbq = n;
                    n.push = n;
                    n.loaded = !0;
                    n.version = '2.0';
                    n.agent = 'dvpixelyoursite';
                    n.queue = [];
                    t = b.createElement(e);
                    t.async = !0;
                    t.src = v;
                    s = b.getElementsByTagName(e)[0];
                    s.parentNode.insertBefore(t, s)
                }(window,
                    document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');

                // initialize default pixel
                options.facebook.pixelIds.forEach(function (pixelId) {
                    Facebook.maybeInitPixel(pixelId);
                });
                initialized = true;

                Utils.fireStaticEvents('facebook');

            },
            maybeInitPixel: function(pixelId) {

                if(configuredPixels.includes(pixelId)) return;

                if (options.facebook.removeMetadata) {
                    fbq('set', 'autoConfig', false, pixelId);
                }
                if(options.facebook.advancedMatching.length === 0) {
                    fbq('init', pixelId);
                } else {
                    fbq('init', pixelId, options.facebook.advancedMatching);
                }
                configuredPixels.push(pixelId);
            },

            fireEvent: function (name, data) {

                if (!initialized || !this.isEnabled()) {
                    return false;
                }

                data.delay = data.delay || 0;
                data.params = data.params || {};

                if (data.delay === 0) {

                    fireEvent(name, data);

                } else {

                    setTimeout(function (name, params) {
                        fireEvent(name, params);
                    }, data.delay * 1000, name, data);

                }

                return true;

            },

            onAdSenseEvent: function (event) {
                this.fireEvent(event.name, event);
            },

            onClickEvent: function (event) {
                this.fireEvent(event.name, event);
            },

            onWatchVideo: function (event) {
                this.fireEvent(event.name, event);
            },

            onCommentEvent: function (event) {
                this.fireEvent(event.name, event);
            },

            onFormEvent: function (event) {
                this.fireEvent(event.name, event);
            },

            onDownloadEvent: function (event) {
                this.fireEvent(event.name, event);

            },

            onWooAddToCartOnButtonEvent: function (product_id) {
                if(!options.dynamicEvents.woo_add_to_cart_on_button_click.hasOwnProperty(this.tag()))
                    return;

                if (window.pysWooProductData.hasOwnProperty(product_id)) {
                    if (window.pysWooProductData[product_id].hasOwnProperty('facebook')) {

                        var event = Utils.clone(options.dynamicEvents.woo_add_to_cart_on_button_click[this.tag()])

                        // use pixels from current product
                        if(window.pysWooProductData[product_id]['facebook'].hasOwnProperty('pixelIds')) {
                            event.pixelIds = window.pysWooProductData[product_id].facebook.pixelIds;
                        }

                        Utils.copyProperties(window.pysWooProductData[product_id]['facebook']['params'], event.params)
                        this.fireEvent(event.name, event);
                    }
                }

            },

            onWooAddToCartOnSingleEvent: function (product_id, qty, product_type, is_external, $form) {

                window.pysWooProductData = window.pysWooProductData || [];
                if(!options.dynamicEvents.woo_add_to_cart_on_button_click.hasOwnProperty(this.tag()))
                    return;

                if (product_type === Utils.PRODUCT_VARIABLE && !options.facebook.wooVariableAsSimple) {
                    product_id = parseInt($form.find('input[name="variation_id"]').val());
                }

                if (window.pysWooProductData.hasOwnProperty(product_id)) {
                    if (window.pysWooProductData[product_id].hasOwnProperty('facebook')) {

                        var event = Utils.clone(options.dynamicEvents.woo_add_to_cart_on_button_click.facebook);



                        // use pixels from current product
                        if(window.pysWooProductData[product_id]['facebook'].hasOwnProperty('pixelIds')) {
                            event.pixelIds = window.pysWooProductData[product_id].facebook.pixelIds;
                        }

                        Utils.copyProperties(window.pysWooProductData[product_id]['facebook']['params'], event.params);

                        var groupValue = 0;
                        if(product_type === Utils.PRODUCT_GROUPED ) {
                            $form.find(".woocommerce-grouped-product-list .qty").each(function(index){
                                var childId = $(this).attr('name').replaceAll("quantity[","").replaceAll("]","");
                                var quantity = parseInt($(this).val());
                                if(isNaN(quantity)) {
                                    quantity = 0;
                                }
                                var childItem = window.pysWooProductData[product_id]['facebook'].grouped[childId];

                                if(quantity == 0) {
                                    event.params.content_ids.forEach(function(el,index,array) {
                                        if(el == childItem.content_id) {
                                            array.splice(index, 1);
                                        }
                                    });
                                }

                                if(event.params.hasOwnProperty('contents')) {
                                    event.params.contents.forEach(function(el,index,array) {
                                        if(el.id == childItem.content_id) {
                                            if(quantity > 0){
                                                el.quantity = quantity;
                                            } else {
                                                array.splice(index, 1);
                                            }
                                        }
                                    });
                                }


                                groupValue += childItem.price * quantity;
                            });
                            if(groupValue == 0) return; // skip if no items selected
                        }



                        // maybe customize value option
                        if (options.woo.addToCartOnButtonValueEnabled && options.woo.addToCartOnButtonValueOption !== 'global') {

                            if(product_type === Utils.PRODUCT_GROUPED) {
                                    event.params.value = groupValue;
                            } else if(product_type === Utils.PRODUCT_BUNDLE) {
                                var data = $(".bundle_form .bundle_data").data("bundle_form_data");
                                var items_sum = getBundlePriceOnSingleProduct(data);
                                event.params.value = (data.base_price+items_sum )* qty;
                            } else {
                                event.params.value = event.params.value * qty;
                            }
                        }

                        // only when non Facebook for WooCommerce logic used
                        if (event.params.hasOwnProperty('contents') && product_type !== Utils.PRODUCT_GROUPED) {
                            event.params.contents[0].quantity = qty;

                        }

                        var event_name = is_external ? options.woo.affiliateEventName : event.name;

                        this.fireEvent(event_name, event);

                    }
                }

            },

            onWooRemoveFromCartEvent: function (event) {
                this.fireEvent(event.name, event);
            },

            onWooAffiliateEvent: function (product_id) {
                if(!options.dynamicEvents.woo_affiliate.hasOwnProperty(this.tag()))
                    return;
                var event = Utils.clone(options.dynamicEvents.woo_affiliate[this.tag()]);


                if (window.pysWooProductData.hasOwnProperty(product_id)) {
                    if (window.pysWooProductData[product_id].hasOwnProperty('facebook')) {

                        Utils.copyProperties(window.pysWooProductData[product_id][this.tag()].params, event.params)
                        this.fireEvent(options.woo.affiliateEventName, event);

                    }
                }

            },

            onWooPayPalEvent: function (event) {
                this.fireEvent(event.name, event);
            },

            onEddAddToCartOnButtonEvent: function (download_id, price_index, qty) {
                if(!options.dynamicEvents.edd_add_to_cart_on_button_click.hasOwnProperty(this.tag()))
                    return;
                var event = Utils.clone(options.dynamicEvents.edd_add_to_cart_on_button_click[this.tag()]);

                if (window.pysEddProductData.hasOwnProperty(download_id)) {

                    var index;

                    if (price_index) {
                        index = download_id + '_' + price_index;
                    } else {
                        index = download_id;
                    }

                    if (window.pysEddProductData[download_id].hasOwnProperty(index)) {
                        if (window.pysEddProductData[download_id][index].hasOwnProperty('facebook')) {


                            Utils.copyProperties(window.pysEddProductData[download_id][index]['facebook']["params"], event.params)

                            // maybe customize value option
                            if (options.edd.addToCartOnButtonValueEnabled && options.edd.addToCartOnButtonValueOption !== 'global') {
                                event.params.value = event.params.value * qty;
                            }

                            // update contents qty param
                            var contents = event.params.contents;
                            contents[0].quantity = qty;
                            event.params.contents = JSON.stringify(contents);

                            this.fireEvent(event.name,event);

                        }
                    }

                }

            },

            onEddRemoveFromCartEvent: function (event) {
                this.fireEvent(event.name, event);
            },
            onPageScroll: function (event) {
                this.fireEvent(event.name, event);
            },
            onTime: function (event) {
                this.fireEvent(event.name, event);
            },
        };

    }(options);

    var Analytics = function (options) {

        var initialized = false;

        /**
         * Fires event
         *
         * @link: https://developers.google.com/analytics/devguides/collection/gtagjs/sending-data
         * @link: https://developers.google.com/analytics/devguides/collection/gtagjs/events
         * @link: https://developers.google.com/gtagjs/reference/event
         * @link: https://developers.google.com/gtagjs/reference/parameter
         *
         * @link: https://developers.google.com/analytics/devguides/collection/gtagjs/custom-dims-mets
         *
         * @param name
         * @param data
         */
        function fireEvent(name, data) {

            var eventParams = Utils.copyProperties(data, {});
            Utils.copyProperties(Utils.getRequestParams(), eventParams);
            if(options.ga.isUse4Version) {
                delete eventParams.traffic_source;
            }




            var _fireEvent = function (tracking_id) {

                var params = Utils.copyProperties(eventParams, { send_to: tracking_id });

                if (options.debug) {
                    console.log('[Google Analytics #' + tracking_id + '] ' + name, params);
                }

                gtag('event', name, params);

            };

            options.ga.trackingIds.forEach(function (tracking_id) {
                _fireEvent(tracking_id);
            });

        }

        function normalizeEventName(eventName) {

            var matches = {
                ViewContent: 'view_item',
                AddToCart: 'add_to_cart',
                AddToWishList: 'add_to_wishlist',
                InitiateCheckout: 'begin_checkout',
                Purchase: 'purchase',
                Lead: 'generate_lead',
                CompleteRegistration: 'sign_up',
                AddPaymentInfo: 'set_checkout_option'
            };

            return matches.hasOwnProperty(eventName) ? matches[eventName] : eventName;

        }

        /**
         * Public API
         */
        return {
            tag: function() {
                return "ga";
            },
            isEnabled: function () {
                return options.hasOwnProperty('ga');
            },

            disable: function () {
                initialized = false;
            },

            loadPixel: function () {

                if (initialized || !this.isEnabled() || !Utils.consentGiven('analytics')) {
                    return;
                }

                Utils.loadGoogleTag(options.ga.trackingIds[0]);

                var cd = {
                    'dimension1': 'event_hour',
                    'dimension2': 'event_day',
                    'dimension3': 'event_month'
                };

                // configure Dynamic Remarketing CDs
                if (options.ga.retargetingLogic === 'ecomm') {
                    cd.dimension4 = 'ecomm_prodid';
                    cd.dimension5 = 'ecomm_pagetype';
                    cd.dimension6 = 'ecomm_totalvalue';
                } else {
                    cd.dimension4 = 'dynx_itemid';
                    cd.dimension5 = 'dynx_pagetype';
                    cd.dimension6 = 'dynx_totalvalue';
                }

                var config = {
                    'link_attribution': options.ga.enhanceLinkAttr,
                    'anonymize_ip': options.ga.anonimizeIP,
                    'custom_map': cd
                };

                if(options.user_id && options.user_id != 0) {
                    config.user_id = options.user_id;
                }

                // Cross-Domain tracking
                if (options.ga.crossDomainEnabled) {
                    config.linker = {
                        accept_incoming: options.ga.crossDomainAcceptIncoming,
                        domains: options.ga.crossDomainDomains
                    };
                }

                if(options.ga.isUse4Version) {
                    if(options.ga.disableAdvertisingFeatures) {
                        config.allow_google_signals = false
                    }
                    if(options.ga.disableAdvertisingPersonalization) {
                        config.allow_ad_personalization_signals = false
                    }
                }

                // configure tracking ids

                options.ga.trackingIds.forEach(function (trackingId,index) {
                    if(options.ga.isDebugEnabled.includes("index_"+index)) {
                        config.debug_mode = true;
                    } else {
                        config.debug_mode = false;
                    }
                    gtag('config', trackingId, config);
                    
                });

                initialized = true;

                Utils.fireStaticEvents('ga');
                $( document).trigger( "analytics_initialized")
            },

            fireEvent: function (name, data) {

                if (!initialized || !this.isEnabled()) {
                    return false;
                }

                data.delay = data.delay || 0;
                data.params = data.params || {};

                if (data.delay === 0) {

                    fireEvent(name, data.params);

                } else {

                    setTimeout(function (name, params) {
                        fireEvent(name, params);
                    }, data.delay * 1000, name, data.params);

                }

                return true;

            },

            onAdSenseEvent: function () {
                // not supported
            },

            onClickEvent: function (event) {

                if (initialized && this.isEnabled() ) {
                    if(options.ga.isUse4Version) {
                        this.fireEvent(event.name, event);
                    } else {
                        var param = {
                            event_category: event.name,
                            event_action: event.params.event_action,
                            non_interaction: event.params.non_interaction,
                            event_day:event.params.event_day,
                            event_hour:event.params.event_hour,
                            event_month:event.params.event_month,
                            traffic_source:event.params.traffic_source,
                        }
                        if(event.params.text != undefined && event.params.text != "") {
                            param['event_label'] = event.params.text;
                        }
                        this.fireEvent(event.name, {
                            params: param
                        });
                    }
                }

            },

            onWatchVideo: function (event) {

                if (initialized && this.isEnabled()) {
                    if(options.ga.isUse4Version) {
                        this.fireEvent(event.name, event);
                    } else {
                        this.fireEvent(event.name, {
                            params: {
                                event_category: event.name,
                                event_action: event.params.event_action,
                                event_label: event.params.video_title,
                                non_interaction: event.params.non_interaction,
                                event_day:event.params.event_day,
                                event_hour:event.params.event_hour,
                                event_month:event.params.event_month,
                                traffic_source:event.params.traffic_source,
                            }
                        });
                    }


                }

            },

            onCommentEvent: function (event) {

                if (initialized && this.isEnabled() ) {

                    if(options.ga.isUse4Version) {
                        this.fireEvent(event.name, event);
                    } else {
                        this.fireEvent(event.name, {
                            params: {
                                event_category: event.name,
                                event_action: event.params.event_action,
                                event_label: document.location.href,
                                non_interaction: event.params.non_interaction,
                                event_day:event.params.event_day,
                                event_hour:event.params.event_hour,
                                event_month:event.params.event_month,
                                traffic_source:event.params.traffic_source,
                            }
                        });
                    }


                }

            },

            onFormEvent: function (event) {

                if (initialized && this.isEnabled() ) {

                    if(options.ga.isUse4Version) {
                        this.fireEvent(event.name, event);
                    } else {
                        var params = {
                            event_category: event.name,
                            event_action: event.params.event_action,
                            non_interaction: event.params.non_interaction,
                            event_day:event.params.event_day,
                            event_hour:event.params.event_hour,
                            event_month:event.params.event_month,
                            traffic_source:event.params.traffic_source,
                        };
                        var formClass = (typeof event.params.form_class != 'undefined') ? 'class: ' + event.params.form_class : '';
                        if(formClass != "") {
                            params["event_label"] = formClass;
                        }
                        this.fireEvent(event.name, {
                            params: params
                        });
                    }
                }

            },

            onDownloadEvent: function (event) {

                if (initialized && this.isEnabled() ) {
                    if(options.ga.isUse4Version) {
                        this.fireEvent(event.name, event);
                    } else {
                        var params = {
                            event_category: event.name,
                            event_action: event.params.event_action,
                            event_label:event.params.download_name,
                            non_interaction: event.params.non_interaction,
                        };
                        this.fireEvent(event.name, {
                            params: params
                        });
                    }
                }

            },

            onWooAddToCartOnButtonEvent: function (product_id) {
                if(!options.dynamicEvents.woo_add_to_cart_on_button_click.hasOwnProperty(this.tag()))
                    return;

                if (window.pysWooProductData.hasOwnProperty(product_id)) {
                    if (window.pysWooProductData[product_id].hasOwnProperty('ga')) {
                        var event = Utils.clone(options.dynamicEvents.woo_add_to_cart_on_button_click[this.tag()]);
                        Utils.copyProperties(window.pysWooProductData[product_id]['ga'].params, event.params)
                        this.fireEvent(event.name, event);
                    }
                }

            },

            onWooAddToCartOnSingleEvent: function (product_id, qty, product_type, is_external, $form) {

                window.pysWooProductData = window.pysWooProductData || [];

                if(!options.dynamicEvents.woo_add_to_cart_on_button_click.hasOwnProperty(this.tag()))
                    return;
                var event = Utils.clone(options.dynamicEvents.woo_add_to_cart_on_button_click[this.tag()]);

                if (product_type === Utils.PRODUCT_VARIABLE && !options.ga.wooVariableAsSimple) {
                    product_id = parseInt($form.find('input[name="variation_id"]').val());
                }

                if (window.pysWooProductData.hasOwnProperty(product_id)) {
                    if (window.pysWooProductData[product_id].hasOwnProperty('ga')) {

                        Utils.copyProperties(window.pysWooProductData[product_id]['ga'].params, event.params);


                        if(product_type === Utils.PRODUCT_GROUPED ) {
                            var groupValue = 0;
                            $form.find(".woocommerce-grouped-product-list .qty").each(function(index){
                                var childId = $(this).attr('name').replaceAll("quantity[","").replaceAll("]","");
                                var quantity = parseInt($(this).val());
                                if(isNaN(quantity)) {
                                    quantity = 0;
                                }
                                var childItem = window.pysWooProductData[product_id]['ga'].grouped[childId];

                                if(options.woo.addToCartOnButtonValueEnabled &&
                                    options.woo.addToCartOnButtonValueOption !== 'global') {

                                    event.params.items.forEach(function(el,index,array) {
                                        if(el.id == childItem.content_id) {
                                            if(quantity > 0){
                                                el.quantity = quantity;
                                                el.price = childItem.price * quantity;
                                            } else {
                                                array.splice(index, 1);
                                            }
                                        }
                                    });

                                }
                                groupValue += childItem.price * quantity;
                            });

                            if(groupValue == 0) return; // skip if no items selected
                        } else {
                            // update items qty param
                            event.params.items[0].quantity = qty;
                        }

                        // maybe customize value option
                        if (options.woo.addToCartOnButtonValueEnabled &&
                            options.woo.addToCartOnButtonValueOption !== 'global' &&
                            product_type !== Utils.PRODUCT_GROUPED)
                        {
                            if(product_type === Utils.PRODUCT_BUNDLE) {
                                var data = $(".bundle_form .bundle_data").data("bundle_form_data");
                                var items_sum = getBundlePriceOnSingleProduct(data);
                                event.params.items[0].price = (data.base_price+items_sum )* qty;
                            } else {
                                event.params.items[0].price = event.params.items[0].price * qty;
                            }

                        }



                        var eventName = is_external ? options.woo.affiliateEventName : event.name;
                        eventName = normalizeEventName(eventName);

                        this.fireEvent(eventName, event);

                    }
                }

            },

            onWooCheckoutProgressStep: function (event) {
                this.fireEvent(event.name, event);
            },

            onWooSelectContent: function (event) {
                this.fireEvent(event.name, event);
            },

            onWooRemoveFromCartEvent: function (event) {
                this.fireEvent(event.name, event);
            },

            onWooAffiliateEvent: function (product_id) {
                if(!options.dynamicEvents.woo_affiliate.hasOwnProperty(this.tag()))
                    return;
                var event = options.dynamicEvents.woo_affiliate[this.tag()];

                if (window.pysWooProductData.hasOwnProperty(product_id)) {
                    if (window.pysWooProductData[product_id].hasOwnProperty('ga')) {

                        event = Utils.clone(event );
                        Utils.copyProperties(window.pysWooProductData[product_id][this.tag()], event.params)
                        this.fireEvent(normalizeEventName(options.woo.affiliateEventName), event);

                    }
                }

            },

            onWooPayPalEvent: function (event) {
                this.fireEvent(event.name, event);
            },

            onEddAddToCartOnButtonEvent: function (download_id, price_index, qty) {
                if(!options.dynamicEvents.edd_add_to_cart_on_button_click.hasOwnProperty(this.tag()))
                    return;
                var event = Utils.clone(options.dynamicEvents.edd_add_to_cart_on_button_click[this.tag()]);


                if (window.pysEddProductData.hasOwnProperty(download_id)) {

                    var index;

                    if (price_index) {
                        index = download_id + '_' + price_index;
                    } else {
                        index = download_id;
                    }

                    if (window.pysEddProductData[download_id].hasOwnProperty(index)) {
                        if (window.pysEddProductData[download_id][index].hasOwnProperty('ga')) {

                            Utils.copyProperties(window.pysEddProductData[download_id][index]['ga'].params, event.params);

                            // update items qty param
                            event.params.items[0].quantity = qty;

                            this.fireEvent(event.name,event);

                        }
                    }

                }

            },

            onEddRemoveFromCartEvent: function (event) {
                this.fireEvent(event.name, event);
            },

            onPageScroll: function (event) {
                if (initialized && this.isEnabled()) {
                    if(options.ga.isUse4Version) {
                        this.fireEvent(event.name, event);
                    } else {
                        var params = {
                            event_category: event.name,
                            event_action: event.params.event_action,
                            event_label: event.scroll_percent,
                            non_interaction: event.params.non_interaction,
                            event_day:event.params.event_day,
                            event_hour:event.params.event_hour,
                            event_month:event.params.event_month,
                            traffic_source:event.params.traffic_source,
                        };
                        this.fireEvent(event.name, {
                            params: params
                        });
                    }
                }
            },
            onTime: function (event) {
                if (initialized && this.isEnabled()) {
                    if(options.ga.isUse4Version) {
                        this.fireEvent(event.name, event);
                    } else {
                        var params = {
                            event_category: event.name,
                            event_action: event.params.event_action,
                            event_label: event.time_on_page,
                            non_interaction: event.params.non_interaction,
                            event_day:event.params.event_day,
                            event_hour:event.params.event_hour,
                            event_month:event.params.event_month,
                            traffic_source:event.params.traffic_source,
                        };
                        this.fireEvent(event.name, {
                            params: params
                        });
                    }
                }
            },
        };

    }(options);

    var GAds = function (options) {

        var initialized = false;

        /**
         * Fires event
         *
         * @link: https://developers.google.com/analytics/devguides/collection/gtagjs/sending-data
         * @link: https://developers.google.com/analytics/devguides/collection/gtagjs/events
         * @link: https://developers.google.com/gtagjs/reference/event
         * @link: https://developers.google.com/gtagjs/reference/parameter
         */
        function fireEvent(name, data) {
            var _params = Utils.copyProperties(data.params,{});
            var ids = data.ids;
            var conversion_labels = data.conversion_labels;
            Utils.copyProperties(Utils.getRequestParams(), _params);
            var _fireEvent = function (conversion_id,event_name) {

                params = Utils.copyProperties(_params, { send_to: conversion_id });

                if("conversion" === event_name) {
                    delete params.items;
                    delete params.ecomm_pagetype;
                    delete params.ecomm_prodid;
                    delete params.ecomm_totalvalue;
                }
                if (options.debug) {
                    console.log('[Google Ads #' + conversion_id + '] ' + event_name, params);
                }

                gtag('event', event_name, params);

            };

            if(conversion_labels.length > 0) {  // if custom event have conversion_label
                conversion_labels.forEach(function (conversion_id) {
                    _fireEvent(conversion_id,name);
                });
            } else { // if normal event have conversion_label or custom without conversion_label

                options.google_ads.conversion_ids.forEach(function (conversion_id) { // send main event
                    _fireEvent(conversion_id,name);
                });

                if (ids.length) {
                    ids.forEach(function (conversion_id) {  // send conversion event next to main(not use for custom events)
                        _fireEvent(conversion_id,"conversion");
                    });
                }
            }
        }

        function normalizeEventName(eventName) {

            var matches = {
                ViewContent: 'view_item',
                AddToCart: 'add_to_cart',
                AddToWishList: 'add_to_wishlist',
                InitiateCheckout: 'begin_checkout',
                Purchase: 'purchase',
                Lead: 'generate_lead',
                CompleteRegistration: 'sign_up',
                AddPaymentInfo: 'set_checkout_option'
            };

            return matches.hasOwnProperty(eventName) ? matches[eventName] : eventName;

        }

        /**
         * Public API
         */
        return {
            tag: function() {
                return "google_ads";
            },
            isEnabled: function () {
                return options.hasOwnProperty('google_ads');
            },

            disable: function () {
                initialized = false;
            },

            loadPixel: function () {

                if (initialized || !this.isEnabled() || !Utils.consentGiven('google_ads')) {
                    return;
                }

                Utils.loadGoogleTag(options.google_ads.conversion_ids[0]);

                // configure conversion ids
                options.google_ads.conversion_ids.forEach(function (conversion_id) {
                    gtag('config', conversion_id);
                });

                initialized = true;

                Utils.fireStaticEvents('google_ads');

            },

            fireEvent: function (name, data) {

                if (!initialized || !this.isEnabled()) {
                    return false;
                }

                data.delay = data.delay || 0;
                data.params = data.params || {};
                data.ids = data.ids || [];
                data.conversion_labels = data.conversion_labels || [];

                if (data.delay === 0) {
                    fireEvent(name, data);
                } else {
                    setTimeout(function (name, data) {
                        fireEvent(name, data);
                    }, data.delay * 1000, name, data);
                }

                return true;

            },

            onAdSenseEvent: function (event) {
                // not supported
            },

            onClickEvent: function (action, params) {
                //disabled
            },

            onWatchVideo: function (event) {
                this.fireEvent(event.name, event);
            },

            onCommentEvent: function (event) {
                this.fireEvent(event.name, event);
            },

            onFormEvent: function (event) {
                this.fireEvent(event.name, event);
            },

            onDownloadEvent: function (event) {
                this.fireEvent(event.name, event);
            },

            onWooAddToCartOnButtonEvent: function (product_id) {

                if(!options.dynamicEvents.woo_add_to_cart_on_button_click.hasOwnProperty(this.tag()))
                    return;

                if (window.pysWooProductData.hasOwnProperty(product_id)) {
                    if (window.pysWooProductData[product_id].hasOwnProperty('google_ads')) {

                        var event = Utils.clone(options.dynamicEvents.woo_add_to_cart_on_button_click[this.tag()])
                        Utils.copyProperties(window.pysWooProductData[product_id]['google_ads']['params'].params, event.params)
                        event["ids"] = window.pysWooProductData[product_id]['google_ads']['ids']
                        event["conversion_labels"] = window.pysWooProductData[product_id]['google_ads']['conversion_labels']
                        this.fireEvent(event.name, event);
                    }
                }

            },

            onWooAddToCartOnSingleEvent: function (product_id, qty, product_type, is_external, $form) {

                window.pysWooProductData = window.pysWooProductData || [];
                if(!options.dynamicEvents.woo_add_to_cart_on_button_click.hasOwnProperty(this.tag()))
                    return;
                var event = Utils.clone(options.dynamicEvents.woo_add_to_cart_on_button_click[this.tag()]);

                if (product_type === Utils.PRODUCT_VARIABLE && !options.google_ads.wooVariableAsSimple) {
                    product_id = parseInt($form.find('input[name="variation_id"]').val());
                }

                if (window.pysWooProductData.hasOwnProperty(product_id)) {
                    if (window.pysWooProductData[product_id].hasOwnProperty('google_ads')) {

                        Utils.copyProperties(window.pysWooProductData[product_id]['google_ads']["params"], event.params);
                        event["ids"] = window.pysWooProductData[product_id]['google_ads']["ids"];
                        event["conversion_labels"] = window.pysWooProductData[product_id]['google_ads']["conversion_labels"];

                        var groupValue = 0;
                        if(product_type === Utils.PRODUCT_GROUPED ) {
                            $form.find(".woocommerce-grouped-product-list .qty").each(function(index){
                                var childId = $(this).attr('name').replaceAll("quantity[","").replaceAll("]","");
                                var quantity = parseInt($(this).val());
                                if(isNaN(quantity)) {
                                    quantity = 0;
                                }

                                var childItem = window.pysWooProductData[product_id]['google_ads'].grouped[childId];

                                if(options.woo.addToCartOnButtonValueEnabled &&
                                    options.woo.addToCartOnButtonValueOption !== 'global') {

                                    event.params.items.forEach(function(el,index,array) {
                                        if(el.id == childItem.content_id) {
                                            if(quantity > 0){
                                                el.quantity = quantity;
                                                el.price = childItem.price * quantity;
                                            } else {
                                                array.splice(index, 1);
                                            }
                                        }
                                    });
                                }
                                groupValue += childItem.price * quantity;
                            });
                            if(groupValue == 0) return;
                            event.params.value = groupValue;
                        } else {
                            // update items qty param
                            event.params.items[0].quantity = qty;
                        }

                        if(product_type === Utils.PRODUCT_BUNDLE) {
                            var data = $(".bundle_form .bundle_data").data("bundle_form_data");
                            var items_sum = getBundlePriceOnSingleProduct(data);
                            event.params.value =  (data.base_price+items_sum )* qty;
                        }

                        // maybe customize value option
                        if (options.woo.addToCartOnButtonValueEnabled &&
                            options.woo.addToCartOnButtonValueOption !== 'global' &&
                            product_type !== Utils.PRODUCT_GROUPED) {
                            if(product_type === Utils.PRODUCT_BUNDLE) {
                               // event.params.items[0].price = (data.base_price+items_sum )* qty;
                            } else {
                               // event.params.items[0].price = event.params.items[0].price * qty;
                            }
                        }



                        var eventName = is_external ? options.woo.affiliateEventName : event.name;
                        eventName = normalizeEventName(eventName);

                        this.fireEvent(eventName, event);

                    }
                }

            },

            onWooRemoveFromCartEvent: function (event) {
                this.fireEvent(event.name, event);
            },

            onWooAffiliateEvent: function (product_id) {
                if(!options.dynamicEvents.woo_affiliate.hasOwnProperty(this.tag()))
                    return;
                var event = options.dynamicEvents.woo_affiliate[this.tag()];

                if (window.pysWooProductData.hasOwnProperty(product_id)) {
                    if (window.pysWooProductData[product_id].hasOwnProperty('google_ads')) {

                        event = Utils.clone(event)
                        Utils.copyProperties(window.pysWooProductData[product_id][this.tag()], event.params)
                        this.fireEvent(normalizeEventName(options.woo.affiliateEventName), event);

                    }
                }

            },

            onWooPayPalEvent: function (event) {
                this.fireEvent(event.name, event);
            },

            onEddAddToCartOnButtonEvent: function (download_id, price_index, qty) {
                if(!options.dynamicEvents.edd_add_to_cart_on_button_click.hasOwnProperty(this.tag()))
                    return;
                var event = options.dynamicEvents.edd_add_to_cart_on_button_click[this.tag()];


                if (window.pysEddProductData.hasOwnProperty(download_id)) {

                    var index;

                    if (price_index) {
                        index = download_id + '_' + price_index;
                    } else {
                        index = download_id;
                    }

                    if (window.pysEddProductData[download_id].hasOwnProperty(index)) {
                        if (window.pysEddProductData[download_id][index].hasOwnProperty('google_ads')) {

                            event = Utils.clone(event)
                            Utils.copyProperties(window.pysEddProductData[download_id][index]['google_ads']['params'], event.params);
                            event['ids'] = window.pysEddProductData[download_id][index]['google_ads']['ids'];
                            event['conversion_labels'] = window.pysEddProductData[download_id][index]['google_ads']['conversion_labels'];
                            // update items qty param
                            params.items[0].quantity = qty;

                            this.fireEvent(event.name, event);

                        }
                    }

                }

            },

            onEddRemoveFromCartEvent: function (event) {
                this.fireEvent(event.name, event);
            },
            onPageScroll: function (event) {
                if (initialized && this.isEnabled()) {
                    this.fireEvent(event.name, event);
                }
            },
            onTime: function (event) {
                if (initialized && this.isEnabled()) {
                    this.fireEvent(event.name, event);
                }
            },

        };

    }(options);

    window.pys = window.pys || {};
    window.pys.Facebook = Facebook;
    window.pys.Analytics = Analytics;
    window.pys.GAds = GAds;
    window.pys.Utils = Utils;

    function getPixelBySlag(slug) {
        switch (slug) {
            case "facebook": return window.pys.Facebook;
            case "ga": return window.pys.Analytics;
            case "google_ads": return window.pys.GAds;
            case "bing": return window.pys.Bing;
            case "pinterest": return window.pys.Pinterest;
        }
    }


    $(document).ready(function () {



        var Pinterest = Utils.setupPinterestObject();
        var Bing = Utils.setupBingObject();

        Utils.manageCookies();
        Utils.initializeRequestParams();
        Utils.setupGdprCallbacks();

        // setup Click Event
        if (options.dynamicEvents.hasOwnProperty("signal_click") ||
            options.dynamicEvents.hasOwnProperty("signal_email") ||
            options.dynamicEvents.hasOwnProperty("signal_tel") ||
            options.dynamicEvents.hasOwnProperty("signal_download")) {

            $(document).onFirst('click', 'a, button, input[type="button"], input[type="submit"]', function (e) {

                var $elem = $(this);


                // Download
                if(options.dynamicEvents.hasOwnProperty("signal_download")) {
                    var isFired = false;
                    if ($elem.is('a')) {
                        var href = $elem.attr('href');
                        if (typeof href !== "string") {
                            return;
                        }
                        href = href.trim();
                        var extension = Utils.getLinkExtension(href);
                        var track_download = false;

                        if (extension.length > 0) {
                            var pixels = Object.keys(options.dynamicEvents.signal_download);
                            for(var i = 0;i<pixels.length;i++) {
                                var event = Utils.clone(options.dynamicEvents.signal_download[pixels[i]]);
                                var extensions = event.extensions;
                                if(extensions.includes(extension)) {
                                    event.params.download_url = href;
                                    event.params.download_type = extension;
                                    event.params.download_name = Utils.getLinkFilename(href);

                                    getPixelBySlag(pixels[i]).onDownloadEvent(event);
                                    isFired = true;
                                }
                            }
                        }
                    }
                    if(isFired) { // prevent duplicate events on the same element
                        return;
                    }
                }


                if (!e.hasOwnProperty('originalEvent')) {
                    return;
                }
                if($elem.hasClass("add_to_cart_button") ||
                    $elem.hasClass("single_add_to_cart_button") ) { // add_to_cart_button fire in woo
                    return;
                }

                if ($elem.hasClass('pys_block')) {
                    return; // avoiding fake double clicks from Affiliate event
                }
                var text = "";
                var target_url = "";
                var linkType = "Internal Click";

                if ($elem.is('a')) {
                    var href = $elem.attr('href');

                    // fixes #112
                    if (typeof href !== "string") {
                        return;
                    }
                    href = href.trim();

                    text = $elem.text();
                    target_url = href;

                    //Email Event
                    if (href.startsWith('mailto:')) {
                        if(options.dynamicEvents.hasOwnProperty("signal_email")) {
                            var pixels = Object.keys(options.dynamicEvents.signal_email);
                            for(var i = 0;i<pixels.length;i++) {
                                var event = Utils.clone(options.dynamicEvents.signal_email[pixels[i]]);
                                Utils.copyProperties(Utils.getRequestParams(), event.params);
                                getPixelBySlag(pixels[i]).onClickEvent(event);
                            }
                        }

                        return; // not fire next
                    }
                    // Phone
                    if (href.startsWith('tel:')) {
                        if(options.dynamicEvents.hasOwnProperty("signal_tel")) {
                            var pixels = Object.keys(options.dynamicEvents.signal_tel);
                            for(var i = 0;i<pixels.length;i++) {
                                var event = Utils.clone(options.dynamicEvents.signal_tel[pixels[i]]);
                                Utils.copyProperties(Utils.getRequestParams(), event.params);
                                getPixelBySlag(pixels[i]).onClickEvent(event);
                            }
                        }
                        return; // not fire next
                    }

                    if (href.startsWith('http')) {
                        // link type
                        var host = $elem.context != undefined ? $elem.context.host : $elem[0].host;
                        if (document.location.host != host) {
                            linkType = 'External Click';
                        }
                    }
                } else if ($elem.is('button')) {
                    if( $elem.hasClass("forminator-button-submit")) {
                        //disable duplicate events
                        return;
                    }
                    text = $elem.text();
                } else if ($elem.is('input[type="button"]')) {
                    text = $elem.val();
                } else if ($elem.is('input[type="submit"]')) {
                    if ( $elem.parents("form.comment-form")) {
                        //disable duplicate events
                        return;
                    }
                    if ($elem.parents("form")) {
                        //disable duplicate events
                        return;
                    }
                    text = $elem.val();
                } else {
                    return;
                }



                text = Utils.filterEmails(text);

                if(options.dynamicEvents.hasOwnProperty("signal_click")) {
                    var pixels = Object.keys(options.dynamicEvents.signal_click);
                    for(var i = 0;i<pixels.length;i++) {
                        var event = Utils.clone(options.dynamicEvents.signal_click[pixels[i]]);
                        event.params["event_action"] = linkType;
                        event.params["text"] = text;
                        if(target_url){
                            event.params["target_url"] = target_url;
                        }
                        Utils.copyProperties(Utils.getRequestParams(), event.params);
                        getPixelBySlag(pixels[i]).onClickEvent(event);
                    }
                }


            });

        }

        // setup AdSense Event
        if (options.dynamicEvents.hasOwnProperty("signal_adsense")) {

            var isOverGoogleAd = false;

            $(document)
                .on('mouseover', 'ins > ins > iframe', function () {
                    isOverGoogleAd = true;
                })
                .on('mouseout', 'iframe', function () {
                    isOverGoogleAd = false;
                });

            $(window)
                .on( "blur",function () {
                    if (isOverGoogleAd) {
                        var pixels = Object.keys(options.dynamicEvents.signal_adsense);
                        for(var i = 0;i<pixels.length;i++) {
                            var event = Utils.clone(options.dynamicEvents.signal_adsense[pixels[i]]);
                            Utils.copyProperties(Utils.getRequestParams(), event.params);
                            getPixelBySlag(pixels[i]).onAdSenseEvent(event);
                        }

                        $.each(options.triggerEventTypes, function (triggerType, events) {
                            $.each(events, function (eventId, triggers) {
                                switch (triggerType) {
                                    case 'ad_sense_click':
                                        Utils.fireTriggerEvent(eventId);
                                        break;
                                }
                            });
                        });
                    }
                })
                .trigger("focus");

        }

        //setup adsense for custom events
        var dynamicAdsenseEventsTriggers = 0
        $.each(options.triggerEventTypes, function (triggerType, events) {
            if(triggerType == "ad_sense_click") {
                dynamicAdsenseEventsTriggers++;
            }
        });
        if (dynamicAdsenseEventsTriggers > 0) {

            var isOverGoogleAd = false;

            $(document)
                .on('mouseover', 'ins > ins > iframe', function () {
                    isOverGoogleAd = true;
                })
                .on('mouseout', 'iframe', function () {
                    isOverGoogleAd = false;
                });

            $(window)
                .on( "blur",function () {
                    if (isOverGoogleAd) {

                        $.each(options.triggerEventTypes, function (triggerType, events) {
                            $.each(events, function (eventId, triggers) {
                                switch (triggerType) {
                                    case 'ad_sense_click':
                                        Utils.fireTriggerEvent(eventId);
                                        break;
                                }
                            });
                        });
                    }
                })
                .trigger("focus");

        }


        // page scroll event
        if (options.dynamicEvents.hasOwnProperty("signal_page_scroll")) {

            var singlePageScroll = function () {


                var docHeight = $(document).height() - $(window).height();
                var isFired = false;
                var pixels = Object.keys(options.dynamicEvents.signal_page_scroll);

                for(var i = 0;i<pixels.length;i++) {
                    var event = Utils.clone(options.dynamicEvents.signal_page_scroll[pixels[i]]);
                    var scroll = Math.round(docHeight * event.scroll_percent / 100)// convert % to absolute positions

                    if(scroll < $(window).scrollTop()) {
                        Utils.copyProperties(Utils.getRequestParams(), event.params);
                        getPixelBySlag(pixels[i]).onPageScroll(event);
                        isFired = true
                    }
                }
                if(isFired) {
                    $(document).off("scroll",singlePageScroll);
                }
            }
            $(document).on("scroll",singlePageScroll);
        }

        if (options.dynamicEvents.hasOwnProperty("signal_time_on_page")) {
            var pixels = Object.keys(options.dynamicEvents.signal_time_on_page);
            var time = options.dynamicEvents.signal_time_on_page[pixels[0]].time_on_page; // the same for all pixel
            setTimeout(function(){
                for(var i = 0;i<pixels.length;i++) {
                    var event = Utils.clone(options.dynamicEvents.signal_time_on_page[pixels[i]]);
                    Utils.copyProperties(Utils.getRequestParams(), event.params);
                    getPixelBySlag(pixels[i]).onTime(event);
                }
            },time*1000);
        }

        // setup Dynamic events
        $.each(options.triggerEventTypes, function (triggerType, events) {

            $.each(events, function (eventId, triggers) {

                switch (triggerType) {
                    case 'url_click':
                        //@see: Utils.setupURLClickEvents()
                        break;

                    case 'css_click':
                        Utils.setupCSSClickEvents(eventId, triggers);
                        break;

                    case 'css_mouseover':
                        Utils.setupMouseOverClickEvents(eventId, triggers);
                        break;

                    case 'scroll_pos':
                        Utils.setupScrollPosEvents(eventId, triggers);
                        break;
                    case 'comment':
                        Utils.setupCommentEvents(eventId, triggers);
                        break;
                }

            });

        });

        // setup WooCommerce events
        if (options.woo.enabled) {

            // WooCommerce AddToCart
            if (options.dynamicEvents.hasOwnProperty("woo_add_to_cart_on_button_click")) {

                // Loop, any kind of "simple" product, except external
                $('.add_to_cart_button:not(.product_type_variable,.single_add_to_cart_button)').on("click",function (e) {

                    var product_id = $(this).data('product_id');

                    if (typeof product_id !== 'undefined') {
                        Facebook.onWooAddToCartOnButtonEvent(product_id,$(this));
                        Analytics.onWooAddToCartOnButtonEvent(product_id);
                        GAds.onWooAddToCartOnButtonEvent(product_id);
                        Pinterest.onWooAddToCartOnButtonEvent(product_id);
                        Bing.onWooAddToCartOnButtonEvent(product_id);
                    }

                });

                // Single Product
                // tap try to https://stackoverflow.com/questions/30990967/on-tap-click-event-firing-twice-how-to-avoid-it
                $('button.single_add_to_cart_button,.single_add_to_cart_button').onFirst('click',function (e) {

                    var $button = $(this);

                    if ($button.hasClass('disabled')) {
                        return;
                    }

                    var $form = $button.closest('form');

                    var product_type = Utils.PRODUCT_SIMPLE;
                    var is_external = false;

                    if ($form.length === 0) {
                        is_external = true;
                    } else if ($form.hasClass('variations_form')) {
                        product_type = Utils.PRODUCT_VARIABLE;
                    } else if($form.hasClass('bundle_form')) {
                        product_type = Utils.PRODUCT_BUNDLE;
                    } else if($form.hasClass('grouped_form')) {
                        product_type = Utils.PRODUCT_GROUPED;
                    }



                    var product_id;
                    var qty;
                    if (product_type === Utils.PRODUCT_GROUPED) {
                        qty = 1;
                        product_id = parseInt($form.find('*[name="add-to-cart"]').val());
                    } else if (product_type === Utils.PRODUCT_VARIABLE) {
                        product_id = parseInt($form.find('*[name="add-to-cart"]').val());
                        var qtyTag = $form.find('input[name="quantity"]');
                        if(qtyTag.length <= 0) {
                            qtyTag = $form.find('select[name="quantity"]');
                        }
                        qty = parseInt(qtyTag.val());
                    } else if (is_external) {
                        product_id = options.woo.singleProductId;
                        qty = 1;
                    } else {
                        product_id = parseInt($form.find('*[name="add-to-cart"]').val());
                        var qtyTag = $form.find('input[name="quantity"]');
                        if(qtyTag.length <= 0) {
                            qtyTag = $form.find('select[name="quantity"]');
                        }
                        qty = parseInt(qtyTag.val());
                    }

                    Facebook.onWooAddToCartOnSingleEvent(product_id, qty, product_type, is_external, $form);
                    Analytics.onWooAddToCartOnSingleEvent(product_id, qty, product_type, is_external, $form);
                    GAds.onWooAddToCartOnSingleEvent(product_id, qty, product_type, is_external, $form);
                    Pinterest.onWooAddToCartOnSingleEvent(product_id, qty, product_type, is_external, $form);
                    Bing.onWooAddToCartOnSingleEvent(product_id, qty, product_type, is_external, $form);

                });

            }

            // WooCommerce Affiliate
            if (options.dynamicEvents.hasOwnProperty("woo_affiliate")) {

                // Loop, external
                $('.product_type_external').on("click",function (e) {

                    var product_id = $(this).data('product_id');

                    if (typeof product_id !== 'undefined') {
                        Facebook.onWooAffiliateEvent(product_id);
                        Analytics.onWooAffiliateEvent(product_id);
                        GAds.onWooAffiliateEvent(product_id);
                        Pinterest.onWooAffiliateEvent(product_id);
                        Bing.onWooAffiliateEvent(product_id);
                    }

                });

            }

            // WooCommerce RemoveFromCart
            if (options.dynamicEvents.hasOwnProperty("woo_remove_from_cart")) {

                $('body').on('click', options.woo.removeFromCartSelector, function (e) {

                    var $a = $(e.currentTarget),
                        href = $a.attr('href');

                    // extract cart item hash from remove button URL
                    var regex = new RegExp("[\\?&]remove_item=([^&#]*)"),
                        results = regex.exec(href);

                    if (results !== null) {

                        var item_hash = results[1];

                        if (options.dynamicEvents["woo_remove_from_cart"].hasOwnProperty(item_hash)) {
                            var events = options.dynamicEvents["woo_remove_from_cart"][item_hash];
                            Utils.fireEventForAllPixel("onWooRemoveFromCartEvent",events)
                        }

                    }

                });

            }

            // WooCommerce PayPal
            if (options.dynamicEvents.hasOwnProperty("woo_paypal")) {

                // Non-default binding used to avoid situations when some code in external js
                // stopping events propagation, eg. returns false, and our handler will never called
                $(document).onFirst('submit click', '#place_order', function (e) {

                    var method = $('form[name="checkout"] input[name="payment_method"]:checked').val();

                    if (method !== 'paypal') {
                        return;
                    }
                    var events = options.dynamicEvents.woo_paypal;
                    Utils.fireEventForAllPixel("onWooPayPalEvent",events)

                });

            }

            // WooCommerce checkout progress
            if(options.dynamicEvents.hasOwnProperty("woo_initiate_checkout_progress_f") ) {

                $(document).on("change",".woocommerce-validated #billing_first_name",function () {
                    Analytics.onWooCheckoutProgressStep(options.dynamicEvents.woo_initiate_checkout_progress_f[Analytics.tag()]);
                });
            }
            if(options.dynamicEvents.hasOwnProperty("woo_initiate_checkout_progress_l")) {

                $(document).on("change",".woocommerce-validated #billing_last_name",function () {
                    Analytics.onWooCheckoutProgressStep(options.dynamicEvents.woo_initiate_checkout_progress_l[Analytics.tag()]);
                });
            }

            if(options.dynamicEvents.hasOwnProperty("woo_initiate_checkout_progress_e")) {

                $(document).on("change",".woocommerce-validated #billing_email",function () {
                    Analytics.onWooCheckoutProgressStep(options.dynamicEvents.woo_initiate_checkout_progress_e[Analytics.tag()]);
                });
            }
            if(options.dynamicEvents.hasOwnProperty("woo_initiate_checkout_progress_o")) {
                $(document).onFirst('submit click', '#place_order', function () {
                    Analytics.onWooCheckoutProgressStep(options.dynamicEvents.woo_initiate_checkout_progress_o[Analytics.tag()]);
                });
            }


            // WooCommerce
            if(options.dynamicEvents.hasOwnProperty("woo_select_content_search") ||
                options.dynamicEvents.hasOwnProperty("woo_select_content_shop") ||
                options.dynamicEvents.hasOwnProperty("woo_select_content_tag") ||
                options.dynamicEvents.hasOwnProperty("woo_select_content_single") ||
                options.dynamicEvents.hasOwnProperty("woo_select_content_category")
            ) {
                $('.product.type-product a.woocommerce-loop-product__link').onFirst('click', function (evt) {
                    var productId = $(this).parent().find("a.add_to_cart_button").attr("data-product_id");
                    if(options.dynamicEvents.hasOwnProperty("woo_select_content_search") &&
                        options.dynamicEvents.woo_select_content_search.hasOwnProperty(productId)) {
                        Analytics.onWooSelectContent(options.dynamicEvents.woo_select_content_search[productId][Analytics.tag()]);
                    } else if(options.dynamicEvents.hasOwnProperty("woo_select_content_shop") &&
                        options.dynamicEvents.woo_select_content_shop.hasOwnProperty(productId)) {
                        Analytics.onWooSelectContent(options.dynamicEvents.woo_select_content_shop[productId][Analytics.tag()]);
                    } else if(options.dynamicEvents.hasOwnProperty("woo_select_content_tag") &&
                        options.dynamicEvents.woo_select_content_tag.hasOwnProperty(productId)) {
                        Analytics.onWooSelectContent(options.dynamicEvents.woo_select_content_tag[productId][Analytics.tag()]);
                    } else if(options.dynamicEvents.hasOwnProperty("woo_select_content_single") &&
                        options.dynamicEvents.woo_select_content_single.hasOwnProperty(productId)) {
                        Analytics.onWooSelectContent(options.dynamicEvents.woo_select_content_single[productId][Analytics.tag()]);
                    } else if(options.dynamicEvents.hasOwnProperty("woo_select_content_category") &&
                        options.dynamicEvents.woo_select_content_category.hasOwnProperty(productId)) {
                        Analytics.onWooSelectContent(options.dynamicEvents.woo_select_content_category[productId][Analytics.tag()]);
                    }
                });
            }
        }

        // setup EDD events
        if (options.edd.enabled) {

            // EDD AddToCart
            if (options.dynamicEvents.hasOwnProperty("edd_add_to_cart_on_button_click")) {

                $('form.edd_download_purchase_form .edd-add-to-cart').on("click",function (e) {

                    var $button = $(this);
                    var $form = $button.closest('form');
                    var variable_price = $button.data('variablePrice'); // yes/no
                    var price_mode = $button.data('priceMode'); // single/multi
                    var ids = [];
                    var quantities = [];
                    var qty;
                    var id;

                    if (variable_price === 'yes' && price_mode === 'multi') {

                        id = $form.find('input[name="download_id"]').val();

                        // get selected variants
                        $.each($form.find('input[name="edd_options[price_id][]"]:checked'), function (i, el) {
                            ids.push(id + '_' + $(el).val());
                        });

                        // get qty for selected variants
                        $.each(ids, function (i, variant_id) {

                            var variant_index = variant_id.split('_', 2);
                            qty = $form.find('input[name="edd_download_quantity_' + variant_index[1] + '"]').val();

                            if (typeof qty !== 'undefined') {
                                quantities.push(qty);
                            } else {
                                quantities.push(1);
                            }

                        });

                    } else if (variable_price === 'yes' && price_mode === 'single') {

                        id = $form.find('input[name="download_id"]').val();
                        ids.push(id + '_' + $form.find('input[name="edd_options[price_id][]"]:checked').val());

                        qty = $form.find('input[name="edd_download_quantity"]').val();

                        if (typeof qty !== 'undefined') {
                            quantities.push(qty);
                        } else {
                            quantities.push(1);
                        }

                    } else {

                        ids.push($button.data('downloadId'));

                        qty = $form.find('input[name="edd_download_quantity"]').val();

                        if (typeof qty !== 'undefined') {
                            quantities.push(qty);
                        } else {
                            quantities.push(1);
                        }
                    }

                    // fire event for each download/variant
                    $.each(ids, function (i, download_id) {

                        var q = parseInt(quantities[i]);
                        var variant_index = download_id.toString().split('_', 2);
                        var price_index;

                        if (variant_index.length === 2) {
                            download_id = variant_index[0];
                            price_index = variant_index[1];
                        }

                        Facebook.onEddAddToCartOnButtonEvent(download_id, price_index, q);
                        Analytics.onEddAddToCartOnButtonEvent(download_id, price_index, q);
                        GAds.onEddAddToCartOnButtonEvent(download_id, price_index, q);
                        Pinterest.onEddAddToCartOnButtonEvent(download_id, price_index, q);
                        Bing.onEddAddToCartOnButtonEvent(download_id, price_index, q);

                    });

                });

            }

            // EDD RemoveFromCart
            if (options.dynamicEvents.hasOwnProperty("edd_remove_from_cart") ) {

                $('form#edd_checkout_cart_form .edd_cart_remove_item_btn').on("click",function (e) {

                    var href = $(this).attr('href');
                    var key = href.substring(href.indexOf('=') + 1).charAt(0);

                    if (options.dynamicEvents.edd_remove_from_cart.hasOwnProperty(key)) {
                        var events = options.dynamicEvents.edd_remove_from_cart[key];
                        Utils.fireEventForAllPixel("onEddRemoveFromCartEvent",events)
                    }

                });

            }

        }

        Utils.setupURLClickEvents();

        // setup Comment Event
        if (options.dynamicEvents.hasOwnProperty("signal_comment")) {

            $('form.comment-form').on("submit",function () {

                var pixels = Object.keys(options.dynamicEvents.signal_comment);
                for(var i = 0;i<pixels.length;i++) {
                    var event = Utils.clone(options.dynamicEvents.signal_comment[pixels[i]]);
                    Utils.copyProperties(Utils.getRequestParams(), event.params);
                    getPixelBySlag(pixels[i]).onCommentEvent(event);
                }
            });

        }

        // setup Form Event
        if ( options.dynamicEvents.hasOwnProperty("signal_form")) {

            $(document).onFirst('submit', 'form', function (e) {

                var $form = $(this);

                // exclude WP forms
                if ($form.hasClass('comment-form') || $form.hasClass('search-form') || $form.attr('id') === 'adminbarsearch') {
                    return;
                }

                // exclude Woo forms
                if ($form.hasClass('woocommerce-product-search') || $form.hasClass('cart') || $form.hasClass('woocommerce-cart-form') ||
                    $form.hasClass('woocommerce-shipping-calculator') || $form.hasClass('checkout') || $form.hasClass('checkout_coupon')) {
                    return;
                }

                // exclude EDD forms
                if ($form.hasClass('edd_form') || $form.hasClass('edd_download_purchase_form')) {
                    return;
                }

                var params = {
                    form_id: $form.attr('id'),
                    form_class: $form.attr('class'),
                    text: $form.find('[type="submit"]').is('input') ?
                        $form.find('[type="submit"]').val() : $form.find('[type="submit"]').text()
                };
                var pixels = Object.keys(options.dynamicEvents.signal_form);
                for(var i = 0;i<pixels.length;i++) {
                    var event = Utils.clone(options.dynamicEvents.signal_form[pixels[i]]);
                    Utils.copyProperties(params,event.params,)
                    Utils.copyProperties(Utils.getRequestParams(), event.params);
                    getPixelBySlag(pixels[i]).onFormEvent(event);
                }
            });

            //Forminator
            $(document).on( 'forminator:form:submit:success', function( formData ){
                var params = {
                    form_id: $(formData.target).find('input[name="form_id"]').val(),
                    text: $(formData.target).find('.forminator-button-submit').text()
                };

                var pixels = Object.keys(options.dynamicEvents.signal_form);
                for(var i = 0;i<pixels.length;i++) {
                    var event = Utils.clone(options.dynamicEvents.signal_form[pixels[i]]);
                    Utils.copyProperties(params,event.params)
                    Utils.copyProperties(Utils.getRequestParams(), event.params);
                    getPixelBySlag(pixels[i]).onFormEvent(event);
                }
            });

            // Ninja Forms
            $(document).onFirst('nfFormSubmitResponse', function (e, data) {

                var params = {
                    form_id: data.response.data.form_id,
                    text: data.response.data.settings.title
                };

                var pixels = Object.keys(options.dynamicEvents.signal_form);
                for(var i = 0;i<pixels.length;i++) {
                    var event = options.dynamicEvents.signal_form[pixels[i]];
                    Utils.copyProperties(params,event.params)
                    Utils.copyProperties(Utils.getRequestParams(), event.params);
                    getPixelBySlag(pixels[i]).onFormEvent(event);
                }

            });

        }

        // load pixel APIs
        Utils.loadPixels();

        // setup Enrich content
        if(Utils.isCheckoutPage()) {
            Utils.fillCheckoutFields();
        }
    });

    // load WatchVideo event APIs
    if (options.dynamicEvents.hasOwnProperty('signal_watch_video')) {
        Utils.initYouTubeAPI();
        Utils.initVimeoAPI();
    }



}(jQuery, pysOptions);

function pys_generate_token(length){
    //edit the token allowed characters
    var a = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890".split("");
    var b = [];
    for (var i=0; i<length; i++) {
        var j = (Math.random() * (a.length-1)).toFixed(0);
        b[i] = a[j];
    }
    return b.join("");
}

function getBundlePriceOnSingleProduct(data) {
    var items_sum = 0;
    jQuery(".bundle_form .bundled_product").each(function(index){
        var id = jQuery(this).find(".cart").data("bundled_item_id");
        var item_price = data.prices[id];
        var item_quantity = jQuery(this).find(".bundled_qty").val();
        if(!jQuery(this).hasClass("bundled_item_optional") ||
            jQuery(this).find(".bundled_product_optional_checkbox input").prop('checked')) {
            items_sum += item_price*item_quantity;
        }
    });
    return items_sum;
}