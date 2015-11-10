/**
 * Unit test script for Channel Line-up
 *
 * @author Joel Capillo <jcapillo@directv.com>
 * 
 */


var localhost = config.localhost; 
var featured_packages = data.featured_packages;
var channels = data.channels;
var ad_channels = AdSales.channels;
var data_type = data.type;

var processChannelNum = function(num){
  var x = parseInt(num);
  if (isNaN(x)) {
    return 0;
  }
  return x;
};


//test for Utility
QUnit.module( "Utility" );
var util = new Utility();
QUnit.test( "Testing \"isNumber\" function. The function should only return true on whole integers and false on strings, floats and other data types.", function( assert ) {  
  assert.ok( !util.isInteger('2e'), 'Testing alpha-numeric input "2e". Asserted that result should be false.' );
  assert.ok( !util.isInteger('abcd'), 'Testing alphabet input "abcd".  Asserted that result should be false.' );
  assert.ok( !util.isInteger('23'), 'Testing a string "23". Asserted that result should be false.' );
  assert.ok( util.isInteger(23), "Testing integer 23. Asserted that result should be true." );
  assert.ok( util.isInteger(-23), "Testing negative integer -23. Expected result should be true." );
  assert.ok( !util.isInteger(23.345), "Testing float 23.345. Asserted that result should be false." );
  assert.ok( util.isInteger(237800000000), "Testing on a very huge number 237800000000. Asserted that result should be true." );
  assert.ok( util.isInteger(0), "Testing on a zero integer value. Asserted that result should be true." );  
});

QUnit.test( "Testing \"randomizeClassName\" function. The function is expected to return a random class name by concatenating the parameter with the random integer from 0 to 2.", function( assert ) {
  var random_class = util.randomizeClassName('target');
  var expected_classnames = ['target0','target1','target2'];
  assert.ok( $.inArray(random_class, expected_classnames) != -1 ,"Testing if the result class name is one of the expected class names. Asserted that it contains one of the random class name on the array." );
  random_class = util.randomizeClassName('targeted');
  assert.equal( $.inArray(random_class, expected_classnames), -1 ,"Testing if the result class name is not one of the expected class names. Asserted that we cannot find the random class name from the array." );
});


QUnit.test( "Testing \"calculateTangentWidth\" function.", function( assert ) {
  var deg = 20;
  var height = 120;
  var result = util.calculateTangentWidth(deg,height);
  assert.ok( !isNaN(result) ,"Result value is "+ result+". Asserting that the result is a numeric value." );
  deg = 10;
  height = 500;
  result = util.calculateTangentWidth(deg,height);
  var expected_result = 88.16;  
  if (util.isIE()) {
    expected_result = expected_result - 2; //we need to remove 2 if IE
  }
  assert.equal(result,expected_result,'Testing if result is equal to '+ expected_result+'. Asserted that the output result is '+ result +'.');
  deg = 'invalid';
  assert.throws(function(){ util.calculateTangentWidth(deg,height) },/Enter a valid degree value./,'Testing for invalid degree value. Asserted that it threw an exception.');
  deg = 10;
  height = 'yo';
  assert.throws(function(){ util.calculateTangentWidth(deg,height) },/Enter a valid opposite height value./,'Testing for invalid opposite height value. Asserted that it threw an exception.');
  assert.throws(function(){ util.calculateTangentWidth(10) },/Enter a valid opposite height value./,'Testing for null opposite height value. Asserted that it threw an exception.');
  assert.throws(function(){ util.calculateTangentWidth() },/Enter a valid degree value./,'Testing for null parameter values. Asserted that it threw an exception.');
});

QUnit.test( "Testing \"normalizeNumLink\" function.", function( assert ) {
  var fixture = $( "#qunit-fixture" );
  fixture.append( '<ul><li class="numLink">one<li><li class="numLink activeLink">two<li><li class="numLink">three<li></ul>' );
  util.normalizeNumLink();
  var actives = [];
  $( ".numLink" ).each(function() {
        if ($(this).hasClass('activeLink')) {
          actives.push($(this));
        }
  });
  assert.equal(actives.length, 0,'Asserted that one of the active classes "activeLink" is removed from the DOM.');
  fixture.html('');
  fixture.append( '<ul><li class="numLink activeLink">one<li><li class="numLink activeLink">two<li><li class="numLink activeLink">three<li></ul>' );
  util.normalizeNumLink();
  var active_new = [];
  $( ".numLink" ).each(function() {
        if ($(this).hasClass('activeLink')) {
          active_new.push($(this));
        }
  });
  assert.equal(active_new.length, 2,'Testing if only one active classes "activeLink" out of three is removed from the DOM. Asserted that it should only remove the first activeLink found.');
});


//test for UrlFormatter
QUnit.module( "UrlFormatter" );
var formatter = new UrlFormatter(localhost);
var server = '/en-us/res/';
if (localhost) {
    server = "/en-us/res/"; //if we're testing in localhost, point this to the residential server
}

QUnit.test( "Testing \"formatUrl\" function. Function should only accept string as a parameter and will throw out an exception if not.", function( assert ) {
  assert.throws(function(){ formatter.formatUrl(123) },/Enter a valid url./,'Testing for invalid url with a value 123. Asserted that it threw an exception');
  var url = "javascript:document.location.href='"+server+"programming/cinemax.html'";
  
  var expected_url = 'http://agentanswercenterstg.directv.com'+server+'programming/cinemax.html';
  if (!localhost)
    expected_url = server+'programming/cinemax.html';
  
  assert.equal(formatter.formatUrl(url),expected_url, 'Testing for a valid input value '+url+' (old style). Asserted that the output string is the expected result.');
  var no_url = '';
  assert.equal(formatter.formatUrl(no_url),no_url, 'Testing if the string has zero length. Asserted that the result is also empty string.');
  assert.throws(function(){ formatter.formatUrl() }, /Enter a valid url./, 'Testing if the input is null value. Asserted that it threw an exception.');
  
  url = server+"programming/cinemax.html";
  assert.equal(formatter.formatUrl(url),expected_url, 'Testing for a different valid input value '+url+'. Asserted that the output string is the expected result.');
  
  url = server+"'programming/cinemax.html'";
  assert.equal(formatter.formatUrl(url),expected_url, 'Testing for a different valid input value '+url+'. Asserted that the output string is the expected result.');
  
  url = '"' + server+"programming/cinemax.html" + '"';
  assert.equal(formatter.formatUrl(url),expected_url, 'Testing for a different valid input value enclosed in double quotes '+url+'. Asserted that the output string is the expected result.');
  
  url = "javascript:document.location.href='http://agentanswercenterstg.directv.com/en-us/res/programming/cinemax.html'";
  assert.equal(formatter.formatUrl(url),expected_url, 'Testing for a different valid input value '+url+'. Asserted that the output string is the expected result.');
});

QUnit.module( "messageBox" );
QUnit.test( "Testing the \"createMsg\" function. Function only accepts a positive integer parameter.", function( assert ) {
   //create dependencies for injection
   var fixture = $( "#qunit-fixture" );
   fixture.append('<div id="container"></div>');
   fixture.append('<div id="messageBox"></div>');
   var grid = new gridTable(config.rowHeightTall,'container',featured_packages);
   
   //start our test
   var msg_box = new messageBox('messageBox', grid);
   var count = 'yo';
   assert.throws(function(){ msg_box.createMsg(count) },/Enter a valid count./,'Testing for invalid count result "'+count+'". Asserted that it threw an exception.');
   
   count = 8.007;
   assert.throws(function(){ msg_box.createMsg(count) },/Enter a valid count./,'Testing for invalid count result "'+count+'". Asserted that it threw an exception.');
   
   count = -1;
   assert.throws(function(){ msg_box.createMsg(count) },/Enter a valid count./,'Testing for invalid count result "'+count+'". Asserted that it threw an exception.');
   
   count = 0;
   msg_box.createMsg(count);
   var html = msg_box.self.html();   
   assert.ok(html.length > 0, 'Testing if there\'s a message on the box for valid count '+count+'. Asserted that the message found is "' + html +'"');
   assert.ok(html.indexOf('0 channel') !== -1, 'Testing if message contains a string "0 channels". Asserted that the message found is "' + html +'"');
   
   count = 23786869;
   msg_box.createMsg(count);
   var html = msg_box.self.html();
   assert.ok(html.length > 0, 'Testing if there\'s a message on the box for valid count '+count+'. Asserted that the message found is "' + html +'"');
   assert.ok(html.indexOf(count+' chan') !== -1, 'Testing if message contains a string "'+count+' channels". Asserted that the message found is "' + html +'"');
});


QUnit.test( "Testing the \"createPackageMsg\" function. Function only accepts a positive integer parameter and a boolean if hd or not.", function( assert ) {
   //inject dependencies
   var fixture = $( "#qunit-fixture" );
   fixture.append('<div id="container"></div>');
   fixture.append('<div id="messageBox"></div>');
   
   var grid = new gridTable(config.rowHeightTall,'container',featured_packages);
   
   //start our test
   var msg_box = new messageBox('messageBox', grid);
   var count = 'yo';
   assert.throws(function(){ msg_box.createPackageMsg(count) },/Enter a valid count./,'Testing for invalid count result "'+count+'". Asserted that it threw an exception.');
   
   count = 8.007;
   assert.throws(function(){ msg_box.createPackageMsg(count) },/Enter a valid count./,'Testing for invalid count result "'+count+'". Asserted that it threw an exception.');
   
   count = -1;
   assert.throws(function(){ msg_box.createPackageMsg(count) },/Enter a valid count./,'Testing for invalid count result "'+count+'". Asserted that it threw an exception.');
   
   count = 0; //a valid count
   var is_hd = 'true';
   assert.throws(function(){ msg_box.createPackageMsg(count,is_hd) },/Enter a valid boolean value if hd or not./,'Testing for invalid boolean parameter "'+is_hd+'". Asserted that it threw an exception.');
   
   is_hd = true;
   msg_box.grid.package_channels = 'p1'; //inject a dependency
   msg_box.createPackageMsg(count,is_hd);
   var html = msg_box.self.html();
   assert.ok(html.indexOf('HD channels') !== -1, 'Testing if message contains a string "HD channels" for valid parameters. Asserted that the message found is "' + html +'"');
   
   is_hd = false;
   msg_box.grid.package_channels = 'p2'; //inject a dependency
   msg_box.createPackageMsg(count,is_hd);
   var html = msg_box.self.html();
   assert.ok(html.indexOf('HD channels') === -1, 'Testing if message contains no string "HD channels" for valid parameters. Asserted that the message found is "' + html +'"');
});

QUnit.test( "Testing the \"clear\" function.", function( assert ) {
    //inject dependencies
   var fixture = $( "#qunit-fixture" );
   fixture.append('<div id="container"></div>');
   fixture.append('<div id="messageBox">Hello Everyone</div>');
   
   var grid = new gridTable(config.rowHeightTall,'container',featured_packages);
   var msg_box = new messageBox('messageBox', grid);
   msg_box.clear();
   var html = msg_box.self.html();
   
   assert.deepEqual(html, 'To look up multiple networks, use a comma (,) to separate search terms.', 'Testing clear function. Asserted that the message box reverts to: "To look up multiple networks, use a comma (,) to separate search terms."');   
});



QUnit.module( "searchBox" );
QUnit.test( "Testing the \"autoSearch\" function.", function( assert ) {
   //inject dependencies
   var fixture = $( "#qunit-fixture" );
   fixture.append('<div id="container"></div>');
   fixture.append('<div id="containerSmall"></div>');
   fixture.append('<div id="messageBox"></div>');
   fixture.append('<input type=text id="testBox"/>');
   fixture.append('<a id="reset">reset</a>');
   
    //initialize the small(top) grid
    var small_grid = new smallGrid(230,'containerSmall',featured_packages);
    small_grid.setOptions(true,false);
    small_grid.setColumns();    
    small_grid.setChannels();
    small_grid.render();
    
    //small grid columns are the same with the big grid
    var columns = small_grid.getColumns();
    
    //initialize the big grid
    var big_grid = new bigGrid(480,'container',featured_packages);
    big_grid.setOptions(true,false);
    big_grid.setColumns(columns);   
    big_grid.setChannels(channels);
    big_grid.setChannels(ad_channels);
    big_grid.render();
    
    big_grid.environment = 'test';

    var search_box = new searchBox('testBox',big_grid,'messageBox','reset','active');
    search_box.autoSearch(); //bind the keyup event instantiates new reset
    
    var value_to_search = '520';
    
    var e = jQuery.Event( "keyup" );
    e.keyCode = 50;
    //assign a value
    $("#testBox").val(value_to_search);
    // trigger the keyup event
    $("#testBox").trigger(e);
    
    var html = $('#messageBox').html();
    assert.ok(html.length > 0, 'Testing if there\'s a search result on the box message when searching for term "'+value_to_search+'". Asserting that the message found is '+html);
    assert.equal(html.match(/\d+/)[0], 1, "Asserting that there is "+html.match(/\d+/)[0]+" search result found for term \""+value_to_search+"\".");
    
    
    value_to_search = 'a';
    
    var e = jQuery.Event( "keyup" );
    e.keyCode = 50;
    //assign a value
    $("#testBox").val(value_to_search);
    // trigger the keyup event
    $("#testBox").trigger(e);
    
    var html = $('#messageBox').html();
    assert.ok(html.length > 0, 'Testing if there\'s a search result on the box message when searching for term "'+value_to_search+'". Asserting that the message found is '+html);
    assert.equal(html.match(/\d+/)[0], big_grid.dataView.getLength(), "Asserting that there are "+html.match(/\d+/)[0]+" search results for term \""+value_to_search+"\".");
    
    
    value_to_search = 'a------';
    
    var e = jQuery.Event( "keyup" );
    e.keyCode = 50;
    //assign a value
    $("#testBox").val(value_to_search);
    // trigger the keyup event
    $("#testBox").trigger(e);
    
    var html = $('#messageBox').html();
    assert.ok(html.length > 0, 'Testing if there\'s a search result on the box message when searching for term "'+value_to_search+'". Asserting that the message found is '+html);
    assert.equal(html.match(/\d+/)[0], big_grid.dataView.getLength(), "Asserting that there are "+html.match(/\d+/)[0]+" search results for term \""+value_to_search+"\".");

    function escapeRegExp(str) {
      return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
    }

    var testCodes = [27];

    $("#testBox").val("");
    var boxValue = $("#testBox").val();
    $.each(testCodes, function(i, v) {
        var e = jQuery.Event('keyup', {keyCode: v});
        $('#' + search_box.resetBtnId).removeClass();
        var newString = String.fromCharCode(e.keyCode);
        //$("#testBox").val(escapeRegExp(newString))
        jQuery('#testBox').trigger(e);
        assert.notEqual($('#' + search_box.resetBtnId).attr("class"), search_box.activeClass, "On " + e.type + ", the keycode " + v + " (" + newString + ") does NOT add the class \"" + search_box.activeClass + "\" when the textbox says: " + (boxValue.replace(/ /g, '\u00a0') == '' ? "empty" : boxValue.replace(/ /g, '\u00a0')) + ".");
    });

    $("#testBox").val('              ');
    var boxValue = $("#testBox").val();
    $.each(testCodes, function(i, v) {
        var e = jQuery.Event('keyup', {keyCode: v});
        $('#' + search_box.resetBtnId).removeClass();
        var newString = String.fromCharCode(e.keyCode);
        //$("#testBox").val(escapeRegExp(newString))
        jQuery('#testBox').trigger(e);
        assert.notEqual($('#' + search_box.resetBtnId).attr("class"), search_box.activeClass, "On " + e.type + ", the keycode " + v + " (" + newString + ") does NOT add the class \"" + search_box.activeClass + "\" when the textbox says: " + (boxValue.replace(/ /g, '\u00a0') == '' ? "empty" : boxValue.replace(/ /g, '\u00a0')) + ".");
    });

    $("#testBox").val('espn');
    var boxValue = $("#testBox").val();
    $.each(testCodes, function(i, v) {
        var e = jQuery.Event('keyup', {keyCode: v});
        $('#' + search_box.resetBtnId).removeClass();
        var newString = String.fromCharCode(e.keyCode);
        //$("#testBox").val(escapeRegExp(newString))
        jQuery('#testBox').trigger(e);
        assert.notEqual($('#' + search_box.resetBtnId).attr("class"), search_box.activeClass, "On " + e.type + ", the keycode " + v + " (" + newString + ") does NOT add the class \"" + search_box.activeClass + "\" when the textbox says: " + (boxValue.replace(/ /g, '\u00a0') == '' ? "empty" : boxValue.replace(/ /g, '\u00a0')) + ".");
    });

    var testCodes = [8,46];

    $("#testBox").val("");
    var boxValue = $("#testBox").val();
    $.each(testCodes, function(i, v) {
        var e = jQuery.Event('keyup', {keyCode: v});
        $('#' + search_box.resetBtnId).removeClass();
        var newString = String.fromCharCode(v);
        //$("#testBox").val(escapeRegExp(newString))
        jQuery('#testBox').trigger(e);
        assert.notEqual($('#' + search_box.resetBtnId).attr("class"), search_box.activeClass, "On " + e.type + ", the keycode " + v + " (" + newString + ") does NOT add the class \"" + search_box.activeClass + "\" when the textbox says: " + (boxValue.replace(/ /g, '\u00a0') == '' ? "empty" : boxValue.replace(/ /g, '\u00a0')) + ".");
    });

    $("#testBox").val('              ');
    var boxValue = $("#testBox").val();
    $.each(testCodes, function(i, v) {
        var e = jQuery.Event('keyup', {keyCode: v});
        $('#' + search_box.resetBtnId).removeClass();
        var newString = String.fromCharCode(v);
        //$("#testBox").val(escapeRegExp(newString))
        jQuery('#testBox').trigger(e);
        assert.notEqual($('#' + search_box.resetBtnId).attr("class"), search_box.activeClass, "On " + e.type + ", the keycode " + v + " (" + newString + ") does NOT add the class \"" + search_box.activeClass + "\" when the textbox says: " + (boxValue.replace(/ /g, '\u00a0') == '' ? "empty" : boxValue.replace(/ /g, '\u00a0')) + ".");
    });

    $("#testBox").val('espn');
    var boxValue = $("#testBox").val();
    $.each(testCodes, function(i, v) {
        var e = jQuery.Event('keyup', {keyCode: v});
        $('#' + search_box.resetBtnId).removeClass();
        var newString = String.fromCharCode(v);
        //$("#testBox").val(escapeRegExp(newString))
        jQuery('#testBox').trigger(e);
        assert.equal($('#' + search_box.resetBtnId).attr("class"), search_box.activeClass, "On " + e.type + ", the keycode " + v + " (" + newString + ") DOES add the class \"" + search_box.activeClass + "\" when the textbox says: " + (boxValue.replace(/ /g, '\u00a0') == '' ? "empty" : boxValue.replace(/ /g, '\u00a0')) + ".");
    });

    var testCodes = [48,49,50,51,52,53,54,55,56,57,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90];

    $("#testBox").val('espn');
    var boxValue = $("#testBox").val();
    $.each(testCodes, function(i, v) {
        var e = jQuery.Event('keyup', {keyCode: v});
        $('#' + search_box.resetBtnId).removeClass();
        var newString = String.fromCharCode(v);
        //$("#testBox").val(escapeRegExp(newString))
        jQuery('#testBox').trigger(e);
        assert.equal($('#' + search_box.resetBtnId).attr("class"), search_box.activeClass, "On " + e.type + ", the keycode " + v + " (" + newString + ") DOES add the class \"" + search_box.activeClass + "\" when the textbox says: " + (boxValue.replace(/ /g, '\u00a0') == '' ? "empty" : boxValue.replace(/ /g, '\u00a0')) + ".");
    });

    var testCodes = [32];

    $("#testBox").val('');
    var boxValue = $("#testBox").val();
    $.each(testCodes, function(i, v) {
        var e = jQuery.Event('keyup', {keyCode: v});
        $('#' + search_box.resetBtnId).removeClass();
        var newString = String.fromCharCode(v);
        //$("#testBox").val(escapeRegExp(newString))
        jQuery('#testBox').trigger(e);
        assert.notEqual($('#' + search_box.resetBtnId).attr("class"), search_box.activeClass, "On " + e.type + ", the keycode " + v + " (" + newString + ") does NOT add the class \"" + search_box.activeClass + "\" when the textbox says: " + (boxValue.replace(/ /g, '\u00a0') == '' ? "empty" : boxValue.replace(/ /g, '\u00a0')) + ".");
    });

    $("#testBox").val('              ');
    var boxValue = $("#testBox").val();
    $.each(testCodes, function(i, v) {
        var e = jQuery.Event('keyup', {keyCode: v});
        $('#' + search_box.resetBtnId).removeClass();
        var newString = String.fromCharCode(v);
        //$("#testBox").val(escapeRegExp(newString))
        jQuery('#testBox').trigger(e);
        assert.notEqual($('#' + search_box.resetBtnId).attr("class"), search_box.activeClass, "On " + e.type + ", the keycode " + v + " (" + newString + ") does NOT add the class \"" + search_box.activeClass + "\" when the textbox says: " + (boxValue.replace(/ /g, '\u00a0') == '' ? "empty" : boxValue.replace(/ /g, '\u00a0')) + ".");
    });

    $("#testBox").val('comedy');
    var boxValue = $("#testBox").val();
    $.each(testCodes, function(i, v) {
        var e = jQuery.Event('keyup', {keyCode: v});
        $('#' + search_box.resetBtnId).removeClass();
        var newString = String.fromCharCode(v);
        //$("#testBox").val(escapeRegExp(newString))
        jQuery('#testBox').trigger(e);
        assert.equal($('#' + search_box.resetBtnId).attr("class"), search_box.activeClass, "On " + e.type + ", the keycode " + v + " (" + newString + ") DOES add the class \"" + search_box.activeClass + "\" when the textbox says: " + (boxValue.replace(/ /g, '\u00a0') == '' ? "empty" : boxValue.replace(/ /g, '\u00a0')) + ".");
    });

    var testCodes = [13];

    $("#testBox").val('');
    var boxValue = $("#testBox").val();
    $.each(testCodes, function(i, v) {
        var e = jQuery.Event('keyup', {keyCode: v});
        $('#' + search_box.resetBtnId).removeClass();
        var newString = String.fromCharCode(v);
        //$("#testBox").val(escapeRegExp(newString))
        jQuery('#testBox').trigger(e);
        assert.notEqual($('#' + search_box.resetBtnId).attr("class"), search_box.activeClass, "On " + e.type + ", the keycode " + v + " (" + newString + ") does NOT add the class \"" + search_box.activeClass + "\" when the textbox says: " + (boxValue.replace(/ /g, '\u00a0') == '' ? "empty" : boxValue.replace(/ /g, '\u00a0')) + ".");
    });

    $("#testBox").val('              ');
    var boxValue = $("#testBox").val();
    $.each(testCodes, function(i, v) {
        var e = jQuery.Event('keyup', {keyCode: v});
        $('#' + search_box.resetBtnId).removeClass();
        var newString = String.fromCharCode(v);
        //$("#testBox").val(escapeRegExp(newString))
        jQuery('#testBox').trigger(e);
        assert.notEqual($('#' + search_box.resetBtnId).attr("class"), search_box.activeClass, "On " + e.type + ", the keycode " + v + " (" + newString + ") does NOT add the class \"" + search_box.activeClass + "\" when the textbox says: " + (boxValue.replace(/ /g, '\u00a0') == '' ? "empty" : boxValue.replace(/ /g, '\u00a0')) + ".");
    });

    $("#testBox").val('comedy');
    var boxValue = $("#testBox").val();
    $.each(testCodes, function(i, v) {
        var e = jQuery.Event('keyup', {keyCode: v});
        $('#' + search_box.resetBtnId).removeClass();
        var newString = String.fromCharCode(v);
        //$("#testBox").val(escapeRegExp(newString))
        jQuery('#testBox').trigger(e);
        assert.equal($('#' + search_box.resetBtnId).attr("class"), search_box.activeClass, "On " + e.type + ", the keycode " + v + " (" + newString + ") DOES add the class \"" + search_box.activeClass + "\" when the textbox says: " + (boxValue.replace(/ /g, '\u00a0') == '' ? "empty" : boxValue.replace(/ /g, '\u00a0')) + ".");
    });

    $("#testBox").val('');
    var boxValue = $("#testBox").val();
    $.each(testCodes, function(i, v) {
        var e = jQuery.Event('keydown', {keyCode: v});
        $('#' + search_box.resetBtnId).removeClass();
        var newString = String.fromCharCode(v);
        //$("#testBox").val(escapeRegExp(newString))
        jQuery('#testBox').trigger(e);
        assert.notEqual($('#' + search_box.resetBtnId).attr("class"), search_box.activeClass, "On " + e.type + ", the keycode " + v + " (" + newString + ") does NOT add the class \"" + search_box.activeClass + "\" when the textbox says: " + (boxValue.replace(/ /g, '\u00a0') == '' ? "empty" : boxValue.replace(/ /g, '\u00a0')) + ".");
    });

    $("#testBox").val('              ');
    var boxValue = $("#testBox").val();
    $.each(testCodes, function(i, v) {
        var e = jQuery.Event('keydown', {keyCode: v});
        $('#' + search_box.resetBtnId).removeClass();
        var newString = String.fromCharCode(v);
        //$("#testBox").val(escapeRegExp(newString))
        jQuery('#testBox').trigger(e);
        assert.notEqual($('#' + search_box.resetBtnId).attr("class"), search_box.activeClass, "On " + e.type + ", the keycode " + v + " (" + newString + ") does NOT add the class \"" + search_box.activeClass + "\" when the textbox says: " + (boxValue.replace(/ /g, '\u00a0') == '' ? "empty" : boxValue.replace(/ /g, '\u00a0')) + ".");
    });

    $("#testBox").val('comedy');
    var boxValue = $("#testBox").val();
    $.each(testCodes, function(i, v) {
        var e = jQuery.Event('keydown', {keyCode: v});
        $('#' + search_box.resetBtnId).addClass('active');
        var newString = String.fromCharCode(v);
        //$("#testBox").val(escapeRegExp(newString))
        jQuery('#testBox').trigger(e);
        assert.equal($('#' + search_box.resetBtnId).attr("class"), search_box.activeClass, "On " + e.type + ", the keycode " + v + " (" + newString + ") DOES add the class \"" + search_box.activeClass + "\" when the textbox says: " + (boxValue.replace(/ /g, '\u00a0') == '' ? "empty" : boxValue.replace(/ /g, '\u00a0')) + ".");
    });

    //combined delimiter test
    value_to_search = 'mtv#216|217';
    var expected_length = 0; //the search term if split/exploded is 3
    
    var e = jQuery.Event( "keyup" );
    e.which = 50;
    //assign a value
    $("#testBox").val(value_to_search);
    // trigger the keyup event
    $("#testBox").trigger(e);
    
    var html = $('#messageBox').html();
    assert.ok(html.length > 0, 'Testing if there\'s a search result on the box message when searching for term "'+value_to_search+'". Asserting that the message found is '+ html);
    assert.ok(big_grid.search_terms.length === 0, 'Asserting that search terms array is not populated.');
    assert.ok(big_grid.search_terms.length === expected_length, 'Asserting that search terms array is the same length as expected which is ' + expected_length + '.');
    
    //more combined test
    value_to_search = 'mtv#216|217*diy#nba#cnn';
    var expected_length = 0; //the search term if split/exploded is 6
    
    var e = jQuery.Event( "keyup" );
    e.which = 50;
    //assign a value
    $("#testBox").val(value_to_search);
    // trigger the keyup event
    $("#testBox").trigger(e);
    
    var html = $('#messageBox').html();
    assert.ok(html.length > 0, 'Testing if there\'s a search result on the box message when searching for term "'+value_to_search+'". Asserting that the message found is '+ html);
    assert.ok(big_grid.search_terms.length === 0, 'Asserting that search terms array is not populated.');
    assert.ok(big_grid.search_terms.length === expected_length, 'Asserting that search terms array is the same length as expected which is ' + expected_length + '.');
    
    //test for single delimiter
    value_to_search = 'mtv,216,217';
    var expected_length = 3; //the search term if split/exploded is 3
    
    var e = jQuery.Event( "keyup" );
    e.which = 50;
    //assign a value
    $("#testBox").val(value_to_search);
    // trigger the keyup event
    $("#testBox").trigger(e);
    
    var html = $('#messageBox').html();
    assert.ok(html.length > 0, 'Testing if there\'s a search result on the box message when searching for term "'+value_to_search+'". Asserting that the message found is '+ html);
    assert.ok(big_grid.search_terms.length > 0, 'Asserting that search terms array is populated.');
    assert.ok(big_grid.search_terms.length === expected_length, 'Asserting that search terms array is the same length as expected which is ' + expected_length + '.');
    

});


QUnit.module( "gridTable - Parent Class" );

QUnit.test( "Testing the Class \"initialization\" process.", function( assert ) {
   assert.throws(function(){ new gridTable(230,'container') },/Featured packages could not be empty./,'Testing gridTable init with undefined featured packages. Asserted that it threw an exception.');
   assert.throws(function(){ new gridTable(230,'container',[]) },/Featured packages could not be empty./,'Testing gridTable init with empty featured packages. Asserted that it threw an exception.');
});

QUnit.test( "Testing the \"setColumns\" function. The function to call for setting the grids column.", function( assert ) {
   //inject dependencies
   var grid = new gridTable(230,'container',featured_packages);
   grid.setOptions(true,false);
   
   var columns = grid.getColumns();
   
   assert.deepEqual(columns.length, 0, "Asserting that there are "+columns.length+" columns before calling setColumn function.");
   
   grid.setColumns();
   
   var columns = grid.getColumns();
   
   var fixed_column_count =  4; //4 is the number of fixed width columns 
   var expected_columns_count = featured_packages.length + fixed_column_count;  
   assert.deepEqual(columns.length, expected_columns_count, "Asserting that there are "+columns.length+" columns after calling setColumn function. "+fixed_column_count+" fixed columns and " + featured_packages.length +" featured packages columns.");
   
});


QUnit.assert.contains = function( needle, haystack, message ) {
  var actual = haystack.indexOf(needle) > -1;
  this.push(actual, actual, needle, message);
};

QUnit.module( "bigGrid - Inherits From gridTable Class" );
QUnit.test( "Testing the Class \"initialization\" process.", function( assert ) {
   assert.throws(function(){ new bigGrid(230,'container') },/Featured packages could not be empty./,'Testing bigGrid init with undefined featured packages. Asserted that it threw an exception.');
   assert.throws(function(){ new bigGrid(230,'container',[]) },/Featured packages could not be empty./,'Testing bigGrid init with empty featured packages. Asserted that it threw an exception.');
});
QUnit.test( "Testing the \"setChannels\" function. This function is responsible for setting the channels(data) on the grid.", function( assert ) {
   //inject dependencies
   var grid = new bigGrid(230,'container',featured_packages);
   grid.setOptions(true,false);
   grid.setChannels(channels); //set the regular channels
   grid.setChannels(ad_channels); //set the ad channels
   
   var expected_channels_count = channels.length + ad_channels.length;
   var data = grid.getChannels();
   assert.deepEqual(data.length, expected_channels_count, "Asserting that there are "+expected_channels_count+" grid rows after calling setChannels function.");
   
   //start checking data integrity inside the big grid  
   var util = new Utility();
   if (!util.isIE()) {
      var fix_columns = ['channel_name','anchors','channel_number','genre','call_letters'];
      $.each(data, function(i, v) {
         var row = data[i];     
          
         for(var n = 0; n < featured_packages.length; n++ ){ //loop through all featured packages
            var featured_package = featured_packages[n];
            var num = n + 1;
            var property = 'p' + num;
            assert.contains( property, Object.keys(row), "Asserted that row "+(i + 1)+" contains "+property+" key." );
         }
          
         for(var ix = 0; ix < fix_columns.length; ix++ ){
            var prop_in = fix_columns[ix];
            assert.contains( prop_in, Object.keys(row), "Asserted that the row "+(i + 1)+" contains "+prop_in+" key." );
         }
      });   
   }
    
});


QUnit.module( "smallGrid - Inherits From gridTable Class" );
QUnit.test( "Testing the Class \"initialization\" process.", function( assert ) {
   assert.throws(function(){ new smallGrid(230,'container') },/Featured packages could not be empty./,'Testing smallGrid init with undefined featured packages. Asserted that it threw an exception.');
   assert.throws(function(){ new smallGrid(230,'container',[]) },/Featured packages could not be empty./,'Testing smallGrid init with empty featured packages. Asserted that it threw an exception.');
});

QUnit.test( "Testing the \"setChannels\" function. This function is responsible for setting the channels(data) on the grid.", function( assert ) {
   //inject dependencies
   var grid = new smallGrid(230,'container',featured_packages);
   grid.setOptions(true,false);
   grid.setChannels(); //set the regular channels
  
   var expected_row_count = 2;
   var data = grid.getChannels();
   assert.deepEqual(data.length, expected_row_count, "Asserting that there are "+expected_row_count+" grid rows after calling setChannels function.");
   
   //start checking data integrity inside the small grid
  var fix_columns = ['channel_name','channel_number','genre','call_letters'];
 
  $.each(data, function(i, v) {
        var row = data[i];
        for(var n = 0; n < featured_packages.length; n++ ){ //loop through all featured packages
           var featured_package = featured_packages[n];
           var num = n + 1;
           var property = 'p' + num;
           assert.contains( property, Object.keys(row), "Asserted that the row "+(i + 1)+" contains "+property+" key." );
           if (i > 0) {
             assert.deepEqual(featured_package.total_channels,parseInt(row[property]),'Asserted that total channels is '+featured_package.total_channels + " for " + featured_package.display_name);
           }
           else
             assert.deepEqual(featured_package.hd_channels,parseInt(row[property]),'Asserted that hd channels is '+featured_package.hd_channels+ " for " + featured_package.display_name);
        }
         
        for(var ix = 0; ix < fix_columns.length; ix++ ){
           var prop_in = fix_columns[ix];
           assert.contains( prop_in, Object.keys(row), "Asserted that the row "+(i + 1)+" contains "+prop_in+" key." );
        }
  });
 
});

QUnit.module( "packageFilter" );
QUnit.test( "Testing the \"filterChannelsByPackage\" function for HD channels count only. The function requires a property parameter and a boolean parameter.", function( assert ) {
    //inject dependencies
    var fixture = $( "#qunit-fixture" );
    fixture.append('<div id="container"></div>');
    fixture.append('<div id="containerSmall"></div>');
    fixture.append('<div id="messageBox"></div>');
    fixture.append('<input type=text id="testBox"/>');
   
    //initialize the small(top) grid
    var small_grid = new smallGrid(230,'containerSmall',featured_packages);
    small_grid.setOptions(true,false);
    small_grid.setColumns();    
    small_grid.setChannels();
    small_grid.render();
    
    //small grid columns are the same with the big grid
    var columns = small_grid.getColumns();
    
    //initialize the big grid
    var big_grid = new bigGrid(480,'container',featured_packages,data_type);
    big_grid.setOptions(true,false);
    big_grid.setColumns(columns);   
    big_grid.setChannels(channels);
    big_grid.setChannels(ad_channels);
    big_grid.render();
    
    var msg_box = new messageBox('messageBox', big_grid);
    var package_filter = new packageFilter(big_grid,msg_box);
    $.each(featured_packages, function(i, v) {      
       package_filter.filterChannelsByPackage('p' + (i + 1) + '||HD',true);
       var msg = $('#messageBox').html();
       var name = featured_packages[i].display_name;
       var count = featured_packages[i].hd_channels;
       assert.deepEqual(big_grid.dataView.getLength(),count,'Asserted that hd channels count on the grid is the same as the hd channels on the data source which is "'+big_grid.dataView.getLength()+'". The package name is "'+name+'"');
    });   
});

QUnit.test( "Testing the \"filterChannelsByPackage\" function for total channels count on a package. The function requires a property parameter and a boolean parameter.", function( assert ) {
    //inject dependencies
    var fixture = $( "#qunit-fixture" );
    fixture.append('<div id="container"></div>');
    fixture.append('<div id="containerSmall"></div>');
    fixture.append('<div id="messageBox"></div>');
    fixture.append('<input type=text id="testBox"/>');
   
    //initialize the small(top) grid
    var small_grid = new smallGrid(230,'containerSmall',featured_packages);
    small_grid.setOptions(true,false);
    small_grid.setColumns();    
    small_grid.setChannels();
    small_grid.render();
    
    //small grid columns are the same with the big grid
    var columns = small_grid.getColumns();
    
    //initialize the big grid
    var big_grid = new bigGrid(480,'container',featured_packages);
    big_grid.setOptions(true,false);
    big_grid.setColumns(columns);   
    big_grid.setChannels(channels);
    big_grid.setChannels(ad_channels);
    big_grid.render();
    
    var msg_box = new messageBox('messageBox', big_grid);
    var package_filter = new packageFilter(big_grid,msg_box); 
    
    $.each(featured_packages, function(i, v) {      
       package_filter.filterChannelsByPackage('p' + (i + 1),true);
       var msg = $('#messageBox').html();
       var name = featured_packages[i].display_name;
       var count = featured_packages[i].total_channels;
       assert.deepEqual(big_grid.dataView.getLength(),count,'Asserted that total channels count on the grid is the same as the total channels on the data source which is "'+big_grid.dataView.getLength()+'". The package name is "'+name+'"');
    });    
});


QUnit.module( "columnSorter" );
QUnit.test( "Testing the \"sortByChannelName\". Function called when clicking the channel name sort button. ", function( assert ) {
    //inject dependencies
    var fixture = $( "#qunit-fixture" );
    fixture.append('<div id="container"></div>');
    fixture.append('<div id="containerSmall"></div>');
    fixture.append('<div id="messageBox"></div>');
    fixture.append('<input type=text id="testBox"/>');
   
    //initialize the small(top) grid
    var small_grid = new smallGrid(230,'containerSmall',featured_packages);
    small_grid.setOptions(true,false);
    small_grid.setColumns();    
    small_grid.setChannels();
    small_grid.render();
    
    //small grid columns are the same with the big grid
    var columns = small_grid.getColumns();
    
    //initialize the big grid
    var big_grid = new bigGrid(480,'container',featured_packages);
    big_grid.setOptions(true,false);
    big_grid.setColumns(columns);   
    big_grid.setChannels(channels);
    big_grid.setChannels(ad_channels);
    big_grid.render();
    
     //identify all sorter controls
    var nameSorter = $('#nameSorter');
    var channelNumberSorter = $('#channelNumberSorter');
    var callLetterSorter = $('#callLetterSorter');
    var genreSorter = $('#genreSorter');
    var channelNameSortStart = $('#channelNameSortStart');
    var channelNumberSortStart = $('#channelNumberSortStart');
    var callLetterSortStart = $('#callLetterSortStart');
    var genreSortStart = $('#genreSortStart');
    //initialize column sorting
    var column_sorter = new columnSorter('channel_name',nameSorter,channelNumberSorter,callLetterSorter,genreSorter,
                                channelNameSortStart,channelNumberSortStart,callLetterSortStart,genreSortStart);
    
    var channel_name_before = big_grid.dataView.getItem(0).channel_name;
    column_sorter.sortByChannelName();
    var channel_name_after = big_grid.dataView.getItem(0).channel_name;
   
    column_sorter.sortByChannelName();
    var first = big_grid.dataView.getItem(0).channel_name;
    var last = big_grid.dataView.getItem(big_grid.dataView.getLength() - 1).channel_name;
   
    if (channel_name_after.toUpperCase() > channel_name_before.toUpperCase()) { //we just sorted from higher to lower
      assert.ok(last.toUpperCase() > first.toUpperCase(), 'Sorted from lower to higher. Asserted that the first channel name is "'+first+'" and the last channel name is "'+last+'."');
      column_sorter.sortByChannelName();
      first = big_grid.dataView.getItem(0).channel_name;
      last = big_grid.dataView.getItem(big_grid.dataView.getLength() - 1).channel_name;
      assert.ok(last.toUpperCase() < first.toUpperCase(), 'Sorted from higher to lower. Asserted that the first channel name is "'+first+'" and the last channel name is "'+last+'."');
    }
    else{
      assert.ok(last.toUpperCase() < first.toUpperCase(), 'Sorted from higher to lower. Asserted that the first channel name is "'+first+'" and the last channel name is "'+last+'."');
      column_sorter.sortByChannelName();
      first = big_grid.dataView.getItem(0).channel_name;
      last = big_grid.dataView.getItem(big_grid.dataView.getLength() - 1).channel_name;
      assert.ok(last.toUpperCase() > first.toUpperCase(), 'Sorted from lower to higher. Asserted that the first channel name is "'+first+'" and the last channel name is "'+last+'."');
    }
    
});

QUnit.test( "Testing the \"sortByChannelNumber\". Function called when clicking the channel number sort button. ", function( assert ) {
    //inject dependencies
    var fixture = $( "#qunit-fixture" );
    fixture.append('<div id="container"></div>');
    fixture.append('<div id="containerSmall"></div>');
    fixture.append('<div id="messageBox"></div>');
    fixture.append('<input type=text id="testBox"/>');
   
    //initialize the small(top) grid
    var small_grid = new smallGrid(230,'containerSmall',featured_packages);
    small_grid.setOptions(true,false);
    small_grid.setColumns();    
    small_grid.setChannels();
    small_grid.render();
    
    //small grid columns are the same with the big grid
    var columns = small_grid.getColumns();
    
    //initialize the big grid
    var big_grid = new bigGrid(480,'container',featured_packages);
    big_grid.setOptions(true,false);
    big_grid.setColumns(columns);   
    big_grid.setChannels(channels);
    big_grid.setChannels(ad_channels);
    big_grid.render();
    
     //identify all sorter controls
    var nameSorter = $('#nameSorter');
    var channelNumberSorter = $('#channelNumberSorter');
    var callLetterSorter = $('#callLetterSorter');
    var genreSorter = $('#genreSorter');
    var channelNameSortStart = $('#channelNameSortStart');
    var channelNumberSortStart = $('#channelNumberSortStart');
    var callLetterSortStart = $('#callLetterSortStart');
    var genreSortStart = $('#genreSortStart');
    //initialize column sorting
    var column_sorter = new columnSorter('channel_name',nameSorter,channelNumberSorter,callLetterSorter,genreSorter,
                                channelNameSortStart,channelNumberSortStart,callLetterSortStart,genreSortStart);
    
    var channel_number_before = processChannelNum(big_grid.dataView.getItem(0).channel_number);
    column_sorter.sortByChannelNumber();
    var channel_number_after = processChannelNum(big_grid.dataView.getItem(0).channel_number);
    
    column_sorter.sortByChannelNumber();
    var first = big_grid.dataView.getItem(0).channel_number;
    var last = big_grid.dataView.getItem(big_grid.dataView.getLength() - 1).channel_number;
    
    if (channel_number_after > channel_number_before) { //we just sorted from higher to lower
      assert.ok(processChannelNum(last) > processChannelNum(first), 'Sorted from lower to higher. Asserted that the first channel_number is "'+first+'" and the last channel_number is "'+last+'."');
      column_sorter.sortByChannelNumber();
      first = big_grid.dataView.getItem(0).channel_number;
      last = big_grid.dataView.getItem(big_grid.dataView.getLength() - 1).channel_number;
      assert.ok(processChannelNum(last) < processChannelNum(first), 'Sorted from higher to lower. Asserted that the first channel_number is "'+first+'" and the last channel_number is "'+last+'."');
    }
    else{
      assert.ok(processChannelNum(last) < processChannelNum(first), 'Sorted from higher to lower. Asserted that the first channel_number is "'+first+'" and the last channel_number is "'+last+'."');
      column_sorter.sortByChannelNumber();
      first = big_grid.dataView.getItem(0).channel_number;
      last = big_grid.dataView.getItem(big_grid.dataView.getLength() - 1).channel_number;
      assert.ok(processChannelNum(last) > processChannelNum(first), 'Sorted from lower to higher. Asserted that the first channel_number is "'+first+'" and the last channel_number is "'+last+'."');
    }
    
});


QUnit.test( "Testing the \"sortByCallLetters\". Function called when clicking the call letter sort button. ", function( assert ) {
    //inject dependencies
    var fixture = $( "#qunit-fixture" );
    fixture.append('<div id="container"></div>');
    fixture.append('<div id="containerSmall"></div>');
    fixture.append('<div id="messageBox"></div>');
    fixture.append('<input type=text id="testBox"/>');
   
    //initialize the small(top) grid
    var small_grid = new smallGrid(230,'containerSmall',featured_packages);
    small_grid.setOptions(true,false);
    small_grid.setColumns();    
    small_grid.setChannels();
    small_grid.render();
    
    //small grid columns are the same with the big grid
    var columns = small_grid.getColumns();
    
    //initialize the big grid
    var big_grid = new bigGrid(480,'container',featured_packages);
    big_grid.setOptions(true,false);
    big_grid.setColumns(columns);   
    big_grid.setChannels(channels);
    big_grid.setChannels(ad_channels);
    big_grid.render();
    
     //identify all sorter controls
    var nameSorter = $('#nameSorter');
    var channelNumberSorter = $('#channelNumberSorter');
    var callLetterSorter = $('#callLetterSorter');
    var genreSorter = $('#genreSorter');
    var channelNameSortStart = $('#channelNameSortStart');
    var channelNumberSortStart = $('#channelNumberSortStart');
    var callLetterSortStart = $('#callLetterSortStart');
    var genreSortStart = $('#genreSortStart');
    //initialize column sorting
    var column_sorter = new columnSorter('channel_name',nameSorter,channelNumberSorter,callLetterSorter,genreSorter,
                                channelNameSortStart,channelNumberSortStart,callLetterSortStart,genreSortStart);
    
    var call_letter_before = big_grid.dataView.getItem(0).call_letters;
    column_sorter.sortByCallLetters();
    var call_letter_after = big_grid.dataView.getItem(0).call_letters;
   
    column_sorter.sortByCallLetters();
    var first = big_grid.dataView.getItem(0).call_letters;
    var last = big_grid.dataView.getItem(big_grid.dataView.getLength() - 1).call_letters;
    
   
    if (call_letter_after.toUpperCase() > call_letter_before.toUpperCase()) { //we just sorted from higher to lower
      assert.ok(last.toUpperCase() > first.toUpperCase(), 'Sorted from lower to higher. Asserted that the first call letter is "'+first+'" and the last call letter is "'+last+'."');
      column_sorter.sortByCallLetters();
      first = big_grid.dataView.getItem(0).call_letters;
      last = big_grid.dataView.getItem(big_grid.dataView.getLength() - 1).call_letters;
      assert.ok(last.toUpperCase() < first.toUpperCase(), 'Sorted from higher to lower. Asserted that the first call letter is "'+first+'" and the last call letter is "'+last+'."');
    }
    else{
      assert.ok(last.toUpperCase() < first.toUpperCase(), 'Sorted from higher to lower. Asserted that the first call letter is "'+first+'" and the last call letter is "'+last+'."');
      column_sorter.sortByCallLetters();
      first = big_grid.dataView.getItem(0).call_letters;
      last = big_grid.dataView.getItem(big_grid.dataView.getLength() - 1).call_letters;
      assert.ok(last.toUpperCase() > first.toUpperCase(), 'Sorted from lower to higher. Asserted that the first call letter is "'+first+'" and the last call letter is "'+last+'."');
    }
    
});


QUnit.test( "Testing the \"sortByGenre\". Function called when clicking the genre sort button. ", function( assert ) {
    //inject dependencies
    var fixture = $( "#qunit-fixture" );
    fixture.append('<div id="container"></div>');
    fixture.append('<div id="containerSmall"></div>');
    fixture.append('<div id="messageBox"></div>');
    fixture.append('<input type=text id="testBox"/>');
   
    //initialize the small(top) grid
    var small_grid = new smallGrid(230,'containerSmall',featured_packages);
    small_grid.setOptions(true,false);
    small_grid.setColumns();    
    small_grid.setChannels();
    small_grid.render();
    
    //small grid columns are the same with the big grid
    var columns = small_grid.getColumns();
    
    //initialize the big grid
    var big_grid = new bigGrid(480,'container',featured_packages,data_type);
    big_grid.setOptions(true,false);
    big_grid.setColumns(columns);   
    big_grid.setChannels(channels);
    big_grid.setChannels(ad_channels);
    big_grid.render();
    
     //identify all sorter controls
    var nameSorter = $('#nameSorter');
    var channelNumberSorter = $('#channelNumberSorter');
    var callLetterSorter = $('#callLetterSorter');
    var genreSorter = $('#genreSorter');
    var channelNameSortStart = $('#channelNameSortStart');
    var channelNumberSortStart = $('#channelNumberSortStart');
    var callLetterSortStart = $('#callLetterSortStart');
    var genreSortStart = $('#genreSortStart');
    //initialize column sorting
    var column_sorter = new columnSorter('channel_name',nameSorter,channelNumberSorter,callLetterSorter,genreSorter,
                                channelNameSortStart,channelNumberSortStart,callLetterSortStart,genreSortStart);
    
    var genre_before = big_grid.dataView.getItem(0).genre;
    column_sorter.sortByGenre();
    var genre_after = big_grid.dataView.getItem(0).genre;
   
    column_sorter.sortByGenre();
    var first = big_grid.dataView.getItem(0).genre;
    var last = big_grid.dataView.getItem(big_grid.dataView.getLength() - 1).genre;
    
   
    if (genre_after.toUpperCase() > genre_before.toUpperCase()) { //we just sorted from higher to lower
      assert.ok(last.toUpperCase() > first.toUpperCase(), 'Sorted from lower to higher. Asserted that the first genre is "'+first+'" and the last genre is "'+last+'"');
      column_sorter.sortByGenre();
      first = big_grid.dataView.getItem(0).genre;
      last = big_grid.dataView.getItem(big_grid.dataView.getLength() - 1).genre;
      assert.ok(last.toUpperCase() < first.toUpperCase(), 'Sorted from higher to lower. Asserted that the first genre is "'+first+'" and the last genre is "'+last+'"');
    }
    else if(genre_after.toUpperCase() < genre_before.toUpperCase()){
      assert.ok(last.toUpperCase() < first.toUpperCase(), 'Sorted from higher to lower. Asserted that the first genre is "'+first+'" and the last genre is "'+last+'"');
      column_sorter.sortByGenre();
      first = big_grid.dataView.getItem(0).genre;
      last = big_grid.dataView.getItem(big_grid.dataView.getLength() - 1).genre;
      assert.ok(last.toUpperCase() > first.toUpperCase(), 'Sorted from lower to higher. Asserted that the first genre is "'+first+'" and the last genre is "'+last+'"');
    }
    else{
      assert.ok(last.toUpperCase() == first.toUpperCase(), 'Sorted from higher to lower. Asserted that the first genre is "'+first+'" and the last genre is "'+last+'"');
      column_sorter.sortByGenre();
      first = big_grid.dataView.getItem(0).genre;
      last = big_grid.dataView.getItem(big_grid.dataView.getLength() - 1).genre;
      assert.ok(last.toUpperCase() == first.toUpperCase(), 'Sorted from lower to higher. Asserted that the first genre is "'+first+'" and the last genre is "'+last+'"');
    }
    
});

QUnit.module( "searchDelimiterMgr" );
QUnit.test( "Testing the \"checkSearchDelimiter\".", function( assert ) {
    
    var supported_delims = [','];
    var search_term = 'test';
    var search_delim = new searchDelimiterMgr(supported_delims,search_term);
    
    assert.ok(!search_delim.checkSearchDelimiter(), 'Asserted that function returns false when search term is "' + search_term + '".');
    
    search_term = 'apple,orange'
    search_delim = new searchDelimiterMgr(supported_delims,search_term);
    
    assert.ok(search_delim.checkSearchDelimiter() == true, 'Asserted that function returns true when search term is "' + search_term + '".');
    
    //changing supported delims
    supported_delims = ['|'];
    var search_delim = new searchDelimiterMgr(supported_delims,search_term);
    
    assert.ok(!search_delim.checkSearchDelimiter(), 'Asserted that function returns false when search term is "' + search_term + '".');
    
    search_term = 'apple|orange'
    search_delim = new searchDelimiterMgr(supported_delims,search_term);
    
    assert.ok(search_delim.checkSearchDelimiter() == true, 'Asserted that function returns true when search term is "' + search_term + '".');
    
    
});

QUnit.test( "Testing the \"syncDelimiterToBase\".", function( assert ) {
    var supported_delims = [','];
    var search_term = 'test,test,';
    var search_delim = new searchDelimiterMgr(supported_delims,search_term);
    var result_str = search_delim.syncDelimiterToBase();
    
    assert.ok(result_str == search_term, 'Asserted that function returns the same string.');
    
    supported_delims = [',','|'];
    search_term = 'test|test,';
    search_delim = new searchDelimiterMgr(supported_delims,search_term);
    result_str = search_delim.syncDelimiterToBase();
    
    assert.ok(result_str != search_term, 'Asserted that function returns different string "'+result_str+'".');
    
    supported_delims = [',','|','#','*','&'];
    search_term = 'test#test,diy*rty*y';
    search_delim = new searchDelimiterMgr(supported_delims,search_term);
    
    result_str = search_delim.syncDelimiterToBase(); //expected to return a different string
    var expected_search_terms_length = 5;
    
    assert.ok(search_delim.syncDelimiterToBase() != search_term, 'Asserted that function returns different string "'+result_str+'".');
    assert.ok(search_delim.syncDelimiterToBase().split(supported_delims[0]).length === expected_search_terms_length, 'Asserted that function returns an exploded string length of array === 5.' )
});






