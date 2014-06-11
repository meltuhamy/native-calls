var NCStats = {
	frames: 0,
	total_simTime: 0,
	num_sims: 0,
	total_tripTime: 0,
	num_trips: 0,
	interval: 60,
  intervalId: undefined,
  num_samples: 0
};

var NCStatsSum = {
  frames: 0,
  total_simTime: 0,
  num_sims: 0,
  total_tripTime: 0,
  num_trips: 0
};


NCStats.intervalId = setInterval(function(){
  // collect average and reset.
  NCStatsSum.frames += NCStats.frames;
  NCStatsSum.total_simTime += NCStats.total_simTime;
  NCStatsSum.num_sims += NCStats.num_sims;
  NCStatsSum.total_tripTime += NCStats.total_tripTime;
  NCStatsSum.num_trips += NCStats.num_trips;
  NCStats.frames = 0;
  NCStats.total_simTime = 0;
  NCStats.num_sims = 0;
  NCStats.total_tripTime = 0;
  NCStats.num_trips = 0;

  NCStats.num_samples++;

}, NCStats.interval);

window.startPublishingStats = function(channel){
  var sendInterval = 1000; // send every second

  // publish average every second, but wait a second first.

  sender = function(){
    NCStatsSum.publishTime = (new Date()).getTime();

    //publish means
    pmrpc.call({
      destination: window.opener,
      publicProcedureName: channel,
      params: [NCStatsSum],
      onSuccess: function(){
        NCStatsSum.frames = 0;
        NCStatsSum.total_simTime = 0;
        NCStatsSum.num_sims = 0;
        NCStatsSum.total_tripTime = 0;
        NCStatsSum.num_trips = 0;
        setTimeout(sender, sendInterval);
      }
    });
  };
  setTimeout(sender, sendInterval*2);
};


