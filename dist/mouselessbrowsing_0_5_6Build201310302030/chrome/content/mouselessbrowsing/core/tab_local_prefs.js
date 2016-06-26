(function() {
	var MlbPrefs = mouselessbrowsing.MlbPrefs
	var SiteRule = mouselessbrowsing.SiteRule
	var MlbCommon = mouselessbrowsing.MlbCommon
	var Prefs = mlb_common.Prefs
	var Utils = mlb_common.Utils

	function TabLocalPrefs(win) {
      this.exclusiveUseOfNumpad = null;
      this.idsForLinksEnabled = false;
      this.idsForImgLinksEnabled = false;
      this.idsForFormElementsEnabled = false;
      this.idsForFramesEnabled = false;
      this.idsForOtherElementsEnabled = false;
      this.prefsBackup = null;
      this.previousVisibilityMode = null;
      this.showIdsOnDemand = null;
      //Todo remove; only for debug purposes
      this.win = win;
      this.visibilityMode = null; 
		this.init();
	}
	
	//Static member variables
	TabLocalPrefs.observedPropExclusiveUseOfNumpad = Prefs.getBoolPref("mouselessbrowsing.exclusiveNumpad");

	function getPrefs(contentWin) {
      //TODO Replace default with Assert as getPrefs will always be called with param (since 0.5.3)
		var browser = gBrowser.mCurrentBrowser
		if (contentWin != null) {
			var browsers = gBrowser._browsers
			if (browsers != null) {
				for (var i = 0; i < browsers.length; i++) {
					if (browsers[i].contentWindow == contentWin.top) {
						browser = browsers[i]
						break;
					}
				}
			}
		}
		if (browser.mouselssbrowsing_tab_data == null) {
			browser.mouselssbrowsing_tab_data = new TabLocalPrefs(contentWin)
		}
		return browser.mouselssbrowsing_tab_data
	}
	TabLocalPrefs.getPrefs = getPrefs

	TabLocalPrefs.isExclusiveUseOfNumpad = function (win) {
		return TabLocalPrefs.getPrefs(win).exclusiveUseOfNumpad
	}

   TabLocalPrefs.onTabSelect = function() {
		Utils.executeDelayed("SetExlNumpadOnTabChange", 300, function(){
   		TabLocalPrefs.observedPropExclusiveUseOfNumpad = getPrefs().exclusiveUseOfNumpad
		})
	}

   TabLocalPrefs.initPrefs = function() {
		var browsers = gBrowser._browsers
		if (browsers != null) {
			for (var i = 0; i < browsers.length; i++) {
				var cw = browsers[i].contentWindow
				var tabLocalPrefs = getPrefs(cw)
				tabLocalPrefs.init()
				tabLocalPrefs.applySiteRules(cw)
				if(browsers[i]==gBrowser.mCurrentBrowser){
					TabLocalPrefs.observedPropExclusiveUseOfNumpad = tabLocalPrefs.exclusiveUseOfNumpad
				}
			}
		}
	}

	TabLocalPrefs.toggleExclusiveUseOfNumpad = function () {
		getPrefs().toggleExclusiveUseOfNumpad()
		TabLocalPrefs.observedPropExclusiveUseOfNumpad = getPrefs().exclusiveUseOfNumpad
	}

	TabLocalPrefs.isIdsEnabledFor = function isIdsEnabledFor(win, idSpanType) {
      switch(idSpanType){
         case MlbCommon.IdSpanTypes.FRAME: 
            return TabLocalPrefs.isIdsForFramesEnabled(win)
            break;
         case MlbCommon.IdSpanTypes.IMG: 
            return TabLocalPrefs.isIdsForImgLinksEnabled(win)
            break;
         case MlbCommon.IdSpanTypes.LINK: 
            return TabLocalPrefs.isIdsForLinksEnabled(win)
            break;
         case MlbCommon.IdSpanTypes.FORMELEMENT: 
            return TabLocalPrefs.isIdsForFormElementsEnabled(win)
            break;
         case MlbCommon.IdSpanTypes.OTHER: 
            return TabLocalPrefs.isIdsForOtherElementsEnabled(win)
            break;
         default:
            throw new Error('Unkown idSpanTyp')
      }
	}

   TabLocalPrefs.isIdsForLinksEnabled = function (win) {
		return getPrefs(win).idsForLinksEnabled
	}

	TabLocalPrefs.isIdsForImgLinksEnabled = function (win) {
		return getPrefs(win).idsForImgLinksEnabled
	}

	TabLocalPrefs.isIdsForFormElementsEnabled = function(win) {
		return getPrefs(win).idsForFormElementsEnabled
	}

	TabLocalPrefs.isIdsForFramesEnabled = function (win) {
		return getPrefs(win).idsForFramesEnabled
	}

   TabLocalPrefs.isIdsForOtherElementsEnabled = function (win) {
		return getPrefs(win).idsForOtherElementsEnabled
	}

   TabLocalPrefs.applySiteRules = function (contentWin){
   	var tabLocalPrefs = getPrefs(contentWin)
   	tabLocalPrefs.applySiteRules(contentWin)
   	TabLocalPrefs.observedPropExclusiveUseOfNumpad = tabLocalPrefs.exclusiveUseOfNumpad 
   }
   
   TabLocalPrefs.getPreviousVisibilityMode = function (){
      return getPrefs().previousVisibilityMode
   }
   
	TabLocalPrefs.getVisibilityMode = function (win){
      return getPrefs(win).visibilityMode
	}

   TabLocalPrefs.setVisibilityMode = function (win, visibilityMode, previousVisibilityMode){
   	getPrefs(win).setVisibilityMode(visibilityMode, previousVisibilityMode)
   }
   
   TabLocalPrefs.isDisableAllIds = function (win){
   	return getPrefs(win).isDisableAllIds()
   }
	
   TabLocalPrefs.isShowIdsOnDemand = function (win){
      return getPrefs(win).showIdsOnDemand 	
   }
   
	TabLocalPrefs.prototype = {
		init : function() {
			this.showIdsOnDemand = Prefs.getBoolPref("mouselessbrowsing.showIdsOnDemand");
			this.exclusiveUseOfNumpad = Prefs.getBoolPref("mouselessbrowsing.exclusiveNumpad");
			var disableAllIds = Prefs.getBoolPref("mouselessbrowsing.disableAllIds");
			if (disableAllIds || this.showIdsOnDemand) {
				this.setVisibilityMode(MlbCommon.VisibilityModes.NONE, MlbCommon.VisibilityModes.CONFIG)
			} else {
				this.setVisibilityMode(MlbCommon.VisibilityModes.CONFIG, MlbCommon.VisibilityModes.NONE)
			}
			this.initShowIdPrefs();
			this.prefsBackup = null
		},
      
      initVisibilityModeAndShowIdPrefs: function(visibilityMode){
         this.setVisibilityMode(visibilityMode)
         this.initShowIdPrefs()
      },
      
      isExclusiveUseOfNumpad: function(){
         return this.exclusiveUseOfNumpad;
      },

		isDisableAllIds : function() {
			return !this.idsForLinksEnabled && !this.idsForImgLinksEnabled
					&& !this.idsForFormElementsEnabled
					&& !this.idsForFramesEnabled
               && !this.idsForOtherElementsEnabled
		},
      
      getPreviousVisibilityMode: function(){
         return this.previousVisibilityMode;
      },
      
      getVisibilityMode: function(){
         return this.visibilityMode 
      },

		setVisibilityMode : function(visibilityMode, previousVisibilityMode) {
			if(previousVisibilityMode==null){
			   this.previousVisibilityMode = this.visibilityMode
			}else{
				this.previousVisibilityMode = previousVisibilityMode
			}
			this.visibilityMode = visibilityMode
		},

		applySiteRules : function(win) {
			var url = win.top.location.href
			for (var i = 0; i < MlbPrefs.siteRules.length; i++) {
				var siteRule = MlbPrefs.siteRules[i]
				if (siteRule.urlRegEx.test(url)) {
					if (this.prefsBackup == null) {
						this.prefsBackup = new SiteRule(null,
								this.visibilityMode, this.exclusiveUseOfNumpad,
								null)//showon demand could not be changed tab wise
					}
					this.exclusiveUseOfNumpad = siteRule.exclusiveUseOfNumpad
					this.showIdsOnDemand = siteRule.showIdsOnDemand
					this.setVisibilityModeForSiteRule(siteRule.visibilityMode)
					this.initShowIdPrefs()
					break;
				} else if (this.prefsBackup != null) {
					// reset prefs to global ones
					this.exclusiveUseOfNumpad = this.prefsBackup.exclusiveUseOfNumpad
					this.showIdsOnDemand = Prefs.getBoolPref("mouselessbrowsing.showIdsOnDemand");
					this.setVisibilityModeForSiteRule(this.prefsBackup.visibilityMode)
					this.initShowIdPrefs()
					this.prefsBackup = null
				}
			}
		},
		
		setVisibilityModeForSiteRule : function(siteRuleVisibilityMode) {
			if (siteRuleVisibilityMode == MlbCommon.VisibilityModes.NONE) {
				this.setVisibilityMode(MlbCommon.VisibilityModes.NONE, MlbCommon.VisibilityModes.CONFIG)
			} else {
				this.setVisibilityMode(siteRuleVisibilityMode,	MlbCommon.VisibilityModes.NONE)
			}
		},

		/*
		 * Seperate function for reuse when toggling visibility of spans
		 */
		initShowIdPrefs : function() {
			var disableAllIds = false
			switch (this.visibilityMode) {
				case MlbCommon.VisibilityModes.NONE :
					disableAllIds = true
					this.idsForLinksEnabled = false
					this.idsForImgLinksEnabled = false
					this.idsForFormElementsEnabled = false
					this.idsForFramesEnabled = false
					this.idsForOtherElementsEnabled = false
					break;
				case MlbCommon.VisibilityModes.CONFIG :
					this.idsForLinksEnabled = Prefs.getBoolPref("mouselessbrowsing.enableLinkIds");
					this.idsForImgLinksEnabled = Prefs.getBoolPref("mouselessbrowsing.enableImgLinkIds");
					this.idsForFormElementsEnabled = Prefs.getBoolPref("mouselessbrowsing.enableFormElementIds");
					this.idsForFramesEnabled = Prefs.getBoolPref("mouselessbrowsing.enableFrameIds");
					this.idsForOtherElementsEnabled = Prefs.getBoolPref("mouselessbrowsing.enableOtherIds");
					break;
				case MlbCommon.VisibilityModes.ALL :
					this.idsForLinksEnabled = true
					this.idsForImgLinksEnabled = true
					this.idsForFormElementsEnabled = true
					this.idsForOtherElementsEnabled  = true
					break;
			}
		},
		
		toggleExclusiveUseOfNumpad: function(){
			if(this.prefsBackup!=null){
				this.prefsBackup.exclusiveUseOfNumpad = !this.exclusiveUseOfNumpad
			}
			this.exclusiveUseOfNumpad = TabLocalPrefs.observedPropExclusiveUseOfNumpad = !this.exclusiveUseOfNumpad
		}
	}

	var NS = mlb_common.Namespace;
	NS.bindToNamespace("mouselessbrowsing", "TabLocalPrefs", TabLocalPrefs)
})()