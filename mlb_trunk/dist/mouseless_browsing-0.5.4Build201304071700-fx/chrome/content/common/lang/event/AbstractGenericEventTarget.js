with(this){
(function(){
   function AbstractGenericEventTarget(){
      this.listeners = new ArrayList()
   }
   
   AbstractGenericEventTarget.prototype = {
      AbstractGenericEventTarget: AbstractGenericEventTarget,

      addListener: function(type, callbackFunc, thisObj){
         this.removeListener(type, callbackFunc, thisObj)
         this.listeners.add(new GenericListener(type, callbackFunc, thisObj))
      },
      
      getListener: function(type, callbackFunc, thisObj){
         var listener = new GenericListener(type, callbackFunc, thisObj)
         for (var i = 0; i < this.listeners.size(); i++) {
            if(this.listeners.get(i).equals(listener)){
               return this.listeners.get(i)
            }
         }
         return null;
      },
      
      notifyListeners: function(event){
         for (var i = 0; i < this.listeners.size(); i++) {
            if(this.listeners.get(i).isType(event.type))
               this.listeners.get(i).handleEvent(event)
         }
      },
      
      removeListener: function(type, callbackFunc, thisObj){
         var oldListener = this.getListener(type, callbackFunc, thisObj)
         if(oldListener)
            this.listeners.remove(oldListener)
      },
   }
   
   function GenericListener(type, callbackFunc, thisObj){
      this.type = type?type:null
      this.callbackFunc = callbackFunc
      this.thisObj = thisObj
   }
   
   GenericListener.prototype = {
      isType: function(type){
         return this.type == "*" || this.type == type
      },

      equals: function(listener){
         if(listener.type==this.type &&
            listener.callbackFunc==this.callbackFunc &&
            listener.thisObj==this.thisObj){
               return true
         }else{
            return false
         }
         
      },
      
      handleEvent: function(event){
         if(event.type!=this.type)
            return
         if(this.thisObj)
            this.callbackFunc.apply(this.thisObj, [event])
         else
            this.callbackFunc(event)
      }
   }
   
   this["AbstractGenericEventTarget"] = AbstractGenericEventTarget
}).apply(this)
}