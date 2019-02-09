# Autocomplete search plugin
This is an <input> field plugin that adds the capability to return results from a JSON file/URL or server side search JSON response page

The datasource of the plugin can be a JSON file (like the included sample.json), an online JSON URL (like the applied in the demo.html), or a page URL that returns a JSON response  
In both JSON file/URL datasources, the data filtration and search is done in the plugin itself (in the JS code), here the plugin serves both as a search and autosuggest component  
While in the case of a page URL, the search should be done on that page level and only the filtered JSON result should be returned to the plugin, here the plugin only serves as an autosuggest component

The results are displayed in an unordered list `<ul>` with the ability to use the keyboard up/down keys to move between the returned results, and the enter key to select one

Each result is displayed in an anchor link `<a>` with user defined data-attribute(s) containing the value(s) of the result, the result is clickable and the function name that is called can be defined in the plugin options  
  
All parameters are configurable using the plugin options, and any updates to how the plugin works or looks is available and open through the JS or CSS files
  
  
Options:
---------
#### **(R)** required
#### **(O)** optional
**dataSource:** *`string`*, the data source of the plugin  
**dataSourceAllowCache:** *`boolean`*, allow ajax call caching  
**dataParameterName:** *`string`*, the query string parameter name in case "dataSource" is set to a page URL  
**dataSourceSearchFields:** *`string`*, the JSON key title(s) holding the value(s) to be searched when "dataSource" is JSON file/URL (comma separated in case of multiple keys)  
**minimumCharacters:** *`integer`*, the minimum number of characters to trigger the plugin  
**resultsHolder:** *`string`*, the CSS class name or ID of the results holder element  
**noResultsMessage:** *`string`*, the message that shows when no results are found  
**errorMessage:** *`string`*, the message that shows when an error occurs during the ajax call  
**messageAlert:** *`boolean`*, show the error messages in a browser alert popup  
**messageHolder:** *`string`*, the CSS class name or ID of the error messages holder element  
**showLoader:** *`boolean`*, show a loader during the ajax request  
**loaderHolder:** *`string`*, the CSS class name or ID of the loader holder element  
**resultLinkTextFields:** *`string`*, the JSON key title(s) holding the text(s) that will appear on each result (comma separated in case of multiple keys)  
**resultLinkDataAttributes:** *`string`*, the JSON key title(s) holding the value(s) that will appear as data-attribute on each result (comma separated in case of multiple keys)  
**resultClickFunctionName:** *`string`*, the function name to be triggered on selected result click
  
  
Notes:
-------
1. JQuery should be included in the page using this plugin, as the plugin does not contain it itself to keep it as small as possible
2. the plugin works only at stage with simple JSON response objects (like the included example) so accessing multi-level objects within the JSON is still not available
3. the CSS and JS files are included as they are with no minification or obfuscation to facilitate the editing and updates as needed
4. all options mentioned above have their default values in the settings in can any of the required fields was missed, but if the parameters were not adjusted to fit the data you have, the plugin will not return any data, and might throw errors
5. for any suggestions/improvements, updates or bugs, please contact me on my [email](mailto:hisham.tj@gmail.com "Email")
