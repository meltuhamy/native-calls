define([], function(){
  /**
   * Maps a WebIDL type into a RPCStub spec type. (see RPCStub.js)
   * See http://www.w3.org/TR/WebIDL/#idl-types
   */
  var IDLTypeMap = Object.create(null);

  IDLTypeMap["any"]                 = "Any";
  IDLTypeMap["boolean"]             = "Boolean";
  IDLTypeMap["byte"]                = "Integer";
  IDLTypeMap["octet"]               = "Integer";
  IDLTypeMap["short"]               = "Integer";
  IDLTypeMap["unsigned short"]      = "Integer";
  IDLTypeMap["long"]                = "Integer";
  IDLTypeMap["unsigned long"]       = "Integer";
  IDLTypeMap["long long"]           = "Integer";
  IDLTypeMap["unsigned long long"]  = "Integer";
  IDLTypeMap["float"]               = "Float";
  IDLTypeMap["unrestricted float"]  = "Float";
  IDLTypeMap["double"]              = "Float";
  IDLTypeMap["unrestricted double"] = "Float";
  IDLTypeMap["Date"]                = "Date";
  IDLTypeMap["string"]              = "String";
  IDLTypeMap["DOMString"]           = "String";
  IDLTypeMap["void"]                = "Undefined";


  // reflexive
  IDLTypeMap["Any"]         = "Any";
  IDLTypeMap["Boolean"]     = "Boolean";
  IDLTypeMap["ArrayBuffer"] = "ArrayBuffer";
  IDLTypeMap["Integer"]     = "Integer";
  IDLTypeMap["Float"]       = "Float";
  IDLTypeMap["String"]      = "String";
  IDLTypeMap["Date"]        = "Date";

  return IDLTypeMap;
});
