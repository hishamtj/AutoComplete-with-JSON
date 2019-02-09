//***********************************************************//
//Autocomplete search plugin for basic JSON v1.0 - 02/02/2019
//Hisham Tajeddine - hisham.tj@gmail.com
//***********************************************************//
$.fn.autocomplete = function (options) {
	//wrap the input with a <div>
    this.wrap("<div class='searchHolder'></div>");
	//the keyboard key codes to be ignored when typing inside the input
    var excludedKeyCodes = [9, 13, 16, 17, 18, 20, 27, 33, 34, 35, 36, 37, 38, 39, 40, 91, 93];
	//plugin settings with default values
    var settings = $.extend({
        dataSource: "sample.json",
        dataSourceAllowCache: false,
        dataParameterName: "",
        dataSourceSearchFields: "name",
        minimumCharacters: 3,
        resultsHolder: ".searchHolder",
        noResultsMessage: "No results",
        errorMessage: "An error has occurred",
        messageAlert: true,
        messageHolder: ".searchHolder",
        showLoader: true,
        loaderHolder: ".searchHolder",
        resultLinkTextFields: "name",
        resultLinkDataAttributes: "id,name",
        resultClickFunctionName: "customClickFunction"
    }, options);
    return this.keyup(function (e) {
		//check if the key code is not within the excluded list
        if (excludedKeyCodes.indexOf(e.keyCode) < 0) {
			//if the "resultsHolder" specified in the settings was not valid, the parent <div> is set as holder
            if (!$(settings.resultsHolder)) {
                settings.resultsHolder = $(this).parent();
            }
			//if the "messageHolder" specified in the settings was not valid, the "resultsHolder" is set as holder
            if (!$(settings.messageHolder)) {
                settings.messageHolder = settings.resultsHolder;
            }
			//check if the "dataSource" is set
            if (settings.dataSource && settings.dataSource.length > 0) {
				//check if the "resultLinkTextFields" and "resultLinkDataAttributes" are set
                if (settings.resultLinkTextFields && settings.resultLinkTextFields.length > 0 && settings.resultLinkDataAttributes && settings.resultLinkDataAttributes.length > 0) {
                    var value = $(this).val();
					//check if the input value length is bigger than the "minimumCharacters"
                    if (value.length >= settings.minimumCharacters) {
						//check if the "showLoader" is set to true to show a loader
                        if (settings.showLoader) {
							//if the "loaderHolder" was not valid, the parent <div> is set as holder
                            if (!$(settings.loaderHolder)) {
                                settings.loaderHolder = $(this).parent();
                            }
							//create a loader <div> and append it to the holder
                            $(settings.loaderHolder).addClass("loaderHolder");
                            $(settings.loaderHolder).prepend("<div class='loader'></div>");
                        }
						//allow or disable ajax caching
                        $.ajaxSetup({ cache: settings.dataSourceAllowCache });
						//check if the "dataSource" is a JSON file/URL or a JSON response page
                        if (settings.dataSource.toLowerCase().indexOf(".json") > -1) {
							//when the datasource is a JSON file/URL, check if the "dataSourceSearchFields" is set in the settings
                            if (settings.dataSourceSearchFields && settings.dataSourceSearchFields.length > 0) {
                                $.ajax({
                                    url: settings.dataSource,
                                    dataType: "json",
                                    success: function (data) {
										//check if the "dataSourceSearchFields" option is set to multiple JSON keys
                                        if (settings.dataSourceSearchFields.indexOf(",") > -1) {
                                            var SearchFields = settings.dataSourceSearchFields.split(",");
                                            var filteredJson = [];
											//loop through the JSON objects and search fields
                                            $.each(data, function (index, valueObj) {
                                                for (var i = 0; i < SearchFields.length; i++) {
													//check if the input value is within the searched field, add the object to the array
                                                    if (valueObj[SearchFields[i]].toString().toLowerCase().indexOf(value.toLowerCase()) > -1) {
                                                        filteredJson.push(data[index]);
                                                    }
                                                }
                                            });
											//filter the array to keep only unique objects
                                            var uniqueFilteredJson = filteredJson.filter((elem, pos, arr) => arr.indexOf(elem) == pos);
                                            loadResults(uniqueFilteredJson, settings);
                                        }
										//if the "dataSourceSearchFields" option is set to a single JSON key
                                        else {
											//filter the JSON to keep only the objects that have the input value within the searched field
                                            var filteredJson = $(data).filter(function (i, n) { return n[settings.dataSourceSearchFields].toString().toLowerCase().indexOf(value.toLowerCase()) > -1 });
                                            loadResults(filteredJson, settings);
                                        }
                                    },
                                    error: function (e) {
                                        throwError(e.responseText, settings, "error");
                                    }
                                });
                            }
                            else {
                                throwError("No JSON search field name is defined", settings, "error");
                            }
                        }
						//the "dataSource" is a JSON response page
                        else {
							//check if the "dataParameterName" (query string key name that will be sent to the search page) option is set
                            if (settings.dataParameterName && settings.dataParameterName.length > 0) {
                                $.ajax({
                                    url: settings.dataSource,
                                    type: "GET",
                                    contentType: "application/json; charset=utf-8",
                                    data: settings.dataParameterName + "=" + value,
                                    success: function (data) {
                                        var filteredJson = JSON.parse(data);
                                        loadResults(filteredJson, settings);
                                    },
                                    error: function (e) {
                                        throwError(e.responseText, settings, "error");
                                    }
                                });
                            }
                            else {
                                throwError("No search query parameter name is defined", settings, "error");
                            }
                        }
                    }
                    else {
                        $(settings.resultsHolder).find(".resultsList").remove();
                        if (settings.messageHolder) { $(settings.messageHolder).find("span.message").remove(); }
                    }
                }
                else {
                    throwError("No JSON text &/or value field is defined", settings, "error");
                }
            }
            else {
                throwError("No JSON data source is defined", settings, "error");
            }
        }
		//if the key code is within the excluded keys
        else {
            if ($(this).parent().find(".resultsList li").length > 1) {
				//if the pressed key is up or down, move within the returned results
                if (e.keyCode == 38 || e.keyCode == 40) {
                    var selected = $(this).parent().find(".resultsList li.selected");
                    $(this).parent().find(".resultsList li").removeClass("selected");
                    if (e.keyCode == 38) { //keyboard up
                        if (selected.prev().length == 0) {
                            selected.siblings().last().addClass("selected");
                        } else {
                            selected.prev().addClass("selected");
                        }
                    }
                    if (e.keyCode == 40) { //keyboard down
                        if (selected.next().length == 0) {
                            selected.siblings().first().addClass("selected");
                        } else {
                            selected.next().addClass("selected");
                        }
                    }
                }
            }
            //if the pressed key is enter, trigger the result click function
            if (e.keyCode == 13) {
                $(this).parent().find(".resultsList li.selected a").click();
            }
            //if the pressed key is escape, clear the input and remove results
            if (e.keyCode == 27) {
                $(this).parent().find(".resultsList").remove();
                $(this).val("");
            }
        }
    });
};
function loadResults(filteredJson, settings) {
    $(settings.resultsHolder).find(".resultsList").remove();
    //if the filtered JSON is not empty or null
    if (filteredJson !== null && filteredJson.length > 0) {
        //remove any previous error messages shown on the page
        if (settings.messageHolder) { $(settings.messageHolder).find("span.message").remove(); }
        //create the <ul> results holder
        var list = $(settings.resultsHolder).append("<ul class='resultsList'></ul>").find("ul");
        //loop through the filtered JSON and create the results
        $.each(filteredJson, function (idx, obj) {
            var linkText, linkDataAttribute;
            //if the "resultLinkTextFields" option is set to multiple JSON keys
            if (settings.resultLinkTextFields.indexOf(",") > -1) {
                linkText = "";
                var TextFields = settings.resultLinkTextFields.split(",");
                //loop through the needed fields and fill their values as the result anchor text (separated by dashes)
                for (i = 0; i < TextFields.length; i++) {
                    linkText += (linkText.length > 0 ? " - " : "") + obj[TextFields[i]];
                }
            }
            //if the needed anchor text is from a single field
            else {
                linkText = obj[settings.resultLinkTextFields];
            }
            //create the needed <li> and <a> elements
            var anchorHolder = document.createElement("li");
            var anchor = document.createElement("a");
            //fill the link text value to the created anchor
            $(anchor).html(linkText);
            //if the "resultLinkDataAttributes" option is set to multiple data-attributes
            if (settings.resultLinkDataAttributes.indexOf(",") > -1) {
                var DataAttributeFields = settings.resultLinkDataAttributes.split(",");
                //loop through the needed keys and add a data-attribute to the anchor with the value being read from the JSON key of the same name
                for (i = 0; i < DataAttributeFields.length; i++) {
                    $(anchor).attr("data-" + DataAttributeFields[i], obj[DataAttributeFields[i]]);
                }
            }
            //if the needed anchor data-attribute is from a single field
            else {
                $(anchor).attr("data-" + settings.resultLinkDataAttributes, obj[settings.resultLinkDataAttributes]);
            }
            //append the result anchor to the result <li>
            $(anchorHolder).append($(anchor));
            //append the result <li> to the <ul> results holder
            list.append(anchorHolder);
        });
        //handle the result anchor click event
        $(settings.resultsHolder).find(".resultsList li a").click(function () {
            //if the "resultClickFunctionName" option is not set in the settings, a default function name is set
            if (!settings.resultClickFunctionName || settings.resultClickFunctionName.length == 0) {
                settings.resultClickFunctionName = "customClickFunction";
            }
            //append the current anchor element to the function name
            var clickFunction = settings.resultClickFunctionName + "($(this));";
            eval(clickFunction);
        });
        //select the first result option by default
        $(settings.resultsHolder).find(".resultsList li:first-child").addClass("selected");
        //change the selected result option on mouse over
        $(settings.resultsHolder).find(".resultsList li").on("mouseover", function () {
            $(this).siblings().removeClass("selected");
            $(this).addClass("selected");
        });        
    }
    else {
        throwError(settings.noResultsMessage, settings, "noresults");        
    }
    //hide the loader if it was already showing
    if (settings.showLoader) { $(settings.loaderHolder).find(".loader").remove(); }
}
function throwError(errorMessage, settings, errorType) {
    //if the error messages are set to show in an alert
    if (settings.messageAlert) {
        alert(errorMessage);
    }
    //if the "messageAlert" is set to false, the error messages will show in an element on the page
    else {
        var messageHolder = document.createElement("span");
        $(messageHolder).html(errorMessage);
        $(messageHolder).addClass("message " + (errorType == "error" ? "error" : "noResults"));
        if ($(settings.messageHolder).find("span.message").length > 0) {
            $(settings.messageHolder).find("span.message").remove();
        }
        $(settings.messageHolder).append(messageHolder);
    }
}