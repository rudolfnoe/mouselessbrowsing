with(this){
(function(){
   function EditListbox(richlistbox, cellEditor){
      this.AbstractGenericEventTarget()
      this.cellEditor = cellEditor
      this.editMode = false
      this.labelBackup = null
      this.rlb = richlistbox
      this.scm = new ShortcutManager(this.rlb, "keydown")
      this.init()
   }
   
   EditListbox.EVENT_TYPE = {
         ITEM_CHANGED: "ITEM_CHANGED",
         ITEM_ADDED: "ITEM_ADDED",
         ITEM_REMOVED: "ITEM_REMOVED",
   }
   
   EditListbox.prototype = {
      constructor: EditListbox,
      
      addItem: function(){
         var newItem = null 
         if(this.rlb.currentIndex==-1 || this.rlb.currentIndex==this.rlb.itemCount-1)
            newItem = this.rlb.appendItem("","")
         else 
            newItem = this.rlb.insertItemAt(this.rlb.currentIndex, "","")
         this.notifyListeners({type:EditListbox.ITEM_ADDED, item:newItem})
         this.rlb.clearSelection()
         this.rlb.selectedIndex = this.rlb.getIndexOfItem(newItem)
         this.startEditing()
      },
      
      createContextMenu: function(){
         var popupset = document.createElement('popupset')
         document.documentElement.appendChild(popupset)
         var contextPopup = document.createElement('menupopup')
         contextPopup.setAttribute("id", "de_mouseless_edit_listbox_cm")
         popupset.appendChild(contextPopup)
         var mi = document.createElement('menuitem')
         mi.id = "de_mouseless_edit_listbox_add_mi"
         mi.setAttribute("label", "Add Item")
         contextPopup.appendChild(mi)
         mi = document.createElement('menuitem')
         mi.id = "de_mouseless_edit_listbox_remove_mi"
         mi.setAttribute("label", "Remove Item")
         contextPopup.appendChild(mi)
         return contextPopup
      },
      
      getContextMenu: function(){
         return document.getElementById('de_mouseless_edit_listbox_cm')   
      },
      
      getValues: function(){
         var result = new Array()
         for (var i = 0; i < this.rlb.itemCount; i++) {
            result.push(this.rlb.getItemAtIndex(i).value)   
         } 
         return result
      },
      
      handleContextShowing: function(event){
         var addMI = document.getElementById("de_mouseless_edit_listbox_add_mi")
         var removeMI = document.getElementById("de_mouseless_edit_listbox_remove_mi")
         if(event.currentTarget!=this.rlb){
            var listenerFunc = "removeEventListener"
         }else{
            var listenerFunc = "addEventListener"
         }
         addMI[listenerFunc]("command", this.addItemEventHandler, true)
         removeMI[listenerFunc]("command", this.removeItemEventHandler, true)
      },
      
      handleFocus: function(){
         if(this.rlb.itemCount==0){
            this.addItem()
         }else if(this.rlb.selectedIndex==-1){
            this.rlb.selectItem(this.rlb.getItemAtIndex(0))
         }
         if(this.editMode==true && document.activeElement!=this.editingElement)
            setTimeout(Utils.bind(function(){this.editingElement.select()}, this))
      },
      
      init: function(){
         this.initContextMenu()
         this.initEventHandlers()
         this.initShortcuts()
      },
      
      initContextMenu: function(){
         var cm = this.getContextMenu()
         if(!cm)
            cm = this.createContextMenu()
         this.rlb.addEventListener("contextmenu", Utils.bind(function(event){this.handleContextShowing(event)}, this), true)
         this.rlb.setAttribute('context', "de_mouseless_edit_listbox_cm")
      },
      
      initEventHandlers: function(){
         this.rlb.addEventListener("dblclick", Utils.bind(function(event){this.toggleEditing(false)}, this), true)
         this.rlb.addEventListener("focus", Utils.bind(this.handleFocus, this), true)
         this.addItemEventHandler = Utils.bind(this.addItem, this)
         this.removeItemEventHandler = Utils.bind(this.removeItem, this)
         
      },
      
      initShortcuts: function(){
         this.scm.addShortcut("RETURN", Utils.bind(function(){this.toggleEditing(false)}, this))
         this.initShorcutsForNonEditMode()
      },
      
      initShorcutsForEditMode: function(){
         this.scm.clearAllShortcuts("NON_EDIT_MODE")
         this.scm.addShortcut("Escape", Utils.bind(function(){this.stopEditing(true)}, this), null, "EDIT_MODE") 
         this.scm.addShortcut("TAB", Utils.bind(function(){this.stopEditing(false)}, this), null, "EDIT_MODE") 
         this.scm.addShortcut("Shift+TAB", Utils.bind(function(){this.stopEditing(false)}, this), null, "EDIT_MODE") 
      },
      
      initShorcutsForNonEditMode: function(){
         this.scm.clearAllShortcuts("EDIT_MODE")
         this.scm.addShortcut("F2", this.startEditing, this, "NON_EDIT_MODE") 
         this.scm.addShortcut("Add", this.addItem, this, "NON_EDIT_MODE") 
         this.scm.addShortcut("Insert", this.addItem, this, "NON_EDIT_MODE") 
         this.scm.addShortcut("SUBTRACT", this.removeItem, this, "NON_EDIT_MODE") 
         this.scm.addShortcut("Delete", this.removeItem, this, "NON_EDIT_MODE") 
      },
      
      removeItem: function(){
         if(this.rlb.currentIndex==-1)
            return
         var currentIndex = this.rlb.currentIndex
         var removedItem = this.rlb.removeItemAt(currentIndex)
         if(currentIndex>=this.rlb.itemCount)
            currentIndex=this.rlb.itemCount-1
         this.rlb.selectedIndex = currentIndex
         this.notifyListeners({type:EditListbox.ITEM_REMOVED, item:removedItem})
      },
      
      setItems: function(labelArray, valueArray){
         if(labelArray.length!=valueArray.length)
            throw new Error("uneqals lenghts of param arrays")
         while(this.rlb.itemCount>0)
            this.rlb.removeItemAt(0)
         for (var i = 0; i < labelArray.length; i++) {
            var label = labelArray[i]
            var value = valueArray?valueArray[i]:label
            var newItem = this.rlb.appendItem(label, value)
         }
      },
      
      startEditing: function(){
         if(this.rlb.selectedIndex==-1)
            return
         this.editMode = true
         this.initShorcutsForEditMode()
         this.editingElement = this.cellEditor.getEditingElement(this.rlb.selectedItem)
         var labelElem = this.rlb.selectedItem.getElementsByTagName("label")[0]
         this.labelBackup = labelElem.value
         this.rlb.selectedItem.replaceChild(this.editingElement, labelElem)
         this.cellEditor.initEditingElement(this.rlb.selectedItem)
         this.editingElement.select()
//TODO
         //         this.blurHandler = Utils.bind(function(event){this.stopEditing()}, this)
//         this.editingElement.addEventListener("blur", this.blurHandler, false)
      },
      
      stopEditing: function(cancelEditing){
         if(this.editMode==false)
            return
         this.editMode=false
         this.initShorcutsForNonEditMode()
         this.editingElement.removeEventListener("blur", this.blurHandler, false)
         var value=null, label = null
         if(cancelEditing){
            value = this.rlb.selectedItem.value
            label = this.labelBackup
         }else{
            value = this.cellEditor.getValue()
            label = this.cellEditor.getLabel()
         }
         var currentIndex = this.rlb.currentIndex
         //Here replace child doesn't work, I don't know why
         var changedItem = this.rlb.insertItemAt(currentIndex, label, value)
         this.rlb.removeItemAt(currentIndex+1)
         this.rlb.selectedIndex = currentIndex
         this.notifyListeners({type:EditListbox.ITEM_CHANGED, item:changedItem})
         this.rlb.focus()
      },
      
      toggleEditing: function(cancelEditing){
         if(this.editMode)
            this.stopEditing(cancelEditing)
         else
            this.startEditing()
      }
      
   }
   
   ObjectUtils.extend(EditListbox, "AbstractGenericEventTarget", this)

   this.EditListbox = EditListbox;
}).apply(this)
}