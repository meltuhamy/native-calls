#ifndef OBJECTSEXAMPLE_H_
#define OBJECTSEXAMPLE_H_
namespace pp{
	class VarDictionary;
	class VarArrayBuffer;
}

int acceptsObject(pp::VarDictionary x);
int acceptsTypedArray(pp::VarArrayBuffer x);

#endif /* OBJECTSEXAMPLE_H_ */
