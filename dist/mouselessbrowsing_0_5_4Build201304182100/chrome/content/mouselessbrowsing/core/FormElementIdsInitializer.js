with(mlb_common){
with(mouselessbrowsing){
(function(){
   function FormElementIdsInitializer(pageInitData){
      this.AbstractInitializer(pageInitData)
   }
   
   FormElementIdsInitializer.prototype = {
      constructor: FormElementIdsInitializer,

      /*
       * Init for form-elements
      */
      _initIds: function (){
         var doc = this.pageInitData.getCurrentDoc()
         var xPathExp = "(//input | //select | //textarea | //button | //iframe | //*[contains(@role,'button')] | //*[@role='menuitem'])[not(ancestor-or-self::*[contains(@style,'display: none') or contains(@style,'display:none')])]"
         var snapshot = doc.evaluate(xPathExp, doc, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null)
         for (var i = 0; i < snapshot.snapshotLength; i++) {
            var element = snapshot.snapshotItem(i)
            
            // Hidden input-fields and fieldsets do not get ids ;-)
            if (element.type == "hidden" || 
                  MlbUtils.isElementOfType(element, MlbUtils.ElementTypes.FIELDSET) ||
                  // File fields are not clickable and focusable via JS
                  // for security reasons
                  MlbUtils.isElementOfType(element, MlbUtils.ElementTypes.FILE) ||
                  (MlbUtils.isElementOfType(element, MlbUtils.ElementTypes.IFRAME) && element.contentDocument.designMode=="off") ||
                  !DomUtils.isVisible(element) ||
                  (MlbPrefs.showIdsOnDemand && !this.isElementInViewport(element))){
               continue;
            }
            
            var parent = element.parentNode;
            var idSpan = this.pageInitData.getIdSpan(element);
            if (idSpan != null) {
               if (!this.pageInitData.getKeepExistingIds()) {
                  this.updateSpan(idSpan);
               }
               if(MlbPrefs.smartPositioning && idSpan.getAttribute("mlb_span_position")!=SpanPosition.APPEND_TEXT && 
                  idSpan.getAttribute("mlb_span_position")!=SpanPosition.NATURAL_FLOW){
                  this.positionIdSpan(idSpan, element, idSpan.getAttribute("mlb_span_position"))
               }
               if (this.pageInitData.getKeepExistingIds())
                  continue
            } else {
               // Generate new span
               var newSpan = this.getNewSpan(MlbCommon.IdSpanTypes.FORMELEMENT);
               
               this.insertIdSpanForFormelements(element, newSpan)

               this.pageInitData.addElementIdSpanBinding(element, newSpan)

            }
            element = MlbUtils.isEditableIFrame(element)?element.contentDocument.body:element
            this.pageInitData.pageData.addElementWithId(element)
         }
      },
      
      /*
       * Do the smart/overlay positioning of formelements
       * Separate method so it can be called twice in case of double initialization (see onpageshow2ndCall)
       */
      insertIdSpanForFormelements: function(element, idSpan){
         var idSpanStyle = {}
         var spanPosition = null
         //Calculate left and top
         if(element.hasAttribute('role') && this.isTextElement(element)){
            spanPosition = SpanPosition.APPEND_TEXT
         }else if(!MlbPrefs.smartPositioning){
            spanPosition = SpanPosition.NATURAL_FLOW
         }else if(MlbUtils.isElementOfType(element, MlbUtils.ElementTypes.TEXT) || 
            MlbUtils.isElementOfType(element, MlbUtils.ElementTypes.PASSWORD) ||
            MlbUtils.isElementOfType(element, MlbUtils.ElementTypes.TEXTAREA) ||
            MlbUtils.isElementOfType(element, MlbUtils.ElementTypes.IFRAME) ||
            (MlbUtils.isElementOfType(element, MlbUtils.ElementTypes.SELECT) && element.size>1)){
            idSpanStyle["border-color"] = "#7F9DB9"
            var compStyle = this.getComputedStyle(element)
            if(!MlbPrefs.isColorStyleDefined)
               idSpanStyle["color"] = compStyle.color
            if(!MlbPrefs.isBackgroundColorStyleDefined){
               if(MlbUtils.isElementOfType(element, MlbUtils.ElementTypes.IFRAME)){
                  //Because of scrollbars and the iframe has almost always background transparent
                  idSpanStyle["background-color"] = "white"
               }else{
                  idSpanStyle["background-color"] = compStyle.backgroundColor
               }
            }
            spanPosition = SpanPosition.NORTH_EAST_INSIDE   
         }else if(MlbUtils.isElementOfType(element, MlbUtils.ElementTypes.BUTTON) ||
                   MlbUtils.isElementOfType(element, MlbUtils.ElementTypes.RADIO) ||
                   MlbUtils.isElementOfType(element, MlbUtils.ElementTypes.CHECKBOX) ||
                   MlbUtils.isElementOfType(element, MlbUtils.ElementTypes.SELECT)){
            //Pos in middle next to button
            spanPosition = SpanPosition.EAST_OUTSIDE
         }else{
            throw new Error('unknown element type for element ' + element.tagName + " " + element.name)
         }
         idSpan.setAttribute("mlb_span_position", spanPosition)
         this.insertIdSpan(idSpan, element, element.parentNode, spanPosition, idSpanStyle)   
      }
      
   }
   ObjectUtils.extend(FormElementIdsInitializer, AbstractInitializer)
   
   Namespace.bindToNamespace("mouselessbrowsing", "FormElementIdsInitializer", FormElementIdsInitializer)
})()
}}