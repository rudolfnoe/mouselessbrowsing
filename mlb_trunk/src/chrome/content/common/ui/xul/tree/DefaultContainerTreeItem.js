with(this){
(function(){
   /*
    * Used as Root element
    */
   function DefaultContainerTreeItem(){
      this.AbstractContainerTreeItem(true)
   }
   
   DefaultContainerTreeItem.prototype = {
      constructor: DefaultContainerTreeItem,
      
      getCellText: function(column){
         return ""
      }
   }
   
   ObjectUtils.extend(DefaultContainerTreeItem, "AbstractContainerTreeItem", this)

   this.DefaultContainerTreeItem = DefaultContainerTreeItem;
}).apply(this)
}