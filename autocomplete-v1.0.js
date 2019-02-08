//***********************************************************//
//Autocomplete search plugin for basic JSON v1.0 - 02/02/2019
//Hisham Tajeddine - hisham.tj@gmail.com
//***********************************************************//
$.fn.autocomplete = function (options) {
    this.wrap("<div class='searchHolder'></div>");
    var excludedKeyCodes = [9, 13, 16, 17, 18, 20, 27, 33, 34, 35, 36, 37, 38, 39, 40, 91, 93];
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
        messageHolder: null,
        showLoader: true,
        loaderHolder: ".searchHolder",
        resultLinkTextFields: "name",
        resultLinkDataAttributes: "id,name",
        resultClickFunctionName: "customClickFunction"
    }, options);
    return this.keyup(function (e) {
        if (excludedKeyCodes.indexOf(e.keyCode) < 0) {
            if (settings.dataSource && settings.dataSource.length > 0) {
                if (settings.resultLinkTextFields && settings.resultLinkTextFields.length > 0 && settings.resultLinkDataAttributes && settings.resultLinkDataAttributes.length > 0) {
                    var value = $(this).val();
                    if (!$(settings.resultsHolder)) {
                        settings.resultsHolder = $(this).parent();
                    }
                    if (!settings.messageHolder) {                                            
                        settings.messageHolder = settings.resultsHolder;
                    }
                    if (value.length >= settings.minimumCharacters) {
                        if (settings.showLoader) {
                            if (!settings.loaderHolder) {
                                settings.loaderHolder = $(this).parent();
                            }
                            $(settings.loaderHolder).addClass("loaderHolder");
                            $(settings.loaderHolder).prepend("<div class='loader'></div>");
                        }
                        $.ajaxSetup({ cache: settings.dataSourceAllowCache });
                        if (settings.dataSource.toLowerCase().indexOf(".json") > -1) {
                            if (settings.dataSourceSearchFields && settings.dataSourceSearchFields.length > 0) {
                                $.ajax({
                                    url: settings.dataSource,
                                    dataType: "json",
                                    success: function (data) {
                                        if (settings.dataSourceSearchFields.indexOf(",") > -1) {
                                            var SearchFields = settings.dataSourceSearchFields.split(",");
                                            var filteredJson = [];
                                            $.each(data, function (index, valueObj) {
                                                for (var i = 0; i < SearchFields.length; i++) {
                                                    if (valueObj[SearchFields[i]].toString().toLowerCase().indexOf(value) > -1) {
                                                        filteredJson.push(data[index]);
                                                    }
                                                }
                                            });
                                            var uniqueFilteredJson = filteredJson.filter((elem, pos, arr) => arr.indexOf(elem) == pos);
                                            loadResults(uniqueFilteredJson, settings);
                                        }
                                        else {
                                            var filteredJson = $(data).filter(function (i, n) { return n[settings.dataSourceSearchFields].toString().toLowerCase().indexOf(value) > -1 });
                                            loadResults(filteredJson, settings);
                                        }
                                    },
                                    error: function (e) {
                                        throwError(e.responseText, settings, "error");
                                    }
                                });
                            }
                            else {
                                alert("No JSON search field name is defined");
                            }
                        }
                        else {
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
                                alert("No search query parameter name is defined");
                            }
                        }
                    }
                    else {
                        $(settings.resultsHolder).find(".resultsList").remove();
                        if (settings.messageHolder) { $(settings.messageHolder).find("span.message").remove(); }
                    }
                }
                else {
                    alert("No JSON text &/or value field is defined");
                }
            }
            else {
                alert("No JSON data source is defined");
            }
        }
        else {
            if ($(this).parent().find(".resultsList li").length > 1) {
                if (e.keyCode == 38) { //up
                    var selected = $(this).parent().find(".resultsList li.selected");
                    $(this).parent().find(".resultsList li").removeClass("selected");
                    if (selected.prev().length == 0) {
                        selected.siblings().last().addClass("selected");
                    } else {
                        selected.prev().addClass("selected");
                    }
                }
                if (e.keyCode == 40) { //down
                    var selected = $(this).parent().find(".resultsList li.selected");
                    $(this).parent().find(".resultsList li").removeClass("selected");
                    if (selected.next().length == 0) {
                        selected.siblings().first().addClass("selected");
                    } else {
                        selected.next().addClass("selected");
                    }
                }
            }            
            if (e.keyCode == 13) { //enter
                $(this).parent().find(".resultsList li.selected a").click();
            }
            if (e.keyCode == 27) { //esc
                $(this).parent().find(".resultsList").remove();
                $(this).val("");
            }
        }
    });
};
function loadResults(filteredJson, settings) {
    $(settings.resultsHolder).find(".resultsList").remove();
    if (filteredJson !== null && filteredJson.length > 0) {
        var list = $(settings.resultsHolder).append("<ul class='resultsList'></ul>").find("ul");
        $.each(filteredJson, function (idx, obj) {
            var linkText, linkDataAttribute;
            if (settings.resultLinkTextFields.indexOf(",") > -1) {
                linkText = "";
                var TextFields = settings.resultLinkTextFields.split(",");
                for (i = 0; i < TextFields.length; i++) {
                    linkText += (linkText.length > 0 ? " " : "") + obj[TextFields[i]];
                }
            }
            else {
                linkText = obj[settings.resultLinkTextFields];
            }
            var anchorHolder = document.createElement("li");
            var anchor = document.createElement("a");            
            $(anchor).html(linkText);
            if (settings.resultLinkDataAttributes.indexOf(",") > -1) {
                var DataAttributeFields = settings.resultLinkDataAttributes.split(",");
                for (i = 0; i < DataAttributeFields.length; i++) {
                    $(anchor).attr("data-" + DataAttributeFields[i], obj[DataAttributeFields[i]]);
                }
            }
            else {
                $(anchor).attr("data-" + settings.resultLinkDataAttributes, obj[settings.resultLinkDataAttributes]);
            }
            $(anchorHolder).append($(anchor));
            list.append(anchorHolder);
        });
        $(settings.resultsHolder).find(".resultsList li a").click(function () {
            if (!settings.resultClickFunctionName) {
                settings.resultClickFunctionName = "customClickFunction";
            }
            var clickFunction = settings.resultClickFunctionName + "($(this));";
            eval(clickFunction);
        });
        $(settings.resultsHolder).find(".resultsList li:first-child").addClass("selected");
        $(settings.resultsHolder).find(".resultsList li").on("mouseover", function () {
            $(this).siblings().removeClass("selected");
            $(this).addClass("selected");
        });
        if (settings.messageHolder) { $(settings.messageHolder).find("span.message").remove(); }
    }
    else {
        $(settings.resultsHolder).find(".resultsList").remove();
        throwError(settings.noResultsMessage, settings, "noresults");        
    }
    if (settings.showLoader) { $(settings.loaderHolder).find(".loader").remove(); }
}
function throwError(errorMessage, settings, errorType) {    
    if (settings.messageAlert) {
        alert(errorMessage);
    }
    else {
        var messageHolder = document.createElement("span");
        $(settings.messageHolder).append(messageHolder);
        $(settings.messageHolder).find("span").html(errorMessage);
        $(settings.messageHolder).find("span").addClass("message " + (errorType == "error" ? "error" : "noResults"));
    }
}