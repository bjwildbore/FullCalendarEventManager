;(function($){ 
	"use strict";		
	
	var methods = {
		init : function( options ){
			var $this = $(this);								
				$this.opts = $.extend({}, $.fn.fui.defaults, options);
			
			$this.data('filterConfig', $this.opts.filters);
			$this.addClass('fuiFilters');				
			buildFilters($this);
			configureEventHandlers($this);
			applyCookiesAndDefaults($this);
			changeFilterStatus($this);
				
		},		

		getFilterValues: function () {					
			return getCurrentFilterValues($(this));			
        }
		
	};


function loadMonth(){
	    //console.log("loadMonth");
	    var viewObj = $('#calendar').fullCalendar('getView');
	    var visStart = viewObj.visStart;  
	    var visEnd = viewObj.visEnd;  
		
		var calDate = new XDate($('#calendar').fullCalendar('getDate'));
		var thisViewCode= viewObj.name+"_"+calDate.toString("yyyy_MM");	
			
	    var start = new Date().getTime();	
		
		//check for month array in page array
		var aViewArray = aEvents[thisViewCode];
						
		if(!aViewArray ){	
		  aViewArray = getMonthArray(calDate,visStart,visEnd);			  
		  aEvents[thisViewCode] = aViewArray; 		  
		}	
		//console.log(aEvents);		
        //console.log(aViewArray );	
		return aViewArray;
	}


	function getMonthArray(d,visStart,visEnd){
	    //console.log("getMonthArray");	    

		var aTmp = {};
		aTmp.dates = [];
		aTmp.resources = [];
		aTmp.availability = [];	
		aTmp.courses = [];

		/*		
		aTmp.courses = {};	
		
		for ( var i=0, len=oFilters.region.dictionary.length; i<len; ++i ){	
			aTmp.courses[oFilters.region.dictionary[i].id] = {};
			for ( var j=0, jlen=oFilters.status.dictionary.length; j<jlen; ++j ){				
				aTmp.courses[oFilters.region.dictionary[i].id][oFilters.status.dictionary[j].title] = new Array();
			}

		}
		*/
		

		aTmp.courses = addCourses(visStart,visEnd);		
		aTmp.dates = addDates(visStart,visEnd);
		aTmp.availability = addAvailability(visStart,visEnd);		
		aTmp.resources = addResources(visStart,visEnd);
		
		return aTmp ;
	}






	function addDates(dStart,dEnd){
	   

		var thisItem =  new CalendarItem();
		var tmpStr = "";
		var aTmp = [];
		var sReportStartDate = dStart.getFullYear() +'-' + (dStart.getMonth()+1) +'-' + dStart.getDate();		

		var sReportEndDate = dEnd.getFullYear() +'-' + (dEnd.getMonth()+1) +'-' + dEnd.getDate();
		//console.log('<Query><Where><And><Geq><FieldRef Name="End_x0020_date" /><Value Type="DateTime">'+sReportStartDate +'</Value></Geq><Leq><FieldRef Name="Start_x0020_date" /><Value Type="DateTime">'+sReportEndDate +'</Value></Leq></And></Where>');

		$().SPServices({
		    operation: "GetListItems",
		    async: false,
		    listName: "clinical_date",
			CAMLQuery: '<Query><Where><And><Geq><FieldRef Name="EndDate" /><Value Type="DateTime">'+sReportStartDate +'</Value></Geq><Leq><FieldRef Name="StartDate" /><Value Type="DateTime">'+sReportEndDate +'</Value></Leq></And></Where></Query>',

		    CAMLViewFields: "<ViewFields><FieldRef Name='ID' /><FieldRef Name='Title' /><FieldRef Name='Region' /><FieldRef Name='Location' /></ViewFields>",
		    completefunc: function (xData, Status) {

		     $(xData.responseXML).SPFilterNode("z:row").each(function() { 
				
				thisItem = new CalendarItem();
				thisItem.id = $(this).attr("ows_ID");
				thisItem.title = $(this).attr("ows_Title");
				thisItem.category = "dates";			

				thisItem.sort = 1;
				thisItem.region = formatOWSItem($(this).attr("ows_Region"),0);					
				thisItem.location = formatOWSItem($(this).attr("ows_Location"),0);				
				thisItem.url = "/Training/TrainingTeam/Lists/OtherDates/DispForm.aspx?ID="+$(this).attr("ows_ID");
				
				thisItem.start =  $(this).attr("ows_StartDate");
				thisItem.end = $(this).attr("ows_EndDate");
				
				thisItem.className = "item_" + thisItem.category;
									

				aTmp.push(thisItem); 				
					
		      });

		    }
	  	});
	  	  	
	  	return aTmp;

	}



function addAvailability(dStart,dEnd){
	   

		var thisItem =  new CalendarItem();
		var tmpStr = "";
		var aTmp = [];
		var sReportStartDate = dStart.getFullYear() +'-' + (dStart.getMonth()+1) +'-' + dStart.getDate();		

		var sReportEndDate = dEnd.getFullYear() +'-' + (dEnd.getMonth()+1) +'-' + dEnd.getDate();
		//console.log('<Query><Where><And><Geq><FieldRef Name="End_x0020_date" /><Value Type="DateTime">'+sReportStartDate +'</Value></Geq><Leq><FieldRef Name="Start_x0020_date" /><Value Type="DateTime">'+sReportEndDate +'</Value></Leq></And></Where>');

		$().SPServices({
		    operation: "GetListItems",
		    async: false,
		    listName: "clinical_availability",
			CAMLQuery: '<Query><Where><And><Geq><FieldRef Name="EndDate" /><Value Type="DateTime">'+sReportStartDate +'</Value></Geq><Leq><FieldRef Name="StartDate" /><Value Type="DateTime">'+sReportEndDate +'</Value></Leq></And></Where></Query>',

		    CAMLViewFields: "<ViewFields><FieldRef Name='ID' /><FieldRef Name='Title' /><FieldRef Name='Region' /><FieldRef Name='Location' /></ViewFields>",
		    completefunc: function (xData, Status) {

		     $(xData.responseXML).SPFilterNode("z:row").each(function() { 
				
				thisItem = new CalendarItem();
				thisItem.id = $(this).attr("ows_ID");
				thisItem.title = $(this).attr("ows_Title");
				thisItem.category = "availability";	
				thisItem.tutor =formatOWSItem($(this).attr("ows_Tutor"),0);

				thisItem.sort = 2;						
				thisItem.url = "/Training/TrainingTeam/Lists/OtherDates/DispForm.aspx?ID="+$(this).attr("ows_ID");

				thisItem.start =  $(this).attr("ows_StartDate");
				thisItem.end = $(this).attr("ows_EndDate");					
				
				thisItem.className = "item_" + thisItem.category;

				aTmp.push(thisItem); 				
					
		      });

		    }
	  	});
	  	  	
	  	return aTmp;

	}

function addResources(dStart,dEnd){
	   

		var thisItem =  new CalendarItem();
		var tmpStr = "";
		var aTmp = [];
		var sReportStartDate = dStart.getFullYear() +'-' + (dStart.getMonth()+1) +'-' + dStart.getDate();		

		var sReportEndDate = dEnd.getFullYear() +'-' + (dEnd.getMonth()+1) +'-' + dEnd.getDate();
		//console.log('<Query><Where><And><Geq><FieldRef Name="End_x0020_date" /><Value Type="DateTime">'+sReportStartDate +'</Value></Geq><Leq><FieldRef Name="Start_x0020_date" /><Value Type="DateTime">'+sReportEndDate +'</Value></Leq></And></Where>');

		$().SPServices({
		    operation: "GetListItems",
		    async: false,
		    listName: "clinical_resource",
			CAMLQuery: '<Query><Where><And><Geq><FieldRef Name="EndDate" /><Value Type="DateTime">'+sReportStartDate +'</Value></Geq><Leq><FieldRef Name="StartDate" /><Value Type="DateTime">'+sReportEndDate +'</Value></Leq></And></Where></Query>',

		    CAMLViewFields: "<ViewFields><FieldRef Name='ID' /><FieldRef Name='Title' /><FieldRef Name='Region' /><FieldRef Name='Location' /></ViewFields>",
		    completefunc: function (xData, Status) {

		     $(xData.responseXML).SPFilterNode("z:row").each(function() { 
				
				thisItem = new CalendarItem();
				thisItem.id = $(this).attr("ows_ID");
				thisItem.title = $(this).attr("ows_Title");
				thisItem.category = "resources";			

				thisItem.sort = 4;						
				thisItem.url = "/Training/TrainingTeam/Lists/OtherDates/DispForm.aspx?ID="+$(this).attr("ows_ID");

				thisItem.start =  $(this).attr("ows_StartDate");
				thisItem.end = $(this).attr("ows_EndDate");					
				
				thisItem.className = "item_" + thisItem.category;

				aTmp.push(thisItem); 				
					
		      });

		    }
	  	});
	  	  	
	  	return aTmp;

	}




function addCourses(dStart,dEnd){	   

		var thisItem =  new CalendarItem();
		var tmpStr = "";
		var aTmp = {};
		var sReportStartDate = dStart.getFullYear() +'-' + (dStart.getMonth()+1) +'-' + dStart.getDate();		

		var sReportEndDate = dEnd.getFullYear() +'-' + (dEnd.getMonth()+1) +'-' + dEnd.getDate();
		//console.log('<Query><Where><And><Geq><FieldRef Name="End_x0020_date" /><Value Type="DateTime">'+sReportStartDate +'</Value></Geq><Leq><FieldRef Name="Start_x0020_date" /><Value Type="DateTime">'+sReportEndDate +'</Value></Leq></And></Where>');

		for (var i = 0; i < oFilters.region.dictionary.length; i++){	
			aTmp["region_" + oFilters.region.dictionary[i].id ] = [];
		}	

		$().SPServices({
		    operation: "GetListItems",
		    async: false,
		    listName: "clinical_course",
			CAMLQuery: '<Query><Where><And><Geq><FieldRef Name="EndDate" /><Value Type="DateTime">'+sReportStartDate +'</Value></Geq><Leq><FieldRef Name="StartDate" /><Value Type="DateTime">'+sReportEndDate +'</Value></Leq></And></Where></Query>',

		    CAMLViewFields: "<ViewFields><FieldRef Name='ID' /><FieldRef Name='Title' /><FieldRef Name='Region' /><FieldRef Name='Tutors' /><FieldRef Name='CourseType' /><FieldRef Name='Status' /><FieldRef Name='Location' /></ViewFields>",
		    completefunc: function (xData, Status) {

		     $(xData.responseXML).SPFilterNode("z:row").each(function() { 
				
				thisItem = new CalendarItem();
				thisItem.id = $(this).attr("ows_ID");
				thisItem.title = $(this).attr("ows_Title");							
				thisItem.category = "courses";
				thisItem.type = formatOWSItem($(this).attr("ows_CourseType"),0);
				thisItem.status = $(this).attr("ows_Status");
				thisItem.region = formatOWSItem($(this).attr("ows_Region"),0);
				thisItem.location = formatOWSItem($(this).attr("ows_Location"),0);
				thisItem.tutor =  formatOWSItem($(this).attr("ows_Tutors"),0);
				
				thisItem.sort = 3;						
				thisItem.url = "/Training/TrainingTeam/Lists/OtherDates/DispForm.aspx?ID="+$(this).attr("ows_ID");

				thisItem.start =  $(this).attr("ows_StartDate");
				thisItem.end = $(this).attr("ows_EndDate");					
				
				thisItem.className = "item_" + thisItem.category + " item_" + thisItem.status;

				aTmp["region_" + thisItem.region].push(thisItem); 	


					
		      });

		    }
	  	});
	  	  	
	  	return aTmp;

	}
	
	
	function applySettingsToCalendar(){
		//console.log("applySettingsToCalendar");	
		var aViewArray = loadMonth();
		filterAndApplyArray(aViewArray );
	
	}

function filterAndApplyArray(aViewArray){	
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
	 	//filters all - region, location,  tutors
	 	//filters courses - region, location, status, tutors, type

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
		title: 'Filters',
		filters: [],
		autosetCookies: true,
		radioSelectedClass: 'icon-circle',
		radioUnselectedClass: 'icon-circle-blank',
		checkSelectedClass: 'icon-check-sign',
		checkUnselectedClass: 'icon-check-empty',
		expandClass: 'icon-angle-down',	
		collapseClass: 'icon-angle-up',	
		enabledClass:  'icon-circle',	
		disabledClass: 'icon-ban-circle',			
		status: true,
		allowDisable: true,
		enabled: true,
		onFilterClick: function(){
			return true;
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

