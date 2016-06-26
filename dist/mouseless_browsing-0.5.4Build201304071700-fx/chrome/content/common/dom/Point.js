with(this){
(function(){
   function Point(x, y) {
      this.x = x
      this.y = y
   }
   
   Point.prototype = {
      constructor: Point,

      getX: function(){
         return this.x
      },

      setX: function(x){
         this.x = x
      },

      getY: function(){
         return this.y
      },

      setY: function(y){
         this.y = y
      },
   }

   this.Point = Point;
}).apply(this)
}