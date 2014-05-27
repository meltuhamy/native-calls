var NCStats = {
	frames: 0,
	total_simTime: 0,
	num_sims: 0,
	total_tripTime: 0,
	num_trips: 0,
	interval: 1000
};

window.startPublishingStats = function(channel){
	setInterval(function(){
		// publish average every second
		NCStats.publishTime = (new Date()).getTime();
		$.jStorage.publish(channel, NCStats);

		// reset
		NCStats.frames = 0;
		NCStats.total_simTime = 0;
		NCStats.num_sims = 0;
		NCStats.total_tripTime = 0;
		NCStats.num_trips = 0;
	}, NCStats.interval);
}
