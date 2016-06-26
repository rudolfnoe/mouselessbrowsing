with(mlb_common){
(function(){
   //Constants
   /*
    *Data Containter for holding all data needed for init process
    *@param currentWin: Current win-object for which init should take place
    *@param onpageshow2ndCall: Flag inidicating that this second cycle of initializing, the first is onDomContentLoaded
    *@param keepExsitingIds: Flag indicating that exisitng id spans should not be changed.
    */
   function PageInitData(currentWin, onpageshow2ndCall, installChangeListener, keepExistingIds, event, rebindElementsToIds){
      this.currentWin = currentWin;
      this.onpageshow2ndCall = onpageshow2ndCall
      this.installChangeListener = installChangeListener
      this.keepExistingIds = keepExistingIds
      this.event = event
      this.rebindElementsToIds = arguments.length>=6?rebindElementsToIds:false
      this.pageData = null
   }
   
   PageInitData.prototype = {
      addElementIdSpanBinding: function(element, idSpan){
         return this.pageData.addElementIdSpanBinding(element, idSpan)   
      },
      
      getCurrentWin: function(){
         return this.currentWin
      },

      setCurrentWin: function(win){
         this.currentWin = win
      },

      getCurrentTopWin: function(){
         return this.currentWin.top
      },
      
      getCurrentDoc: function(){
         return this.currentWin.document
      },
      
      getEvent: function(){
         return this.event
      },

      getIdSpan: function(element){
         return this.pageData.getIdSpanByElement(element)
      },
      
      getInitCounter: function(){
         return this.pageData.getInitCounter()   
      },

      getKeepExistingIds: function(){
         return this.keepExistingIds
      },

      setKeepExistingIds: function(keepExistingIds){
         this.keepExistingIds = keepExistingIds
      },

      setPageData: function(pageData){
         this.pageData = pageData
      },
      
      isRebindElementsToIds: function(){
         return this.rebindElementsToIds
      },

      isOnPageshow: function(){
         return this.event && this.event.type==this.EventTypes.PAGE_SHOW
      },

      isOnDomContentLoaded: function(){
         return this.event && this.event.type==this.EventTypes.DOM_CONTENT_LOADED
      },
      
      isPagePersisted: function(){
         return this.event && this.event.persisted   
      },
      
      EventTypes: {
          DOM_CONTENT_LOADED: "DOMContentLoaded",
          PAGE_SHOW:"pageshow",
          TOGGLING_IDS:"togglinids"     
      }
   }
   
   Namespace.bindToNamespace("mouselessbrowsing", "PageInitData", PageInitData)
})()
}