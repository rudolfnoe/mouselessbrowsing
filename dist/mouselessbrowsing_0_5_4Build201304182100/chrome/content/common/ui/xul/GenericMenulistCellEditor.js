with(this){
(function(){
   function GenericMenulistCellEditor(menulist){
      this.menulist = menulist
      if(menulist.parentNode)
         DomUtils.removeElement(menulist)
   }
   
   GenericMenulistCellEditor.prototype = {
      constructor: GenericMenulistCellEditor,
      
      getEditingElement: function(){
         return this.menulist
      },
      
      getValue: function(){
         if(this.menulist.selectedIndex!=-1)
            return this.menulist.selectedItem.value
         else
            return this.menulist.inputField.value

      },
      
      getLabel: function(){
         if(this.menulist.selectedIndex!=-1)
            return this.menulist.selectedItem.label
         else
            return this.menulist.inputField.value
      },    
      
      //Called after editing element is inserted in the DOM
      initEditingElement: function(currentItem){
         this.menulist.value = currentItem.value
         //As edit element is not in DOM yet the property editable is not set
         if(this.menulist.getAttribute('editable')=="true")
            this.menulist.inputField.value = currentItem.value
      }
   }

   this.GenericMenulistCellEditor = GenericMenulistCellEditor;
}).apply(this)
}