define([], function(){
  // allow global setting
  return window.NaClConfig ? window.NaClConfig : {
    CONFIG: 'Debug',
    TOOLCHAIN: 'newlib',
    VALIDATION: true
  }
});
