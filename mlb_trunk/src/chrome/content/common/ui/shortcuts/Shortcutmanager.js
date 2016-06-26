with(this){
(function(){

/*
 * ShortCutManager
 * Version 0.1
 * Created by Rudolf Noe
 * 18.06.2005
 *
 * Licence Statement
 * Version:  MPL 1.1
 *
 * The contents of this file are subject to the Mozilla Public License
 * Version 1.1  (the "License"); you may  not use this  file except in
 * compliance with the License.  You  may obtain a copy of the License
 * at http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied. See
 * the  License  for  the   specific  language  governing  rights  and
 * limitations under the License.
 */

//Global variables
var currentEvent = null;

function ShortCutManager(){
    this.shortCuts = new Object();
    window.addEventListener("keydown", ShortCutManager_onEvent, true);
}

function ShortCutManager_getInstance(){
    if(!window.shortcutManager){
        window.shortcutManager = new ShortCutManager();
    }
    return window.shortcutManager;
}
ShortCutManager.getInstance=ShortCutManager_getInstance;

ShortCutManager.getCurrentEvent= function(){
   return currentEvent
}

function ShortCutManager_addJsShortCut(keyCode, modifierMask, jsCode, clientId){
    if(modifierMask==null){
        modifierMask = 0;
    }
    var shortCutKey = createShortCutKey(keyCode, modifierMask)
    ShortCutManager_getInstance().shortCuts[shortCutKey] = new ShortCut(jsCode, clientId);
}
ShortCutManager.addJsShortCut = ShortCutManager_addJsShortCut;

/*
 * param: combinedKeyCode = keyCode << 4 | Event.ALT_MASK | Event.CONTROL_MASK | Event.SHIFT_MASK
 */
function ShortCutManager_addJsShortCutWithCombinedKeyCode(combinedKeyCode, jsCode, clientId){
    var shortcutArray = ShortCutManager_getInstance().shortCuts[combinedKeyCode];
    var newShortCut = new ShortCut(jsCode, clientId);
    if(shortcutArray==null)
        ShortCutManager_getInstance().shortCuts[combinedKeyCode] = new Array(newShortCut);
    else
        shortcutArray[shortcutArray.length] = newShortCut;
}
ShortCutManager.addJsShortCutWithCombinedKeyCode = ShortCutManager_addJsShortCutWithCombinedKeyCode

/*
 * param: combinedKeyCode = keyCode << 4 | Event.ALT_MASK | Event.CONTROL_MASK | Event.SHIFT_MASK
 */
function ShortCutManager_addJsShortCutForElement(elementId, keyCode, modifierMask, jsCode, clientId){
	var element = document.getElementById(elementId);
	if(!element)
		return;
    var shortCutKey = createShortCutKey(keyCode, modifierMask, elementId)
	ShortCutManager_addJsShortCutWithCombinedKeyCode(shortCutKey, jsCode, clientId)
	element.addEventListener("keydown", ShortCutManager_onElementEvent, true);
}
ShortCutManager.addJsShortCutForElement = ShortCutManager_addJsShortCutForElement

function ShortCutManager_onEvent(event, elementId){
    var shortCuts = window.shortcutManager.shortCuts;
    var shortCutKey = ShortCutManager_encodeEvent(event);
    if(elementId)
    	shortCutKey = elementId + "_" + shortCutKey;
    var shortCutArray = shortCuts[shortCutKey]
    if(shortCutArray){
        currentEvent = event;
        for(var i=0; i<shortCutArray.length; i++){
            var result = shortCutArray[i].onEvent(event);
            if(result&ShortCutManager.PREVENT_FURTHER_EVENTS){
            	break;
            }
        }
    }else{
        currentEvent = null;
    }
}

function ShortCutManager_onElementEvent(event){
	var srcElement = event.target;
	if(srcElement.id)
		ShortCutManager_onEvent(event, srcElement.id)
	else 
		ShortCutManager_onEvent(event, srcElement.name);
}

function ShortCutManager_clearShortCut(combinedKeyCode){
    ShortCutManager_getInstance().shortCuts = new Object();
}
ShortCutManager.clearShortCut=ShortCutManager_clearShortCut;

/*
 * Löscht alle Shortcuts mit einer bestimmten
 * ClientId
 */
function ShortCutManager_clearAllShortCutsForClientId(clientId){
	try{
		var shortCuts = ShortCutManager_getInstance().shortCuts;
		for(i in shortCuts){
			var shortCutArray = shortCuts[i];
			var newShortCutArray = new Array();
			for(var j = 0; j < shortCutArray.length; j++){
				var shortCut = shortCutArray[j];
				if(shortCut.clientId!=clientId)
					newShortCutArray[newShortCutArray.length] = shortCut;
			}
			shortCuts[i] = newShortCutArray;
		}
	}catch(e){alert(e)}
}
ShortCutManager.clearAllShortCutsForClientId = ShortCutManager_clearAllShortCutsForClientId;

function createShortCutKey(keyCode, modifierMask, elementId){
	var shortCutKey = keyCode << 4 | modifierMask;
	if(elementId)
		shortCutKey = elementId + "_" + shortCutKey;
	return shortCutKey;
}
/*
 * Encodes KeyEvent
 */
function ShortCutManager_encodeEvent(event){
    return event.keyCode << 4 | ShortCutManager_encodeEventModifier(event);
}

function ShortCutManager_encodeEventModifier(event){
    return event.altKey * Event.ALT_MASK |
        event.ctrlKey * Event.CONTROL_MASK |
        event.shiftKey * Event.SHIFT_MASK |
        event.metaKey * Event.META_MASK;
}
ShortCutManager.encodeEventModifier=ShortCutManager_encodeEventModifier;

function ShortCutManager_isModifierCombination(event, modifierCombination){
    return this.encodeEventModifier(event)==modifierCombination
}
ShortCutManager.isModifierCombination=ShortCutManager_isModifierCombination;

/*
 * Construktor für Shortcut
 */
function ShortCut(jsCode, clientId){
    this.jsCode = jsCode.replace(/'/g, '"');
    this.clientId = clientId;
}

function ShortCut_onEvent(event){
    var result = window.eval(this.jsCode);
    if(result&ShortCutManager.SUPPRESS_KEY){
	    event.preventDefault();
    	 event.stopPropagation();
    }
    return result
}
ShortCut.prototype.onEvent = ShortCut_onEvent;

//Constants
ShortCutManager.ALT = Event.ALT_MASK;
ShortCutManager.CTRL = Event.CONTROL_MASK;
ShortCutManager.SHIFT = Event.SHIFT_MASK;
ShortCutManager.CTRL_SHIFT = Event.CONTROL_MASK | Event.SHIFT_MASK;
ShortCutManager.ALT_SHIFT = Event.ALT_MASK | Event.SHIFT_MASK;
ShortCutManager.CTRL_ALT = Event.ALT_MASK | Event.CONTROL_MASK;
ShortCutManager.SUPPRESS_KEY = 1;
ShortCutManager.PREVENT_FURTHER_EVENTS = 2

this.ShortCutManager = ShortCutManager
}).apply(this)
}