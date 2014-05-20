define([], function(){
  return function(scanner){
    // exports OnigRegExp
    function OnigRegExp(source) {
      this.scanner = scanner;
      this.source = source;
      this.ready = false;
      this.scannerID = -1; //invalid until ready
    }

    OnigRegExp.prototype._whenScannerReady = function(callback){
      var thisRef = this;
      if(this.ready){
        // call straightaway.
        if(typeof callback == "function"){
          callback.apply(this);
        }
      } else {
        // new scanner then call.
        this.scanner.newScanner([this.source], function(scannerID){
          thisRef.ready = true;
          thisRef.scannerID = scannerID;
          if(typeof callback == "function"){
            callback.apply(thisRef);
          }
        });
      }
    };


    OnigRegExp.prototype.captureIndicesForMatch = function(string, match) {
      var capture, captureIndices, _i, _len;
      if (match != null && match.captureIndices.length > 0) {
        captureIndices = match.captureIndices;
        for (_i = 0, _len = captureIndices.length; _i < _len; _i++) {
          capture = captureIndices[_i];
          capture.match = string.slice(capture.start, capture.end);
        }
        return captureIndices;
      } else {
        return null;
      }
    };


    OnigRegExp.prototype.search = function(string, startPosition, callback) {
      if (startPosition == null) {
        startPosition = 0;
      }
      if (typeof startPosition === 'function') {
        callback = startPosition;
        startPosition = 0;
      }

      this._whenScannerReady(function(){
        var thisRef = this;
        this.scanner.findNextMatch(this.scannerID, string, startPosition, function(match){
          if(typeof callback === "function"){
            callback(thisRef.captureIndicesForMatch(string, match));
          }
        });
      });
    };


    OnigRegExp.prototype.test = function(string, callback) {
      this.search(string, 0, function(result){
        if(typeof callback == "function"){
          callback(result!=null);
        }
      });
    };
    return OnigRegExp;
  };
});