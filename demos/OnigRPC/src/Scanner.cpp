#include "PPRPCGEN_OnigTypes.h"
#include "PPRPCGEN_Scanner.h"
#include "onig-scanner.h"
namespace pprpcgen {
namespace Scanner{

uint32_t newScanner( std::vector<std::string> patterns){
	return OnigScanner::newInstance(patterns);
}

OnigMatch findNextMatch( uint32_t scannerID,  std::string string,  uint32_t startPosition){
	OnigScanner* scanner = OnigScanner::getInstance(scannerID);
	return scanner->findNextMatch(string, startPosition);
}

}
}