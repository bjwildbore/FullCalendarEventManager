FullCalendarEventManager
====

A jquery plugin to efficiently cache and filter multiple array sources - primarily for FullCalendar

Requires:
jquery

Callback function options:


onMonthLoad

-afterInit
Optional callback to perform once the plugin is initialised

-afterFilter
Function to do what ever you like with the filtered array after it is filtered

-retrieveSourceArrays
function to retrieve data object of arrays that needs to be filtered
example:
```
retrieveSourceArrays: function(visibleStart,visibleEnd){
	//demo build dummy sources
	// this array would be populated by some form of ajax webservice query or something similar
	var oSources = {};
	oSources.courses = [];
	oSources.events = [];
	oSources.dates = [];
	
	for (i = 0; i < 50000; ++i) {
		oSources.courses.push({id:'a'+i,value:'b',source:'courses',region:'b,a',category:'1'});
		oSources.events.push({id:'a'+i,value:'b',source:'events',region:'c',category:'2'});
		oSources.dates.push({id:'a'+i,value:'b',source:'events',region:'c',category:'3'});
	}
	return oSources;
},	
```

-retrieveFilterObjects
function to retrieve filter objects
must contain a sources filter object 
```
retrieveFilterObjects: function($this){
	//demo retrieve dummy filter objects and values
	var oFilters = {};	
		
	//filter must have source filter array which specifies which sources are wanted	
	oFilters.sources = {};
	oFilters.sources.selectedArray = ['courses','events','dates'];			
	
	// - each filter must be named after a property to filter on in the source array eg:region
	// - each filter nust have an array of selected values that must be matched in the source 
	//   objects for the object to be returned in the filtered array
	// - each filter must have an apply to array which specified which sources are to be filtered by this filter.
	//   Unspecified sources are not filtered by this and ignored
	oFilters.region = {};			
	oFilters.region.selectedArray = ['courses','events'];		
	oFilters.region.applyTo = ["courses","events","dates"];						

	oFilters.category = {};			
	oFilters.category.selectedArray = ['1','2'];		
	oFilters.category.applyTo = ["courses","events","dates"];	
		
	return oFilters
}	
```

