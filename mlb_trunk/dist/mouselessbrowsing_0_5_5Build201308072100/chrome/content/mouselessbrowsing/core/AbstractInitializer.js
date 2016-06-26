with(mlb_common){
with(mouselessbrowsing){
(function(){
   function AbstractInitializer(pageInitData){
      this.pageInitData = pageInitData
      this.pageData = pageInitData.pageData
      this.spanPrototype = null
      this.currentSpanWidth = null
      this.currentIdLength = null
      this.spanHeight = null
   }
   
   //Static methods
   AbstractInitializer.imgOverlayStyles = null
   
   AbstractInitializer.init = function(){
      this.imgOverlayStyles = new ImgOverlayStylesTemplate()
      if(MlbPrefs.isColorStyleDefined)
         delete this.imgOverlayStyles["color"]
      if(MlbPrefs.isBackgroundColorStyleDefined)
         delete this.imgOverlayStyles["background-color"]
   },
   
   AbstractInitializer.getImgOverlayStyles = function(){
      return this.imgOverlayStyles
   },

      /*
    * Set special/orignal styles according visibility of id span
    * @param element: Formelement for which the style should be set/reset
    * @param idSpanVisible: Flag indicating if the corresponding idSpan is visible
    */
   AbstractInitializer.setElementStyle = function(element, idSpanVisible){
      var styleArray = null
      if(idSpanVisible==false && element.elemStylesIdOff!=null){
         styleArray = element.elemStylesIdOff
      } else if (idSpanVisible==true && element.elemStylesIdOn!=null){
         styleArray = element.elemStylesIdOn
      }
      if(styleArray==null){
         return
      }
      for(var i=0; i<styleArray.length; i++ ){
         var styleEntry = styleArray[i]
         element.style[styleEntry.style] = styleEntry.value
      }
   },
   
   AbstractInitializer.prototype = {
      constructor: AbstractInitializer,
      AbstractInitializer: AbstractInitializer,
      
      /*
       * Creates new IdSpan
       */
      createSpan: function(){
          if(this.spanPrototype==null){
              //span
              var span = this.pageInitData.getCurrentDoc().createElement("span");
              span.style.cssText = MlbPrefs.styleForIdSpan
              span.style.display = "inline";
              
              //Mark this span as id-span
              span.setAttribute(MlbCommon.ATTR_ID_SPAN_FLAG, "true");
              this.spanPrototype = span;
          }
          return this.spanPrototype.cloneNode(true)
      },
      
      insertIdSpan: function(newSpan, element, parentElement, spanPosition, additionalStyles){
         parentElement = parentElement?parentElement:element
         
         var leftMarginSet = false
         var topMarginSet = false

         //For performance reasons do as much of the style modifications on the span before inserting it
         if(spanPosition!=SpanPosition.APPEND_TEXT && spanPosition!=SpanPosition.NATURAL_FLOW){
            newSpan.style.position="relative"
            //Set margin-top and width
            if(this.spanHeight){
               newSpan.style.marginTop = -this.spanHeight + "px"
               topMarginSet = true
            }
            var textLength = newSpan.textContent.length
            if(this.currentIdLength==textLength){
               newSpan.style.marginLeft = -this.currentSpanWidth + "px"
               leftMarginSet = true
            }
            
            for (var styleProp in additionalStyles) {
               newSpan.style.setProperty(styleProp, additionalStyles[styleProp], "important")   
            }
         }
         
         if(spanPosition==SpanPosition.APPEND_TEXT){
            this.insertSpanForTextElement(newSpan, element)
         }else if(parentElement==element)
            element.appendChild(newSpan)
         else
            DomUtils.insertAfter(newSpan, element)

         if(SpanPosition.NATURAL_FLOW==spanPosition || spanPosition==SpanPosition.APPEND_TEXT)//No special positioning is done
            return
            
         //Set link position relative but only if neither the link nor one of its descendants are positioned
         //as this would lead to disarrangements
         //See also MLB issue 25, 37,
         if(!this.isPositionedElement(parentElement)){
            parentElement.style.position="relative"
         }

         //TODO try this to move up before inseration as it would speed up initialization
         if(!topMarginSet){
            this.spanHeight = newSpan.offsetHeight
            newSpan.style.marginTop = (-newSpan.offsetHeight) + "px"
         }
         if(!leftMarginSet){
            this.currentSpanWidth = newSpan.offsetWidth
            this.currentIdLength = newSpan.textContent.length
            newSpan.style.marginLeft = (-newSpan.offsetWidth) + "px"
         }
         
         //If overlayed element is to small relative to the span do not 
         //TODO make configurable
         var factor = 2
         if(element.offsetWidth<factor*newSpan.offsetWidth && 
             element.offsetHeight<factor*newSpan.offsetHeight){
            spanPosition = SpanPosition.EAST_OUTSIDE
         }         
         
         if(spanPosition==SpanPosition.EAST_OUTSIDE || 
            spanPosition==SpanPosition.NORTH_EAST_OUTSIDE){
            var currentMarginRight = this.getComputedStyle(element).marginRight
            currentMarginRight = StringUtils.isEmpty(currentMarginRight)?parseInt(currentMarginRight):0
            element.style.marginRight = (newSpan.offsetWidth-currentMarginRight) + "px"
         }
         
         this.positionIdSpan(newSpan, element, spanPosition)
      },
 
      isElementInViewport : function(element){
         var rect = element.getBoundingClientRect()
   
         return (
            rect.bottom >= 0 &&
            rect.right >= 0 &&
            rect.top <= window.innerHeight &&
            rect.left <= window.innerWidth 
         )
      },

      getComputedStyle: function(element){
         return element.ownerDocument.defaultView.getComputedStyle(element, null)
      },
      
      /*
       *  Gets new span for id; 
       */
      getNewSpan: function(typeOfSpan){
          var newSpan = this.createSpan();
          this.setNewSpanId(newSpan)
          //Setting the type the element the id span is created for
          newSpan.setAttribute(MlbCommon.ATTR_ID_SPAN_FOR, typeOfSpan);
          return newSpan;
      },

      findParentOfLastTextNode: function(element){
         var childNodes = element.childNodes
         for (var i = childNodes.length-1; i >= 0; i--) {
            var child = childNodes.item(i)
            if(child.nodeType==Node.TEXT_NODE && !XMLUtils.isEmptyTextNode(child)){
               return element
            }else if (child.hasChildNodes() && this.isElementVisible(child)){
               var result = this.findParentOfLastTextNode(child)
               if(result!=null){
                  return result
               }
            }
         }
         return null;
      },
      
      hasVisibleText: function(elem, useComputedStyle, isRootElement){
         //visibility check not for element itself, as it could be initially hidden
         if(elem.textContent=="" ||
            (!isRootElement && useComputedStyle && !this.isElementVisible(elem)) ||
            (!isRootElement && !useComputedStyle && (elem.style.display=="none" || elem.style.visibility=="hidden" )))
            return false
         var children = elem.childNodes
         for (var i = 0; i < children.length; i++) {
            var child = children[i]
            if(child.nodeType==3 && !XMLUtils.isEmptyTextNode(child))
               return true
            else if (child.nodeType==1){
               var hasText = this.hasVisibleText(child, useComputedStyle, false)
               if(hasText)
                  return true
            }
               
         }
         return false
      },
      
      initIds: function(){
         var debugPerfDetail = Application.prefs.getValue("mouselessbrowsing.debug.perfdetail", false)
         if(debugPerfDetail){
            var timer = new PerfTimer()
         }
         this._initIds()
         if(debugPerfDetail){
            var type = ObjectUtils.getType(this)
            MlbUtils.logDebugMessage("Init time for " + type + ": " + timer.stop())
         }
      },
      
      insertSpanForTextElement: function(newSpan, element){
         //Append to last element in link except for imgages for better style
         var parentOfLastTextNode = this.findParentOfLastTextNode(element)
         if(parentOfLastTextNode!=null){
            parentOfLastTextNode.appendChild(newSpan)
         }else{
            element.appendChild(newSpan);
         }
         return newSpan
      },
      
      /*
       * Checks wether an element is currently visible to avoid appending ids to invisible links
       */
      isElementVisible: function(element){
         //Comment out 08.10.2008 due to mail from Martijn
         /*if(element.className=="" && element.getAttribute('style')==null){
            return true
         }*/
         if(!DomUtils.isVisible(element) ||
            //heuristic values
            element.offsetLeft<-100 || element.offsetTop<-100){
            return false
         }
         return true
      },
      
      isImageElement: function(element){
         if(element.hasAttribute("mlb_image_elem"))
            return true
            //TODO remove
//         var isImage = false
//         if(element.getElementsByTagName('img').length>0 ||
//            StringUtils.isEmpty(element.textContent) || StringUtils.trim(element.textContent).length==0){
//            isImage = true
//         }
//         //Check if any visible text is there
//         if(!isImage)
         isImage = !this.isTextElement(element)
         if(isImage)
            element.setAttribute("mlb_image_elem", "true")
         return isImage 
      },

      //TODO all descendants must be searched for positioned elements
      isPositionedElement: function(element){
         var style = this.getComputedStyle(element)
         if(style.position!="static")
            return true
         if(element.hasChildNodes()){
            for (var i = 0; i < element.childNodes.length; i++) {
               var node = element.childNodes[i]
               if(node.nodeType==1 && this.isPositionedElement(node)){
                  return true
               }
            }
         }
         return false
      },
      
      isTextElement: function(element){
         var useComputedStyle = true
         if(!DomUtils.isVisible(element))
            useComputedStyle = false
         return this.hasVisibleText(element, useComputedStyle, true)
      },
      
      positionIdSpan: function(idSpan, element, spanPosition){
         var spanOffset = DomUtils.getOffsetToBody(idSpan)
         var elementOffset = DomUtils.getOffsetToBody(element)
         
         var left = elementOffset.x - spanOffset.x 
         if(spanPosition==SpanPosition.EAST_OUTSIDE || 
            spanPosition==SpanPosition.NORTH_EAST_OUTSIDE){
            left = left + element.offsetWidth
         }else if(spanPosition==SpanPosition.NORTH_EAST_INSIDE){
            left = left + element.offsetWidth - idSpan.offsetWidth
         }else {
            throw new Error('unknown span position')
         }
         var top = elementOffset.y - spanOffset.y 
         if(spanPosition == SpanPosition.EAST_OUTSIDE){
            top = top + (element.offsetHeight - idSpan.offsetHeight)/2
         }
         //Take already set value into acount
         if(left!=0){
            left += idSpan.style.left?parseInt(idSpan.style.left, 10):0
            idSpan.style.left = left + "px"
         }
         if(top!=0){
            top += idSpan.style.top?parseInt(idSpan.style.top, 10):0
            idSpan.style.top = top + "px"
         }
      },
      
      setNewSpanId: function(span){
         span.mlb_initCounter = this.pageData.getInitCounter()
         var newId = this.pageData.getNextId();
         span.textContent = newId
      },

      /*
       * Updates an id span which already exists
       */
      updateSpan: function(span){
          this.setNewSpanId(span) 
          span.style.display = "inline";
      }
     
   }
   
   Namespace.bindToNamespace("mouselessbrowsing", "AbstractInitializer", AbstractInitializer)

   SpanPosition = {
      APPEND_TEXT: "APPEND_TEXT", 
      EAST_OUTSIDE: "EAST_OUTSIDE",
      NATRUAL_FLOW: "NATURAL_FLOW",
      NORTH_EAST_INSIDE: "NORTH_EAST_INSIDE",
      NORTH_EAST_OUTSIDE: "NORTH_EAST_OUTSIDE"
   }      
   Namespace.bindToNamespace("mouselessbrowsing", "SpanPosition", SpanPosition)
   
   function ImgOverlayStylesTemplate() {
       this["background-color"] = "#EEF3F9"
       this["color"] = "black"
   }   
})()
}}