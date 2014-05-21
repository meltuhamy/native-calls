// [get url params](http://stackoverflow.com/a/2880929/847763)
var urlParams;
(window.onpopstate = function () {
    var match,
            pl = /\+/g,  // Regex for replacing addition symbol with a space
            search = /([^&=]+)=?([^&]*)/g,
            decode = function (s) {
                return decodeURIComponent(s.replace(pl, " "));
            },
            query = window.location.search.substring(1);

    urlParams = {};
    while (match = search.exec(query))
        urlParams[decode(match[1])] = decode(match[2]);
})();

// using URL params, we load the correct module.
window.NaClConfig = {
    TOOLCHAIN: urlParams.TOOLCHAIN,
    CONFIG: urlParams.CONFIG
};