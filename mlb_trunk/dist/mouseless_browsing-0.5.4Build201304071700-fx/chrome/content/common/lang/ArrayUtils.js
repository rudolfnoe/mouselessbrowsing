with(this){
(function(){
   var ArrayUtils = {
      cloneArray: function(array){
         if(array==null)
            throw new Error('null pointer exception')
         var arr = new Array(array.length)
         for (var i = 0; i < array.length; i++) {
            arr[i] = array[i]
         }
         return arr
      },
      
      contains: function(array, value){
         return array.indexOf(value)!=-1
      }
   }

   this.ArrayUtils = ArrayUtils;
}).apply(this)
}