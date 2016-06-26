/**
 * Contains constants and loading of common subscripts
 */
(function(){
	var MlbCommon = { 
		//Constants
		COMMON_CHROME_ULR: "chrome://mouselessbrowsing/content/common/",
		
		MLB_GUI_ID: "{c0bcf963-624b-47fe-aa78-8cc02434cf32}",
		MLB_VERSION: "0.5.5Build201308072100",
		MLB_CHROME_URL: "chrome://mouselessbrowsing/content/mouselessbrowsing",
		MLB_PREF_OBSERVER: "MLB_PREF_OBSERVER",
		
		//Attribute of the id-span that flags the span as an id-span
		ATTR_ID_SPAN_FLAG: "MLB_idSpanFlag",

		//Attribute of the id-span identifying the type element the id is for
		//see Tyes for id-Spans
		//Used for toggling the visibility of the id-spans
		ATTR_ID_SPAN_FOR: "idSpanFor",
		
		//Attribute of id span containing the element it belongs to
		//Not fill in every case
		ATTR_ELEMENT_FOR_ID_SPAN: "idSpanElement",
      
      //Atribute idicating that this element should be igored
      ATTR_IGNORE_ELEMENT: "mlb_ignore",
      
      //key with which the binding between element and id span can be retrieved from the page data
      MLB_BINDING_KEY_ATTR: "mlb_binding_key",

		 
		//Types of id-Spans, the value of the Attribute MLB_idSpanFor
		IdSpanTypes: {
			FRAME: "FRAME",
			IMG: "IMG",
			FORMELEMENT: "FORMELEMENT",
			LINK: "LINK",
			OTHER: "OTHER"
		},
		
		VisibilityModes: {
			ALL: "ALL",
			CONFIG: "CONFIG",
			NONE: "NONE"
		},
		
		ModifierCodes:{
			CTRL: 1,
			ALT: 2,
			SHIFT: 4
		},
		
		IdTypes:{
			NUMERIC: "NUMERIC",
			CHAR: "CHAR"
		},
		
		OpenLinkLocations:{
			TAB:"TAB",
			WINDOW:"WINDOW",
			COOLIRIS_PREVIEW:"COOLIRIS_PREVIEW"
		},
		
		//ShortcutManager-ClientId
		SCM_CLIENT_ID: "MLB",
		
		/*
		 * Loads Script from url
		 * Must be local url
		 */
		loadScript: function(url, scopeObj){
			var sm = Components.classes["@mozilla.org/moz/jssubscript-loader;1"].
							getService(Components.interfaces.mozIJSSubScriptLoader)
			sm.loadSubScript(url, scopeObj);
		},
		
		init: function(){
         //Create Namespace object for mouseless
         var namespaceObj = window['mlb_common'] = new Object()
         
         try{
            //Load script loader all the rest
            var tempScriptLoaderNS = new Object()
            this.loadScript(this.COMMON_CHROME_ULR + "script/ScriptLoader.js", tempScriptLoaderNS)
            this.scriptLoader = tempScriptLoaderNS.ScriptLoader
            //First load ObjectUtils as this is required during load for Inheritence
            this.scriptLoader.loadScript(this.COMMON_CHROME_ULR+"lang/ObjectUtils.js", namespaceObj)
            var exclude = ["Shortcutmanager.js", "ObjectUtils.js"]
            this.scriptLoader.loadScripts(this.COMMON_CHROME_ULR, namespaceObj, exclude, true)
         }catch(e){
            var msg = "Error during initalization of Mouseless Browsing.\n" +
                      "Please file bug report under: " +
                      "\nhttp://code.google.com/p/mouselessbrowsing/issues/list" +
                      "\nError: " + e.toString() +
                      "\nStackstrace: " +
                      "\n" + e.stack 
            alert(msg)
            Components.utils.reportError(msg)
         }
      
		}
	}
	
	MlbCommon.init()
	
	var NS = mlb_common.Namespace
	NS.bindToNamespace("mouselessbrowsing", "MlbCommon", MlbCommon)
})()