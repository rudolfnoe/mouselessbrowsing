/*
 * Mouseless Browsing This files contains all the event-handling and actions
 * Version 0.5 Created by Rudolf Noe 31.12.2007
 */
with (mlb_common) {
	with (mouselessbrowsing) {
		(function() {

			const isWindowsOS = Utils.getOperationSystem() == OperationSystem.WINDOWS

			var EventHandler = {

				// Current onkeydown event for use in onkeypress
				currentOnKeydownEvent : null,

				// Keybuffer
				keybuffer : "",

				// Flag indicating whether a event was stopped
				// Set onkeydown and used onkeypress
				eventStopped : false,

				// Flag indicating whether the keyboard input should be blocked
				// for MLB
				blockKeyboardInputForMLBActive : false,

				// TimerId for reseting blocking of keyboard input
				blockKeyboardInputTimerId : null,

				// current tab local prefs
				currentTabLocalPrefs : null,

				// Flag for remembering whether the previous event
				// was alt + numpad; only used on WINNT as
				// there Alt+numpad produce extra key event
				lastEventWasAltNumpad0To9 : false,

				// Flag for openening link in new tab
				openInNewTab : false,

				// Flag for openening link in new tab
				openInNewWindow : false,

				// Flag for opening link in Cooliris Previews
				openInCoolirisPreviews : false,

				// Regexp for keybuffercontent to focus special tab
				changeTabByNumberRegExp : /^0\d{1,}$/,

				globalIds : {
					"0" : "urlbar",
					"00" : "searchbar"
				},

				// Indicates wether Element should be selected and opens the
				// context-menu
				openContextMenu : false,

				// Timer-id from setTimeout(..) for clearing the this.keybuffer
				timerId : null,

				/*
				 * Main-eventhandling for every page
				 */
				onkeypress : function(event) {

					var keyCode = event.which;
					var charCode = event.charCode
					var charString = String.fromCharCode(charCode)
							.toUpperCase()

					var hasModifier = ShortcutManager.hasModifier(event)
					var isSpecialIdEntering = this.isSpecialIdEntering(event)
					var isWritableElement = MlbUtils
							.isWritableElement(event.originalTarget)
					var isOneOfConfiguredModifierCombination = this
							.isOneOfConfiguredModifierCombination(event)
					var isNummericIdType = MlbPrefs.isNumericIdType()
					var isCharIdType = !isNummericIdType
					var isDigit = keyCode >= KeyEvent.DOM_VK_0
							&& keyCode <= KeyEvent.DOM_VK_9
					var idsNotVisible = this.getCurrentTabLocalPrefs()
							.getVisibilityMode() == MlbCommon.VisibilityModes.NONE

					// Do nothing if
					if (!window.getBrowser()
							||
							// Case: numeric ids and no digit pressed (only for
							// performance reasons made explicit at the
							// beginning
							(isNummericIdType && !isDigit)
							||
							// Case: avoid overriding of e.g. changing tabs with
							// Ctlr+<number> Bug #18
							(isNummericIdType && hasModifier && !isOneOfConfiguredModifierCombination)
							||
							// Case: Focus is in editable field and event was
							// not stopped
							(isWritableElement && !this.eventStopped)
							||
							// Case: char ids and modifier was pressed
							(isCharIdType && hasModifier)
							||
							// Case: entered char is not in defined char set
							(isCharIdType && !(this.isCharCodeInIds(charString) || isSpecialIdEntering))
							||
							// Case: Ids not visible and no special id (e.g
							// tabid) is entered
							(idsNotVisible && !isSpecialIdEntering) ||
							// Case: event is one triggered by Alt+numpad on
							// windows
							(isWindowsOS && this.isAltPlusNumpad0To9(event,
									this.currentOnKeydownEvent))) {
						return
					}

					// With new keystroke clear old timer
					clearTimeout(this.timerId);

					this.keybuffer = this.keybuffer
							+ String.fromCharCode(charCode);

					// Update statusbar
					if (MlbPrefs.showKeybufferInStatusbar) {
						this.updateStatuspanel(this.keybuffer.toUpperCase());
					}

					// Set flag whether link should be opened in new tab or in
					// cooliris preview
					var encodedEventModifier = ShortcutManager
							.encodeEventModifier(event)
					this.openInNewTab = encodedEventModifier == MlbPrefs.modifierForOpenInNewTab
					this.openInNewWindow = encodedEventModifier == MlbPrefs.modifierForOpenInNewWindow
					this.openInCoolirisPreviews = encodedEventModifier == MlbPrefs.modifierForOpenInCoolirisPreviews

					if (this.isExecuteAutomatic(event)) {
						if (this.isExecuteInstantly(event))
							this.executeAutomatic()
						else
							this.timerId = setTimeout(
									"mouselessbrowsing.EventHandler.executeAutomatic()",
									MlbPrefs.delayForAutoExecute);
					} else {
						this.setResetTimer()
					}
				},

				/*
				 * Stopps the keydown event in certain cases to avoid default
				 * behavior
				 */
				onkeydown : function(event) {
					// Set current onkeydown for later use in onkeypress
					// Used to fix Bug #31
					this.currentOnKeydownEvent = event

					var isOneOfConfiguredModifierCombination = this
							.isOneOfConfiguredModifierCombination(event)

					// Case excl. use of numpad, second part is to avoid
					// overwriting of change tab
					if (this.isCaseOfExclusivlyUseOfNumpad(event) ||
							// Case Digit + modifier
							(MlbPrefs.isNumericIdType()
									&& this.isDigitPressed(event)
									&& isOneOfConfiguredModifierCombination && !this
									.isAltCtrlInEditableField(event)) ||
							// Case input is blocked for MLB
							this.blockKeyboardInputForMLBActive) {
						this.stopEvent(event)
						this.eventStopped = true
						// Fix for Bug Id 13 and Workaround for FF Bug 291082;
						if (MlbUtils.isElementOfType(event.originalTarget,
								MlbUtils.ElementTypes.SELECT)) {
							event.originalTarget.blur()
						}
					} else {
						this.eventStopped = false
					}

					if (this.blockKeyboardInputForMLBActive) {
						this.setTimerForBlockKeyboardInputReset()
					}
				},

				/*
				 * Not in use yet Used to solve bug #52 but there is not onkeyup
				 * event for alt key if it pressed in combination with other
				 * key! So no constitent behavior could be implemented
				 */
				onkeyup : function(event) {
					var keyCode = event.keyCode
					if ((keyCode != KeyEvent.DOM_VK_CONTROL && keyCode != KeyEvent.DOM_VK_ALT)
							|| this.keybuffer.length == 0) {
						return
					}
					this.executeAutomatic()
				},

				// TODO commenting
				// As in case of Alt+numpad event no keydown is fired the key
				// down event is the one from the
				// previous event, therefore for the evaluation of whether the
				// current event should be
				// discarted the current keypress event must be used
				isAltPlusNumpad0To9 : function(keypressEvent, keydownEvent) {
					// First determine if the current event should be discarted
					var noModifierPressed = !ShortcutManager
							.hasModifier(keypressEvent)
					if (noModifierPressed && this.lastEventWasAltNumpad0To9) {
						// in this case the provided keyDownEvent is the one
						// from the last event!
						// as for alt+numpad no keydown event is fired!
						this.lastEventWasAltNumpad0To9 = false
						return true
					}

					// Set the "last event flag"
					var isOnlyAltModifier = keydownEvent.altKey
							&& !(keydownEvent.ctrlKey || keydownEvent.metaKey)
					var isNumpad0To9 = keydownEvent.keyCode >= KeyEvent.DOM_VK_NUMPAD0
							&& keydownEvent.keyCode <= KeyEvent.DOM_VK_NUMPAD9
					if (isOnlyAltModifier && isNumpad0To9) {
						this.lastEventWasAltNumpad0To9 = true
					} else {
						this.lastEventWasAltNumpad0To9 = false
					}
					return false
				},
            
            onscroll: function(event){
               if (!MlbPrefs.showIdsOnDemand) {
                  return;
               }
               var currentVisibilityMode = TabLocalPrefs.getPrefs(content)
                     .getVisibilityMode();
               if ( currentVisibilityMode != MlbCommon.VisibilityModes.NONE) {
                  this.hideIdsAfterExecuting(content);
               }
            },

				isOneOfConfiguredModifierCombination : function(event) {
					var encodedModifierCode = ShortcutManager
							.encodeEventModifier(event)
					if (encodedModifierCode == MlbPrefs.modifierForWritableElement
							|| encodedModifierCode == MlbPrefs.modifierForOpenInNewTab
							|| encodedModifierCode == MlbPrefs.modifierForOpenInNewWindow
							|| (encodedModifierCode == MlbPrefs.modifierForOpenInCoolirisPreviews && MlbUtils
									.isCoolirisPreviewsInstalled())) {
						return true
					} else {
						return false
					}
				},

				isAltCtrlInEditableField : function(event) {
					return MlbUtils.isWritableElement(event.originalTarget)
							&& ShortcutManager.isModifierCombination(event,
									ShortcutManager.CTRL_ALT)
				},

				isDigitPressed : function(keyDownEvent) {
					var keyCode = keyDownEvent.which
					return (keyCode >= KeyEvent.DOM_VK_0 && keyCode <= KeyEvent.DOM_VK_9)
							|| (keyCode >= KeyEvent.DOM_VK_NUMPAD0 && keyCode <= KeyEvent.DOM_VK_NUMPAD9)
				},

				isExecuteInstantly : function(keypressEvent) {
					if (!MlbPrefs.executeInstantlyWhenIdUnique)
						return false

					if (this.isSpecialIdEntering(keypressEvent)) {
						var tabId = this.keybuffer.substring(1)
						if (StringUtils.isEmpty(tabId)) {
							return false
						}
						var searchedTabId = parseInt(tabId + "0", 10)
						var tabCount = MlbUtils.getVisibleTabs().length
						return searchedTabId > tabCount
					} else {
						return MlbUtils.getPageData()
								&& MlbUtils.getPageData()
										.isIdUnique(this.keybuffer)
					}
				},

				isSpecialIdEntering : function(keypressEvent) {
					return (this.keybuffer != ""
							&& this.keybuffer.indexOf("0") == 0 && StringUtils
							.isDigit(this.keybuffer))
							|| (keypressEvent.charCode == KeyEvent.DOM_VK_0)
				},

				handleEnter : function() {
					var event = InitManager.getShortcutManager()
							.getCurrentEvent();
					if (this.shouldExecute()) {
						var currentContentWin = content;
						this.execute();
						if (MlbPrefs.showIdsOnDemand) {
							this.hideIdsAfterExecuting(currentContentWin);
						}
						this.stopEvent(event);
					}
					this.resetVars();
					return ShortcutManager.DO_NOT_SUPPRESS_KEY
				},

				/*
				 * Autoexecution function when pressed ctrl-key
				 */
				executeAutomatic : function() {
					if (this.shouldExecute()) {
						var currentContentWin = content;
						this.execute();
						if (MlbPrefs.showIdsOnDemand) {
							this.hideIdsAfterExecuting(currentContentWin);
						}
					}
					this.resetVars();
				},

				isCharCodeInIds : function(charString) {
					if (MlbPrefs.idChars.indexOf(charString) != -1) {
						return true;
					} else {
						return false;
					}
				},

				isExecuteAutomatic : function(event) {
					// Always if Ctrl or Alt-Key was Pressed
					if (event.ctrlKey || event.altKey
							|| MlbPrefs.executeAutomaticEnabled == true) {
						return true
					} else {
						return false
					}
				},

				shouldExecute : function() {
					if (MlbUtils.getPageData()
							&& // avoid error if page is changed in the
								// meantime e.g. with history back
							MlbUtils.getPageData()
									.hasElementWithId(this.keybuffer)
							|| this.changeTabByNumberRegExp
									.test(this.keybuffer)
							|| this.globalIds[this.keybuffer] != null) {
						return true;
					} else {
						return false;
					}
				},

				/*
				 * Execute action
				 */
				execute : function() {
					/* First check for focusing URL-Field
					if (this.keybuffer == "0") {
						document.getElementById('urlbar').select();
						return;
					}

					if (this.keybuffer == "00") {
						document.getElementById('searchbar').select();
						return;
					}*/

					// Check for changing tab by number
					if (this.changeTabByNumberRegExp.test(this.keybuffer)) {
						this.changeTabByNumber();
						return;
					}

					// Else...
					var element = MlbUtils.getPageData()
							.getElementForId(this.keybuffer);
					// If onDomContentLoaded the pageData is not refreshed
					// removed items could be in the pageData
					if (element.ownerDocument == null) {// Element no longer
														// exists within the
														// document
						return
					}
					var currentDoc = element.ownerDocument;
					var currentWin = currentDoc.defaultView;
					// Return code for onclick-functions
					var returnCode = true;
					var tagName = element.tagName.toLowerCase();
					var type = element.type ? element.type.toLowerCase() : null;

					if (tagName == "body") {
						currentWin.focus();
						if (currentDoc.body) {
							currentDoc.body.focus()
						}
						return;
					}
					// First try at least to focus
					try {
						element.focus();
					} catch (e) {
					}

					// If it is text- or password-field
					if ((tagName == "input" && (type == "text" || type == "password"))
							|| tagName == "textarea") {
						element.select()
					}
					// If its an anchor check different possibilities
					else if (tagName == "a") {
						var loadInBackground = Prefs
								.getBoolPref("browser.tabs.loadInBackground")
						if (this.openInNewTab) {
							Utils.openUrlInNewTab(element.href,
									!loadInBackground);
							return;
						} else if (this.openInNewWindow) {
							Utils.openInNewWindow(element.href, true)
							return;
						} else if (this.openInCoolirisPreviews) {
							this.showCoolirisPreview(element);
							return
						} else if (element.target != null
								&& element.target.length > 0
								&& !this.isTargetInCurrentWin(currentWin.top,
										element.target)) {// Extra handling as
															// FF does not open
															// link if it not
															// within the same
															// window
							var tabs = MlbUtils.getVisibleTabs().length
							for (var i = 0; i < tabs.length; i++) {
								var tab = tabs[i]
								if (tab.document.defaultView.name == element.target) {
									tab.load(Utils.createURI(element.href))
									if (!loadInBackground) {
										tab.focus()
									}
									return
								}
							}
							var newTab = Utils.openUrlInNewTab(element.href,
									!loadInBackground);
							// set name of new window
							// TODO make it right
							if (element.target != "_blank")
								newTab.document.defaultView.name = element.target
							return;
						}
					}

					// And simulate click
					function performEvent(type) {
						var clickEvent = currentDoc.createEvent("MouseEvents");
						clickEvent.initMouseEvent(type, true, true, currentWin,
								1, 0, 0, 0, 0, false, false, false, false, 0,
								null);
						element.dispatchEvent(clickEvent);
					}
					performEvent("mouseover")
					performEvent("mousedown")
					performEvent("click")
					performEvent("mouseup")
				},

				hideIdsAfterExecuting : function(win) {
					var currentVisibilityMode = TabLocalPrefs.getPrefs(win)
							.getVisibilityMode();
					this.updateIdsAfterToggling(win,
							MlbCommon.VisibilityModes.NONE,
							currentVisibilityMode);
				},

				/*
				 * Determines whether the target of a link is within the current
				 * win
				 */
				isTargetInCurrentWin : function(topWin, target) {
					var allFrames = MlbUtils.getAllFrames(topWin)
					if (target == "_self" || target == "_parent"
							|| target == "_top"
							|| allFrames.some(function(element) {
										return element.name == target
									})) {
						return true
					}
					return false
				},

				/*
				 * Toggles the visibility of the Ids
				 */
				toggleIds : function() {
					if (this.isSuppressShortCut()) {
						return ShortcutManager.DO_NOT_SUPPRESS_KEY
					}
					var currentVisibilityMode = this.getCurrentTabLocalPrefs()
							.getVisibilityMode()
					var previousVisibilityMode = this.getCurrentTabLocalPrefs()
							.getPreviousVisibilityMode()
					var resultingVisibilityMode = null;
					if ((currentVisibilityMode == MlbCommon.VisibilityModes.CONFIG || currentVisibilityMode == MlbCommon.VisibilityModes.ALL)) {
						if (this.getPageInitializer()
								.hasVisibleIdSpans(content)) {
							// If ids are currently shown, switch to visibility
							// mode "none"
							resultingVisibilityMode = MlbCommon.VisibilityModes.NONE;
						} else {// Special case to make ids visible on first
								// shortcut after reenabling MLB
							resultingVisibilityMode = MlbCommon.VisibilityModes.CONFIG;
						}
					} else if (previousVisibilityMode == MlbCommon.VisibilityModes.CONFIG) {
						// Previous mode was config, switch back to config mode
						resultingVisibilityMode = MlbCommon.VisibilityModes.CONFIG;
					} else {
						// Previous mode was all, switch back to all mode
						resultingVisibilityMode = MlbCommon.VisibilityModes.ALL;
					}
					this.updateIdsAfterToggling(content,
							resultingVisibilityMode, currentVisibilityMode);

				},

				/*
				 * Toggles between showing the ids for the configured elements
				 * and all elements
				 */
				toggleAllIds : function() {
					var currentVisibilityMode = this.getCurrentTabLocalPrefs()
							.getVisibilityMode()
					var resultingVisibilityMode = null
					if (currentVisibilityMode == MlbCommon.VisibilityModes.NONE
							|| currentVisibilityMode == MlbCommon.VisibilityModes.CONFIG) {
						resultingVisibilityMode = MlbCommon.VisibilityModes.ALL;
					} else {
						resultingVisibilityMode = MlbCommon.VisibilityModes.CONFIG;
					}
					this.updateIdsAfterToggling(content,
							resultingVisibilityMode, currentVisibilityMode);

				},

				/*
				 * Initiates the update of the id spans after toggling the ids
				 */
				updateIdsAfterToggling : function(win, visibilityMode,
						currentVisibilityMode) {
					TabLocalPrefs.getPrefs(win)
							.initVisibilityModeAndShowIdPrefs(visibilityMode);
					// Hide all as the
					if (visibilityMode == MlbCommon.VisibilityModes.NONE) {
						this.getPageInitializer().deactivateChangeListener(win)
						this.hideIdSpans(win);
					} else {
						if (currentVisibilityMode == MlbCommon.VisibilityModes.ALL)// hide
																					// first
																					// all
																					// id
																					// spans
																					// as
																					// the
																					// number
																					// of
																					// spans
																					// will
																					// be
																					// less
							this.hideIdSpans(win)
						this.getPageInitializer().updatePage();
					}
				},

				/*
				 * Hides all Id spans Called recusvily an all frames
				 */
				hideIdSpans : function(winObj) {
					// Reset PageData
					var pageData = MlbUtils.getPageData(winObj)
					function _hideIdSpans(winObj) {
						var doc = winObj.document;
						var spans = doc.evaluate("//span[@MLB_idSpanFlag]",
								doc, null,
								XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE, null)
						for (var i = 0; i < spans.snapshotLength; i++) {
							var span = spans.snapshotItem(i)
							span.style.display = "none";
							// TODO side effect of Easygreasy is that on pages
							// where eg scripts runs page data is null on
							// history back
							if (pageData) {
								var elementForSpan = pageData
										.getElementBySpan(span)
								if (elementForSpan != null) {
									AbstractInitializer.setElementStyle(
											elementForSpan, false)
								}
							}
						}
						var frames = winObj.frames;
						for (var i = 0; i < frames.length; i++) {
							_hideIdSpans(frames[i]);
						}
					}
					_hideIdSpans(winObj)
					if (pageData)// is null on first initialization after
									// startup
						pageData.initResetableMembers()
				},

				/*
				 * Moves back or forward in history
				 */
				moveHistory : function(direction) {
					if (this.isSuppressShortCut()) {
						return ShortcutManager.DO_NOT_SUPPRESS_KEY
					}
					// Due to fact ff crashes otherwise a setTimeout must be
					// applied
					if (direction == "forward")
						getBrowser().goForward();
					else
						getBrowser().goBack();

				},

				moveHistoryBack : function() {
					return this.moveHistory("back");
				},

				moveHistoryForward : function() {
					return this.moveHistory("forward");
				},

				/*
				 * Some shortcuts will be suppressed if they have no modifier
				 * and a textfield or selectbox is focused TODO check
				 * implementation, it's probably wrong
				 */
				isSuppressShortCut : function() {
					var event = InitManager.getShortcutManager()
							.getCurrentEvent();
					if (this.isNonPrintableKey(event))
						return false;
					var noModifierPressed = !ShortcutManager.hasModifier(event)
					return noModifierPressed
							&& MlbUtils.isWritableElement(event.originalTarget)
							&& !this.isCaseOfExclusivlyUseOfNumpad(event);
				},

				/* TODO Implement is wrong!! */
				isNonPrintableKey : function(event) {
					var keyCode = event.keyCode;
					if ((keyCode >= 112 && keyCode <= 123) || keyCode < 49)
						return true;
					else
						return false;
				},

				resetVars : function() {
					this.currentOnKeydownEvent = null
					this.keybuffer = "";
					this.lastEventWasAltNumpad0To9 = false
					this.openInNewTab = false;
					this.openInNewWindow = false;
					this.openInCoolirisPreviews = false;
					this.updateStatuspanel("");
					this.openContextMenu = false;
					clearTimeout(this.timerId);
					this.resetBlockKeyboardInput()
					this.clearTimerForBlockKeyboardInput()
				},

				/*
				 * scrolling up/down
				 */
				scroll : function(direction) {
					if (this.isSuppressShortCut()) {
						return ShortcutManager.DO_NOT_SUPPRESS_KEY
					}
					var event = InitManager.getShortcutManager()
							.getCurrentEvent()
					var eventWin = event.originalTarget.ownerDocument.defaultView
					var winToScroll = eventWin.top == content
							? eventWin
							: content
					if (direction == "up")
						winToScroll.scrollBy(0, -MlbPrefs.pixelsToScroll);
					else
						winToScroll.scrollBy(0, MlbPrefs.pixelsToScroll);
				},

				scrollDown : function() {
					return this.scroll("down");
				},

				scrollUp : function() {
					return this.scroll("up");
				},

				/*
				 * Checks wether the actual-keystroke should be suppressed
				 */
				isCaseOfExclusivlyUseOfNumpad : function(event) {
					var keyCode = event.keyCode;
					var noModifierPressed = !ShortcutManager.hasModifier(event)
					// As ADD and SUBSTRACT are also on main part of the
					// keyboard they will not be treated as numpad keys
					var isNumpad = (keyCode >= KeyEvent.DOM_VK_NUMPAD0 && keyCode <= KeyEvent.DOM_VK_NUMPAD9)
							|| (keyCode == KeyEvent.DOM_VK_MULTIPLY)
							|| (keyCode == KeyEvent.DOM_VK_SEPARATOR)
							|| (keyCode == KeyEvent.DOM_VK_DECIMAL)
							|| (keyCode == KeyEvent.DOM_VK_DIVIDE)
					return MlbPrefs.isNumericIdType()
							&& this.getCurrentTabLocalPrefs()
									.isExclusiveUseOfNumpad()
							&& this.getCurrentTabLocalPrefs()
									.getVisibilityMode() != MlbCommon.VisibilityModes.NONE
							&& noModifierPressed && isNumpad;
				},

				/*
				 * Eventhandling for selecting a tab
				 */
				onTabSelect : function(event) {
					this.setCurrentTabLocalPrefs();
				},

				openLinkInNewCoolirisPreview : function(event) {
					if (this.isSuppressShortCut() && this.keybuffer.length == 0) {
						return ShortcutManager.DO_NOT_SUPPRESS_KEY
					}
					this.openLinkInOtherLocationViaPostfixKey(event,
							MlbCommon.OpenLinkLocations.COOLIRIS_PREVIEW);
				},

				openLinkInNewTab : function(event) {
					if (this.isSuppressShortCut() && this.keybuffer.length == 0) {
						return ShortcutManager.DO_NOT_SUPPRESS_KEY
					}
					this.openLinkInOtherLocationViaPostfixKey(event,
							MlbCommon.OpenLinkLocations.TAB);
				},

				openLinkInNewWindow : function(event) {
					if (this.isSuppressShortCut() && this.keybuffer.length == 0) {
						return ShortcutManager.DO_NOT_SUPPRESS_KEY
					}
					this.openLinkInOtherLocationViaPostfixKey(event,
							MlbCommon.OpenLinkLocations.WINDOW);
				},

				/*
				 * Opens Link in a new tab
				 */
				openLinkInOtherLocationViaPostfixKey : function(event,
						locationId) {
					if (this.keybuffer == "") {
						return;
					}
					var element = MlbUtils.getPageData()
							.getElementForId(this.keybuffer);
					if (element == null)
						return;
					var tagName = element.tagName.toLowerCase();
					if (tagName != "a")
						return;
					this.resetVars();
					var currentContentWin = content;
					var href = element.href
					if (locationId == MlbCommon.OpenLinkLocations.TAB) {
						Utils
								.openUrlInNewTab(
										href,
										!Prefs
												.getBoolPref("browser.tabs.loadInBackground"));
					} else if (locationId == MlbCommon.OpenLinkLocations.WINDOW) {
						// Otherwise the key is displayed
						this.blurActiveElement(event)
						Utils.openInNewWindow(href, true)
					} else if (locationId == MlbCommon.OpenLinkLocations.COOLIRIS_PREVIEW
							&& MlbUtils.isCoolirisPreviewsInstalled()) {
						this.showCoolirisPreview(element)
					}
					if (MlbPrefs.showIdsOnDemand) {
						this.hideIdsAfterExecuting(currentContentWin);
					}
					return ShortcutManager.PREVENT_FURTHER_EVENTS;
				},

				showCoolirisPreview : function(link) {
					var dummyEvent = content.document
							.createEvent("MouseEvents");
					cpvw_docHandler
							.initPreviewShow(dummyEvent, link.href, link)
				},

				/*
				 * Toggles the exclusive use of numpad
				 */
				toggleExclusiveUseOfNumpadSecondCall : false,
				toggleExclusiveUseOfNumpad : function() {
					if (this.toggleExclusiveUseOfNumpadSecondCall == false) {
						this.toggleExclusiveUseOfNumpadSecondCall = true;
						setTimeout(
								"mouselessbrowsing.EventHandler.toggleExclusiveUseOfNumpadSecondCall=false",
								1000);
					} else {
						this.getCurrentTabLocalPrefs()
								.toggleExclusiveUseOfNumpad()
					}
				},

				updateStatuspanel : function(status) {
					document.getElementById("mlb-status").value = status;
				},

				changeTabByNumber : function() {
					var tabs = MlbUtils.getVisibleTabs()
					var requestedTab = parseInt(this.keybuffer.substring(1), 10);
					var newActiveTab = null;
					if (requestedTab <= tabs.length) {
						// Correct index as tabs are counted zero based but in
						// MLB it is 1 based
						newActiveTab = requestedTab - 1
					} else {
						newActiveTab = tabs.length - 1
					}
					// Application.activeWindow.tabs[newActiveTab].focus() is
					// not working as content will not be focused afterwards
					getBrowser().selectedTab = tabs[newActiveTab]
				},

				stopEvent : function(event) {
					event.preventDefault();
					event.stopPropagation();
				},

				selectLink : function() {
					if (this.keybuffer == "") {
						return ShortcutManager.DO_NOT_SUPPRESS_KEY;
					}
					var pageData = MlbUtils.getPageData()
					var element = pageData.getElementForId(this.keybuffer);
					if (element == null)
						return;
					var tagName = element.tagName.toLowerCase();
					if (tagName != "a")
						return;
					// Select Link
					element.focus();
					var doc = element.ownerDocument;
					var selection = doc.defaultView.getSelection()

					// Create new Range
					var range = doc.createRange();
					range.selectNode(element);
					range.setEndBefore(pageData.getIdSpanByElement(element))
					// Set new Selection
					selection.removeAllRanges();
					selection.addRange(range);

					this.resetVars();

				},

				onElementFocusEvent : function(event) {
					var focusedElement = event.originalTarget
					if (!this.isElementWithOverlayPositioning(focusedElement)) {
						return
					}
					var idSpan = null
					if (focusedElement instanceof HTMLDocument
							&& focusedElement.designMode == "on") {
						idSpan = focusedElement.defaultView.frameElement.idSpan
					} else if (focusedElement.ownerDocument) {
						var win = focusedElement.ownerDocument.defaultView
						var pageData = MlbUtils.getPageData(win)
						if (pageData != null) {
							idSpan = pageData
									.getIdSpanByElement(focusedElement)
						}
					}
					if (idSpan == null) {
						return
					}
					if (event.type == "focus") {
						idSpan.style.visibility = "hidden"
					} else {
						idSpan.style.visibility = "visible"
					}
				},

				isElementWithOverlayPositioning : function(element) {
					return MlbUtils.isElementOfType(element,
							MlbUtils.ElementTypes.TEXT)
							|| MlbUtils.isElementOfType(element,
									MlbUtils.ElementTypes.PASSWORD)
							|| MlbUtils.isElementOfType(element,
									MlbUtils.ElementTypes.TEXTAREA)
							|| MlbUtils.isEditableIFrame(element)
				},

				getPageInitializer : function() {
					return mouselessbrowsing.PageInitializer
				},

				blurActiveElement : function(event) {
					if (MlbPrefs
							.isEscKey(MlbPrefs.BLUR_ACTIVE_ELEMENT_KEY_PREF_ID)
							&& this.isPopupOpen()) {
						return
					}
					var activeElement = getBrowser().contentDocument.activeElement
					while (activeElement.tagName == "FRAME"
							|| activeElement.tagName == "IFRAME") {
						activeElement = activeElement.contentDocument.activeElement
					}
					if (activeElement.blur) {
						activeElement.blur()
					}
					if (activeElement.ownerDocument.designMode == "on") {
						activeElement.ownerDocument.defaultView.top.focus()
					}
				},

				/*
				 * Toggles the blocking of the keyboard input
				 */
				toggleBlockKeyboardInputForMLB : function() {
					if (MlbPrefs
							.isEscKey(MlbPrefs.BLOCK_KEYBOARD_INDPUT_PREF_ID)
							&& this.isPopupOpen()) {
						return
					}
					if (this.blockKeyboardInputForMLBActive) {
						this.blockKeyboardInputForMLBActive = false
						this.clearTimerForBlockKeyboardInput()
					} else {
						this.blockKeyboardInputForMLBActive = true
						this.setTimerForBlockKeyboardInputReset()
					}
				},

				/*
				 * Sets timer for reseting keyboard input blocking
				 */
				setTimerForBlockKeyboardInputReset : function() {
					this.clearTimerForBlockKeyboardInput()
					this.blockKeyboardInputTimerId = setTimeout(
							mouselessbrowsing.EventHandler.resetBlockKeyboardInput,
							MlbPrefs.delayForAutoExecute)
				},

				/*
				 * Clears Timer responsible for resetting keyboard input
				 * blocking
				 */
				clearTimerForBlockKeyboardInput : function() {
					if (this.blockKeyboardInputTimerId != null) {
						clearTimeout(this.blockKeyboardInputTimerId)
						this.blockKeyboardInputTimerId = null
					}
				},

				/*
				 * Resets keyboard input blocking
				 */
				resetBlockKeyboardInput : function() {
					mouselessbrowsing.EventHandler.blockKeyboardInputForMLBActive = false
				},

				isPopupOpen : function() {
					var popupsets = document.getElementsByTagName("popupset")
					for (var i = 0; i < popupsets.length; i++) {
						var popups = popupsets[i].childNodes
						for (var j = 0; j < popups.length; j++) {
							if (popups[j].state == "open") {
								return true
							}
						}
					}
					return false
				},

				openConfiguration : function(event) {
					// If click on icon only single left click opens
					// configuration
					if (event != null
							&& ((event.button && event.button != 0) || event.detail > 1)) {
						return
					}
					openDialog(MlbCommon.MLB_CHROME_URL
									+ "/preferences/prefs.xul", "mlb_prefs",
							"chrome, centerscreen")
				},

				addSiteRule : function() {
					var urlbar = document.getElementById("urlbar")
					openDialog(MlbCommon.MLB_CHROME_URL
									+ "/preferences/prefs.xul", "mlb_prefs",
							"chrome, centerscreen", urlbar.value)
				},

				reportBug : function() {
					Utils
							.openUrlInNewTab(
									'http://code.google.com/p/mouselessbrowsing/issues/list',
									true)
				},

				giveFeedback : function() {
					Utils.getMostRecentBrowserWin().content.location.href = "mailto:info@mouseless.de"
				},

				hideMlbMenu : function() {
					MlbPrefs.setShowMlbMenuFlag(false)
					document.getElementById('mlb_tools_menu').style.display = "none"
				},

				hideMlbStatusbar : function() {
					MlbPrefs.setShowMlbStatusbarFlag(false)
					mouselessbrowsing.InitManager.initStatusbar()
				},

				disableMlb : function() {
					// Hide ids in all browsers
					Firefox.iterateAllBrowsers(function(browser) {
								EventHandler.hideIdSpans(browser.contentWindow)
							})
				},

				setResetTimer : function() {
					this.timerId = setTimeout(
							"mouselessbrowsing.EventHandler.resetVars()",
							MlbPrefs.delayForAutoExecute);
				},

				getCurrentTabLocalPrefs : function() {
					if (this.currentTabLocalPrefs == null) {
						this.setCurrentTabLocalPrefs()
					}
					return this.currentTabLocalPrefs
				},

				setCurrentTabLocalPrefs : function() {
					this.currentTabLocalPrefs = TabLocalPrefs.getPrefs(content)
				}

			}

			var NS = mlb_common.Namespace
			NS.bindToNamespace("mouselessbrowsing", "EventHandler",
					EventHandler)

		})()
	}
}