with(this){
(function(){
   const rootBranch = "mouselessbrowsing.";
   //const {require} = Components.utils.import("resource://gre/modules/commonjs/toolkit/require.js", {});
   const { devtools } = Components.utils.import("resource://devtools/shared/Loader.jsm", {});
   const { require } = devtools;
   const Preferences = require("sdk/preferences/service");
   var ss = require("sdk/simple-storage");
   var Prefs = {
      getValue: function(key, defaultValue){
        if (key.indexOf(rootBranch)!=0){
          key = rootBranch + key
        }
        return Preferences.get(key, defaultValue);
      },
      setValue: function(key, value){
         Preferences.set(rootBranch + key, value);
      },
      has: function(key){
         return Preferences.has(key);
      }
   };
   
   var Storage = {
         set: function(key, value){
            ss.key = value;
         },
         get: function(key){
            return ss.key;
         }
   };

   var Utilities = {
         _bookmarks : null,
         get bookmarks() {
           if (!this._bookmarks) {
             this._bookmarks = Cc["@mozilla.org/browser/nav-bookmarks-service;1"].
                               getService(Ci.nsINavBookmarksService);
           }
           return this._bookmarks;
         },

         _livemarks : null,
         get livemarks() {
           if (!this._livemarks) {
             this._livemarks = Cc["@mozilla.org/browser/livemark-service;2"].
                               getService(Ci.nsILivemarkService);
           }
           return this._livemarks;
         },

         _annotations : null,
         get annotations() {
           if (!this._annotations) {
             this._annotations = Cc["@mozilla.org/browser/annotation-service;1"].
                                 getService(Ci.nsIAnnotationService);
           }
           return this._annotations;
         },

         _history : null,
         get history() {
           if (!this._history) {
             this._history = Cc["@mozilla.org/browser/nav-history-service;1"].
                             getService(Ci.nsINavHistoryService);
           }
           return this._history;
         },

         _windowMediator : null,
         get windowMediator() {
           if (!this._windowMediator) {
             this._windowMediator = Cc["@mozilla.org/appshell/window-mediator;1"].
                                    getService(Ci.nsIWindowMediator);
           }
           return this._windowMediator;
         },

         makeURI : function(aSpec) {
           if (!aSpec)
             return null;
           var ios = Cc["@mozilla.org/network/io-service;1"].getService(Ci.nsIIOService);
           return ios.newURI(aSpec, null, null);
         },

         free : function() {
           this._bookmarks = null;
           this._livemarks = null;
           this._annotations = null;
           this._history = null;
           this._windowMediator = null;
         }
       };

   function Window(aWindow) {
      this._window = aWindow;
      this._tabbrowser = aWindow.getBrowser();
      this._events = new Events();
      this._cleanup = {};

      this._watch("TabOpen");
      this._watch("TabMove");
      this._watch("TabClose");
      this._watch("TabSelect");

      var self = this;
      gShutdown.push(function() { self._shutdown(); });
    }

    Window.prototype = {
      get events() {
        return this._events;
      },

      /*
        * Helper used to setup event handlers on the XBL element. Note that the
        * events are actually dispatched to tabs, so we capture them.
        */
      _watch : function win_watch(aType) {
        var self = this;
        this._tabbrowser.addEventListener(aType,
          this._cleanup[aType] = function(e){ self._event(e); },
          true);
      },

      /*
        * Helper event callback used to redirect events made on the XBL element
        */
      _event : function win_event(aEvent) {
        this._events.dispatch(aEvent.type, "");
      },

      get tabs() {
        var tabs = [];
        var browsers = this._tabbrowser.browsers;

        for (var i=0; i<browsers.length; i++)
          tabs.push(new BrowserTab(this._window, browsers[i]));

        return tabs;
      },

      get activeTab() {
        return new BrowserTab(this._window, this._tabbrowser.selectedBrowser);
      },

      open : function win_open(aURI) {
        return new BrowserTab(this._window, this._tabbrowser.addTab(aURI.spec).linkedBrowser);
      },

      _shutdown : function win_shutdown() {
        for (var type in this._cleanup)
          this._tabbrowser.removeEventListener(type, this._cleanup[type], true);
        this._cleanup = null;

        this._window = null;
        this._tabbrowser = null;
        this._events = null;
      },

    };   
 
    function BrowserTab(aWindow, aBrowser) {
      this._window = aWindow;
      this._tabbrowser = aWindow.getBrowser();
      this._browser = aBrowser;
      this._cleanup = {};

      this._watch("load");

      var self = this;
      gShutdown.push(function() { self._shutdown(); });
    }

    BrowserTab.prototype = {
      get uri() {
        return this._browser.currentURI;
      },

      get index() {
        var tabs = this._tabbrowser.mTabs;
        for (var i=0; i<tabs.length; i++) {
          if (tabs[i].linkedBrowser == this._browser)
            return i;
        }
        return -1;
      },

      get window() {
        return this._window;
      },

      get document() {
        return this._browser.contentDocument;
      },

      /*
        * Helper used to determine the index offset of the browsertab
        */
      _getTab : function bt_gettab() {
        var tabs = this._tabbrowser.mTabs;
        return tabs[this.index] || null;
      },

      load : function bt_load(aURI) {
        this._browser.loadURI(aURI.spec, null, null);
      },

      focus : function bt_focus() {
        this._tabbrowser.selectedTab = this._getTab();
        this._tabbrowser.focus();
      },

      close : function bt_close() {
        this._tabbrowser.removeTab(this._getTab());
      },

      moveBefore : function bt_movebefore(aBefore) {
        this._tabbrowser.moveTabTo(this._getTab(), aBefore.index);
      },

      moveToEnd : function bt_moveend() {
        this._tabbrowser.moveTabTo(this._getTab(), this._tabbrowser.browsers.length);
      },

      _shutdown : function bt_shutdown() {
        this._cleanup = null;

        this._window = null;
        this._tabbrowser = null;
        this._browser = null;
      },

    };

   
   
   var Application = {
      prefs: Prefs,
      storage: Storage,
      activeWindow: function(){
         return new Window(Utilities.windowMediator.getMostRecentWindow("navigator:browser"));
      }
   };

   this.Application = Application;
}).apply(this)
}