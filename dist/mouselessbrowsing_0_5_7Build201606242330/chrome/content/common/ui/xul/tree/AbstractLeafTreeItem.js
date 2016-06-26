with(this){
(function(){
   function AbstractLeafTreeItem(){
   }
   
   AbstractLeafTreeItem.prototype = {
      constructor: AbstractLeafTreeItem,

      getCellText : function(column) {
         throw new Error ('Not implemented')
      },

      isContainer: function(){
         return false
      },
      
   }
   
   ObjectUtils.extend(AbstractLeafTreeItem, "AbstractTreeItem", this)

   this.AbstractLeafTreeItem = AbstractLeafTreeItem;
}).apply(this)
}