/*
 * Mouseless Browsing 
 * Version 0.5
 * Created by Rudolf Noe
 * 30.12.2007
 */

with(mlb_common){
with(mouselessbrowsing){
(function(){
	
	var STRINGBUNDLE_ID = "mouselessbrowsingOverlaySB"

   //Prefs observer
   var MLB_prefObserver = null;
   
   //EventHandler
   var mainKeyPressHandler = {handleEvent: function(event){EventHandler.onkeypress(event)}};
   var mainKeyDownHandler = {handleEvent: function(event){EventHandler.onkeydown(event)}}
   var mainScrollHandler = {handleEvent: function(event){EventHandler.onscroll(event)}}
   
   //Used to solve bug #52
   //var mainKeyUpHandler = {handleEvent: function(event){EventHandler.onkeyup(event)}}
   var mainDomContentLoadedHandler = {handleEvent: function(event){PageInitializer.onDOMContentLoaded(event)}}
   var mainPageShowHander = {handleEvent: function(event){PageInitializer.onPageShow(event)}}
   var googleProjectHelperHandler = {handleEvent: function(event){GoogleProjectHelper.onPageShow(event)}}
   var focusHandler = {handleEvent: function(event){EventHandler.onElementFocusEvent(event)}}
   var tabSelectHandlerTabPrefs = {handleEvent: function(event){mouselessbrowsing.TabLocalPrefs.onTabSelect()}}
   var tabSelectHandlerEventHandler = {handleEvent: function(event){EventHandler.onTabSelect()}}
   
   
	var InitManager = {
		eventHandlersActive: false,

      scm: new ShortcutManager(window, "keydown", true),
		
		init: function(event){
		   MlbPrefs.initPrefs();
         MlbUtils.init();
         VersionManager.doMigration()
         //Reinit prefs as something could have changed
		   MlbPrefs.initPrefs();
         if(MLB_prefObserver==null){
            this.registerObservers();
         }
         this.scm.clearAllShortcuts(MlbCommon.SCM_CLIENT_ID);
			if(MlbPrefs.disableMLB){
				this.disableMLB()
			}else{
				this.enableMLB()
			}
		   this.initMenu();
		   this.initStatusbar();
         if(Application.prefs.getValue("mouselessbrowsing.debug.layoutdebugger", false)){
            LayoutDebugger.init()
         }
		   MlbUtils.logDebugMessage("InitManager.init done")
		},
		
		enableMLB: function (){
		    this.initShortCuts()
          TabIdHandler.init(true)
		    var showIdsOnDemand = Prefs.getBoolPref("mouselessbrowsing.showIdsOnDemand");
          if(!this.eventHandlersActive){
		       this.initEventHandlers("addEventListener", showIdsOnDemand);
		       this.eventHandlersActive = true
		    }
		    TabLocalPrefs.initPrefs()
          var disableAllIds = Prefs.getBoolPref("mouselessbrowsing.disableAllIds");
          //Init the current page the others are only initialized on demand
          PageInitializer.init()
          AbstractInitializer.init()

          //As only the current page will be entirely initialized for performance reasons
          //the visibility mode of the others must be adjusted 
          Firefox.iterateAllBrowsers(function(browser){
             if(browser==Firefox.getActiveBrowser())
               return
          	var contentWin = browser.contentWindow
          	var visibilityMode = TabLocalPrefs.getVisibilityMode(contentWin)
          	var idsVisible = PageInitializer.hasVisibleIdSpans(contentWin)  
            if(visibilityMode==MlbCommon.VisibilityModes.NONE && idsVisible){
          		EventHandler.hideIdSpans(contentWin)
          	}
          })
		},
		
		disableMLB: function(){
			//Remove event listener
         TabIdHandler.init(false)
			if(this.eventHandlersActive){
			   this.initEventHandlers("removeEventListener")
			   this.eventHandlersActive = false
			}
			//Add single shortcut for enabling MLB
			this.setShortcut("mouselessbrowsing.keys.toggleEnableDisableMLB", InitManager.toggleEnableDisableMLB, InitManager);
		   PageInitializer.disableMlb()
			EventHandler.disableMlb()
		},
      
      getShortcutManager: function(){
         return this.scm
      },
		
		registerObservers: function(){
			//Add preferences-observer
	      MLB_prefObserver = Utils.createObserverForInterface(InitManager)
	      Utils.registerObserver(MlbCommon.MLB_PREF_OBSERVER, MLB_prefObserver)
	      Utils.observeObject(TabLocalPrefs, "observedPropExclusiveUseOfNumpad", this.initStatusbar, this)
		},
		
		initEventHandlers : function(addOrRemoveListenerFunction, showIdsOnDemand) {
			var tabbrowser = document.getElementById("content"); // tabbrowser
			//key event listener
			window[addOrRemoveListenerFunction]("keypress", mainKeyPressHandler, true);  
         window[addOrRemoveListenerFunction]("keydown", mainKeyDownHandler, true);
         //Used to solve bug #52
//       window[addOrRemoveListenerFunction]("keyup", mainKeyUpHandler, true);
         
         //load event listener
   		tabbrowser[addOrRemoveListenerFunction]("DOMContentLoaded", mainDomContentLoadedHandler, true);
	  		tabbrowser[addOrRemoveListenerFunction]("pageshow", mainPageShowHander, false);
			tabbrowser[addOrRemoveListenerFunction]("pageshow", googleProjectHelperHandler, false);

			// Focus Listener
			getBrowser()[addOrRemoveListenerFunction]("focus", focusHandler, true);
			getBrowser()[addOrRemoveListenerFunction]("blur", focusHandler, true);
         
			//Tab select listener
			getBrowser().tabContainer[addOrRemoveListenerFunction]("TabSelect", tabSelectHandlerTabPrefs,false);
			getBrowser().tabContainer[addOrRemoveListenerFunction]("TabSelect", tabSelectHandlerEventHandler,false);
         
         //Scroll listener
         //always remove it
         getBrowser().removeEventListener("scroll", mainScrollHandler, true);
         //Only add it when showIdsOnDemand
         if (showIdsOnDemand) {
            MlbUtils.logDebugMessage('mlb scroll listener activated');
            getBrowser()[addOrRemoveListenerFunction]("scroll", mainScrollHandler, true);
            
         }
		},
		
		initShortCuts: function (){
          var eh = mouselessbrowsing.EventHandler 
		    //Shortcut for Enter
		    this.scm.addShortcut(208, eh.handleEnter, eh, MlbCommon.SCM_CLIENT_ID);
		    
          this.setShortcut("mouselessbrowsing.keys.openInNewTabPostfixKey", eh.openLinkInNewTab, eh);

          this.setShortcut("mouselessbrowsing.keys.openInNewWindowPostfixKey", eh.openLinkInNewWindow, eh);
          
          //TODO will probably never be enabled
          if(MlbUtils.isCoolirisPreviewsInstalled()){
            this.setShortcut("mouselessbrowsing.keys.openInCoolirisPreviewsPostfixKey", eh.openLinkInNewCoolirisPreview, eh);
          }

		    this.setShortcut("mouselessbrowsing.keys.toggleMLB", eh.toggleIds, eh);
		    
			 this.setShortcut("mouselessbrowsing.keys.toggleAllIds", eh.toggleAllIds, eh);

         this.setShortcut("mouselessbrowsing.keys.updatePage", function(){PageInitializer.updatePage(); return ShortcutManager.SUPPRESS_KEY}, null);
         
         this.setShortcut("mouselessbrowsing.keys.historyBack", eh.moveHistoryBack, eh);
		
		    this.setShortcut("mouselessbrowsing.keys.historyForward", eh.moveHistoryForward, eh);
		    
		    this.setShortcut("mouselessbrowsing.keys.clearKeybuffer", eh.resetVars, eh);
		    
		    this.setShortcut("mouselessbrowsing.keys.scrollDown", eh.scrollDown, eh);
		    
		    this.setShortcut("mouselessbrowsing.keys.scrollUp", eh.scrollUp, eh);
		    
		    this.setShortcut("mouselessbrowsing.keys.selectLink", eh.selectLink, eh);

		    this.setShortcut(MlbPrefs.BLOCK_KEYBOARD_INDPUT_PREF_ID, eh.toggleBlockKeyboardInputForMLB, eh);

		    this.setShortcut(MlbPrefs.BLUR_ACTIVE_ELEMENT_KEY_PREF_ID, eh.blurActiveElement, eh);
		    
		    this.setShortcut("mouselessbrowsing.keys.openConfig", eh.openConfiguration, eh);
		    var combinedKeyCode = Prefs.getCharPref("mouselessbrowsing.keys.openConfig");
			 var openConfigBC = document.getElementById("mlb_openConfig_bc");
			 openConfigBC.setAttribute('acceltext', KeyInputbox.getStringForCombinedKeyCode(combinedKeyCode))

		    this.setShortcut("mouselessbrowsing.keys.addSiteRule", eh.addSiteRule, eh);
		    combinedKeyCode = Prefs.getCharPref("mouselessbrowsing.keys.addSiteRule");
			 var addUrlRuleBC = document.getElementById("mlb_addUrlRule_bc");
			 addUrlRuleBC.setAttribute('acceltext', KeyInputbox.getStringForCombinedKeyCode(combinedKeyCode))

		    //Toggling exclusive use with double stroke of numpad-key
			 if(MlbPrefs.toggleExlNumpadWithDoubleStrokeNumKey){
		       this.scm.addShortcut(2304, eh.toggleExclusiveUseOfNumpad, eh, MlbCommon.SCM_CLIENT_ID);
			 }
		
		    combinedKeyCode = Prefs.getCharPref("mouselessbrowsing.keys.toggleExlusiveUseOfNumpad");
		    if(combinedKeyCode!="2304" && combinedKeyCode!="0")
			    this.scm.addShortcut(combinedKeyCode, TabLocalPrefs.toggleExclusiveUseOfNumpad, TabLocalPrefs, MlbCommon.SCM_CLIENT_ID);
		    
			 this.setShortcut("mouselessbrowsing.keys.toggleEnableDisableMLB", InitManager.toggleEnableDisableMLB, InitManager);
		},
		
		setShortcut: function(prefsKey, functionPtn, thisObj){
			var combinedKeyCode = Prefs.getCharPref(prefsKey);
			if(combinedKeyCode!="0"){
				this.scm.addShortcut(combinedKeyCode, functionPtn, thisObj, MlbCommon.SCM_CLIENT_ID);
			}
		},
		
		initMenu: function(){
		   //Display menu?
			var mlbMenu = document.getElementById("mlb_tools_menu");
			if(MlbPrefs.showMlbMenu){
				mlbMenu.style.display="block"
			}else{
				mlbMenu.style.display="none"
			}
         document.getElementById('mlb_disableMLB_bc').setAttribute("checked", MlbPrefs.disableMLB?"true":"false")
		},
		
		initStatusbar:function(){
         //Display keybuffer in statusbar?
          var statusPanel = document.getElementById("mlb-status-panel");
          if(MlbPrefs.showMlbIconInStatusbar || MlbPrefs.showKeybufferInStatusbar){
              statusPanel.style.display="block";
          }else{
              statusPanel.style.display="none";
          }
          var statusIcon = document.getElementById("mlb-status-image");
          var skinUrlPrefix = "chrome://mouselessbrowsing/skin/" 
          if(MlbPrefs.disableMLB){
          	statusIcon.src = skinUrlPrefix + "MLB_disabled.ico"
          }else{
          	statusIcon.src = skinUrlPrefix + "MLB.ico"
          }
          if(MlbPrefs.showMlbIconInStatusbar){
              statusIcon.style.display="block";
          }else{
              statusIcon.style.display="none";
          }
          var exlNumpadIcon = document.getElementById("mlb-status-exl-numpad-image");
          if(TabLocalPrefs.isExclusiveUseOfNumpad() && MlbPrefs.showMlbIconInStatusbar && !MlbPrefs.isCharIdType() && !MlbPrefs.disableMLB){
              exlNumpadIcon.style.display="block";
          }else{
              exlNumpadIcon.style.display="none";
          }       
          var statusLabel = document.getElementById("mlb-status");
          if(MlbPrefs.showKeybufferInStatusbar && !MlbPrefs.disableMLB){
              statusLabel.style.display="block";
          }else{
              statusLabel.style.display="none";
          }
          var tooltiptext = "Mouseless Browsing " + MlbCommon.MLB_VERSION
          if(MlbPrefs.disableMLB){
          	tooltiptext += " disabled"
          }
          if(TabLocalPrefs.isExclusiveUseOfNumpad() && !MlbPrefs.isCharIdType() && !MlbPrefs.disableMLB){
          	tooltiptext += "\n" + Utils.getString(STRINGBUNDLE_ID, "exclusiveUseOfNumpadActive")
          }
          statusPanel.tooltipText = tooltiptext
		},
		
		toggleEnableDisableMLB: function(){
			Prefs.setBoolPref("mouselessbrowsing.disableMLB", !MlbPrefs.disableMLB)
			this.init()
		},
		
		observe: function(){
			this.init();
		}
	
	}
	
	var NS = mlb_common.Namespace
	NS.bindToNamespace("mouselessbrowsing","InitManager", InitManager)

   //TODO remove, used only for test purposes
   function showOffsets(event){
      if(event.ctrlKey && event.button==2){
        var target = event.originalTarget
        
        var offset = DomUtils.getOffsetToBody(target)
        mlb_common.Utils.logMessage("MLB: TagName: " + target.tagName + " OffsetLeft (Body): " + offset.x + " OffsetTop (Body): " + offset.y)
        event.stopPropagation()
        event.preventDefault()
      }
   }
	
})()
}}

