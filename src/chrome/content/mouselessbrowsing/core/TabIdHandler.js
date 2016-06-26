with(mlb_common){
with(mouselessbrowsing){
(function(){
   const TAB_ID_REGEXP = /^\[\d{2,}\]\s{1}/
   const SHOW_TAB_ID_MS = 'mlb_showTabIdMS'
   const SHOW_TAB_ID_MI = 'mlb_showTabIdMI'
   
   
   function TabIdHandler(){
      this.showTabIdMIAdded = false
      //Menuitem and separator
      this.showTabIdMI = null
      this.showTabIdMS = null
   }
   
   TabIdHandler.instance = null
   
   TabIdHandler.getInstance = function(){
      if(!this.instance)
         this.instance = new TabIdHandler()
      return this.instance
   }
   TabIdHandler.init = function(mlbActive){
      this.getInstance().init(mlbActive)
   }
   
   TabIdHandler.toggleTabIdVisibility = function(event){
      this.getInstance().toggleTabIdVisibility(event)
   }

   TabIdHandler.prototype = {
      init: function(mlbActive){
         if(mlbActive)
            this.displayShowTabIdMI()
         else
            this.hideShowTabIdMI()
         if(mlbActive && MlbPrefs.showTabIds)
            this.enableTabIds()
         else
            this.disableTabIds()
      },
      
      disableTabIds: function(){
         this.addOrRemoveEventListeners("remove")
         this.removeTabIds()
         if(this.showTabIdMI)
            this.showTabIdMI.removeAttribute('checked')
       },
      
      displayShowTabIdMI: function(){
         var tabContextMenu
         if(!this.showTabIdMIAdded){
            if(MlbUtils.isFirefox4()){
               tabContextMenu = gBrowser.tabContextMenu
            }else{
               tabContextMenu = document.getAnonymousElementByAttribute(gBrowser, "anonid", "tabContextMenu")
            }
            var separator = document.createElement("menuseparator")
            separator.setAttribute('anonid', SHOW_TAB_ID_MS)
            this.showTabIdMS = tabContextMenu.appendChild(separator)
            this.showTabIdMI = tabContextMenu.appendChild(DomUtils.removeElement(byId(SHOW_TAB_ID_MI)))
            this.showTabIdMIAdded = true
         }
         this.setCollapsedOnShowTabIdMI(false)
      },
      
      enableTabIds: function(){
         this.addOrRemoveEventListeners("add")
         this.showTabIdMI.setAttribute('checked', 'true')
         this.initTabs();
      },
      
      handleDOMAttrModified: function(event){
         var tagName = event.originalTarget.localName.toLowerCase()
         if(event.attrName!="label" || TAB_ID_REGEXP.test(event.newValue) ||
            tagName != "tab"){
            return
         }
         var tab = event.originalTarget

         //As of FF4 one could not use the _tPos member any more
         var tabs = MlbUtils.getVisibleTabs()
         var index = null;
         if(MlbUtils.isFirefox4()){
            index = getBrowser().visibleTabs.indexOf(tab) + 1
         }else{
            index = tab._tPos+1;
         }
         this.setTabId(tab, index)
      },
      
      handleTabClose: function(event){
         this.initTabsDelayed(0)
      },

      handleTabHide: function(event){
         this.initTabsDelayed();
      },

      handleTabOpen: function(event){
         this.initTabsDelayed();
      },
      
      handleTabMove: function(event){
         this.initTabsDelayed();
      },

      handleTabShow: function(event){
         this.initTabsDelayed();
      },
      
      hideShowTabIdMI: function(){
         if(!this.showTabIdMIAdded)
            return
         else
            this.setCollapsedOnShowTabIdMI(true)
         
      },
      
      addOrRemoveEventListeners: function(addOrRemove){
         var functionName = addOrRemove + "EventListener"
         var tabContainer = Firefox.getTabContainer();
         tabContainer[functionName]("TabClose", this, false)
         tabContainer[functionName]("TabOpen", this, false)
         tabContainer[functionName]("TabMove", this, false)
         tabContainer[functionName]("TabHide", this, false)
         tabContainer[functionName]("TabShow", this, false)
         //TabAttrModified could not be used as it is not called after restart of FF
         tabContainer[functionName]("DOMAttrModified", this, false)
      },
      
      initTabs: function(){
         var tabs = null;
         if(MlbUtils.isFirefox4()){
            tabs = getBrowser().visibleTabs;
         }else{
            tabs = getBrowser().mTabs;
         }
         for (var i = 0; i < tabs.length; i++) {
            this.setTabId(tabs[i], i+1)
         }
      },
      
      initTabsDelayed: function(delay){
         var delay = delay!=null?delay:100;
         Utils.executeDelayed("MLB_TAB_INIT", delay, this.initTabs, this);
      },
      
      removeTabId: function(tab){
         tab.setAttribute('label', tab.getAttribute('label').replace(TAB_ID_REGEXP, ""))
      },
      
      removeTabIds: function(){
         var tabs = getBrowser().mTabs
         for (var i = 0; i < tabs.length; i++) {
            this.removeTabId(tabs[i])
         }
      },
      
      setTabId: function(tab, newId){
         var label = tab.getAttribute('label') 
         if(TAB_ID_REGEXP.test(label)){
            label = label.replace(TAB_ID_REGEXP, "")
         }
         label = "[0" + newId + "] " + label
         tab.setAttribute('label', label)
      },
      
      setCollapsedOnShowTabIdMI: function(collapsed){
         this.showTabIdMS.collapsed = collapsed
         this.showTabIdMI.collapsed = collapsed
      },
      
      toggleTabIdVisibility: function(){
         var showTabIds = this.showTabIdMI.hasAttribute('checked') 
         if(showTabIds)
            this.enableTabIds()
         else
            this.disableTabIds()
         MlbPrefs.setShowTabIdFlag(showTabIds)
      }
   }
   
   ObjectUtils.extend(TabIdHandler, AbstractGenericEventHandler)
   
   Namespace.bindToNamespace("mouselessbrowsing", "TabIdHandler", TabIdHandler)
   
   function byId(id){
      return document.getElementById(id)
   }
   
})()
}}