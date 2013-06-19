$(document).ready(function()
{	




	jQuery.extend(jQuery.expr[':'], {
	  containsIgnoreCase: "(a.textContent||a.innerText||jQuery(a).text()||'').toLowerCase().indexOf((m[3]||'').toLowerCase())>=0"
	});




	
	var aViewArray = new Array();

	
	var oFilters = {};
	
		oFilters.region = {};
		oFilters.region.key = 'region';
		oFilters.region.status = 0;
		oFilters.region.values = 0;
		oFilters.region.dictionary = [];
		oFilters.region.applyGrep = true;
		oFilters.region.applyTo = ["courses","dates","availability", "resources"];
		// courses already filtered by region , not grep filtered

		
		oFilters.location = {};
		oFilters.location.key = 'location';
		oFilters.location.active = 0;
		oFilters.location.values = 0;
		oFilters.location.dictionary = [];
		oFilters.location.applyGrep = true;
		oFilters.location.applyTo = ["courses","date","availability", "resources"];
		
		oFilters.tutor = {};
		oFilters.tutor .key = 'tutor';
		oFilters.tutor.active = 0;
		oFilters.tutor.values = 0;
		oFilters.tutor.dictionary = [];
		oFilters.tutor.applyGrep = true;
		oFilters.tutor.applyTo = ["courses","availability"];



		
		oFilters.status = {};
		oFilters.status.key = 'status';
		oFilters.status.active = 0;
		oFilters.status.values = 0;
		oFilters.status.dictionary = [];
		oFilters.status.applyGrep = true;
		oFilters.status.applyTo = ["courses"];




		oFilters.type = {};
		oFilters.type.key = 'type';
		oFilters.type.active = 0;
		oFilters.type.values = 0;
		oFilters.type.dictionary = [];
		oFilters.type.applyGrep = true;
		oFilters.type.applyTo = ["courses"];

		oFilters.options = {};
		oFilters.options.key = 'options';
		oFilters.options.active = 0;
		oFilters.options.values = 0;
		oFilters.options.dictionary = [];
		oFilters.options.applyGrep = false;
		oFilters.options.applyTo = [];
		
		loadDictionaryArrays();	
		
		fuiFilters()->buildFilters();	
		
		var aEvents = new Array(); 

		renderCalendar();

		
});//end body load		