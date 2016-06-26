with(this){
(function(){
   function ElementWrapper(element, backupChanges){
      if(!element || element.nodeType!=1 || !element.style)
         throw Error ("element null or no element type or element.style is null")
      this.element = element
      this.style = element.style
      this.backupChanges = arguments.length>=2?backupChanges:true
      if(this.backupChanges){
         this.propertiesBackup = new Object()
         this.stylesBackup = new Object()
      }
   }
   
   ElementWrapper.prototype = {
      constructor: ElementWrapper,
      getElement: function(){
         return this.element 
      },
      setProperty: function(prop, value){
         if(this.backupChanges)
            this.propertiesBackup[prop] = this.element[prop]
         this.element[prop] = value            
      },
      setStyle: function(prop, value, priority){
         if(this.backupChanges)         
            this.stylesBackup[prop] = this.style.getPropertyValue(prop)
         this.style.setProperty(prop, value, priority?priority:"")
      },
      setCss: function(cssText, overwriteExisiting){
         if(overwriteExisiting){
            for(var m in this.style){
               this.stylesBackup(m) = this.style.getPropertyValue(m)
            }
            this.style.cssText = cssText
            return
         }else{
             var cssObj = CssUtils.parseCssText(cssText)
             for(var m in cssObj){
               this.stylesBackup[m] = this.style.getPropertyValue(m)
               this.style.setProperty(m, cssObj[m], "")
             }
         }
      },
      restore: function(){
         this.restoreProperties()
         this.restoreStyle() 
      },
      restoreProperties: function(){
         for (var m in this.propertiesBackup){
            this.element[m] = this.propertiesBackup[m]
            delete this.propertiesBackup[m]
         }
      },
      restoreStyle: function(){
         for (var m in this.stylesBackup){
            var stylesBackupVal = this.stylesBackup[m]
            if(StringUtils.isEmpty(stylesBackupVal))
               this.style.removeProperty(m)
            else
               this.style[m] = this.stylesBackup[m]
            delete this.stylesBackup[m]
         } 
      }
      
   }

   this.ElementWrapper = ElementWrapper;
}).apply(this)
}