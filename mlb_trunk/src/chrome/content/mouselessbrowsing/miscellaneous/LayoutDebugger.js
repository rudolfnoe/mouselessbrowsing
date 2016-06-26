with(mlb_common){
(function(){
   //Imports
   var Application = mlb_common.Application;
   var PageData = mouselessbrowsing.PageData
   function LayoutDebugger(increment){
      this.increment = increment
      this.counter = 0
   }
   
   LayoutDebugger.prototype = {
      constructor: LayoutDebugger,
      
      onIdIncrement: function(){
         this.counter++
         if(this.counter%this.increment==0){
            alert('')
         }
      }
   }
   LayoutDebugger.createPageData = function(idChars){
      var pageData = new PageData(idChars)
      var ld = new LayoutDebugger(10)
      Utils.watchProperty(pageData, "counter", ld.onIdIncrement, ld)
      return pageData
   }
   
   LayoutDebugger.createPageDataBackup = null
   
   LayoutDebugger.init = function(){
      //Replace createMethod
      if(Application.prefs.getValue("mouselessbrowsing.debug.layout_debugger_active", false) &&
         LayoutDebugger.createPageDataBackup == null){
         LayoutDebugger.createPageDataBackup = PageData.createPageData
         PageData.createPageData = LayoutDebugger.createPageData 
      }else if(LayoutDebugger.createPageDataBackup!=null){
         PageData.createPageData = LayoutDebugger.createPageDataBackup
      }
      if(!LayoutDebugger.scm){
         LayoutDebugger.scm = new ShortcutManager()
//         scm.add
      }
   }
   
//   LayoutDebugger.toggleDebugging = function(){
   
   
   Namespace.bindToNamespace("mouselessbrowsing", "LayoutDebugger", LayoutDebugger)
})()
}