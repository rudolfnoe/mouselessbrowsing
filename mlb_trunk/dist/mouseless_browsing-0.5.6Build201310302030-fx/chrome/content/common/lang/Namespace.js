with(this){
/*
 * Version 0.1
 * Created by Rudolf Noe
 * 28.12.2007
 *
 * Basic Namespace functionality
 * Namespaces are emulated via nested objects
 */
(function(){
	var Namespace = {
		VERSION: "0.2",
		//TODO: Remove in future versions if not used any more
		COMMON_NS: "rno_common",
		DEFAULT_COMMON_NS: "rno_common",
		 
		/*
		 * Creates the neccessary namespace objects
		 * @param namespace: namespace string; namespace parts are separaded by dot (".")
		 * 		e.g. for "xxx.yyy.zzz" 
		 */
		createNamespace: function(namespace){
			var names = namespace.split('.');
			var obj = window;
			for (key in names){
				var name = names[key];
				if(obj[name] == undefined){
					obj[name] = new Object();
				}
				obj = obj[name];
			}
			return obj;
		},
	    
	    /*
	     * Binds an object to a namespace
	     * @param namespace: namespace string e.g. "firstLevelNS.secondLevelNS"
	     * @param name: Name under which the object is bound within the provided namespace
	     * 		e.g. namespace="firstlevelNS", name="Foo" --> Object will be available via
	     * 		firstlevelNS.Foo
	     * @param object: object which is bound under <namespace>.<name> 
	     */
	    bindToNamespace: function(namespace, name, object){
	    	if(object==null){
	    		throw Error("namespace.js: Namespace.bindToNamespace: Param object must not be null");
	    	}
	    	var namespaceObj = this.createNamespace(namespace);
	    	if(namespaceObj[name]==null 
	    		|| namespaceObj[name].VERSION<object.VERSION){
		    	namespaceObj[name] = object;
	    	}
		}
	}
	this["Namespace"] = Namespace;	
}).apply(this)
}