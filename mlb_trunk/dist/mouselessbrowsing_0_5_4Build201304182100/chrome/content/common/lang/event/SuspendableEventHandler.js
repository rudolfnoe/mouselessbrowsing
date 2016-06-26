with(this){
(function(){
   function SuspendableEventHandler(eventHandler, suspended){
      this.eventHandler = eventHandler
      this.suspended = suspended
   }
   
   SuspendableEventHandler.prototype = {
      getSuspended: function(){
         return this.suspended
      },

      setSuspended: function(suspended){
         this.suspended = suspended
      },
      
      handleEvent: function(event){
         if(this.suspended)
            return
         this.eventHandler.handleEvent(event)
      }
   }

   this.SuspendableEventHandler = SuspendableEventHandler;
}).apply(this)
}