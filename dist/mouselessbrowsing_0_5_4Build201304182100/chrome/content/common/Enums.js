with(this){
(function(){
	var Severity = {
		ERROR: "ERROR",
		WARNING: "WARNING",
		INFO: "INFO"
	}
	this["Severity"] = Severity;

	var SeverityColor = {
		ERROR: "red",
		WARNING: "blue",
		INFO: "black"
	}
	this["SeverityColor"] = SeverityColor;
}).apply(this)
}