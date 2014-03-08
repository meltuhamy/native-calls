requirejs.config({
  paths: REQUIRE_PATHS
});

require(["NaClModule"], function(NaClModule) {
	window.NaClModule = NaClModule;
});