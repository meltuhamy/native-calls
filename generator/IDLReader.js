var fs = require('fs');

module.exports = {
  readFile: function(file){
    "use strict";
    return fs.readFileSync(file);
  },
  readFiles: function(files){
    "use strict";
    var s = '';
    for(var i = 0; i < files.length; i++){
      s = s.concat(this.readFile(files[i]));
    }

    return s;
  }
};