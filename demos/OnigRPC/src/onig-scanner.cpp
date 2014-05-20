#include "onig-scanner.h"
#include "onig-reg-exp.h"
#include "onig-result.h"
//#include "onig-scanner-worker.h"
#include "unicode-utils.h"


uint32_t OnigScanner::nextInstanceID = 0;
std::map<uint32_t, OnigScanner*>* OnigScanner::instances = new std::map<uint32_t, OnigScanner*>();



// todo utf8 support?
// todo optimise vector passing
OnigScanner::OnigScanner(std::vector<std::string> sources) {
  int length = sources.size();
  regExps.resize(length);

  for (int i = 0; i < length; i++) {
    regExps[i] = shared_ptr<OnigRegExp>(new OnigRegExp(sources[i], i));
  }

  searcher = shared_ptr<OnigSearcher>(new OnigSearcher(regExps));
  asyncCache = shared_ptr<OnigCache>(new OnigCache(length));
}

OnigScanner::~OnigScanner() {}

// todo asynch support
//void OnigScanner::FindNextMatch(Handle<String> v8String, Handle<Number> v8StartLocation, Handle<Function> v8Callback) {
//  String::Utf8Value utf8Value(v8String);
//  string string(*utf8Value);
//  int charOffset = v8StartLocation->Value();
//  bool hasMultibyteCharacters = v8String->Length() != v8String->Utf8Length();
//  NanCallback *callback = new NanCallback(v8Callback);
//
//#ifdef _WIN32
//  String::Value utf16Value(v8String);
//  shared_ptr<wchar_t> utf16String(wcsdup(reinterpret_cast<wchar_t*>(*utf16Value)));
//#else
//  shared_ptr<wchar_t> utf16String;
//#endif
//
//  OnigScannerWorker *worker = new OnigScannerWorker(callback, regExps, string, utf16String, hasMultibyteCharacters, charOffset, asyncCache);
//  NanAsyncQueueWorker(worker);
//}

OnigMatch OnigScanner::findNextMatch(std::string stringToSearch, uint32_t startPosition) {

  // todo multibyte character support

  wchar_t *utf16String = NULL;
#ifdef _WIN32
  // todo windows support
//  String::Value utf16Value(v8String);
//  utf16String = reinterpret_cast<wchar_t*>(*utf16Value);
#endif

  shared_ptr<OnigResult> bestResult = searcher->Search(stringToSearch, utf16String, false, startPosition);
  if(!bestResult){
	  return OnigMatch();
  }

  OnigMatch result;
  result.index = bestResult->Index();
  result.captureIndices = CaptureIndicesForMatch(bestResult.get(), stringToSearch, false);
  return result;

}

std::vector<CaptureIndex> OnigScanner::CaptureIndicesForMatch(OnigResult* result, std::string stdString, bool hasMultibyteCharacters) {
  int resultCount = result->Count();
  std::vector<CaptureIndex> captures;

  for (int index = 0; index < resultCount; index++) {
    int captureLength = result->LengthAt(index);
    int captureStart = result->LocationAt(index);

    if (hasMultibyteCharacters) {
      const char* stringData = stdString.data();
      captureLength = UnicodeUtils::characters_in_bytes(stringData + captureStart, captureLength);
      captureStart = UnicodeUtils::characters_in_bytes(stringData, captureStart);
    }

    CaptureIndex r;
    r.index = index; // don't really need this.... (?)
    r.start = captureStart;
    r.end = captureStart + captureLength;
    r.length = captureLength;
    captures.push_back(r);
  }

  return captures;
}

uint32_t OnigScanner::newInstance(std::vector<std::string> patterns){
	OnigScanner* instance = new OnigScanner(patterns);
	uint32_t id = OnigScanner::nextInstanceID++;
	OnigScanner::instances->insert(std::pair<uint32_t,OnigScanner*>(id, instance));
	return id;
}

OnigScanner* OnigScanner::getInstance(uint32_t id){
	std::map<uint32_t,OnigScanner*>::iterator it = OnigScanner::instances->find(id);
	if(it == OnigScanner::instances->end()){
		return NULL;
	} else {
		return it->second;
	}
}
