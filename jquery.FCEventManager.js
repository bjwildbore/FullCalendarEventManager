;(function($){ 
	"use strict";		
	
	var methods = {
		init : function( options ){
			var $this = $(this);								
				$this.data('opts', $.extend({}, $.fn.fcman.defaults, options));	
				
			$this.data('eventsCache', []);
			$this.data('calendarID' , $this.data('opts').fullCalendarID);							
			
			console.log('init');			
			
			

			
            if (typeof $this.data('opts').afterInit === "function") {
                if (!$this.data('opts').afterInit.call(this, $this)) {
                    return false;
                }
            }
			
		},		

		applyFiltersToView: function (view) {	
			return applyFiltersToView($(this),view);			
        },		

		prefetchMonth: function (date,viewname) {
			console.log('prefetchMonth');		
			var view = getViewFromDate(date);
			view.start = date;
			view.name = viewname;
			
			console.log(view);
			
			cacheAndLoadMonth($(this), view);		
			return true;			
        },
		
		clearCache: function () {
			var $this = $(this);	
			$this.data('eventsCache', []);
			return $this;
		},
		
	};

	function clearTime(d) {
		d.setHours(0);
		d.setMinutes(0);
		d.setSeconds(0); 
		d.setMilliseconds(0);
		return d;
	}
	
	function cloneDate(d, dontKeepTime) {
		if (dontKeepTime) {
			return clearTime(new Date(+d));
		}
		return new Date(+d);
	}	
	
	function fixDate(d, check) { // force d to be on check's YMD, for daylight savings purposes
		if (+d) { // prevent infinite looping on invalid dates
			while (d.getDate() != check.getDate()) {
				d.setTime(+d + (d < check ? 1 : -1) * HOUR_MS);
			}
		}
	}
	
	function getViewFromDate(date) {
	
		var start = new Date(date);
		start.setDate(1);
		var end = addMonths(new Date(start), 1);
		
		var visStart = new Date(start);
		var visEnd = new Date(end);
		
		addDays(visStart, -((visStart.getDay() - Math.max(0, 0) + 7) % 7));
		addDays(visEnd, (7 - visEnd.getDay() + Math.max(0, 0)) % 7);		
		return {visStart:visStart,visEnd:visEnd}
		

	}	
	
	function addDays(d, n, keepTime) { // deals with daylight savings
	if (+d) {
		var dd = d.getDate() + n,
			check = cloneDate(d);
		check.setHours(9); // set to middle of day
		check.setDate(dd);
		d.setDate(dd);
		if (!keepTime) {
			clearTime(d);
		}
		fixDate(d, check);
	}
	return d;
}
	
	function addMonths(d, n, keepTime) { // prevents day overflow/underflow
		if (+d) { // prevent infinite looping on invalid dates
			var m = d.getMonth() + n,
				check = cloneDate(d);
			check.setDate(1);
			check.setMonth(m);
			d.setMonth(m);
			if (!keepTime) {
				clearTime(d);
			}
			while (d.getMonth() != check.getMonth()) {
				d.setDate(d.getDate() + (d < check ? 1 : -1));
			}
		}
		return d;
	}	
	
	
	function applyFiltersToView($this,view){
		console.log("applyFiltersToView");	
		
		var calendarSelector = "#" + $this.data('calendarID'),
			start = new Date().getTime(),
			aViewArray = cacheAndLoadMonth($this,view),	
			end = new Date().getTime(),
			aFiltered = filterArray($this,aViewArray ),
			end2 = new Date().getTime(),
			time1 = end - start,
			time2 = end2 - start;
			
			console.log('load Execution time: ' + time1);
			console.log('filter Execution time: ' + time2);
			console.log('array to apply' ,aFiltered );
			
		/*
		$(calendarSelector).fullCalendar ('removeEvents');
		$(calendarSelector).fullCalendar('addEventSource', {	events: aFiltered });
		*/
	}		

	function cacheAndLoadMonth($this,view){
	    //console.log("loadMonth");

	    var visStart = view.visStart,
			visEnd = view.visEnd,
			eventsCache = $this.data('eventsCache'),
			d = view.start,			
			thisViewCode= view.name+"_"+ d.getFullYear()  +"_"+ (d.getMonth() + 1),			
			aViewArray = eventsCache[thisViewCode];	
			/*
			//console.log("visStart",visStart);
			//console.log("visEnd",visEnd);
			//console.log("eventsCache",eventsCache);
			//console.log("d",d);
			//console.log("thisViewCode",thisViewCode);			
			*/
			
		if(!aViewArray ){	
			aViewArray = getMonthArray($this, visStart,visEnd);			  
			eventsCache[thisViewCode] = aViewArray;
			$this.data('eventsCache', eventsCache); 		  
		}	
		//console.log(aEvents);		
        //console.log(aViewArray );	
		return aViewArray;
	}


	function getMonthArray($this,visStart,visEnd){
	    //console.log("getMonthArray");	    

		var aTmp = {};

		//loop over sources and run retrieval functions	
		//run sources retrievefunction
		
		/*
			aTmp.source1name = [calendarItem, calendarItem, calendarItem];
			aTmp.source2name = [calendarItem, calendarItem, calendarItem];
			aTmp.source3name = [calendarItem, calendarItem, calendarItem];		
		*/
		//console.log($this.data('opts'));
		if (typeof $this.data('opts').retrieveSourceArrays === "function") {
            aTmp = $this.data('opts').retrieveSourceArrays.call(this, $this, visStart, visEnd); 
        }
		
		return aTmp ;
	}


function filterArray($this,aSourceData,oFilters){	
	 //console.log("filterArray");
	
	var selectedSources = [],	 	
		aAppliedFilters = {},	
		sourceFilter = {},
		start = new Date().getTime(),		
		source = "",
		region = 0,
		property = '',
		filterItem = {},
		needle ="",
		haystack = "",	 	 
		i = 0,
		j = 0,
		oFilters = {},
		aFiltered = [],
		aTmp = [],
		oTmp = {};
		
	//console.log(aSourceData);
		
	if (typeof $this.data('opts').retrieveFilterObjects === "function") {
        oFilters = $this.data('opts').retrieveFilterObjects.call(this, $this);	
			//console.log('***')		;
			//console.log(oFilters)		;
    } else {
		alert("ERROR: retrieveFilterObjects incorrectly specified");
		return [];
	}
	
	console.log('getFilterOjjects: ' + ((new Date()).getTime()-start) ) ; start = new Date().getTime();
	
	sourceFilter = oFilters.sources;	
	//console.log(sourceFilter)
	
	//remove unselected sources to reduce filtering time
	if (sourceFilter.numSelected === 0){		
		return [];	
	} else {
		//add selected sources
		 selectedSources = sourceFilter.selectedArray;
		 //console.log(sourceFilter.selectedArray)
		 for (i = 0; i < selectedSources.length; i++){
			source = selectedSources[i];
			if(aSourceData[source].length){
				oTmp[source] = aSourceData[source];
				aAppliedFilters[source] = [];   
			}		
		}
	}	
	//remove sources from the filters
	delete oFilters.sources;	
	console.log('filter sources: ' + ((new Date()).getTime()-start) ) ; start = new Date().getTime();
	
	//loop over the filters and remove any redundant sources and list filter to apply to each source to reduce filtering time
	for (property in oFilters) {
		//console.log('filterproperty', property)
		if ( oFilters.hasOwnProperty(property) && property !== "sources") {		
			filterItem = oFilters[property];
			
			if(filterItem.numSelected == 0){ //if none selected we dont want any showing so just remove applied sources from the oTmp array				
				//console.log('none selected')
				for (j = 0; j < filterItem.applyTo.length; j++){
					source = filterItem.applyTo[j];
					delete oTmp[source];					
					delete aAppliedFilters[source]; 
				} 				
			} else if(!filterItem.allSelected) {// if some selected	
				//console.log('some selected')
				for (j = 0; j < filterItem.applyTo.length; j++){
					source = filterItem.applyTo[j];		
					
					//add the filters to the applied filters object					
					if( (typeof aAppliedFilters[source] == "object") && (aAppliedFilters[source] !== null)  ){
						aAppliedFilters[source].push(filterItem);         	  				
					}	    	
				} 
				
			} else { //if all values selected do nothing as there is nothing to remove
				//console.log('all selected')
				//do nothing
			}
			
		}
	}
	console.log('get applied filters: ' + ((new Date()).getTime()-start) ) ; start = new Date().getTime();
	
	//console.log('aAppliedFilters',aAppliedFilters);
	//add sources into array that is to be filtered
	for (source in oTmp) {
		aTmp = aTmp.concat(oTmp[source]);
	}	
	console.log('concat sources: ' + ((new Date()).getTime()-start) ) ; start = new Date().getTime();
		
	if(aAppliedFilters.length == 0){
			aFiltered = aTmp ;
		} else {		
			aFiltered = jQuery.grep(aTmp , function(element, index){
				
				var source = element.source,
					i = 0,
					j = 0,
					filterKey = '',
					filter = [],
					bFound = false,
					needle = "",
					numOfNeedles = 0,
					haystack = "",
				    filters = aAppliedFilters[source];
				//console.log('source', source)
				
				if (!filters.length){
					return true;
				}
				//console.log();
				//console.log(" ");
				//console.log("*** Item type:" + source);
				for (i = 0; i < filters.length; i++){
					filter = filters[i];
										
					//console.log("Apply Filter:"+filter.key);
					needle = element[filter.key]; // the data element value(s)
					haystack = filter.values;     // the filters allowed value(s)
					/*
					console.log ("Element '" + filter.key + "' value = " + needle )
					console.log("Filter acceptable values = " + haystack );
					*/
					//console.log('needle' );
					//console.log(needle );
					//console.log('haystack' );
					//console.log(haystack);

					numOfNeedles = needle.length
					if(numOfNeedles ==1){
						// looking for one item
						//console.log("one needle" );						
						if(haystack.indexOf(needle[0]) == -1){						
							//console.log('needle not found, item not allowed');
							return false;						
						}

					} else if (numOfNeedles ==0){						
						//do nothing at this stage - returns true for non specified needles
					} else {
						//console.log("ouch lots of needles" );
						//loop over numOfNeedles to find in haystacks
						bFound = false;
						for (i = 0; i < numOfNeedles ; i++){						
							if(haystack.indexOf(needle[i]) > -1 ){						
								//console.log('item found' + needle[i]);	
								bFound = true;
								i = numOfNeedles ;												
							}						
						}
						if(!bFound){
							//console.log("No items in haystack" );
							return false;	
						}
											

					}
					//console.log('ITEM ALLOWED' );
					return true
					
				}			
				
				return true;
			});		
		}
		

		console.log('grep: ' + ((new Date()).getTime()-start) ) ; start = new Date().getTime();
		
		return aFiltered;

	}	

	$.fn.fcman = function(method) { 
		if ( methods[method] ) {
			return methods[method].apply( this, Array.prototype.slice.call( arguments, 1 ));
		} else if ( typeof method === 'object' || ! method ) {
			return methods.init.apply( this, arguments );
		} else {
			$.error( 'Method ' +  method + ' does not exist on jQuery.tooltip' );
		}
	};
	
	// plugin defaults - added as a property on our plugin function
	$.fn.fcman.defaults = {			
		fullCalendarID: '',
		onMonthLoad: function(){
			return true;
		},	
		
		afterInit: function(){
			console.log('NOTE: No after afterInit function ');
			//alert('ERROR: No afterInit specified');
			return false;
		},
		
		retrieveSourceArrays: function(visibleStart,visibleEnd){
			console.log('ERROR: No function to retrieve filter values specified');
			alert('ERROR: No function to retrieve filter values specified');
			return false;
		},		
		
		retrieveFilterObjects: function(){
			console.log('ERROR: No function to retrieve filter values specified');
			alert('ERROR: No function to retrieve filter values specified');
			return false;
		}	
		
	};	

})(jQuery);


function CalendarItem(){
	this.id = "";
	this.title = "";
	this.code = "";
	
	this.source = "courses";
	this.region = "";
	this.location = "";	
	this.tutors = "";
	this.tutorids = "";		
	this.type = "";
	this.status = "";
	
	this.className = "";
	this.url = "";
	
	this.start = "";
	this.end = "";
}

