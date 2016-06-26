with(this){
(function(){
	function Map(){
      this.keyList = new ArrayList()
      this.valueList = new ArrayList()
	}
	
	Map.prototype = {
		constructor: Map,
		clear: function(){
		   this.keyList = new ArrayList()
		   this.valueList = new ArrayList()
		},
		
		containsKey: function(key){
		   return this.keyList.contains(key)	
		},
		
		containsValue: function(obj){
		   return this.valueList.contains(obj)	
		},
		
		get: function(key){
			var index = this.keyList.indexOf(key)
         if(index==-1)
            return null
         else
            return this.valueList.get(index)
		},
		
		keys: function(){
			return this.keyList.toArray()
		},
		
		put: function(key, value){
         this.keyList.add(key)
         this.valueList.add(value)
		},
		
		remove: function(key){
         var index = this.keyList.indexOf(key)
         if(index!=-1){
            this.keyList.removeAtIndex(index)
            this.valueList.removeAtIndex(index)
         }
		},
		
		values: function(){
         return this.valueList.toArray()
		}
		
	}

	this["Map"] = Map;
}).apply(this)
}