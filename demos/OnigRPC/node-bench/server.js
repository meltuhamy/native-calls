var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/', function(req, res){
  res.sendfile('index.html');
});


console.log("Listening.");
var largeText = "return jQuery.merge( [], parsed.childNodes );\n};\n\n\n// Keep a copy of the old load method\nvar _load = jQuery.fn.load;\n\n/**\n * Load a url into a page\n */\njQuery.fn.load = function( url, params, callback ) {\n\tif ( typeof url !== \"string\" && _load ) {\n\t\treturn _load.apply( this, arguments );\n\t}\n\n\tvar selector, type, response,\n\t\tself = this,\n\t\toff = url.indexOf(\" \");\n\n\tif ( off >= 0 ) {\n\t\tselector = jQuery.trim( url.slice( off ) );\n\t\turl = url.slice( 0, off );\n\t}\n\n\t// If it's a function\n\tif ( jQuery.isFunction( params ) ) {\n\n\t\t// We assume that it's the callback\n\t\tcallback = params;\n\t\tparams = undefined;\n\n\t// Otherwise, build a param string\n\t} else if ( params && typeof params === \"object\" ) {\n\t\ttype = \"POST\";\n\t}\n\n\t// If we have elements to modify, make the request\n\tif ( self.length > 0 ) {\n\t\tjQuery.ajax({\n\t\t\turl: url,\n\n\t\t\t// if \"type\" variable is undefined, then \"GET\" method will be used\n\t\t\ttype: type,\n\t\t\tdataType: \"html\",\n\t\t\tdata: params\n\t\t}).done(function( responseText ) {\n\n\t\t\t// Save response for use in complete callback\n\t\t\tresponse = arguments;\n\n\t\t\tself.html( selector ?\n\n\t\t\t\t// If a selector was specified, locate the right elements in a dummy div\n\t\t\t\t// Exclude scripts to avoid IE 'Permission Denied' errors\n\t\t\t\tjQuery(\"<div>\").append( jQuery.parseHTML( responseText ) ).find( selector ) :\n\n\t\t\t\t// Otherwise use the full result\n\t\t\t\tresponseText );\n\n\t\t}).complete( callback && function( jqXHR, status ) {\n\t\t\tself.each( callback, response || [ jqXHR.responseText, status, jqXHR ] );\n\t\t});\n\t}\n\n\treturn this;\n};\n\n\n\n\njQuery.expr.filters.animated = function( elem ) {\n\treturn jQuery.grep(jQuery.timers, function( fn ) {\n\t\treturn elem === fn.elem;\n\t}).length;\n};\n\n\n\n\nvar docElem = window.document.documentElement;\n\n/**\n * Gets a window from an element\n */\nfunction getWindow( elem ) {\n\treturn jQuery.isWindow( elem ) ? elem : elem.nodeType === 9 && elem.defaultView;\n}\n\njQuery.offset = {\n\tsetOffset: function( elem, options, i ) {\n\t\tvar curPosition, curLeft, curCSSTop, curTop, curOffset, curCSSLeft, calculatePosition,\n\t\t\tposition = jQuery.css( elem, \"position\" ),\n\t\t\tcurElem = jQuery( elem ),\n\t\t\tprops = {};\n\n\t\t// Set position first, in-case top/left are set even on static elem\n\t\tif ( position === \"static\" ) {\n\t\t\telem.style.position = \"relative\";\n\t\t}\n\n\t\tcurOffset = curElem.offset();\n\t\tcurCSSTop = jQuery.css( elem, \"top\" );\n\t\tcurCSSLeft = jQuery.css( elem, \"left\" );\n\t\tcalculatePosition = ( position === \"absolute\" || position === \"fixed\" ) &&\n\t\t\t( curCSSTop + curCSSLeft ).indexOf(\"auto\") > -1;\n\n\t\t// Need to be able to calculate position if either top or left is auto and position is either absolute or fixed\n\t\tif ( calculatePosition ) {\n\t\t\tcurPosition = curElem.position();\n\t\t\tcurTop = curPosition.top;\n\t\t\tcurLeft = curPosition.left;\n\n\t\t} else {\n\t\t\tcurTop = parseFloat( curCSSTop ) || 0;\n\t\t\tcurLeft = parseFloat( curCSSLeft ) || 0;\n\t\t}\n\n\t\tif ( jQuery.isFunction( options ) ) {\n\t\t\toptions = options.call( elem, i, curOffset );\n\t\t}\n\n\t\tif ( options.top != null ) {\n\t\t\tprops.top = ( options.top - curOffset.top ) + curTop;\n\t\t}\n\t\tif ( options.left != null ) {\n\t\t\tprops.left = ( options.left - curOffset.left ) + curLeft;\n\t\t}\n\n\t\tif ( \"using\" in options ) {\n\t\t\toptions.using.call( elem, props );\n\n\t\t} else {\n\t\t\tcurElem.css( props );\n\t\t}\n\t}\n};\n\njQuery.fn.extend({\n\toffset: function( options ) {\n\t\tif ( arguments.length ) {\n\t\t\treturn options === undefined ?\n\t\t\t\tthis :\n\t\t\t\tthis.each(function( i ) {\n\t\t\t\t\tjQuery.offset.setOffset( this, options, i );\n\t\t\t\t});".split("\n");
var OnigScanner = require('oniguruma').OnigScanner;
var scanner = new OnigScanner(['this', 'var', 'selector', 'window']);


// Emit welcome message on connection
io.on('connection', function(socket) {
  console.log("Connection!");
  socket.emit('connected', { message: 'ready' });

  socket.on('findNextMatch', function(data){
    var result = scanner.findNextMatchSync(data.line, data.position);
    socket.emit('result', {id: data.id, result: result});
  });
});

http.listen(3001, function(){
  console.log('listening on *:3001');
});