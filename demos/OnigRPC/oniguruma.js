define(["./onig-reg-exp.js"], function(OnigRegExp){
  // exports OnigRegExp, OnigScanner, but needs to construct OnigRPC using srcPrefix.
  return function(scanner){

    function OnigScanner(sources){
      this.ready = false;
      this.scannerID = -1;
      this.sources = sources;
      this.scanner = scanner;
    }

    OnigScanner.prototype._whenScannerReady = function(callback){
      var thisRef = this;
      if(this.ready){
        // call straightaway.
        if(typeof callback == "function"){
          callback.apply(this);
        }
      } else {
        // new scanner then call.
        this.scanner.newScanner(this.sources, function(scannerID){
          thisRef.ready = true;
          thisRef.scannerID = scannerID;
          if(typeof callback == "function"){
            callback.apply(thisRef);
          }
        });
      }
    };

    OnigScanner.prototype.findNextMatch = function(string, startPosition, callback) {
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
          if(match.captureIndices.length == 0){
            match = null;
          }
          if(match != null){
            match.scanner = thisRef;
          }
          if(typeof callback == "function"){
            callback(match);
          }
        });
      });
    };

    return {
      OnigRegExp: OnigRegExp(scanner),
      OnigScanner: OnigScanner
    };
  };
});