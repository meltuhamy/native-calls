#include "ObjectsExample.h"
#include "ppapi/cpp/var_dictionary.h"
#include "ppapi/cpp/var_array_buffer.h"

int acceptsObject(pp::VarDictionary x){
	return 100; 
}

int acceptsTypedArray(pp::VarArrayBuffer x){
	return 200;
}
