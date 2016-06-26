with(mouselessbrowsing){
(function(){
   //Constructor
	function PageData(){	
		
      this.changeListener = null
      
      //id to object/span map
      //key: unique id which is set as attribute on element and idSpan
      //value: Object with element and idSpan property
      this.elementIdSpanMap = new Object()
      //numeric key for binding map
      this.elementIdSpanMapKey = 0
      //Counter which hold the actual number of initializations
      this.initCounter = 0
      
      this.nextKeepExistingIds = true
      
      this.initResetableMembers()
	}
   
   //Static create method to enable hooking of layout debugger
   PageData.createPageData = function(){
      return new PageData()
   }
	
	PageData.prototype =  {

      getNextKeepExistingIds: function(){
         return this.nextKeepExistingIds
      },

      setNextKeepExistingIds: function(nextKeepExistingIds){
         this.nextKeepExistingIds = nextKeepExistingIds
      },

      getInitCounter: function(){
         return this.initCounter
      },
      
      getChangeListener: function(){
         return this.changeListener
      },

      setChangeListener: function(changeListener){
         this.changeListener = changeListener
      },
      
      addElementIdSpanBinding: function(element, idSpan){
         var bindingKey = this.elementIdSpanMapKey++ + ""
         this.elementIdSpanMap[bindingKey]= {element:element, idSpan: idSpan}
         element.setAttribute(MlbCommon.MLB_BINDING_KEY_ATTR, bindingKey) 
         idSpan.setAttribute(MlbCommon.MLB_BINDING_KEY_ATTR, bindingKey) 
      },
      
      addElementWithId: function(element){
			this.elementsWithId[this.counter] = element;
			if(this.useCharIds){
				this.idToElementMap[this.currentId] = element;
			}
		},
		
      getElementBy: function(elementOrIdSpan, type){
         if(!elementOrIdSpan.hasAttribute(MlbCommon.MLB_BINDING_KEY_ATTR))
            return null
         //Check if refEntry is there as if page was cached the attribute is there but not entry any more
         var refEntry = this.elementIdSpanMap[elementOrIdSpan.getAttribute(MlbCommon.MLB_BINDING_KEY_ATTR)]
         if(!refEntry)
            return null
         if(type=="span")
            return refEntry.idSpan
         else
            return refEntry.element
      },

      getElementBySpan: function(refSpan){
         return this.getElementBy(refSpan, "element")
      },
      
		getElementForId:function(id){
			if(this.useCharIds){
				return this.idToElementMap[id.toUpperCase()]
			}else{
				return this.elementsWithId[id]
			}
		},
		
      getIdSpanByElement: function(refElement){
         return this.getElementBy(refElement, "span")
      },

		getNextId:function(){
			this.counter = this.counter+1
			if(this.useCharIds){
				this.currentId = this.getNextCharId(this.currentId, this.currentId.length-1)
				return this.currentId
			}else{
				return this.counter
			}
		},
		
		getNextCharId: function(id, indexInId){
	      if(indexInId==-1) {
	         return this.idChars.charAt(0)+ id;
	      }
	      var charAtIndex = id.charAt(indexInId);
	      var indexOfCharInChars = this.idChars.indexOf(charAtIndex);
	      var newValue = "";
	      if(indexOfCharInChars==this.idChars.length-1) {
	         newValue = this.replaceChar(id, indexInId, this.idChars.charAt(0));
	         return this.getNextCharId(newValue, indexInId-1);
	      }else {
	         return this.replaceChar(id, indexInId, this.idChars.charAt(indexOfCharInChars+1));
	      }
		},
      
      hasElementWithId: function(id){
			if(this.useCharIds){
				return this.idToElementMap[id.toUpperCase()]!=null
			}else{
				return this.elementsWithId[id]!=null
			}
		},
      
      incrementInitCounter: function(){
         return ++this.initCounter
      },

      initResetableMembers: function(){
         //Element Counter
         this.counter = 0
         
         //Array with id-marked elements
         this.elementsWithId = new Array(1000)
   
         if(MlbPrefs.isCharIdType()){
            this.useCharIds = true
            this.idChars = MlbPrefs.idChars
            this.idToElementMap = new Object()
         }else{
            this.useCharIds = false
            this.idChars = null
            this.idToElementMap = null
         }
         this.currentId = ""
         
         this.absolutePositionedFormElements = new Array();
      },
      
      isIdUnique: function(id){
         if(!this.hasElementWithId(id))
            return false
         if(this.useCharIds)
            id += this.idChars.charAt(0)
         else
            id += "0"
         if(this.hasElementWithId(id))
            return false
         else
            return true
      },

      replaceChar: function(value, index, newChar) {
	      var result = "";
	      if(index!=0) {
	         result = value.substring(0, index);
	      }
	      result = result + newChar;
	      if(index!=value.length-1) {
	         result = result + value.substring(index+1);
	      }
	      return result;
	   }
      
	}
	
	var NS = mlb_common.Namespace;
	NS.bindToNamespace("mouselessbrowsing", "PageData", PageData)
})()
}