
// the same API as Fib.fib(x), only it's implemented in JavaScript.
define(function(){
  function fibJS(x){
    if (x == 0)
      return 0;

    if (x == 1)
      return 1;

    return fibJS(x-1)+fibJS(x-2);
  }

  return {
    "fib" : function(x, callback){
      var result;
      setTimeout(function(){
        result = fibJS(x);
        if(callback){
          callback.call(null, result);
        }
      },0);
    }
  }

});