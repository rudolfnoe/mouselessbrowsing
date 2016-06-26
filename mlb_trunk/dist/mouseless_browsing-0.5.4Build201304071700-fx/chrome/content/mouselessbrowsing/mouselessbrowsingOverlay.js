/*
 * Mouseless Browsing 
 * Version 0.5
 * Created by Rudolf Noe
 * 31.12.2007
*/
(function(){
	//Add event for each window
	window.addEventListener('load',  {handleEvent: function(event){mouselessbrowsing.InitManager.init(event)}}, false);
})()