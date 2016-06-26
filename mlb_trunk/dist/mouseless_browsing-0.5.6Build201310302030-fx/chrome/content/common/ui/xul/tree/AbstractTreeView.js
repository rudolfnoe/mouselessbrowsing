with(this){
(function(){
	
	function AbstractTreeView(tree, rootItem) {
		this.tree = tree
      this.visibleItems = new ArrayList()
      if(arguments.length>=2){
         if(!rootItem.isContainer())
            throw new Error('root item must be container')
         this.rootItem = rootItem
         this.visibleItems.add(rootItem)
   		this.rowCount = 1
      }else{
         //Create Default root container but don't show it
         this.rootItem = new DefaultContainerTreeItem()
         //Set level to -1 so that children are displayed on level 0
         this.rootItem.setLevel(-1)
   		this.rowCount = 0
      }
      this.treebox = null
		//self registration of the view at the tree
      //so this hasn't to be done outside
		this.tree.view = this
	}
	
	AbstractTreeView.prototype = {
		constructor: AbstractTreeView,
      AbstractTreeView: AbstractTreeView,

      getRootItem: function(){
         return this.rootItem
      },
      getVisibleItems: function(){
         return this.visibleItems
      },
      getTreeBox: function(){
         return this.treebox
      },
      addItem: function(item, parent){
         if(parent==null)
            var parent = this.getRootItem()
         if(!parent.isContainer())
            throw new Error('parent is no container')
         parent.addChild(item)
         if(parent.isVisible()){
            var insertIndex = this.getIndexForItem(parent) + parent.getVisibleDescendantsCount()
   			this.visibleItems.addAtIndex(insertIndex, item)
   			this.updateRowCount()
   			this.rowCountChanged(this.insertIndex, 1)
         }
      },
      filter: function(filterExp){
         this._iterateTree(function(item){
            var columns = this.tree.columns
            for (var i = 0; i < columns.length; i++) {
               var cellText = item.getCellText(columns.getColumnAt(i))
               if(StringUtils.matches(cellText, "*"+filterExp)){
                  item.setFiltered(false)
                  break
               }else{
                  item.setFiltered(true)
               }
            }
         })
         var oldSize = this.visibleItems.size()
         this.visibleItems.clear()
         this.treebox.rowCountChanged(0, -oldSize)
         this._iterateTree(function(item){
            if(!item.getFiltered()){
               this.visibleItems.add(item)
            }
         })
         this.treebox.rowCountChanged(0, this.visibleItems.size())
      },
		getCellProperties : function(row, col, props) {
         //TODO
		},
		getCellText : function(row, column) {
         return this.visibleItems.get(row).getCellText(column)
		},
		getColumnProperties : function(colid, col, props) {
         //TODO
		},
		getImageSrc : function(row, col) {
         return this.visibleItems.get(row).getImageSrc(col)
		},
      getIndexForItem: function(aItem){
         for (var i = 0; i < this.visibleItems.size(); i++) {
            var item = this.visibleItems.get(i)
            if(item==aItem)
               return i
         }
         return -1
      },
      getVisibleItem: function(row){
         return this.visibleItems.get(row) 
      },
		getLevel : function(row) {
         return this.visibleItems.get(row).getLevel()
		},
      getParentIndex:function(row){
         var startLevel = this.getVisibleItem(row).getLevel()
         for(var i=row; i >= 0; i--){
            var otherLevel = this.getVisibleItem(i).getLevel()
            if(otherLevel<startLevel)
               return i
         }
         return -1
      },
		getRowProperties : function(row, props) {
         //TODO
		},
      getSelectedItem: function(){
         if(this.tree.currentIndex==-1)
            return null
         else
            return this.visibleItems.get(this.tree.currentIndex)
      },
      hasNextSibling: function(row, afterIndex){
         var searchedLevel = this.getVisibleItem(row).getLevel()
         for (var i = afterIndex+1; i < this.visibleItems.size(); i++) {
            var otherLevel = this.getVisibleItem(i).getLevel()
            if(otherLevel==searchedLevel)
               return true
            else if(otherLevel<searchedLevel)
               break
         }
         return false
      },
      invalidateRow: function(indexOrItem){
         var index = indexOrItem
         if(isNaN(indexOrItem))
            index = this.getIndexForItem(indexOrItem)
         if(index==-1)
            throw new Error("Row for param " + indexOrItem + " not found")
         this.getTreeBox().invalidateRow(index)
            
      },
		isContainer : function(row) {
         return this.visibleItems.get(row).isContainer()
		},
      isContainerEmpty: function(row){
      	return this.visibleItems.get(row).isContainerEmpty()
      },
      isContainerOpen: function(row){
      	return this.visibleItems.get(row).isContainerOpen()
      },
		isSeparator : function(row) {
         return this.visibleItems.get(row).isSeparator()
		},
		isSorted : function() {
         //TODO
			return false;
		},
      _iterateTree: function(callBackFunction){
         function iterateItem(item){
            if(!item.isContainer()){
               callBackFunction.apply(this, [item])
               return
            }else{
               var children = item.getChildren()
               for (var i = 0; i < children.size(); i++) {
                  iterateItem.apply(this, [children.get(i)])
               }
            }
         }
         iterateItem.apply(this, [this.getRootItem()])
      },
      removeItem: function(item){
         if(item.getParent()==null)
            throw new Error('root cannot be removed')
         item.getParent().removeChild(item)
         if(item.isVisible()){
            var index = this.getIndexForItem(item)
            var removedItemsCount = 1
            if(item.isContainer()){
               var visibleDescendantsCount = item.getVisibleDescendants().size()
               this.visibleItems.removeRange(index, index+visibleDescendantsCount)
               removedItemsCount += visibleDescendantsCount
            }else{
      			this.visibleItems.removeAtIndex(index)
            }
   			this.updateRowCount()
   			this.rowCountChanged(index, -removedItemsCount)
         }
      },
      removeSelected: function(){
         if(this.tree.currentIndex==-1)
            return
         this.removeItem(this.getSelectedItem())
      },
		rowCountChanged: function(index, count){
      	if(this.treebox==null)
      	  return
      	this.treebox.rowCountChanged(index, count)
      },
		setTree : function(treebox) {
			this.treebox = treebox;
		},
		updateRowCount: function(){
			this.rowCount = this.visibleItems.size()
		},
      toggleOpenState: function(row){
         var item = this.getVisibleItem(row)
         if(!item.isContainer)
         	throw new Error('toggleOpenState called for non-container')
         if(item.isContainerOpen()){
            item.setContainerOpen(false)
            var visibleDescendantsCount = item.getVisibleDescendantsCount()
            var startIndex = row+1
            var endIndex = row + visibleDescendantsCount
            this.visibleItems.removeRange(startIndex, endIndex)
            this.rowCountChanged(row+1, -visibleDescendantsCount) 
         }else{
            item.setContainerOpen(true)
            var visibleDescendants = item.getVisibleDescendants()
            this.visibleItems.addAllAtIndex(row+1, visibleDescendants)
            this.rowCountChanged(row+1, visibleDescendants.size()) 
         }
      },
	}	
	this["AbstractTreeView"] = AbstractTreeView;
}).apply(this)
}