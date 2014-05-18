;(function($){ 
	'use strict';		
	
	var methods = {
		init : function( options ){
			var $this = $(this);								
				$this.data('opts', $.extend({}, $.fn.fcman.defaults, options));	
				
			$this.data('eventsCache', []);
			$this.data('calendarID' , $this.data('opts').fullCalendarID);	
			
            if (typeof $this.data('opts').afterInit === 'function') {
                if (!$this.data('opts').afterInit.call(this, $this)) {
                    return false;
                }
            }
			
		},		

		applyFiltersToView: function (view,refetch) {	
			return applyFiltersToView($(this),view,refetch);			
        },		

		prefetchMonth: function (date,viewname) {
			var view = getViewFromDate(date);
			view.start = date;
			view.name = viewname;			
			
			cacheAndLoadPeriod($(this), view, false);		
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
			while (d.getDate() !== check.getDate()) {
				d.setTime(+d + (d < check ? 1 : -1) * 3600000);
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
		return {visStart:visStart,visEnd:visEnd};
		

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
			while (d.getMonth() !== check.getMonth()) {
				d.setDate(d.getDate() + (d < check ? 1 : -1));
			}
		}
		return d;
	}	
	
	function applyFiltersToView($this,view,refetch){		
		
		var calendarSelector = '#' + $this.data('calendarID'),
			start = new Date().getTime(),
			aViewArray = cacheAndLoadPeriod($this,view,refetch),	
			end = new Date().getTime(),
			time1 = end - start,
			aFiltered = filterArray($this,aViewArray ),
			end2 = new Date().getTime(),
			
			time2 = end2 - start;
			
			//console.log('load Execution time: ' + time1);
			//console.log('filter Execution time: ' + time2);
			//console.log('array to apply' ,aFiltered );			

			if (typeof $this.data('opts').afterFilter === 'function') {
                if (!$this.data('opts').afterFilter.call(this, $this,aFiltered)) {
                    return false;
                }
            }			
			

	}		

	function cacheAndLoadPeriod($this,view,refetch){

		var visStart = view.visStart,
			visEnd = view.visEnd,
			eventsCache = $this.data('eventsCache'),
			d = view.start,			
			thisViewCode = view.name+'_'+ d.getFullYear()  +'_'+ (d.getMonth() + 1),			
			aViewArray = [];	
	
		switch(view.name) {
			case "basicDay":
			    thisViewCode= view.name+'_'+ d.getFullYear()  +'_'+ (d.getMonth() + 1)+'_'+ d.getDate();					
			    break;
			case "basicWeek":
			    thisViewCode= view.name+'_'+ d.getFullYear()  +'_'+ getWeekNumber(d);					
			    break;
			default:
			    thisViewCode= view.name+'_'+ d.getFullYear()  +'_'+ (d.getMonth() + 1);					
		}
		
		aViewArray = eventsCache[thisViewCode];	
		
		if(!aViewArray || refetch ){ // refetch the events from the sources if refetch variable is true or the array is null
			aViewArray = getPeriodData($this, visStart,visEnd);
			eventsCache[thisViewCode] = aViewArray;
			$this.data('eventsCache', eventsCache);
		}	

		
		return aViewArray;
	}


	function getPeriodData($this,visStart,visEnd){
		var aTmp = {};

		if (typeof $this.data('opts').retrieveSourceArrays === 'function') {
            aTmp = $this.data('opts').retrieveSourceArrays.call(this, $this, visStart, visEnd); 
        }
		
		return aTmp ;
	}


function getWeekNumber(d) {
    // Copy date so don't modify original
    d = new Date(+d);
    d.setHours(0,0,0);
    // Set to nearest Thursday: current date + 4 - current day number
    // Make Sunday's day number 7
    d.setDate(d.getDate() + 4 - (d.getDay()||7));
    // Get first day of year
    var yearStart = new Date(d.getFullYear(),0,1);
    // Calculate full weeks to nearest Thursday
    var weekNo = Math.ceil(( ( (d - yearStart) / 86400000) + 1)/7)
    // Return array of year and week number
    return weekNo;
}


function filterArray($this,aSourceData,oFilters){

	var selectedSources = [],
		aAppliedFilters = {},
		sourceFilter = {},		
		source = '',		
		property = '',
		filterItem = {},
		numSelected = 0,
		i = 0,			
		aFiltered = [],
		aTmp = [],
		oTmp = {};
	

		
	if (typeof $this.data('opts').retrieveFilterObjects === 'function') {
        oFilters = $this.data('opts').retrieveFilterObjects.call(this, $this);	
    } else {
		alert('ERROR: retrieveFilterObjects incorrectly specified');
		return [];
	}
	
	
	sourceFilter = oFilters.sources;	
	selectedSources = sourceFilter.selectedArray;
	numSelected = selectedSources.length;
	//remove unselected sources to reduce filtering time
	if (numSelected === 0){		
		return [];	
	} else {
		//add selected sources
		selectedSources = sourceFilter.selectedArray;

		for (i = 0; i < numSelected; i++){
			source = selectedSources[i];
			if(aSourceData[source].length){
				oTmp[source] = aSourceData[source].slice(0);
				aAppliedFilters[source] = [];   
			}		
		}
	}	
	//console.log('aSourceData',aSourceData)
	//remove sources from the filters
	delete oFilters.sources;	
	

	
	//loop over the filters and remove any redundant sources and list filter to apply to each source to reduce filtering time
	for (property in oFilters) {

	if ( oFilters.hasOwnProperty(property)) {		
			filterItem = oFilters[property];
			filterItem.key = property;
			filterItem.numSelected = filterItem.selectedArray.length
			
			if(filterItem.numSelected === 0){ //if none selected we dont want any showing so just remove applied sources from the oTmp array			

				for (i = 0; i < filterItem.applyTo.length; i++){
					source = filterItem.applyTo[i];
					delete oTmp[source];
					delete aAppliedFilters[source];
				}
			} else if(!filterItem.allSelected) {// if some selected	
				for (i = 0; i < filterItem.applyTo.length; i++){
					source = filterItem.applyTo[i];		
					
					//add the filters to the applied filters object					
					if( (typeof aAppliedFilters[source] === 'object') && (aAppliedFilters[source] !== null)  ){
						aAppliedFilters[source].push(filterItem);
					}
				} 
			} else { //if all values selected do nothing as there is nothing to remove

				//do nothing
			}
			
		}
	}
	

	//add sources into array that is to be filtered
	//console.log('oTmp',oTmp);
	for (source in oTmp) {
		aTmp = aTmp.concat(oTmp[source]);
		//console.log(oTmp[source])
	}	
		
	if(aAppliedFilters.length === 0){
		aFiltered = aTmp ;
	} else {

		if (typeof $this.data('opts').filterArrayItems === 'function') {
			aFiltered = $this.data('opts').filterArrayItems.call(this, $this,aTmp,aAppliedFilters);	
		} else {
			aFiltered = aTmp;		
		}
		
	}	
	
	return aFiltered;
}	

	$.fn.fcman = function(method) { 
		if ( methods[method] ) {
			return methods[method].apply( this, Array.prototype.slice.call( arguments, 1 ));
		} else if ( typeof method === 'object' || ! method ) {
			return methods.init.apply( this, arguments );
		} else {
			$.error( 'Method ' +  method + ' does not exist on plugin' );
		}
	};
	
	// plugin defaults - added as a property on our plugin function
	$.fn.fcman.defaults = {			
		onMonthLoad: function(){
			return true;
		},	
		
		afterInit: function(){
			//console.log('NOTE: No after afterInit function ');
			//alert('ERROR: No afterInit specified');
			return false;
		},

		afterFilter: function($this){
			//console.log('NOTE: afterFilter ');
			/*
			$(selector).fullCalendar('removeEvents');
			$(selector).fullCalendar('addEventSource', {events: aFiltered });
			*/
			return false;
		},
		
		retrieveSourceArrays: function(){
			//console.log('ERROR: No function to retrieve filter values specified');
			alert('ERROR: No function to retrieve filter values specified');
			return false;
		},		
		
		retrieveFilterObjects: function(){
			//console.log('ERROR: No function to retrieve filter values specified');
			alert('ERROR: No function to retrieve filter values specified');
			return false;
		},

		filterArrayItems: function($this,aTmp, aAppliedFilters){
			//console.log('filterArrayItems')
			//console.log('aTmp',aTmp )
			//console.log('aAppliedFilters', aAppliedFilters)

			var aFiltered = jQuery.grep(aTmp , function(element){
				//console.log('grep', element)

				var source = element.sourceID,
					i = 0,						
					filter = '',
					bFound = false,				
					numOfNeedles = 0,
					needle = '',
					haystack = '',
					filters = aAppliedFilters[source];
					
				//console.log(filters)

				if (!filters.length){
					return true;
				}
				//console.log(filters)
			
				for (i = 0; i < filters.length; i++){
					
					filter = filters[i];
					//console.log('filter',filter);					
					needle = element[filter.key]; // the data element value(s)
					if( typeof(needle) === 'undefined'){
						needle = '';
					}
					haystack = filter.selectedArray;     // the filters allowed value(s)

						//console.log('needle:',needle);
						//console.log('haystack',haystack);

					numOfNeedles = needle.length;
					//console.log(needle,haystack,numOfNeedles)
					
					if(numOfNeedles ===1){
						// looking for one item	
						//console.log('oneItem');
						if(needle== ''){						
							needle= ['[Empty]'];
						} 
						
						//console.log('needle:',needle);
						//console.log('haystack',haystack);
						//console.log('idx',haystack.indexOf(needle[0]));


						
						if(haystack.indexOf(needle[0]) === -1){						
							//console.log('denied');
							return false;						
						}
					} else if (numOfNeedles !== 0){						
										
						//loop over numOfNeedles to find in haystacks
						//console.log('lotsaItems');
						bFound = false;
						for (i = 0; i < numOfNeedles ; i++){						
							if(haystack.indexOf(needle[i]) > -1 ){						
								bFound = true;
								i = numOfNeedles ;												
							}						
						}
						
						if(!bFound){
							return false;	
						}											

					} else {	
						//console.log('noItems');
						//do nothing at this stage - returns true for non specified needles
					}
					
					//console.log('itemALlowed');					
					
				}				
				return true;
			});
			//console.log('aFiltered',aFiltered)
			return aFiltered;
		},	
		
		
	};	

})(jQuery);


function CalendarItem(){
	this.id = '';
	this.title = '';
	this.code = '';
	
	this.source = 'courses';
	this.region = '';
	this.location = '';	
	this.tutors = '';
	this.tutorids = '';		
	this.type = '';
	this.status = '';
	this.extra = '';
	this.className = '';
	this.url = '';
	
	this.start = '';
	this.end = '';
}

