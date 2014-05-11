define([], function(){
  // allow global setting
  var defaultConfig = {
    CONFIG: 'Debug',
    TOOLCHAIN: 'newlib',
    VALIDATION: true
  };

  if(window.NaClConfig){
    var correctConfig = {};
    for(var key in defaultConfig){
      if(defaultConfig.hasOwnProperty(key)){
        if(window.NaClConfig[key] != undefined){
          correctConfig[key] = window.NaClConfig[key];
        } else {
          correctConfig[key] = defaultConfig[key];
        }
      }
    }

    return correctConfig;

  } else {

    return defaultConfig

  }


});
