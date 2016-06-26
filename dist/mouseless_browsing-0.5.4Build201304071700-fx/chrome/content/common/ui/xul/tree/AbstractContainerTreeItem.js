with(this){
(function(){
   function AbstractContainerTreeItem(open){
      this.children = new ArrayList()
      if(arguments.length>=1)
         this.containerOpen = open
      else  
         this.containerOpen = true
   }
   
   AbstractContainerTreeItem.prototype = {
      constructor: AbstractContainerTreeItem,
      AbstractContainerTreeItem: AbstractContainerTreeItem,

      addChild: function(abstractTreeItem){
         abstractTreeItem.setParent(this)
         abstractTreeItem.setLevel(this.getLevel()+1)
         this.children.add(abstractTreeItem)         
      },
      
      getCellText : function(column) {
         throw new Error ('Not implemented')
      },

      getChildren: function(){
         return this.children
      },
      
      getChildCount: function(){
         return this.children.size()
      },
      
      getVisibleDescendants: function(){
         function addVisibleChildren(abstractTreeItem, arrayList, omitContainerChecking){
            if(omitContainerChecking || abstractTreeItem.isContainer() && abstractTreeItem.isContainerOpen()){
               var children = abstractTreeItem.getChildren()
               for (var i = 0;i < children.size(); i++) {
                  var child = children.get(i)
                  arrayList.add(child)
                  addVisibleChildren(child, arrayList, false)            
               }
            }
         }
         var result = new ArrayList()
         addVisibleChildren(this, result, true)
         return result
      },
      
      getVisibleDescendantsCount: function(){
         return this.getVisibleDescendants().size()
      },

      isContainer: function(){
         return true
      },
      
      isContainerEmpty: function(row){
         return this.children.size()==0
      },

      isContainerOpen: function(row){
         return this.containerOpen
      },
      
      removeChild: function(abstractTreeItem){
         abstractTreeItem.setParent(null)
         return this.children.remove(abstractTreeItem)
      },

      setContainerOpen: function(containerOpen){
         this.containerOpen = containerOpen
      },
      
      
   }
   
   ObjectUtils.extend(AbstractContainerTreeItem, "AbstractTreeItem", this)

   this.AbstractContainerTreeItem = AbstractContainerTreeItem;
}).apply(this)
}