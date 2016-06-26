with(this){
/*
 * Version 0.1
 * Created by Rudolf Noe
 * 28.12.2007
 *
 * Helper functions related to Listboxes
 * As the XBL-extension of listboxes is buggy this solution was choosen
 */
(function(){
	var Listbox = {
		VERSION: "0.2",
		
		/* 
		 * Returns NodeList of listitems of a listbox
		 * @param listbox object
		 * @returns NodeList of listitem-objects
		 */
		getItems: function(listbox){
			return listbox.getElementsByTagName("listitem");
		},
      
      getItemByValue: function(listbox, value){
         var items = this.getItems(listbox)
         for (var i = 0; i < items.length; i++) {
            if(items[i].value==value)
               return items[i]
         }
      }, 
		
		getSelectedListCells: function(listbox){
			if(listbox.selectedIndex==-1){
				return null;
			}
			var selectedItem = listbox.getItemAtIndex(listbox.selectedIndex)
			return selectedItem.getElementsByTagName('listcell')
		},
      
      getValues: function(listbox){
         var result = new Array()
         var items = this.getItems(listbox)
         for (var i = 0; i < items.length; i++) {
            var itemArray = new Array()
            var listcells = items[i].getElementsByTagName('listcell')
            for (var j = 0; j < listcells.length; j++) {
               itemArray.push(listcells[j].getAttribute('value'))
            }
            result.push(itemArray)
         }
         return result
      },
		
		/*
		 * Appends a row to a mulicolumn listbox
		 * @param listbox: listbox object
		 * @Param labelArray (mand): array of labels, for each column one entry
		 * @Param valueArray (mand): array of values, for each column one entry
		 * @param listItemValue (option): value of the newly created listitem
		 */
		appendMultiColumnItem: function(listbox, labelArray, valueArray, listItemValue, styleArray){
			if(labelArray.length!=valueArray.length)
				throw new Error("Listbox.appendMultiColumnItem: labelArray and valueArray do not have the sam length")
			var newItem = document.createElementNS(Constants.XUL_NS, "listitem");
			if(listItemValue!=null){
				newItem.setAttribute("value", listItemValue)
			} 
			for(var i=0; i<labelArray.length; i++){
				var listcell = document.createElementNS(Constants.XUL_NS, "listcell")
				listcell.setAttribute("label", labelArray[i])
				listcell.setAttribute("value", valueArray[i])
				if(styleArray!=null && styleArray[i]!=null){
					listcell.style.cssText = styleArray[i]
				}
				newItem.appendChild(listcell)
			}
			listbox.appendChild(newItem)
			return newItem
		},		
		
		/**
		 * Updates the selected row in the listbox
		 */
		updateSelectedRow: function(listbox, labelArray, valueArray){
         var selectedItem = listbox.selectedItem
         if(selectedItem==null){
         	throw new Error("Listbox.updateMultiColumnItem: No item selected")
         }
         this.updateRow(listbox, selectedItem, labelArray, valueArray)
		},
		
		updateRow: function(listbox, listItem, labelArray, valueArray){
         if(labelArray.length!=valueArray.length)
            throw new Error("Listbox.appendMultiColumnItem: labelArray and valueArray do not have the sam length")
         var listcells = listItem.getElementsByTagName("listcell")
         if(labelArray.length!=listcells.length){
         	throw new Error("Listbox.updateMultiColumnItem: labelArray.length is not equal to the number of listcells")
         }
         for(var i=0; i<listcells.length; i++){
            if(labelArray[i]!=null){
               listcells[i].setAttribute("label", labelArray[i])
            }
            if(valueArray[i]!=null){
               listcells[i].setAttribute("value", valueArray[i])
            }
         }
		}
	}
	this["Listbox"]= Listbox;
	
}).apply(this)
}