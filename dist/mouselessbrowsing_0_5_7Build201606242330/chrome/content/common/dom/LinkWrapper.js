with(this){
(function(){
   function LinkWrapper(link){
      this.link = link      
   }
   
   LinkWrapper.prototype = {
      constructor: LinkWrapper,
      open: function(where){
         openUILinkIn(this.link.href, where)
      }
   }

   this.LinkWrapper = LinkWrapper;
   
   LinkTarget = {
      CURRENT:"current",
      TAB:"tab",
      WINDOW:"window"
   }
}).apply(this)
}