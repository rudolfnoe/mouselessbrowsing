with(this){
(function(){
	function AbstractGenericEventHandler(){
	}
	AbstractGenericEventHandler.prototype = {
		constructor: AbstractGenericEventHandler,
		
		handleEvent: function(event){
			var type = event.type
			var funcName = "handle" + type.substring(0,1).toUpperCase() + type.substring(1) 
			if(this[funcName] instanceof Function){
				this[funcName](event)
			}
		}
	}
   this["AbstractGenericEventHandler"] = AbstractGenericEventHandler;
}).apply(this)
}