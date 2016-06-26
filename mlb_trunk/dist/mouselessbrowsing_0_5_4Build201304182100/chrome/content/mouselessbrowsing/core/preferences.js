/*
 * Mouseless Browsing 
 * Version 0.5
 * Created by Rudolf Noe
 * 30.12.2007
 */

(function(){
	//Imports
   var Prefs = mlb_common.Prefs
   var Utils = mlb_common.Utils
   var MlbCommon = mouselessbrowsing.MlbCommon
   var GlobalData = mouselessbrowsing.GlobalData
   
	function SiteRule (urlRegEx, visibilityMode, exclusiveUseOfNumpad, showIdsOnDemand){
		this.urlRegEx = urlRegEx
		this.visibilityMode = visibilityMode
		this.exclusiveUseOfNumpad = exclusiveUseOfNumpad
		this.showIdsOnDemand = showIdsOnDemand
	}
   var NS = mlb_common.Namespace
   NS.bindToNamespace("mouselessbrowsing", "SiteRule", SiteRule)
	
	var MlbPrefs = {
		DEBUG_PREF_ID: "mouselessbrowsing.debug",
		DEBUG_PERF_PREF_ID: "mouselessbrowsing.debug.perf",
		BLUR_ACTIVE_ELEMENT_KEY_PREF_ID: "mouselessbrowsing.keys.blurActiveElement",
		BLOCK_KEYBOARD_INDPUT_PREF_ID: "mouselessbrowsing.keys.blockKeyboardInputForMlb",
		disableMLB: null,
      showIdsOnDemand: null,
		disableAutomaticPageUpdateOnChange: null,
		initOnDomContentLoaded: null,
		executeAutomaticEnabled: null,
		executeInstantlyWhenIdUnique: null,
		delayForAutoExecute: null,
		pixelsToScroll: null,
		maxIdNumber: null,
		idType: null,
		modifierForWritableElement: null,
		modifierForOpenInNewTab: null,
		modifierForOpenInNewWindow: null,
		modifierForOpenInCoolirisPreviews: null,
		idChars: null,
		smartPositioning: null,
//      TODO remove or put in
//      omitSmartPosForCheckboxAndRadio: null,
      filterDuplicateLinks: null,
      showTabIds: null,
		showKeybufferInStatusbar: null,
		showMlbIconInStatusbar: null,
		showMlbMenu: null,
		siteRules: null,
		styleForIdSpan: null,
		styleForFrameIdSpan: null,
		toggleExlNumpadWithDoubleStrokeNumKey: null,
		//Not configurable via prefs dialog 
		debug: null,
      
      isColorStyleDefined: false,
      isBackgroundColorStyleDefined: false,
      
		initPrefs: function (){
		    try{
				//Checking actual preference settings
		      this.observedPropExclusiveUseOfNumpad = Prefs.getBoolPref("mouselessbrowsing.exclusiveNumpad");
            this.showIdsOnDemand = Prefs.getBoolPref("mouselessbrowsing.showIdsOnDemand");
		      this.disableMLB= Prefs.getBoolPref("mouselessbrowsing.disableMLB");
		      this.disableAutomaticPageUpdateOnChange= Prefs.getBoolPref("mouselessbrowsing.disableAutomaticPageUpdateOnChange");
		      this.initOnDomContentLoaded = Prefs.getBoolPref("mouselessbrowsing.initOnDomContentLoaded");
		      this.executeAutomaticEnabled = Prefs.getBoolPref("mouselessbrowsing.executeAutomaticNew");
		      this.executeInstantlyWhenIdUnique = Prefs.getBoolPref("mouselessbrowsing.executeInstantlyWhenIdUnique");
				this.smartPositioning = Prefs.getBoolPref("mouselessbrowsing.smartPositioning");
            //      TODO remove or put in
//				this.omitSmartPosForCheckboxAndRadio = Prefs.getBoolPref("mouselessbrowsing.omitSmartPosForCheckboxAndRadio");
				this.filterDuplicateLinks = Prefs.getBoolPref("mouselessbrowsing.filterDuplicateLinks");
				this.showTabIds = Prefs.getBoolPref("mouselessbrowsing.showTabIds");
		      this.showKeybufferInStatusbar = Prefs.getBoolPref("mouselessbrowsing.showKeybufferInStatusbar");
		      this.showMlbIconInStatusbar = Prefs.getBoolPref("mouselessbrowsing.showMlbIconInStatusbar");
		      this.showMlbMenu = Prefs.getBoolPref("mouselessbrowsing.showMlbMenu");
		      this.delayForAutoExecute = Prefs.getCharPref("mouselessbrowsing.autoExecuteDelay");
		      this.pixelsToScroll = Prefs.getCharPref("mouselessbrowsing.pixelsToScroll");
		      this.maxIdNumber = Prefs.getCharPref("mouselessbrowsing.maxIdNumber");
		      this.idType = Prefs.getCharPref("mouselessbrowsing.idType");
      		this.modifierForWritableElement = Prefs.getCharPref("mouselessbrowsing.modifierForWritableElement");
      		this.modifierForOpenInNewTab = Prefs.getCharPref("mouselessbrowsing.modifierForOpenInNewTab");
      		this.modifierForOpenInNewWindow = Prefs.getCharPref("mouselessbrowsing.modifierForOpenInNewWindow");
      		this.modifierForOpenInCoolirisPreviews = Prefs.getCharPref("mouselessbrowsing.modifierForOpenInCoolirisPreviews");
      		this.toggleExlNumpadWithDoubleStrokeNumKey = Prefs.getBoolPref("mouselessbrowsing.toggleExlNumpadWithDoubleStrokeNumKey");
		      if(this.isCharIdType()){
			      this.idChars = Prefs.getCharPref("mouselessbrowsing.idChars");
		      }else{
		      	this.idChars = "1234567890"
		      }
		      this.initSiteRules()
		      this.initStylePrefs()

		      //Init debug prefs
		      this.debug = Prefs.getBoolPref(this.DEBUG_PREF_ID) 
		      this.debugPerf = Prefs.getBoolPref(this.DEBUG_PERF_PREF_ID) 
		      
		    }catch(e){
		    	 alert("Error during initialization of Prefs:" + e)
		    	 throw e
		    }
		},
		
		initStylePrefs: function(){
			var importantExceptions = {"font-family":"", "margin-left":"", "max-width":""}
		   this.styleForIdSpan = this.addImportantToStyles(Prefs.getCharPref("mouselessbrowsing.styleForIdSpan"), importantExceptions);
		   //For Frame id spans all styles are set to !important 
		   this.styleForFrameIdSpan = this.addImportantToStyles(Prefs.getCharPref("mouselessbrowsing.styleForFrameIdSpan"), {});
         this.isColorStyleDefined = /(^\s*color\s*:)|(;\s*color\s*:)/i.test(this.styleForIdSpan)
         this.isBackgroundColorStyleDefined = this.styleForIdSpan.toLowerCase().indexOf('background-color')!=-1
		},
		
		/*
		 * Adds !important to styles as styles should not be overruled by page styles
		 */
		addImportantToStyles: function(styleString, exceptions){
		    var styleEntries = styleString.split(";")
		    var newStyleArray = new Array()
		    var styleKeyRegEx = /(\s|:)/
		    for (var i = 0; i < styleEntries.length; i++) {
		       var styleEntry = styleEntries[i]
		       //remove spaces and "\n" at beginning
		       styleEntry = styleEntry.replace(/^[\\n\s]*/,"")
		       if(styleEntry.length==0){
		       	continue
		       }
		       var styleKey = styleEntry.substring(0, styleEntry.search(/[\s:]/))
		       if(styleEntry.indexOf("!important")==-1 && exceptions[styleKey]==null){
		       	styleEntry +=" !important"
		       }
		       newStyleArray.push(styleEntry)
		    }
		    return newStyleArray.join(";")
		},
		
		initSiteRules: function(){
			this.siteRules = new Array()
			if(!Prefs.hasUserPref('mouselessbrowsing.siteRules')){
				return
			}
         var siteRulesArray = Prefs.getPrefsForListbox('mouselessbrowsing.siteRules')
         for(var i=0; i<siteRulesArray.length; i++) {
         	var urlRegEx = Utils.convert2RegExp(siteRulesArray[i][0])
         	var visibilityMode = siteRulesArray[i][1]
         	//Following values are stored as strings
         	var exclusiveUseOfNumpad = (siteRulesArray[i][2]=='true')
         	var showIdsOnDemand = (siteRulesArray[i][3]=='true')
         	this.siteRules.push(new SiteRule(urlRegEx, visibilityMode, exclusiveUseOfNumpad, showIdsOnDemand))
         }
		},
		
      isNumericIdType: function(){
      	return this.idType==MlbCommon.IdTypes.NUMERIC
      },
      
      isCharIdType: function(){
      	return this.idType==MlbCommon.IdTypes.CHAR
      },
      
      setShowMlbMenuFlag: function(show){
      	this.showMlbMenu=show
         Prefs.setBoolPref("mouselessbrowsing.showMlbMenu", show)	
      },
      
      setShowMlbStatusbarFlag: function(show){
         this.showMlbIconInStatusbar=show
         Prefs.setBoolPref("mouselessbrowsing.showMlbIconInStatusbar", show)
         this.showKeybufferInStatusbar=show
         Prefs.setBoolPref("mouselessbrowsing.showKeybufferInStatusbar", show) 
      },
      
      setShowTabIdFlag: function(show){
         this.showTabIds = show
         Prefs.setBoolPref("mouselessbrowsing.showTabIds", show)
      },
      
      isEscKey: function(prefKey){
      	return Prefs.getCharPref(prefKey)==27<<4
      }
      
	} 
   var NS = mlb_common.Namespace
   NS.bindToNamespace("mouselessbrowsing", "MlbPrefs", MlbPrefs)

   
})()
