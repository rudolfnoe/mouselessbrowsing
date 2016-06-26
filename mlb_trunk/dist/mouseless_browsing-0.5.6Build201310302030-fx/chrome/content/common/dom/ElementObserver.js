with(this){
(function(){
   var ElementObserver = {
      id: 0,
      elementToStyleObserverMap: null,

      //Lazy initialization to avoid dependencies
      getElementToStyleObserverMap: function(){
         if(this.elementToStyleObserverMap==null)
            this.elementToStyleObserverMap = new Map()
         return this.elementToStyleObserverMap
      },

      injectStyleListener: function(element){
         var style = element.style
         style.setPropertyOriginal = style.setProperty
         style.setProperty = function(style, value, priority){
            this.setPropertyOriginal(style, value, priority)
            ElementObserver.notifyObservers(element, style, value)
         }
      },
      
      notifyObservers: function(element, style, value){
         var observers = this.getElementToStyleObserverMap().get(element)
         for (var i = 0; i < observers.size(); i++) {
            observers.get(i).observe(element, style, value)
         }
      },
      
      registerStyleObserver: function(element, observedAttrs, callbackFunc, thisObj){
         var observer = new Observer(id++, observedAttrs, callbackFunc, thisObj)
         if(!this.getElementToStyleObserverMap().containsKey(element)){
            this.injectStyleListener(element)
            this.getElementToStyleObserverMap().put(element, new ArrayList(observer))
         }else{
            this.getElementToStyleObserverMap().get(element).add(observer)            
         }
         return observer.id
      },
      
      unregisterObserver: function(observerId){
         var observersList = this.getElementToStyleObserverMap().values()
         outerList:
         for (var i = 0; i < observersList.size(); i++) {
            var observerList = observersList.get(i)
            for (var j = 0; j < observerList.size; j++) {
               if(observerList.get(j).id==observerId)
                  observerList.removeAtIndex(j)
                  break outerList
            }
         }
      }
   }
   
   function Observer(id, observedAttrs, callbackFunc, thisObj){
      this.id = id
      if(typeof observedAttrs == "string")
         this.observedAttrs = new Array(observedAttrs)
      else if (ObjectUtils.getType(observedAttrs)==BasicObjectTypes.ARRAY)
         this.observedAttrs = observedAttrs
      else
         throw new Error('unaccepted parameter')
      this.callbackFunc = callbackFunc
      this.thisObj = thisObj
   }
   
   Observer.prototype = {
      observe: function(element, attr, value){
         if(this.observedAttrs.indexOf(attr)==-1)
            return
         if(this.thisObj)
            this.callbackFunc.apply(this.thisObj, [element, attr, value])
         else
            this.callbackFunc(element, attr, value)
      }
   }

   this.ElementObserver = ElementObserver;
}).apply(this)
}