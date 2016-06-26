with(this){
(function(){
   var WindowUtils = {
      getCenterScreen: function(win){
         var win = win?win:window
         return new Point(win.outerWidth/2, win.outerHeight/2)
      },
   }

   this.WindowUtils = WindowUtils;
}).apply(this)
}