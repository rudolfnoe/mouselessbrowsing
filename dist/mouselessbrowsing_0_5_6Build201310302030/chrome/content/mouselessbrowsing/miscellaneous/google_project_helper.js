/*
 * Writes the configuration of FF / MLB in the description field
 * of the new issue entered in Google Projects
 */
(function(){
	var MlbCommon = mouselessbrowsing.MlbCommon
	var Prefs = mlb_common.Prefs
   var GoogleProjectHelper = {
   	onPageShow: function(event){
   		var win = event.originalTarget.defaultView
   		if(win==null || win.location==null || win.location.href != "http://code.google.com/p/mouselessbrowsing/issues/entry"){
   			return
   		}
   		var config = "\nClient Configuration (automatically added by MLB)\nOS: "
   		config += Components.classes["@mozilla.org/xre/app-info;1"]
                         .getService(Components.interfaces.nsIXULRuntime).OS;
         var ffInfo = Components.classes["@mozilla.org/xre/app-info;1"]
                     .getService(Components.interfaces.nsIXULAppInfo);
         config += ", " + ffInfo.name + " " + ffInfo.version + ", MLB " + MlbCommon.MLB_VERSION + "\n"
         config += "MLB Configuration:\n"
         Prefs.getFuelPrefs("mouselessbrowsing.").forEach(function(fuelPref){
            config += fuelPref.name + ": " + fuelPref.value + "\n"
         })
         var comment = win.document.getElementsByName('comment')[0]
         comment.value += config
   	}
   }
	var NS = mlb_common.Namespace
   NS.bindToNamespace("mouselessbrowsing", "GoogleProjectHelper", GoogleProjectHelper)
})()

