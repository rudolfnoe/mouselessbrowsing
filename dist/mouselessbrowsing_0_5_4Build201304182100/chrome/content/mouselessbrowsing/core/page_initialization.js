/*
 * Mouseless Browsing 
 * Version 0.5
 * Created by Rudolf Noe
 * 31.12.2007
 */
with(mlb_common){
with(mouselessbrowsing){
(function(){
   const UPDATE_PAGE_TIMER_ID = "UPDATE_PAGE"
   
   //Change Listener listening changes in the content DOM
   var changeListener = function(e) {
      var node = e.relatedNode
      if(node.nodeType!=1 || 
        (node.tagName=="SPAN" && node.getAttribute(MlbCommon.ATTR_ID_SPAN_FLAG)=="true"))
         return
//          MlbUtils.logDebugMessage(e.type  + "  " + node)
      Utils.executeDelayed(UPDATE_PAGE_TIMER_ID, 500, function(){
         //Do not update invisble pages
         if(content!=node.ownerDocument.defaultView.top)
            return
         PageInitializer.updatePage(node.ownerDocument.defaultView.top)
      })
   }
   
   var pageHideListener = function(e){
      var win = e.target
      var d = new Date()
      MlbUtils.logDebugMessage("beforeunload: " + e.name + " | topwin: " + (win==win.top) + " time: " + d.toLocaleTimeString()+","+d.getMilliseconds())
      PageInitializer.setNextKeepExistingIds(false)
   }

   var PageInitializer = {
      
      cleanUpPage: function(winObj){
         //Clean up documents for reevalutation
         DomUtils.iterateWindows(winObj, function(subwin){
            //Remove spans
            var spans = XPathUtils.getElements("//span[@" + MlbCommon.ATTR_ID_SPAN_FLAG + "]", subwin.document)
            for (var i = 0; i < spans.length; i++) {
               DomUtils.removeElement(spans[i])
            }
            //Remove mlb_ignore attribute for reevaluation
            var elems = XPathUtils.getElements("//*[@"+ MlbCommon.ATTR_IGNORE_ELEMENT + "]", subwin.document)
            for (var i = 0; i < elems.length; i++) {
               elems[i].removeAttribute(MlbCommon.ATTR_IGNORE_ELEMENT)
            }
            
            //Remove MlbCommon.MLB_BINDING_KEY_ATTR attribute 
            var elems = XPathUtils.getElements("//*[@"+ MlbCommon.MLB_BINDING_KEY_ATTR + "]", subwin.document)
            for (var i = 0; i < elems.length; i++) {
               elems[i].removeAttribute(MlbCommon.MLB_BINDING_KEY_ATTR)
            }
         })
      },
		
      disableMlb: function(){
         Firefox.iterateAllBrowsers(function(browser){
            if(MlbUtils.getPageData(browser.contentWindow))
               PageInitializer.deactivateChangeListener(browser.contentWindow)
         })
      },

      //Called after update of Prefs
		init: function(){
         this.deactivateChangeListener(content)
         MlbUtils.setPageData(content, null)
         
         //Clean up documents for reevalutation
         this.cleanUpPage(content)
         
         TabLocalPrefs.applySiteRules(content)
         this.updatePage(content);
		},
      
      initIdSpanElementBinding: function(targetDocument, pageData){
         var bindingKeyToBindingMap = {}
         var elems = XPathUtils.getElements("//*[@"+ MlbCommon.MLB_BINDING_KEY_ATTR + "]", targetDocument)
         for (var i = 0; i < elems.length; i++) {
            var elem = elems[i]
            var bindingKey = elem.getAttribute(MlbCommon.MLB_BINDING_KEY_ATTR)
            var bindingEntry = bindingKeyToBindingMap[bindingKey]
            if(bindingEntry==null)
               bindingKeyToBindingMap[bindingKey] = bindingEntry = {}
            if(elem.hasAttribute(MlbCommon.ATTR_ID_SPAN_FLAG))
               bindingEntry.idSpan = elem
            else
               bindingEntry.element = elem
         }
         for(var bindingKey in bindingKeyToBindingMap){
            var bindingEntry = bindingKeyToBindingMap[bindingKey]
            if(bindingEntry.idSpan==null){
               bindingEntry.element.removeAttribute(MlbCommon.MLB_BINDING_KEY_ATTR)
               continue
            }
            pageData.addElementIdSpanBinding(bindingEntry.element, bindingEntry.idSpan)
         }
      },
		
		//Function called on pageShow event
		onPageShow: function(event){
			var onpageshow2ndCall = !event.persisted && MlbPrefs.initOnDomContentLoaded
//         MlbUtils.logDebugMessage('page persisted: ' + event.persisted)
			var win = event.originalTarget.defaultView

         //Onpage show init starts from topwin if already initialized after DOMCOntentLoaded
         //It is not enough to load when topwin is loaded as subframes could trigger XmlHttpRequests
         //e.g. Gmail
			var topWinIsInitialized = win.top.mlb_initialized==true
         if(!topWinIsInitialized && win!=win.top && MlbPrefs.initOnDomContentLoaded){
            return
         }
         
         var rebindElementsToIds = event.persisted || (!MlbUtils.getPageData() && this.hasIdSpans(win.top))
         
         //After topwin is initialized ids has always to be regenerated entirely as with frameset no top win will be loaded any more
			this.prepareInitialization(event, onpageshow2ndCall, true, !event.persisted, rebindElementsToIds);
         if(win==win.top){
            win.mlb_initialized=true
         }
		},
		
		//Function called on DOMContentLoaded event
		onDOMContentLoaded: function(event){
			if(MlbPrefs.initOnDomContentLoaded){
			   this.prepareInitialization(event, false, false, true, false);
			}
		},
		
		prepareInitialization: function(event, onpageshow2ndCall, installChangeListener, keepExisitingIds, rebindElementsToIds){
         var win = event.originalTarget.defaultView
         
         //If a new tab is opened about:blank is the first location which is loaded
         //No Init neccessary
         if(win.location.href=="about:blank"){
            return
         }
         
         var pageInitData = new PageInitData(win, onpageshow2ndCall, installChangeListener, keepExisitingIds, event, rebindElementsToIds)
         
         //Apply URL exceptions
         //Could not be in initPage as it should not be executed on toggleing
         TabLocalPrefs.applySiteRules(win)
         
         //Is MLB activated?
         var currentVisibilityMode = TabLocalPrefs.getVisibilityMode(win)
         if(TabLocalPrefs.isShowIdsOnDemand(win) ||
            currentVisibilityMode==MlbCommon.VisibilityModes.NONE){
            //Set the visibility modes so that with toggeling the ids will become visible
         	if(currentVisibilityMode!=MlbCommon.VisibilityModes.NONE){
               TabLocalPrefs.setVisibilityMode(win, MlbCommon.VisibilityModes.NONE);
         	}
            //If history back was pressed after toggling of the ids 
            //the alreay generated ids must be hidden
            var topWin = pageInitData.getCurrentTopWin()
            if(this.hasVisibleIdSpans(topWin)){
               EventHandler.hideIdSpans(topWin);
            }
            //Deactivate change listener
            this.deactivateChangeListener(topWin)
            
            return;
         }
         
         this.initPage(pageInitData)
		},

		/*
		 * Updates the page after toggling of ids or if prefs has changed
		 */
		updatePage: function(topWin){
         if(!topWin)
            topWin = content
         var perfTimer = new PerfTimer()
         var pageInitData = new PageInitData(topWin, false, true, false);
         this.setNextKeepExistingIds(false)
         this.initPage(pageInitData)  
         MlbUtils.logDebugMessage("Update page finished: " + perfTimer.stop())
		},
		
		/*
		 * Main entry method for initializing
		 * @param pageInitData:
		 */ 
		initPage: function(pageInitData){
         
			var topWin = pageInitData.getCurrentTopWin()

			if(TabLocalPrefs.isDisableAllIds(topWin)==true){
				return
			}
		   
		   var pageData = MlbUtils.getPageData(topWin)
		   if(pageData==null){
            pageData = PageData.createPageData()
		   }else if(!pageData.getNextKeepExistingIds()){
            pageInitData.setKeepExistingIds(false)
            pageData.setNextKeepExistingIds(true)
		   	pageData.initResetableMembers()
		   }
	      MlbUtils.setPageData(topWin, pageData)
	   	pageInitData.pageData = pageData 
         
         //Debug Info
         MlbUtils.logDebugMessage('init topWin: "' + pageInitData.getCurrentTopWin().name + '"| event: ' + 
            (pageInitData.getEvent()?pageInitData.getEvent().type:"update") + ' | topwin: ' + (pageInitData.getCurrentTopWin()==pageInitData.getCurrentWin()) + 
            " | keepExistingIds: " + pageInitData.getKeepExistingIds())
         
         //If page is from cache the ids are still visible but the bindings between ids spans and their elements are lost
         //so this have to recreated
         //In some cases the persited flag is false even the html is cached i.e.
         //mlb attributes and spans are in page
         //See issus #109
         if(pageInitData.isRebindElementsToIds()){
            this.initIdSpanElementBinding(pageInitData.getCurrentDoc(), pageData)
         }
            
         //Increment initCounter
         pageData.incrementInitCounter()
         
	      //Even if only a frame is loaded everything is initialized
	      //There is no performance issues as the already exisiting ids are only updated

	      if(MlbPrefs.debugPerf){
				var perfTimer = new PerfTimer()
			}
         
			//Deactivate change listener
         if(!MlbPrefs.disableAutomaticPageUpdateOnChange)
            this.deactivateChangeListener(topWin)
         
         if(pageInitData.getKeepExistingIds())
		      this.initFrame(pageInitData, pageInitData.getCurrentWin());
         else
		      this.initFrame(pageInitData, topWin);
            
         
         //Activate Change listener
         if(!MlbPrefs.disableAutomaticPageUpdateOnChange && pageInitData.installChangeListener)
            this.activateChangeListener(pageInitData)
			
		   if(MlbPrefs.debugPerf){
            var timeConsumed = perfTimer.stop()
            var debugMessage = "MLB time for"
            if(pageInitData.onpageshow2ndCall){
            	debugMessage += " 2nd"
            }else if(MlbPrefs.initOnDomContentLoaded){
            	debugMessage += " 1st"
            }
            debugMessage += " initialization: " + timeConsumed + " msec"
            Utils.logMessage(debugMessage)
         }
		   
		},
      
      activateChangeListener: function(pageInitData){
         var topWin = pageInitData.getCurrentTopWin()
         MlbUtils.iterateFrames(topWin, function(win){
            if(!MlbUtils.isVisibleWindow(win))
               return
            if(win.document.designMode!="on")
				  this.addOrRemoveChangeListener(win, "add", changeListener)
         }, this)
			MlbUtils.getPageData(topWin).setChangeListener(changeListener)
         
      },

      deactivateChangeListener: function(topWin){
         Utils.clearExecuteDelayedTimer(UPDATE_PAGE_TIMER_ID)
         // Disable change listener
         var pageData = MlbUtils.getPageData(topWin)
         if(!pageData)
            return
			var changeListener = pageData.getChangeListener()
			if (changeListener) {
            MlbUtils.iterateFrames(topWin, function(win){
   				this.addOrRemoveChangeListener(win, "remove", changeListener)
            }, this)
				pageData.setChangeListener(null)
			}
      },
		
      addOrRemoveChangeListener: function(win, addOrRemove, listenerFunc){
         if(!win.document.body)
            return
         win.document.body[addOrRemove+"EventListener"]("DOMNodeInserted", listenerFunc, true)
      },

      /*
		 * Initializes one Frame Is called recursivly @param pageInitData @param
		 * win: current win to initialize
		 * 
		 */
		initFrame: function(pageInitData, win){
			 //If document of win is editable skip it, it is a "rich-text-field", e.g. at Gmail
          //also skip invisble frames
			 if(win.document.designMode=="on" || !MlbUtils.isVisibleWindow(win)){
			 	return
			 }
			 
          //Watch for making it editable
			 win.document.wrappedJSObject.watch("designMode", this.onChangeDesignMode)
          
			 pageInitData.setCurrentWin(win);
		
          if(pageInitData.getCurrentDoc()){
   		    if(TabLocalPrefs.isIdsForFramesEnabled(win)){
   		        (new FrameIdsInitializer(pageInitData)).initIds()
   		    }
   		    
   		    //Init ids for form elements
   		    if(TabLocalPrefs.isIdsForFormElementsEnabled(win)){
   		        (new FormElementIdsInitializer(pageInitData)).initIds()
   		    }    
   		
   			//Init ids for links
   		    if(TabLocalPrefs.isIdsForLinksEnabled(win) || TabLocalPrefs.isIdsForImgLinksEnabled(win)){
               (new LinkIdsInitializer(pageInitData)).initIds()
   		    }
   			
             //Init ids for all other clickable elements
   		    if(TabLocalPrefs.isIdsForOtherElementsEnabled(win)){
   		        (new OtherElementIdsInitializer(pageInitData)).initIds()
   		    }
          }
          
          if(win!=win.top)
            win.addEventListener("beforeunload", pageHideListener, true)
		    
		    if(!pageInitData.getKeepExistingIds()){
             //Recursive call for all subframes
   		    for(var i = 0; i<win.frames.length; i++){
                var frame = win.frames[i]
   		       this.initFrame(pageInitData, win.frames[i]);
   		    }
          }
          
		},
		
		onChangeDesignMode: function(property, oldValue, newValue){
		   if(newValue && newValue.toString().toLowerCase()=="on"){
   			//Remove old id spans
		   	//"this" is in this context HTMLDocument!
		   	var spans = this.getElementsByTagName('span')
		   	for (var i = 0; i < spans.length; i++) {
		   		var span = spans[i]
		   		if(span.hasAttribute("MLB_idSpanFlag")){
		   			span.parentNode.removeChild(span)
		   			//Correct index as spans array is updated on the fly
		   			i--
		   		}
		   	}
		   	setTimeout(function(){mouselessbrowsing.PageInitializer.updatePage()})
		   }
		   return newValue
		},
		
      
		/*
		 * Checks wether window already contains ids
		 */
		hasVisibleIdSpans: function(winObj){
         var found = false
			DomUtils.iterateWindows(winObj, function(subWin){
            if(found)
               return
   			var spans = XPathUtils.getElements("//span[@" + MlbCommon.ATTR_ID_SPAN_FLAG + "]", subWin.document)
   		   for(var i=0; i<spans.length; i++){
   		       if(spans[i].style.display=="inline"){
                  found = true
                  break
                }
   		    }
			})
         return found
		},

      hasIdSpans: function(winObj){
         var found = false
			DomUtils.iterateWindows(winObj, function(subWin){
            if(found)
               return
            var doc = subWin.document
   			var idSpanNumber = doc.evaluate("count(//span[@MLB_idSpanFlag])", doc, null, XPathResult.NUMBER_TYPE, null).numberValue;
            if(idSpanNumber>0){
               found = true
            }
			})
         return found
		},
      
      //For future use
      getWindowData: function(win, key){
         if(!win._mouselessStorage || !win._mouselessStorage[key])
            return null
         return win._mouselessStorage[key]
      },

      //For future use
      setWindowData: function(win, key, value){
         if(!win._mouselessStorage)
            win._mouselessStorage = new Object()
         win._mouselessStorage[key] = value
      },
      
      setNextKeepExistingIds: function(value){
         var pageData = MlbUtils.getPageData()
         if(pageData)
            pageData.setNextKeepExistingIds(value)
      }
      
      
      
   }      
	
   var NS = mlb_common.Namespace
   NS.bindToNamespace("mouselessbrowsing", "PageInitializer", PageInitializer)
})()
}}
