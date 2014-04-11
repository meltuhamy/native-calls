define(["loglevel"], function (loglevel) {
  function TagLogger(inTag) {
    var tag;
    if(inTag != undefined){
      tag = "["+inTag+"]";
    }
    return {
      "trace": function (message) {
        loglevel.trace.apply(null, [tag].concat(Array.prototype.slice.call(arguments)));
      },
      "debug": function (message) {
        loglevel.debug.apply(null, [tag].concat(Array.prototype.slice.call(arguments)));
      },
      "info": function (message) {
        loglevel.info.apply(null, [tag].concat(Array.prototype.slice.call(arguments)));
      },
      "warn": function (message) {
        loglevel.warn.apply(null, [tag].concat(Array.prototype.slice.call(arguments)));
      },
      "error": function (message) {
        loglevel.error.apply(null, [tag].concat(Array.prototype.slice.call(arguments)));
      },
      "setTag": function (newTag) {
        tag = "[" + newTag + "]";
      }
    };
  }

  return TagLogger;
});
