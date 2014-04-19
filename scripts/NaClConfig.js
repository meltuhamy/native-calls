define([], function(){
  // allow global setting
  return window.NaClConfig ? window.NaClConfig : {
    CONFIG: 'Release',
    TOOLCHAIN: 'newlib'
  }
});
