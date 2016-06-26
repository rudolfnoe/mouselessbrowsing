with(this){
/* DotNetRemoting JavaScript Serializer/Deserializer
 * Orignial Author Dan Wellmann Thanks!!!
 * Downloaded from http://dotnetremoting.com/  
 * */

(function(){
	
      /* main entry for serialization
       * JavaScript object as an input
       * usage: JSerialize(MyObject);
       * @ObjectToSerilize: Object which should be serialized
       * @objectName: Name of the root object
       * @indentSpace: String with spaces which is used to indent output
       * @ommitFunction: Boolean indicating whether functions should be serialized or not
       * @prefixOfTransientMembers: If attribute of object has this prefix it will not be serialized 
       */
      function JSerialize(ObjectToSerilize, objectName, indentSpace, ommitFunctions, prefixOfTransientMembers)
      {
         indentSpace = indentSpace?indentSpace:'';
         
         var Type = GetTypeName(ObjectToSerilize);
         
         if((Type=="Function" && ommitFunctions) || objectName=="prototype" || 
            (prefixOfTransientMembers!=null && objectName.indexOf(prefixOfTransientMembers)==0)){
         	return ""
         }
          
         var s = indentSpace  + '<' + objectName +  ' type="' + Type + '">';
         
         switch(Type)
         {
      		case "number":
      		case "boolean":		
      		{
      			s += ObjectToSerilize; 
      		} 
         
      		break;
      	   
      		case "string":
      		{
      			s += "<![CDATA[" + ObjectToSerilize +"]]>"
;
      		}
      		
      		break;

      		case "date":
      	   {
      			s += ObjectToSerilize.toLocaleString(); 
      	   }
      	   break;
      	   
      		case "Array":
      		{
      			s += "\n";
      				
      				for(var name in ObjectToSerilize)
      				{
      					s += JSerialize(ObjectToSerilize[name], ('index' + name ), indentSpace + "   ", ommitFunctions, prefixOfTransientMembers);
      				};
      				
      				s += indentSpace;
      		}
      		break;
         	 		
      		default:
      		{
      			s += "\n";
      			
      			for(var name in ObjectToSerilize)
      			{
                  if(!ObjectToSerilize.hasOwnProperty(name))
                     continue
      				s += JSerialize(ObjectToSerilize[name], name, indentSpace + "   ", ommitFunctions, prefixOfTransientMembers);
      			};
      			
      			s += indentSpace;
      		}
      		break;
      
         }
         
      	s += "</" + objectName + ">\n";	
           
          return s;
      };
      
      // main entry for deserialization
      // XML string as an input
      function JDeserialize(XmlText, namespaceArray)
      {
      	var _doc = GetDom(XmlText); 
      	return Deserial(_doc.childNodes[0], namespaceArray);
      }
      
      // get dom object . IE or Mozilla
      function GetDom(strXml)
      {
      	var parser = new DOMParser();
      	return parser.parseFromString(strXml, "text/xml");
      }
      
      // internal deserialization
      function Deserial(xn, namespaceArray)
      {
      	var RetObj; 
      	 
      	var NodeType = "object";
      	
      	if (xn.attributes != null && xn.attributes.length != 0)
      	{
      		var tmp = xn.attributes.getNamedItem("type");
      		if (tmp != null)
      		{
      			NodeType = xn.attributes.getNamedItem("type").nodeValue;
      		}
      	}
      	
      	if (IsSimpleVar(NodeType))
      	{
      		return StringToObject(xn.textContent, NodeType);
      	}
      	
      	switch(NodeType)
      	{
      		case "Array":
      		{
      			RetObj = new Array();
      			var arrayIndex = 0
      			for(var i = 0; i < xn.childNodes.length; i++)
      			{
      				var node = xn.childNodes[i];
      				if(node.nodeType!=1){
      					continue
      				}
      				RetObj[arrayIndex++] = Deserial(node, namespaceArray);
      			}
      			
      			return RetObj;
      		}
      		
      		case "object":
      		    RetObj = new Object()
      		    break;
      		
      		default:
      		{
   				var ns = ""
      			if(namespaceArray){
      				for (var i = 0; i < namespaceArray.length; i++) {
      					if(window[namespaceArray[i]][NodeType]!=null){
      						ns = namespaceArray[i]
      						break;
      					}
      				}
      			}
      			RetObj = eval("new "+ (ns.length>0?ns+".":"") + NodeType + "()");
      		}
      		break;
      	}
      	
      	for(var i = 0; i < xn.childNodes.length; i++)
      	{
      		var node = xn.childNodes[i];
      		if(node.nodeType!=1){
      			continue
      		}
      		RetObj[node.nodeName] = Deserial(node, namespaceArray);
      	}
      
      	return RetObj;
      }
      
      function IsSimpleVar(type)
      {
      	switch(type)
      	{
      		case "int":
      		case "string":
      		case "String":
      		case "Number":
      		case "number":
      		case "Boolean":
      		case "boolean":
      		case "bool":
      		case "dateTime":
      		case "Date":
      		case "date":
      		case "float":
      			return true;
      	}
      	
      	return false;
      }
      
      function StringToObject(Text, Type)
      {
      	var RetObj = null;
      
      	switch(Type)
      	{
      		case "int":
      			return parseInt(Text);   
      			 
      		case "number":
      		{
      			var outNum;
      			
      			if (Text.indexOf(".") > 0)
      			{
      				return parseFloat(Text);    
      			}
      			else
      			{
      				return parseInt(Text);    
      			}
       		}	
      			 	 
      		case "string":
      		case "String":
      			return Text;
      			 
      		case "dateTime":
      		case "date":
      		case "Date":
      			return new Date(Text);
      		 		
      		case "float":
      			return parseFloat(Text, 10);
      			
      		case "bool":
      		case "boolean":
      			{
      				if (Text == "true" || Text == "True")
      				{
      					return true;
      				}
      				else
      				{
      					return false;
      				}
      			}
      			return parseBool(Text);	
      	}
      
      	return RetObj;  
      }
      
      function GetClassName(obj) 
      {	 
      	try
      	{
      		var ClassName = obj.constructor.toString();
      		ClassName = ClassName.substring(ClassName.indexOf("function") + 8, ClassName.indexOf('(')).replace(/ /g,'');
      		return ClassName;
      	}
      	catch(e) 
      	{
      		return "NULL";
      	}
      }
       
      function GetTypeName(ObjectToSerilize)
      {
      	if (ObjectToSerilize instanceof Date)
      		return "date";	
      		
      	var Type  = typeof(ObjectToSerilize);
      
      	if (IsSimpleVar(Type))
      	{
      		return Type;
      	}
      	
      	Type = GetClassName(ObjectToSerilize); 
      	
      	return Type;
      }

   JSerial = {
   	classes: {},
   	serialize: JSerialize,
   	deserialize: JDeserialize,
   	registerClass: function(key, constructor){
   		this.classes[key] = constructor
   	}
   }
   this["JSerial"] = JSerial;
}).apply(this)
}