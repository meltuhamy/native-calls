define([], function(){
  /**
   * Maps a WebIDL type into a RPCStub spec type. (see RPCStub.js)
   * See http://www.w3.org/TR/WebIDL/#idl-types
   */
  var IDLTypeMap = Object.create(null);

  IDLTypeMap["any"]                 = "Any";
  IDLTypeMap["boolean"]             = "Boolean";
  IDLTypeMap["byte"]                = "Byte";
  IDLTypeMap["octet"]               = "Octet";
  IDLTypeMap["short"]               = "Short";
  IDLTypeMap["unsigned short"]      = "UnsignedShort";
  IDLTypeMap["long"]                = "Long";
  IDLTypeMap["unsigned long"]       = "UnsignedLong";
  IDLTypeMap["long long"]           = "LongLong";
  IDLTypeMap["unsigned long long"]  = "UnsignedLongLong";
  IDLTypeMap["float"]               = "Float";
  IDLTypeMap["unrestricted float"]  = "Float";
  IDLTypeMap["double"]              = "Float";
  IDLTypeMap["unrestricted double"] = "Float";
  IDLTypeMap["Date"]                = "Date";
  IDLTypeMap["string"]              = "String";
  IDLTypeMap["DOMString"]           = "String";
  IDLTypeMap["void"]                = "Undefined";
  IDLTypeMap["undefined"]           = "Undefined";
  IDLTypeMap["object"]              = "Object";


  // reflexive
  var keys = Object.keys(IDLTypeMap);
  for(var i = 0; i< keys.length; i++){
    IDLTypeMap[IDLTypeMap[keys[i]]] = IDLTypeMap[keys[i]];
  }

  return IDLTypeMap;
});
