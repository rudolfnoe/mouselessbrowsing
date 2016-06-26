with(mlb_common){
with(mouselessbrowsing){
(function(){
   function FrameIdsInitializer(pageInitData){
      this.AbstractInitializer(pageInitData)
   }
   
   FrameIdsInitializer.prototype = {
      constructor: FrameIdsInitializer,
      
      /*
       * Init Frame-Ids
       */
      _initIds: function(){
         for(var i = 0; i<this.pageInitData.getCurrentWin().frames.length; i++){
            var frame = this.pageInitData.getCurrentWin().frames[i];
            var doc = frame.document
            if(doc.designMode=="on" || doc.body==null || doc.body.innerHTML.length==0){
               //do not mark editable IFrames; these are used as rich text fields
               //in case of onDomContentLoaded event the body of frames are partly not available
               continue
            }else if(frame.idSpan){
               if(this.pageInitData.getKeepExistingIds()){
                  continue
               }else{
                  this.updateSpan(frame.idSpan);
               }
            }else{
               var idSpan = this.getNewSpan(this.pageInitData, MlbCommon.IdSpanTypes.FRAME);
               //Setting different style
               idSpan.style.cssText = MlbPrefs.styleForFrameIdSpan;
               
               //Insert Span
               idSpan = doc.importNode(idSpan, true)
               doc.body.insertBefore(idSpan, doc.body.firstChild);
                 
               //Set reference to idSpan
               frame.idSpan = idSpan;
            }
            //Update element Array
            this.pageInitData.pageData.addElementWithId(doc.body);
         }
      }
      
   }
   ObjectUtils.extend(FrameIdsInitializer, AbstractInitializer)
   
   Namespace.bindToNamespace("mouselessbrowsing", "FrameIdsInitializer", FrameIdsInitializer)
})()
}}