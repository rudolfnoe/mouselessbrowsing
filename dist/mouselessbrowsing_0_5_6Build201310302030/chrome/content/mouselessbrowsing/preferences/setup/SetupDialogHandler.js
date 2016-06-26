with(mlb_common){
with(mouselessbrowsing){
(function(){
   
   SetupDialogHandler = {
      
      doCancel: function(){
         //do nothing
      },
      
      doOK: function(){
         Prefs.savePrefs(document)
      },

      doOnload: function(){
         Prefs.loadPrefs(document);
      }
      
   }
   
   Namespace.bindToNamespace("mouselessbrowsing", "SetupDialogHandler", SetupDialogHandler)
})()
}}