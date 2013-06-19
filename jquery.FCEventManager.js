;(function($){ 
	"use strict";		
	
	var methods = {
		init : function( options ){
			var $this = $(this);								
				$this.opts = $.extend({}, $.fn.fui.defaults, options);
				
			$this.data('eventsCache', []);
			$this.data('calendarID' , $this.opts.fullCalendarID);	
			$this.data('filterValues' , []);				
					
		},		

		applyFiltersToView: function (view) {					
			return applyFiltersToView($(this),view);			
        },		
	
		clearCache: function () {
			return $this;
		},
		
	};

	function applyFiltersToView($this,view){
		//console.log("applySettingsToCalendar");	
		var aViewArray = cacheAndLoadMonth($this,view);
		filterAndApplyArray($this,aViewArray );
	
	}		

	function cacheAndLoadMonth($this,view){
	    //console.log("loadMonth");
	    
	    var visStart = view.visStart,
			visEnd = view.visEnd,
			eventsCache = $this.data('eventsCache'),	
			calDate = new XDate($('#calendar').fullCalendar('getDate')),	
			thisViewCode= view.name+"_"+calDate.toString("yyyy_MM"),
			aViewArray = eventsCache[thisViewCode];
						
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
		
		if (typeof $this.opts.retrieveSourceArrays === "function") {
            aTmp = $this.opts.retrieveSourceArrays.call(this, $this, visStart, visEnd)) 
        }
		
		return aTmp ;
	}






function filterAndApplyArray($this,aViewArray){	
	 //console.log("filterAndApplyArray");
	
	 var optionFilterValues = getFilterListValues("options"),
	 	 regionFilterValues = getFilterListValues("region"),
	 	 aAppliedFilters = {},
	 	 category = "",
	 	 region = 0,
	 	 property = '',
	 	 filterItem = {},
	 	 needle ="",
	 	 haystack = "",	 	 
	 	 i = 0,
	 	 j = 0,
	 	 aFiltered = [],
	 	 aTmp = [];
	 
	 //filter by options andcourse regions before grepping
	 for (i = 0; i < optionFilterValues.length; i++){	
	 	category = optionFilterValues[i];
	 	//console.log(aViewArray);

		if(category != 'courses' ){
			// if there is something in the array add it
			if(aViewArray[category].length){
	  			aTmp = aTmp.concat(aViewArray[category]);
	  			aAppliedFilters[category] = []; 
	  		}
		} else {	
			
 			for (j = 0; j < regionFilterValues.length; j++){
				region = 'region_' + regionFilterValues[j];
				if(aViewArray['courses'][region].length){
					aTmp = aTmp.concat(aViewArray[category][region]);
					aAppliedFilters['courses'] = []; 					
				}	 		
	 		}	
	 	} 	
	 }

		$('#calendar').fullCalendar ('removeEvents');		
		
		for (property in oFilters) {
    		if (oFilters.hasOwnProperty(property)) {
    			filterItem = oFilters[property];
    			
        	  	if(filterItem.applyGrep == true && filterItem.active != 0){        	  	
        	  		for (j = 0; j < filterItem.applyTo.length; j++){
        	  			category = filterItem.applyTo[j];
        	  			
        	  			if( (typeof aAppliedFilters[category] == "object") && (aAppliedFilters[category] !== null)  ){
        	  				aAppliedFilters[category].push(filterItem); 
        	  				
        	  			}	    	
        	  		}        	  		  		
        	  	}
        	  	
    		}
		}
		

		
		if(aAppliedFilters.length == 0){
			aFiltered = aTmp ;
		} else {		
			aFiltered = jQuery.grep(aTmp , function(element, index){
				
				var category = element.category,
					i = 0,
					j = 0,
					filterKey = '',
					filter = [],
					bFound = false,
					needle = "",
					numOfNeedles = 0,
					haystack = "",
				    filters = aAppliedFilters[category];
				
				if (!filters.length){
					return true;
				}
				//console.log();
				//console.log(" ");
				//console.log("*** Item type:" + category);
				for (i = 0; i < filters.length; i++){
					filter = filters[i];
										
					console.log("Apply Filter:"+filter.key);
					needle = element[filter.key];
					haystack = filter.values;
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
		
	
		$('#calendar').fullCalendar('addEventSource', {	events: aFiltered });

	}	

	$.fn.fui = function(method) { 
		if ( methods[method] ) {
			return methods[method].apply( this, Array.prototype.slice.call( arguments, 1 ));
		} else if ( typeof method === 'object' || ! method ) {
			return methods.init.apply( this, arguments );
		} else {
			$.error( 'Method ' +  method + ' does not exist on jQuery.tooltip' );
		}
	};
	
	// plugin defaults - added as a property on our plugin function
	$.fn.fui.defaults = {			
		fullCalendarID: '',
		onMonthLoad: function(){
			return true;
		},	

		retrieveSourceArrays: function(visibleStart,visibleEnd){
			alert('ERROR: No function to retrieve filter values specified');
			return false;
		}		
		
		retrieveFilterValues: function(){
			alert('ERROR: No function to retrieve filter values specified');
			return false;
		}	
		
	};	

})(jQuery);


	function CalendarItem(){
		this.id = "";
		this.title = "";
		this.code = "";
		
		this.category = "courses";
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

