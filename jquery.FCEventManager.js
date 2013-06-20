;(function($){ 
	"use strict";		
	
	var methods = {
		init : function( options ){
			var $this = $(this);								
				$this.data('opts', $.extend({}, $.fn.fcman.defaults, options));				
			$this.data('eventsCache', []);
			$this.data('calendarID' , $this.data('opts').fullCalendarID);							
			console.log('init');
			console.log($this.data('opts'));			
		},		

		applyFiltersToView: function (view) {	
			return applyFiltersToView($(this),view);			
        },		
	
		clearCache: function () {
			var $this = $(this);	
			$this.data('eventsCache', []);
			return $this;
		},
		
	};

	function applyFiltersToView($this,view){
		console.log("applyFiltersToView");	
		
		var calendarSelector = "#" + $this.data('calendarID'),
			aViewArray = cacheAndLoadMonth($this,view),		
			aFiltered = filterArray($this,aViewArray );
		/*
		$(calendarSelector).fullCalendar ('removeEvents');
		$(calendarSelector).fullCalendar('addEventSource', {	events: aFiltered });
		*/
	}		

	function cacheAndLoadMonth($this,view){
	    console.log("loadMonth");

	    var visStart = view.visStart,
			visEnd = view.visEnd,
			eventsCache = $this.data('eventsCache'),
			d = view.start,			
			thisViewCode= view.name+"_"+ d.getFullYear()  +"_"+ (d.getMonth() + 1),			
			aViewArray = eventsCache[thisViewCode];	
			
			console.log("visStart",visStart);
			console.log("visEnd",visEnd);
			console.log("eventsCache",eventsCache);
			console.log("d",d);
			console.log("thisViewCode",thisViewCode);			
			
			
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
		console.log($this.data('opts'));
		if (typeof $this.data('opts').retrieveSourceArrays === "function") {
            aTmp = $this.data('opts').retrieveSourceArrays.call(this, $this, visStart, visEnd); 
        }
		
		return aTmp ;
	}


function filterArray($this,aSourceData,oFilters){	
	 console.log("filterArray");
	
	var selectedSources = [],	 	
		aAppliedFilters = {},	
		sourceFilter = {},		 
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
		 
	console.log(aSourceData);
		
	if (typeof $this.data('opts').retrieveFilterObjects === "function") {
        oFilters = $this.data('opts').retrieveFilterObjects.call(this, $this);	
			console.log('***')		;
			console.log(oFilters)		;
    } else {
		alert("ERROR: retrieveFilterObjects incorrectly specified");
		return [];
	}
	
	
	sourceFilter = oFilters.sources;	
	console.log(sourceFilter)
	
	//remove unselected sources to reduce filtering time
	if (sourceFilter.numSelected === 0){		
		return [];	
	} else {
		//add selected sources
		 selectedSources = sourceFilter.selectedArray;
		 console.log(sourceFilter.selectedArray)
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
	
	//loop over the filters and remove any redundant sources and list filter to apply to each source to reduce filtering time
	for (property in oFilters) {
		console.log('filterproperty', property)
		if ( oFilters.hasOwnProperty(property) && property !== "sources") {		
			filterItem = oFilters[property];
			
			if(filterItem.numSelected == 0){ //if none selected we dont want any showing so just remove applied sources from the oTmp array				
				console.log('none selected')
				for (j = 0; j < filterItem.applyTo.length; j++){
					source = filterItem.applyTo[j];
					delete oTmp[source];					
					delete aAppliedFilters[source]; 
				} 				
			} else if(!filterItem.allSelected) {// if some selected	
				console.log('some selected')
				for (j = 0; j < filterItem.applyTo.length; j++){
					source = filterItem.applyTo[j];		
					
					//add the filters to the applied filters object					
					if( (typeof aAppliedFilters[source] == "object") && (aAppliedFilters[source] !== null)  ){
						aAppliedFilters[source].push(filterItem);         	  				
					}	    	
				} 
				
			} else { //if all values selected do nothing as there is nothing to remove
				console.log('all selected')
				//do nothing
			}
			
		}
	}
	
	console.log('aTmp',oTmp);
	console.log('aAppliedFilters',aAppliedFilters);
	//add sources into array that is to be filtered
	for (source in oTmp) {
		aTmp = aTmp.concat(oTmp[source]);
	}	
	
		
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
				console.log('source', source)
				
				if (!filters.length){
					return true;
				}
				//console.log();
				//console.log(" ");
				//console.log("*** Item type:" + source);
				for (i = 0; i < filters.length; i++){
					filter = filters[i];
										
					console.log("Apply Filter:"+filter.key);
					needle = element[filter.key]; // the data element value(s)
					haystack = filter.values;     // the filters allowed value(s)
					/*
					console.log ("Element '" + filter.key + "' value = " + needle )
					console.log("Filter acceptable values = " + haystack );
					*/
					//console.log('needle' );
					//console.log(needle );
					//console.log('haystack' );
					console.log(haystack);

					numOfNeedles = needle.length
					if(numOfNeedles ==1){
						// looking for one item
						//console.log("one needle" );						
						if(haystack.indexOf(needle[0]) == -1){						
							//console.log('needle not found, item ont allowed');
							return false;						
						}

					} else if (numOfNeedles ==0){						
						//do nothing at this stage - returns true for non specified needles
					} else {
						console.log("ouch lots of needles" );
						//loop over numOfNeedles to find in haystacks
						bFound = false;
						for (i = 0; i < numOfNeedles ; i++){						
							if(haystack.indexOf(needle[i]) > -1 ){						
								console.log('item found' + needle[i]);	
								bFound = true;
								i = numOfNeedles ;												
							}						
						}
						if(!bFound){
							console.log("No items in haystack" );
							return false;	
						}
											

					}
					console.log('ITEM ALLOWED' );
					return true
					
				}			
				
				return true;
			});		
		}
		
	
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

