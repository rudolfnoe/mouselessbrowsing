with(this){
(function(){   
   function ArrayList (arg){
   	if(arg!=null){
   		if(arg.constructor ==Array){
      		this.array = new Array()
   			for (var i = 0; i < arg.length; i++) {
   				this.add(arg[i])
   			}
   	   }else{
   	   	this.array = new Array(arg)
   	   }
   	}else{
   		this.array = new Array()
   	}
   }
   
   ArrayList.prototype = {
      constructor: ArrayList,
      
      _checkIndexInRange: function(index){
         if(index<0 || index>=this.array.length)
            throw new Error('IndexOutOfBounds')
      },
      
      add: function(obj){
         this.array.push(obj)
      },
      
      addAll: function(arr){
         if(arr.constructor == ArrayList){
         	arr = arr.array
         }
         this.array = this.array.concat(arr)
      },
      
      addAllAtIndex: function(index, arr){
         if(arr.constructor == ArrayList){
         	arr = arr.array
         }
         this.array = this.array.slice(0,index).concat(arr).concat(this.array.slice(index))
      },
      
      addAtIndex: function(index, obj){
         if(index<0 || index>this.array.length)
            throw new Error('IndexOutOfBounds')
         if(index==this.array.length)
            this.array.push(obj)
         else
      	  this.array = this.array.slice(0,index).concat(obj).concat(this.array.slice(index))
      },
      
      clear: function(){
      	this.array = new Array()
      },
      
      contains: function(obj, compareFunc){
      	if(compareFunc){
            return this.array.some(function(element, index, array){
            	compareFunc(obj, element)
            })
      	}else{
         	return this.array.indexOf(obj)!=-1
      	}
      },
      
      get: function(index){
         this._checkIndexInRange(index)
      	return this.array[index]
      },
      
      indexOf: function(obj){
         return this.array.indexOf(obj)   
      },

      remove: function(obj){
         var index = this.array.indexOf(obj)
         if(index==-1)
            throw new Error('obj not in list')
      	this.removeAtIndex(index)
      },
      
      removeAtIndex: function(index){
         this._checkIndexInRange(index)
      	this.array = this.array.slice(0,index).concat(this.array.slice(index+1))
      },
      
      //Params are inclusive bounderies
      removeRange: function(startIndex, endIndex){
         this._checkIndexInRange(startIndex)
         this._checkIndexInRange(endIndex)
         var lastPart = null
         if(endIndex<this.size()-1)
            var lastPart =  this.array.slice(endIndex+1)
         this.array = this.array.slice(0,startIndex)
         if(lastPart)
            this.array = this.array.concat(lastPart)
      },
      
      set: function(index, obj){
         this._checkIndexInRange(index)
      	this.array[index] = obj
      },
      
      size: function(){
      	return this.array.length
      },
      
      toArray: function(){
      	var newArray = new Array()
      	for (var i = 0; i < this.array.length; i++)
      		newArray.push(this.get(i))
      	return newArray
      },
      
      toString: function(){
      	return "ArrayList: " + this.array.toString()
      }
      
      
   }
   this["ArrayList"]= ArrayList;   
}).apply(this)
}