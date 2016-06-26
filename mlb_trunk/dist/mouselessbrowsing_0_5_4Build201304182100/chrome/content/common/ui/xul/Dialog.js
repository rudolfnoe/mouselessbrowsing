with(this){
(function(){
	DialogMode={
		MODAL:"MODAL",
		NON_MODAL:"NON_MONDAL"
	}
	this.DialogMode = Dialog;DialogMode
	
	DialogResult={
		OK:"OK",
		CANCEL:"CANCEL"
	}
   this.DialogResult = DialogResult

	function Dialog(url, name, modal, parentWin, features, argObj){
		this.url = url
		this.name = name
		this.modal = modal
		this.parentWin = parentWin
		this.features = features
		this.argObj = argObj
		this.listeners = new ArrayList()
		this.dialog = null
	}
	Dialog.prototype = {
		addEventListener: function(listener){
        this.listeners.add(listener) 			
		},
      
      getNamedResult: function(key){
         return this.dialogContext.resultObj[key]
      },
      
      getResult: function(){
         return this.dialogContext.result 
      },
		
		informListeners: function(){
		   for (var i = 0; i < this.listeners.size(); i++) {
            if(this.dialogContext.result==DialogResult.OK && this.listeners.get(i).handleDialogAccept)
               this.listeners.get(i).handleDialogAccept(this.dialogContext.resultObj)
            else if(this.dialogContext.result==DialogResult.CANCEL && this.listeners.get(i).handleDialogCancel)
               this.listeners.get(i).handleDialogCancel(this.dialogContext.resultObj)
         }
		},
		
		setFeatures: function(features){
			this.features = features
		},
		
		show: function(point){
			this.dialogContext = new DialogContext(this.argObj)
         var features = this.features?this.features:""
         features += this.modal?", modal=yes":""
         if(point==null)
            features += ", centerscreen=yes"
         else{
            features += ", left=" + point.getX() + "px "
            features += ", top=" + point.getY() + "px "
         }
			this.dialog = this.parentWin.openDialog(this.url, this.name, features, this.dialogContext)
			if(this.modal){
				this.informListeners();
			}else{
				this.dialog.addEventListener("unload", Utils.bind(this.informListeners, this), true)
			}
		}
	}
   
   Dialog.acceptDialog = function(){
      Dialog.getDialog().acceptDialog()
   }
   
   Dialog.getDialog = function(){
      var dialogs = document.getElementsByTagName('dialog')
      if(dialogs.length!=1)
         throw new Error('No or to much dialog elements')
      return dialogs[0]
   }
	
	Dialog.getNamedArgument = function(key){
      if(!window.arguments || !window.arguments[0] || !window.arguments[0].argObj)
         throw new Error('No argument set')
		return window.arguments[0].argObj[key]
	}
	
	Dialog.setResultOjb = function(obj){
		window.arguments[0].resultObj = obj
	}
	
	Dialog.setNamedResult = function(key, value){
		window.arguments[0].resultObj[key]=value
	}
   
   Dialog.setResult = function(result){
      window.arguments[0].result = result
   }
	
	function DialogContext(argObj){
		this.argObj = argObj
		this.resultObj = new Object
		this.result = DialogResult.CANCEL
	}
   
	this.Dialog = Dialog;
   
}).apply(this)
}