/**
 * Contains Code for migration to version 0.5
 */
with(mouselessbrowsing){
with(mlb_common){
(function(){
	
   var Application = mlb_common.Application;
   var VersionManager = { 
   	VERSION_PREF: "mouselessbrowsing.version",
   	
      versionsToBeMigrated: ["0.5", "0.5.2Alpha_1"],
                   
   	doFirstInstallationMigration: function(){
         //Set different keys for toggleing Ids for Unix OS as "Decimal" key is "Separator" key on linux
         if(Utils.getOperationSystem()==OperationSystem.LINUX){
            var prefs = Application.prefs
            prefs.setValue("mouselessbrowsing.keys.toggleMLB", "1728")   
            prefs.setValue("mouselessbrowsing.keys.toggleAllIds", "1730")
            prefs.setValue("mouselessbrowsing.keys.toggleEnableDisableMLB", "1729")
            MlbUtils.logDebugMessage("Shortcut for toggling ids changed for Linux host system")
         }
         MlbUtils.logDebugMessage("VersionManager.doFirstInstallationMigration done")
         //Do setup a little bit later so the main window is already open
         setTimeout(Utils.bind(this.setup, this), 500)
      },
      
      doMigration: function(){
         var migrated = false
         if(this.isFirstInstallation()){
            migrated = true
            this.doFirstInstallationMigration()
         }else if(this.hasVersionToBeMigrated()){
            migrated = true
            this.doMigrationToCurrentVersion()
         }
         Prefs.setCharPref(this.VERSION_PREF, MlbCommon.MLB_VERSION)
         //Commentet out as homepage is broken
         /*if(migrated){
      		setTimeout(mouselessbrowsing.VersionManager.showVersionInfoPage, 1000)
         }*/
   	},
      
      doMigrationToCurrentVersion: function(){
         var currentVersion = Prefs.getCharPref(this.VERSION_PREF)
         for (var i = 0; i < this.versionsToBeMigrated.length; i++) {
            var version = this.versionsToBeMigrated[i]
            if(ServiceRegistry.getVersionComparator().compare(version, currentVersion)>0){
               var mirgationFunctionName = "migrateToVersion_" + version.replace(/\./g,"_") 
               this[mirgationFunctionName]()
               MlbUtils.logDebugMessage("Successfully migrated to version " + version)
            }
         }
      },
      
   	deleteObsoletePrefs: function(){
			if (Prefs.hasUserPref('mouselessbrowsing.enableCtrlPlusDigit')) {
   			Application.prefs.get('mouselessbrowsing.enableCtrlPlusDigit').reset()
			}
			if (Prefs.hasUserPref('mouselessbrowsing.useSelfDefinedCharsForIds')) {
   			Application.prefs.get('mouselessbrowsing.useSelfDefinedCharsForIds').reset()
			}
			if (Prefs.hasUserPref('mouselessbrowsing.showTabIds')) {
   			Application.prefs.get('mouselessbrowsing.showTabIds').reset()
			}
			MlbUtils.logDebugMessage('Old prefs deleted')
   	},
   	
      hasVersionToBeMigrated: function(){
         if(this.isFirstInstallation())
            return false
   		var newInstalledVersion = MlbCommon.MLB_VERSION
   		var currentVersion = Prefs.getCharPref(this.VERSION_PREF)
   		if(ServiceRegistry.getVersionComparator().compare(newInstalledVersion, currentVersion)>0){
   			return true
   		}else{
   			return false
   		}
   	},
      
      isFirstInstallation: function(){
         return Application.prefs.getValue('mouselessbrowsing.version', "").length==0
      },
   	
   	migrateStyles: function(){
   		var prefKeyStyleForIdSpan = "mouselessbrowsing.styleForIdSpan"
   		var prefKeyStyleForFrameIdSpan = "mouselessbrowsing.styleForFrameIdSpan"
   		if(!Prefs.hasUserPref(prefKeyStyleForIdSpan) && 
   		    !Prefs.hasUserPref(prefKeyStyleForFrameIdSpan)){
   		    	return
   		}
   		var args = {out:null}
   		openDialog(MlbCommon.MLB_CHROME_URL+"/preferences/style_migration_dialog.xul", "", "chrome, dialog, modal", args)
   		if(args.out==null || args.out=="KEEP"){
   			return
   		}
   		if (Prefs.hasUserPref(prefKeyStyleForIdSpan)) {
   			Application.prefs.get(prefKeyStyleForIdSpan).reset()
			}
			if (Prefs.hasUserPref(prefKeyStyleForFrameIdSpan)) {
   			Application.prefs.get(prefKeyStyleForFrameIdSpan).reset()
			}
   	},
   	
   	migrateToVersion_0_5: function(){
   		this.migrateStyles()
   		this.deleteObsoletePrefs()
   	},
      
      migrateToVersion_0_5_2Alpha_1: function(){
         Application.prefs.setValue("mouselessbrowsing.executeAutomaticNew", Application.prefs.getValue("mouselessbrowsing.executeAutomatic", false))
         //Reinit prefs
         MlbPrefs.initPrefs();
      },
      
      setup: function(){
         var setupDialog = new Dialog(MlbCommon.MLB_CHROME_URL+"/preferences/setup/setup.xul", "setupdialog", false, window)
         var callBackHandler = {
            handleDialogAccept: function(){
               Utils.notifyObservers(MlbCommon.MLB_PREF_OBSERVER);
            }
         }
         setupDialog.addEventListener(callBackHandler)
         setupDialog.show()
      },
   	
   	showVersionInfoPage: function(){
   		var newTab = Utils.openUrlInNewTab('http://mlb.whatsnew.rudolf-noe.de')
   		newTab.moveBefore(Application.activeWindow.tabs[0])
         newTab.focus();
   	}
   	
   	
   }
   var NS = mlb_common.Namespace
   NS.bindToNamespace("mouselessbrowsing", "VersionManager", VersionManager)
   
})()
}}