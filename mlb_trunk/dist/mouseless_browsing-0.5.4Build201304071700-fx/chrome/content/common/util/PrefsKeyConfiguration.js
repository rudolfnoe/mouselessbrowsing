with(this){
const COMBINED_KEY_CODE_ATTR = "COMBINED_KEY_CODE_ATTR"
function byId(elementId){
   return document.getElementById(elementId)
}

function onCommandAssignShortcut(keyListboxId, keyInputboxId){
   var keyListBox = byId(keyListboxId)
   var keyInputBox = byId(keyInputboxId)
   Listbox.updateSelectedRow(keyListBox, [null, keyInputBox.getKeyString()], [null, null])
   keyListBox.selectedItem.setAttribute(COMBINED_KEY_CODE_ATTR, keyInputBox.getCombinedValue())
   keyListBox.focus()
}

function onCommandRemoveShortcut(keyListboxId){
   var keyListBox = byId(keyListboxId)
   Listbox.updateSelectedRow(keyListBox, [null, "None"], [null, null])
   keyListBox.selectedItem.setAttribute(COMBINED_KEY_CODE_ATTR, "0")
   keyListBox.focus()
}

function onCommandRestoreDefault(keyListboxId){
   var keyListBox = byId(keyListboxId)
   var selItem = keyListBox.selectedItem
   var prefid = selItem.getAttribute("prefid")
   if(Prefs.hasUserPref(prefid)){
      Prefs.clearUserPref(prefid)
   }
   var defaultKey = Prefs.getCharPref(prefid)
   Listbox.updateSelectedRow(keyListBox, [null, KeyInputbox.getStringForCombinedKeyCode(defaultKey)], [null, null])
   keyListBox.selectedItem.setAttribute(COMBINED_KEY_CODE_ATTR, defaultKey)
   keyListBox.focus()
}

function loadKeyListbox(keyListboxId){
   var keyListBox = byId(keyListboxId)
   var keyItems = Listbox.getItems(keyListBox)
   for (var i = 0; i < keyItems.length; i++) {
      var keyItem = keyItems[i]
      var prefId = keyItem.getAttribute('prefid')
      var combinedKeyCode = Prefs.getCharPref(prefId)
      var keyString = KeyInputbox.getStringForCombinedKeyCode(combinedKeyCode)
      keyItem.setAttribute(COMBINED_KEY_CODE_ATTR, combinedKeyCode)
      Listbox.updateRow(keyListBox, keyItem, [null, keyString!=null?keyString:"None"], new Array(2))
   }
}

function saveKeyListbox(keyListboxId){
   var keyListBox = byId(keyListboxId)
   var keyItems = Listbox.getItems(keyListBox)
   for (var i = 0; i < keyItems.length; i++) {
      var keyItem = keyItems[i]
      var prefId = keyItem.getAttribute('prefid')
      Prefs.setCharPref(prefId, keyItem.getAttribute(COMBINED_KEY_CODE_ATTR))
   }
}

function setKeyboxFromKeyboxMenu(keyInputboxId, keyCombId){
	var keyInputBox = byId(keyInputboxId)
   if(keyCombId=="TAB"){
     keyInputBox.setCombinedValue(9<<4)
   }else if(keyCombId=="SHIFT_TAB"){
     keyInputBox.setCombinedValue(9<<4|Event.SHIFT_MASK)
   }
}
}