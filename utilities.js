	function loadDictionaryArrays(){
		
		oFilters.region.dictionary  = $.jStorage.get("caRegions");				
		if(!oFilters.region.dictionary ){		  
		  oFilters.region.dictionary = getRegionsArrayFromSP();			
		  $.jStorage.set("caRegions",oFilters.region.dictionary);		  
		}  
		
		oFilters.location.dictionary = $.jStorage.get("caLocations");				
		if(!oFilters.location.dictionary ){	
		  oFilters.location.dictionary = getLocationsArrayFromSP();			
		  $.jStorage.set("caLocations",oFilters.location.dictionary );		  
		}

		oFilters.tutor.dictionary = $.jStorage.get("caTutors");				
		if(!oFilters.tutor.dictionary ){	
		  oFilters.tutor.dictionary = getTutorsArrayFromSP();			
		  $.jStorage.set("caTutors",oFilters.tutor.dictionary );		  
		}	

		oFilters.type.dictionary = $.jStorage.get("caTypes");				
		if(!oFilters.type.dictionary){	
		  oFilters.type.dictionary = getTypesArrayFromSP();			
		  $.jStorage.set("caTypes",oFilters.type.dictionary);		  
		}

		oFilters.status.dictionary = $.jStorage.get("caStatus ");				
		if(!oFilters.status.dictionary){	
		  oFilters.status.dictionary = getStatusArrayFromSP();			
		  $.jStorage.set("caStatus ",oFilters.status.dictionary );		  
		} 
		
	}// end loadDictionaryArrays

		function clearBrowserCache(){
		
	    $.jStorage.flush();
		$.cookie("f_region","");
		
		$.cookie("f_tutor","");
		$.cookie("f_location","");		
		$.cookie("f_status","");
		$.cookie("f_type","");
		$.cookie("f_options","");	
	  
	    location.reload(true);	  	
	}
	
	function formatOwsDate(d){	
		var	sDateSplit = d.split(' ');
		var	sTimeSplit = sDateSplit[1].split(':');
		var	sDateSplit = sDateSplit[0].split('-');
		var	sTime = sTimeSplit[0] +":" +sTimeSplit[1];				
		var	sDate =  sDateSplit[2]+"/"+sDateSplit[1]+"/"+ sDateSplit[0];
        
        return(sDate +" (" +sTime +")" );
	}
	
	function renderCalendar(){
		//console.log("renderCalendar");
	
		// ********  render the calendar ************
		$('#calendar').fullCalendar({
			height:500,	
			firstDay:1,
			editable:false,
			viewDisplay: function(view) {
				// $("#jumpTool").appendTo("td.fc-header-center");
				applySettingsToCalendar();
			},
	
			header:{
				left:   'today prevYear,prev,next,nextYear',
				center: 'title',
				right:  ''
			},
	
			
	
			eventClick: function(event) {
				if (event.url) {
					window.open(event.url);
					return false;
				}
			}
	
		});
	
	}
	
	
	
	