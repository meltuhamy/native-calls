#ifndef SRC_ONIG_SCANNER_H_
#define SRC_ONIG_SCANNER_H_

#include "onig-cache.h"
#include "onig-searcher.h"
#include <string>
#include <vector>
#include <memory>
#include <map>
#include "OnigTypes.h"

class OnigRegExp;
class OnigResult;

class OnigScanner {
  public:
	static uint32_t newInstance(std::vector<std::string> patterns);
	static OnigScanner* getInstance(uint32_t instanceID);
	OnigMatch findNextMatch(std::string string, uint32_t startPosition);
  private:
    ~OnigScanner();

    std::vector<CaptureIndex> CaptureIndicesForMatch(OnigResult* result, std::string stdString, bool hasMultibyteCharacters);

    std::vector< std::shared_ptr<OnigRegExp> > regExps;
    std::shared_ptr<OnigSearcher> searcher;
    shared_ptr<OnigCache> asyncCache;

    // instances
    OnigScanner(std::vector<std::string> patterns);
    static std::map<uint32_t, OnigScanner*>* instances;
    static uint32_t nextInstanceID;

};

#endif  // SRC_ONIG_SCANNER_H_
