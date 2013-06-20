FullCalendarEventManager
====

A jquery plugin to efficiently cache and filter multiple array sources - primarily for FullCalendar

Requires:
jquery

Callback function options:


onMonthLoad

afterInit
- Optional callback to perform once the plugin is initialised

afterFilter
- Function to do what ever you like with the filtered array after it is filtered

retrieveSourceArrays
- function to retrieve data object of arrays that needs to be filtered
example:
	retrieveSourceArrays: function(visibleStart,visibleEnd){
		var oSources = {};
		oSources.courses = [];
		oSources.events = [];
		oSources.dates = [];
		
		for (i = 0; i < 50000; ++i) {
			oSources.courses.push({id:'a'+i,value:'b',source:'courses',region:'b,a',region2:'a,d',region3:'a,d',region4:'a,d'});
			oSources.events.push({id:'a'+i,value:'b',source:'events',region:'c',region2:'a,d',region3:'a,d',region4:'a,d'});
			oSources.dates.push({id:'a'+i,value:'b',source:'events',region:'c',region2:'a,d',region3:'a,d',region4:'a,d'});
		}
		return oSources;
	},	

retrieveFilterObjects
- function to retrieve filter objects
* must contain a sources filter object 
retrieveFilterObjects: function($this){
	var oFilters = {};	
		oFilters.sources = {};
		oFilters.sources.key = 'sources';
		oFilters.sources.status = 0;
		oFilters.sources.values = 0;
		oFilters.sources.dictionary = [];
		oFilters.sources.numSelected = 1;
		oFilters.sources.selectedArray = ['courses','events','dates'];
	
		oFilters.sources.applyTo = ["courses","dates","availability", "resources"];
		
		oFilters.region = {};
		oFilters.region.key = 'region';
		oFilters.region.status = 0;
		oFilters.region.values = ['a'];
		oFilters.region.dictionary = [];
		oFilters.region.numSelected = 2;
		oFilters.region.selectedArray = ['courses','events'];		
		oFilters.region.applyTo = ["courses","events","availability", "resources"];						
		
	return oFilters
}	

