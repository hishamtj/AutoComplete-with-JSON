//***********************************************************//
//Autocomplete search plugin for basic JSON v1.0 - 02/02/2019
//Hisham Tajeddine - hisham.tj@gmail.com
//***********************************************************//
$.fn.autocomplete = function (options) {
    this.wrap("<div class='searchHolder'></div>");
    var settings = $.extend({
        dataSource: "sample.json",
        dataSourceAllowCache: false,
        dataParameterName: "",
        minimumCharacters: 3,
        resultsHolder: ".searchHolder",
        noResultsMessage: "No results",
        errorMessage: "An error has occurred",
        messageAlert: true,
        messageHolder: null,
        showLoader: true,
        loaderHolder: ".searchHolder",
        resultJsonTextField: "name",
        resultJsonValueField: "id",
        resultClickFunctionName: "customClickFunction"
    }, options);
    return this.keyup(function (e) {
        if (e.keyCode != 38 && e.keyCode != 40 && e.keyCode != 13 && e.keyCode != 39 && e.keyCode != 37) {
            if (settings.dataSource && settings.dataSource.length > 0) {
                if (settings.resultJsonTextField && settings.resultJsonTextField.length > 0 && settings.resultJsonValueField && settings.resultJsonValueField.length > 0) {
                    var value = $(this).val();
                    if (!$(settings.resultsHolder)) {
                        settings.resultsHolder = $(this).parent();
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
                            $.ajax({
                                url: settings.dataSource,
                                dataType: "json",
                                success: function (data) {
                                    var filteredJson = $(data).filter(function (i, n) { return n[settings.resultJsonTextField].indexOf(value) > -1 });
                                    loadResults(filteredJson, settings);
                                },
                                error: function (e) {
                                    throwError(e.responseText, settings, "error");
                                }
                            });
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
        }
    });
};
function loadResults(filteredJson, settings) {
    $(settings.resultsHolder).find(".resultsList").remove();
    if (filteredJson != null && filteredJson.length > 0) {
        var list = $(settings.resultsHolder).append("<ul class='resultsList'></ul>").find("ul");
        $.each(filteredJson, function (idx, obj) {
            var linkText, linkValue;
            linkText = obj[settings.resultJsonTextField];
            linkValue = obj[settings.resultJsonValueField];
            list.append("<li><a data-value='" + linkValue + "'>" + linkText + "</a></li>");
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
    }
    else {
        throwError(settings.noResultsMessage, settings, "noresults");
    }
    if (settings.showLoader) { $(settings.loaderHolder).find(".loader").remove(); }
}
function throwError(errorMessage, settings, errorType) {
    if (settings.messageAlert) {
        alert(errorMessage);
    }
    else if (settings.messageHolder) {
        $(settings.messageHolder).html(errorMessage);
        $(settings.messageHolder).addClass("message " + (errorType == "error" ? "error" : "noResults"));
    }
}