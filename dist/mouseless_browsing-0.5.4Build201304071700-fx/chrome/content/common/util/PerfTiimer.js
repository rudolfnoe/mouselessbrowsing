with(this){
(function(){
	function PerfTimer(){
		this.start = new Date()
	}
	PerfTimer.prototype = {
		start: function(){
			this.start = new Date()
		},
		stop: function(){
			this.stop = new Date()
			return this.stop.getTime()-this.start.getTime()
		}
	} 
   this["PerfTimer"] =  PerfTimer;
}).apply(this)
}