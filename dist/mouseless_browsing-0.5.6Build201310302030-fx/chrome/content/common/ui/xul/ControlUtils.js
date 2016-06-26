with(this){
/*
 * 
 * Common-Prefs Version 0.1 Created by Rudolf Noe 28.12.2007
 * 
 * Partly copied from pref-tabprefs.js (c) Bradley Chapman (THANKS!)
 */
(function() {
   
	// Attribute of a control under which key the preference should be stored
	var ControlUtils = {
		/*
		 * Appends menuitem to menulist
		 */
		appendItemToMenulist: function(menulist, label, value){
			if(menulist==null || label==null || value==null){
			   throw new Error("Arguments must not be null")
			}
		   var newItem = document.createElementNS(Constants.XUL_NS, "menuitem");
         newItem.setAttribute('label', label)
         newItem.setAttribute('value', value)
         menulist.menupopup.appendChild(newItem)
		},
		
		/*
		 * Adds menuitems for a array of labels and values, 
		 * Only new items with different values will be added 
		 * @param in menulist menulist
		 * @param in String[] labelArray
		 * @param in String[] valueArray
		 */
		appendItemsToMenulist: function(menulist, labelArray, valueArray){
		   var itemsMap = new Map()
		   var menuitems = menulist.getElementsByTagName('menuitem')
		   for (var i = 0; i < menuitems.length; i++) {
		   	itemsMap.put(menuitems[i].value)
		   }
		   for (var i = 0; i < labelArray.length; i++) {
		   	var value = valueArray[i]
		   	if(itemsMap.containsKey(value))
		   	   continue
		   	menulist.appendItem(labelArray[i], value, null)
		   }
		},
		
		clearMenulist: function(menulist){
		   var menupopup = menulist.menupopup
		   while(menupopup.hasChildNodes()){
		   	menupopup.removeChild(menupopup.firstChild)
		   }
		},
      
      filterMenulist: function(menulist, value){
         if(value==null)
            value = menulist.value
         value = value.toLowerCase()
         var parts = value.split(" ")
         var menuitemsFit = new Array()
         for (var i = 0; i < menulist.itemCount; i++) {
            var fit = true
            var menuitem = menulist.getItemAtIndex(i)
            var startindex = 0
            for (var j = 0; j < parts.length; j++) {
               var menuItemValue = (menuitem.value?menuitem.value:menuitem.label).toLowerCase()
               startindex = menuItemValue.indexOf(parts[j], startindex)
               if(startindex==-1){
                  fit = false
                  break
               }
               startindex += parts[j].length
            }
            if(!fit)
               menuitem.style.display = "none"
            else{
               menuitem.style.display = "block"
               menuitemsFit.push(menuitem)
            }
         }
      },
      
      observeControl: function(control, callbackFunc, thisObj){
         var callBack = Utils.bind(callbackFunc, thisObj)
         var tagName = control.tagName.toLowerCase() 
         if(tagName=="menulist" || "colorfield"){
            control.addEventListener("select", function(){
               callBack(control, control.value)
            }, true)
         }
         if(tagName=="textbox" || tagName=="menulist" || tagName=="colorfield"){
            control.addEventListener("input", function(){
               callBack(control, control.value)
            }, true)
            Utils.observeObject(control, "value", function(newValue){
               callBack(control, newValue)
            })
         }
      },
		
		/*
		 * Selects item of menulist by its value and returns the item 
		 */
		selectMenulistByValue : function(menulist, value) {
			this.selectChoiceElementByValue(menulist, "menuitem", value)
		},
		
		selectRadiogroupByValue: function(radiogroup, value){
			this.selectChoiceElementByValue(radiogroup, "radio", value)
		},
		
		selectChoiceElementByValue: function(choiceElement, childrenTagName, value){
			var items = choiceElement.getElementsByTagName(childrenTagName);
			for (var i = 0; i < items.length; i++) {
				if (items[i].value == value) {
					choiceElement.selectedItem = items[i]
					choiceElement.value = value
					return items[i]
				}
			}
		},
		
	}
	this["ControlUtils"]= ControlUtils;
}).apply(this)
}