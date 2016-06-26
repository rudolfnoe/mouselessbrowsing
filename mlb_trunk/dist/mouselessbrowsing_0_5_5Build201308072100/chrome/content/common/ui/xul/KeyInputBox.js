with(this){
/*
 * 
 */
(function(){
   //Common Constants
   var KeyInputbox = {
   	getStringForCombinedKeyCode : function(combinedKeyCode) {
			if (combinedKeyCode == "0") {
				return 'None'
			}
			var modifiers = combinedKeyCode & 0xF;
			var modString = this.getModifierString(modifiers)
			var keyCode = combinedKeyCode >> 4;
			var keyString = this.getKeyCodeString(keyCode)
			if (modString != "" && keyString != "") {
				return modString + "+" + keyString
			} else if (modString != "") {
				return modString
			} else {
				return keyString
			}
		},
		
		getKeyCodeString : function(keyCode) {
			if (keyCode == KeyEvent.DOM_VK_CONTROL
					|| keyCode == KeyEvent.DOM_VK_ALT
					|| keyCode == KeyEvent.DOM_VK_SHIFT
					|| keyCode == KeyEvent.DOM_VK_META) {
				return ""
			}
			var charString = ""
			for (key in KeyEvent) {
				if (KeyEvent[key] == keyCode) {
					charString = key.substring(7)
					break
				}
			}
			return charString
		},
		
		getModifierString : function(modifiers) {
			var arr = new Array();
			if (modifiers & Event.CONTROL_MASK)
				arr.push('Ctrl');
			if (modifiers & Event.SHIFT_MASK)
				arr.push('Shift');
			if (modifiers & Event.ALT_MASK)
				arr.push('Alt');
			if (modifiers & Event.META_MASK)
				arr.push('Meta');
			return arr.join('+');
		}
	}
   this["KeyInputbox"] = KeyInputbox
}).apply(this)
   
}