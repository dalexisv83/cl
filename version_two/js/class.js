/**
 * This js file holds the re-usable classes for Channel Line-up
 *
 * @author Joel Capillo <jcapillo@directv.com>
 * @version 1
 * 
 */

///////////////////start////////////////////

//IMPORTANT!!!!!!!!!!!!! Set this to FALSE if on remote server(AAC), set this to TRUE when running on local computer
var isLocalHost = true; 

/**
 * Initiate inheritance Functions
 */
if (typeof Object.create !== 'function') {
    Object.create = function (o) {
        function F() {
        }
        F.prototype = o;
        return new F();
    };
}

var inheritPrototype = function(childObject, parentObject) {
    var copyOfParent = Object.create(parentObject.prototype);
    copyOfParent.constructor = childObject;
    childObject.prototype = copyOfParent;
};



/**
 * Sets the proper server path
 * @param {boolean} localhost determines if we're running the application in localhost or remote server(Tridion) 
 */
var getServerPath = function(localhost){
    if (!localhost) {
        return '%%pub%%';
    }
    else
      return 'http://agentanswercenterstg.directv.com/en-us/res/';
};


/**
 * Holds the configuration values
 */
var config = {
    localhost:isLocalHost,
    k_width: 410,
    rowHeightTall:38, //row height for the big grid
    rowHeightShort:30, //row height for the small grid
    y_diff:14, //constant used for calculating distance on rotated text to the bottom
    adChannelUrl: "javascript:document.location.href='"+getServerPath(isLocalHost)+"programming/paid_programming_part_time_channels.html'",
    deg: 10 //degree of rotation of the package divs
};


/**
 * Start of Base class of grid tables
 *
 * @param {integer} rowHeight the height of each row on the grid
 * @param {string} context the id of the dom element to attach the grid
 * @param {array} featured_packages the array of programming packages to feature
 */
var gridTable = function(rowHeight,context,featured_packages){
    this.rowHeight = rowHeight;
    this.data = [];
    this.columns = [];
    this.context = context;
    this.options = {};
    this.featured_packages = featured_packages;
    this.k_width = config.k_width;   
    
    if (this.featured_packages == undefined || 0 === this.featured_packages.length)
        throw new Error('Featured packages could not be empty.');
    
    this.getNarrowCellWidth = function(){
        return this.k_width/this.featured_packages.length;
    };
    
    this.init = function(){
    };
};

gridTable.prototype.render = function(){
    new Slick.Grid("#"+this.context, this.data, this.columns, this.options);
};

gridTable.prototype.setOptions = function(enableCellNavigation,enableColumnReorder){
    var options = {
        enableCellNavigation:enableCellNavigation,
        enableColumnReorder:enableColumnReorder,
        rowHeight: this.rowHeight
    };
    this.options = options;
};

gridTable.prototype.getOptions = function(){
    return this.options;
};

gridTable.prototype.getChannels = function(){
    return this.data;
};

gridTable.prototype.setChannels = function(data){
};

gridTable.prototype.getColumns = function(){
    return this.columns;
};

gridTable.prototype.setColumns = function(className,minWidth){
    var utility = new Utility(config.localhost);
    var featured_packages_count = this.featured_packages.length;
    var width = this.getNarrowCellWidth();
    
    /**
     * Private function used for formatting package cells 
     */
    var narrowRowFormatter = function(row, cell, value, columnDef, dataContext) {
        if (utility.isInteger(value)) {
          var index = cell - 4;
          var html = '';
          if (row == 0) {
             html = '<a href="#" id="hd_btn'+index+'" class="numLink" title="click to show '+value+' HD channels" data="'+cell+'">'+value+'</a>';
          }
          else{
              html = '<a href="#" id="reg_btn'+index+'" class="numLink" title="click to show all '+value+' channels" data="'+cell+'">'+value+'</a>';
          }         
          return html;
        }
        else
          return value;
    };
    
    /**
    * Regular row formatter for fix width columns
    */
    var fixRowFormatter = function(row, cell, value, columnDef, dataContext) {
        if (!dataContext.hasOwnProperty('url') || cell > 0) {
           return '<div class="inner">'+value+'</div>';
        }
        else{
          return '<div class="inner">'+'<a href="'+dataContext.url+'" target="_blank">'+value+'</a>'+'</div>';
        }     
    };
    
    if (!className)
      className = 'narrower';
    
    if (!minWidth)
      minWidth = 5;    
    
    //initatiate fix headers
    var columns = [     
      { id: "channel_name", name: "Channel Name", field: "channel_name", width: 212, formatter: fixRowFormatter, sortable: true, cssClass:'wide' },      
      { id: "channel_number", name: "Channel Number", field: "channel_number", width: 70, sortable: true , cssClass:'narrow', formatter: fixRowFormatter  },
      { id: "call_letters", name: "Call Letters", field: "call_letters", width: 70, sortable: true, cssClass:'narrow', formatter: fixRowFormatter },
      { id: "genre", name: "Genre", field: "genre", width: 70, formatter: fixRowFormatter, sortable: true, cssClass:'narrow genre' }
    ];
    
    var len = columns.length;
    //fill the packages column
    for(var i = 0; i < featured_packages_count; i++){
      var class_name = '';
      if (i % 2 == 0) {
        class_name = className + ' even';
      }
      else
        class_name = className + ' odd';      
      
      columns[i + len] = {
        id: 'p' + (i + 1),
        name: '',
        field: 'p' + (i + 1),
        width: width,
        cssClass: class_name,
        minWidth: minWidth,
        formatter: narrowRowFormatter
      };
      
    }    
    this.columns = columns;  
};
/**
 * End of the base class gridTable
 */


/**
 * Start of big grid class that inherits from parent class gridTable
 *
 */
var bigGrid = function(rowHeight,context,featured_packages,data_type){   
    this.dataType = data_type;
    this.dataView = null;
    this.sortdir = 0;    
    this.sortcol = "channel_number";
    this.container = $('#'+context);
    this.package_channels = false;
    this.searchString = '';
    this.isFiltering = false;
    var oThis = this;
    this.comparer = function(a, b) {
        
        var sortcol = oThis.sortcol;
        if (!a[sortcol])
          a[sortcol] = '';
        if (!b[sortcol]) 
          b[sortcol] = '';
       
        var x,y;
        if (sortcol == 'channel_number'){      
          x = parseInt(a[sortcol]);
          y = parseInt(b[sortcol]);
          if (isNaN(x))       
            x = 0;
          if (isNaN(y))
            y = 0;     
        }
        else{
          x = jQuery.trim(a[sortcol].toUpperCase());
          y = jQuery.trim(b[sortcol].toUpperCase());      
        }
        
        return (x == y ? 0 : (x > y ? 1 : -1));
    
    };
    this.removeFakeTableClass = function(){
        for(var i=0; i < 3; i++) {
          this.container.removeClass('fake-table' + i);        
        }
    };
    this.updateFilter = function() {
      var oThis = this;     
      this.dataView.setFilterArgs({
        searchString: oThis.searchString
       });
      this.removeFakeTableClass(); //remove fake table class
      this.isFiltering = true; //broadcast that we're filtering
      this.dataView.refresh();
    };
    gridTable.call(this,rowHeight,context,featured_packages);   
};
inheritPrototype(bigGrid, gridTable);

bigGrid.prototype.render = function(){
        
        this.dataView = new Slick.Data.DataView();        
        var grid = new Slick.Grid("#" + this.context, this.dataView, this.columns, this.options);
        var utility = new Utility();
        
        var oThis = this;
        
        //private function for searching
        var searchFilter = function(item, args) {
            var regex = new RegExp(args.searchString, "i");
            var searchFactor = null;
            if (!oThis.package_channels) {
                searchFactor =  item["anchors"].search(regex) != -1 ||
                                item["channel_name"].search(regex) != -1 ||
                                item["channel_number"].search(regex) != -1 ||
                                item["call_letters"].search(regex) != -1 ||
                                item["genre"].search(regex) != -1;
            }
            else{              
              var properties = oThis.package_channels.split('||');              
              var hd_regex = new RegExp('hd', "i");
              if (properties[1]) {
                  switch(oThis.dataType) {
                    case 'commercial':
                        searchFactor = item[properties[0]].search(regex) != -1 &&
                           (item["channel_name"].search(hd_regex) != -1 ||
                           item["call_letters"].search(hd_regex) != -1);
                        break;                       
                    default:
                        searchFactor = item[properties[0]].search(regex) != -1 &&
                               item["channel_name"].search(hd_regex) != -1;
                  }
              }
              else{
                searchFactor = item[oThis.package_channels].search(regex) != -1;
              }
            }
            
            if (searchFactor) 
              return true;
            
            return false;
        };
        
        this.dataView.onRowCountChanged.subscribe(function (e, args) {
            grid.updateRowCount();
            grid.render();
        });        
        this.dataView.onRowsChanged.subscribe(function (e, args) {
            grid.invalidateRows(args.rows);
            grid.render();
        });        
        
        this.dataView.setItems(this.data);
        this.dataView.setFilterArgs({
            searchString: oThis.searchString
        });
        this.dataView.setFilter(searchFilter); //set the searchfilter function to use
        
        grid.onSort.subscribe(function (e, args) {
            oThis.sortdir = args.sortAsc ? 1 : -1;
            oThis.sortcol = args.sortCol.field;
            oThis.dataView.sort(oThis.comparer, args.sortAsc);            
        });
        
        grid.setSortColumn("channel_name",true); //columnId, ascending       
       
       

};

/**
 * Sets the data for ad and regular channels
 * 
 * @param {array} data the array of channels
 */
bigGrid.prototype.setChannels = function(data){    
    var formatter = new UrlFormatter(config.localhost);
    var ad_channel_url = formatter.formatUrl(config.adChannelUrl);
    var total_count = this.data.length;
    
    for (var i = 0; i < data.length; i++ ) { //loop through all channels
        
        var channel = data[i];
        
        if (!channel.hasOwnProperty('genre') || !channel.genre)
          channel.genre = '';
          
        if (!channel.hasOwnProperty('callletters') || !channel.callletters)
          channel.callletters = '';
          
        var anchor,channel_url,id,channel_name,channel_num;
        if (channel.hasOwnProperty('searchTerm') && channel.hasOwnProperty('channelNum')){
          //if ad channel
          id = total_count + i;
          anchor = channel.searchTerm.join();
          channel_url = ad_channel_url;
          channel_name = channel.name;
          channel_num = channel.channelNum;
        }
        else{
          //if regular channel
          id = i;
          anchor = channel.anchors;
          channel_url = formatter.formatUrl(channel.url);
          channel_name = channel.channelnamebold;
          channel_num = channel.channelnumber;
        }     
        
        this.data[id] = {
            id:  "id_" + id,
            channel_name: channel_name,
            channel_number: channel_num,
            call_letters: channel.callletters,
            anchors:anchor,
            url:channel_url,
            genre:channel.genre
        };
       
        for(var n = 0; n < this.featured_packages.length; n++ ){
            var num = n + 1;
            var property = 'p' + num;
            if (channel[property]) {
               this.data[id][property] = channel[property]; 
            }
            else{
                this.data[id][property] = " ";                      
            }
        }
        
    }   
};

bigGrid.prototype.setColumns = function(columns){  
   this.columns = columns;
};

/**
 * Activate the HD Channels Filter
 *
 * @param {object} search_box the search box object
 * @param {string} messageBoxId the id of the message box to attach
 */
bigGrid.prototype.activateHdChannelsFilter = function(search_box,messageBoxId){
    var grid = this;
    var message_box = new messageBox(messageBoxId,grid); //initiate the message box
    var util = new Utility();
    $.each(this.featured_packages, function(i, v) {
            var context = "hd_btn"+i;
            var link = $('#'+context);
            var package_filter = new packageFilter(grid,message_box);
            link.click(function() {
                util.normalizeNumLink();
                search_box.self.val('');
                var numlink = $(this);
                if(!numlink.hasClass('activeLink'))
                   numlink.addClass('activeLink');
                //remove the fix width columns from the equation
                var property = parseInt(numlink.attr('data')) - 3; 
                property = 'p' + property;
                property = property+'||HD';
                package_filter.filterChannelsByPackage(property,true);
            });
    });    
};


/**
 * Activates the regular channels filter
 * 
 * @param {object} search_box the search box object
 * @param {string} messageBoxId the id of the message box to attach
 */
bigGrid.prototype.activateRegularChannelsFilter = function(search_box,messageBoxId){
    var grid = this;
    var message_box = new messageBox(messageBoxId,grid); //initiate the message box
    var util = new Utility();
    $.each(this.featured_packages, function(i, v) {
        var context = "reg_btn"+i;
        var link = $('#'+context);
        var package_filter = new packageFilter(grid,message_box);
        link.click(function(){
            util.normalizeNumLink();
            search_box.self.val('');
            var numlink = $(this);
            if(!numlink.hasClass('activeLink'))
                numlink.addClass('activeLink');
            //remove the fix width columns from the equation
            var property = parseInt(numlink.attr('data')) - 3; 
            property = 'p' + property; //determine the property
            package_filter.filterChannelsByPackage(property,false);
        });     
    });
};
/**
 * End of bigGrid class
 */



/**
 * Start of small grid class
 */
var smallGrid = function(rowHeight,context,featured_packages){
   gridTable.call(this,rowHeight,context,featured_packages);   
};
inheritPrototype(smallGrid, gridTable);

smallGrid.prototype.setChannels = function(){
    for (var i = 0; i < 2; i++ ){
        var channel_name = "Approximate number of HD channels";
        if (i > 0)
          channel_name = "Approximate channels in per package<span class='red'>**</span>";
          
        this.data[i] = {
            id:  "id_" + i,
            channel_name: channel_name,
            channel_number: " ",
            call_letters: " ",
            genre:" "
        };
        
         
        for(var n = 0; n < this.featured_packages.length; n++ ){ //loop through all featured packages
          var featured_package = this.featured_packages[n];
          var num = n + 1;
          var property = 'p' + num;
          if (i > 0) {
            this.data[i][property] = featured_package.total_channels;
          }
          else
            this.data[i][property] = featured_package.hd_channels;
        }  
    }
};
/**
 * End of small grid class
 */



/**
 * Package filter class
 */
var packageFilter = function(grid,message_box){
    this.grid = grid;
    this.message_box = message_box;
    /**
     * Shows all channels for a given package
     * @param {string} property represents the key value of the package from the data source
     * @param {boolean} hd_only determines if we're filtering hd only for true or all for false
     */
    this.filterChannelsByPackage = function(property,hd_only){  
      var msg_box = this.message_box;
      //start hooking-up to the grid
      this.grid.package_channels = property; 
      this.grid.searchString = 'x';
      this.grid.updateFilter();      
      var count = this.grid.dataView.getLength();
      //display message
      msg_box.createPackageMsg(count,hd_only);
    };
};
/**
 * End Package filter class
 */


/**
 * Start for tooltip class
 *
 * @param {object} obj the DOM object element to attach tooltip
 */
var toolTip = function(obj){
    this.self = obj;
    /**
     * activates genre codes tool tip
     * @param {object} data_temp_holder the object that holds the tooltip content
     */
    this.genreToolTip = function(data_temp_holder){
        var html = data_temp_holder.html();       
        this.self.qtip({
            content: {
              text: html
            },
            position:{
              my: 'left top',  
              at: 'bottom right',
              target: this
            },
            style: {
              classes: 'qtip-bootstrap'
            }
        });
        this.self.show()
    };
    /**
     * activates the package header tooltip
     * @param {string} description the html to display inside tooltip
     */
    this.packageHeaderTooltip = function(description){      
        this.self.qtip({ 
            content: {
              text: description
            },
            position:{
              my: 'right top',  
              at: 'bottom right', 
              target: this
            },
            style: {
              classes: 'qtip-youtube'
            }
        });   
    };
};
/**
 * End for Genre tooltip class 
 */


/**
 * The search box class
 *
 * @param {object} grid the gridTable class to attach the searchBox
 * @param {string} context the id of an input text to attach
 * @param {string} messageBoxId the id of the message box to attach
 */
var searchBox = function(context,grid,messageBoxId,resetBtnId){
    this.context = context;
    this.grid = grid;
    this.self = $('#'+this.context);
    this.self.focus();
    this.autoSearch = function(){
        var oThis = this.self;
        var oGrid = this.grid;
        var msg_box = new messageBox(messageBoxId,this.grid);
        var reset_btn = new reset(resetBtnId);
        var utility = new Utility();
        oThis.keyup(function (e) {
            // if enter
            if (e.which == 13)
              return;
            
            oGrid.package_channels = false; //set to false to broadcast where searching normally
            utility.normalizeNumLink();
            
            // if escape or clear with backspace/delete
            if ((e.which == 27) || (((e.which == 8) || (e.which == 46)) && (oThis.val().length == 0))){
              oThis.val('');
              reset_btn.deactivate();
            } else {
              reset_btn.activate(oGrid,oThis,messageBoxId);
            }
            
            oGrid.searchString = oThis.val();
            oGrid.updateFilter();
            var count = oGrid.dataView.getLength();
            msg_box.clear();
            if ((count > 0 || count == 0) && oGrid.searchString.length > 0)
              msg_box.createMsg(count);
        });
        oThis.keydown(function (e) {
            //if enter
            if ((e.which == 13) && (oThis.val().length != 0)) {
                var clearedVal = oThis.val();
                oThis.val('');
                oGrid.searchString = clearedVal;
                oGrid.updateFilter();
                var count = oGrid.dataView.getLength();
                msg_box.clear();
                if ((count > 0 || count == 0) && oGrid.searchString.length > 0)
                    msg_box.createMsg(count);
                msg_box.searchTerm(clearedVal);
                oThis.focus();
            }
        });
    };
};


/**
 * Start of message box class
 *
 */
var messageBox = function(context,grid){    
    this.self = $('#'+context);
    this.grid = grid;
    this.clear = function(){
        this.self.html('');
    };
};

messageBox.prototype.createMsg = function(count){
    var util = new Utility();
    if (!util.isInteger(count) || count < 0)
           throw new Error('Enter a valid count.');
    
    if (this.self.hasClass('no-channels-found'))
      this.self.removeClass('no-channels-found');

    if (this.self.hasClass('search-term'))
      this.self.removeClass('search-term');
      
    var msg = '';
    if (count == 0) {
      this.self.addClass('no-channels-found');
      msg = '<b>' + count + ' channel(s) found</b>. <br />See <a target="_blank" href="'+getServerPath(config.localhost)+'programming/commercials.html">Programming Requests</a> for points about channels not currently available on DIRECTV.';
    }
    else
      msg = '<b>' + count + ' channel(s) found</b>.';
    
    this.self.html(msg);
};


messageBox.prototype.createPackageMsg = function(count,is_hd){
    var util = new Utility();
    if (!util.isInteger(count) || count < 0)
        throw new Error('Enter a valid count.');
        
    if (typeof is_hd != 'boolean')
        throw new Error('Enter a valid boolean value if hd or not.');
     
    if (this.self.hasClass('no-channels-found'))
      this.self.removeClass('no-channels-found');
    
    var formatter = new UrlFormatter(config.localhost);
    var package_index = parseInt(this.grid.package_channels.match(/\d+/)[0]) - 1;
    
    //reverse the index
    package_index = (this.grid.featured_packages.length - 1) - package_index;
    var package_name = this.grid.featured_packages[package_index].display_name;
    var package_link = formatter.adjustUrl(this.grid.featured_packages[package_index].url);
    
    var msg = 'Displaying <b>'+count+'</b> channels for '+'<a href="'+package_link+'" target="_blank">'+package_name+'</a> package.';
    if (is_hd)
       msg = 'Displaying <b>'+count+'</b> HD channels for '+'<a href="'+package_link+'" target="_blank">'+package_name+'</a> package.';    
    
    this.self.html(msg);
};

messageBox.prototype.searchTerm = function(term) {
  var msg = "You searched for <b>&ldquo;<span>" + term + "</span>&rdquo;</b><br /><br />";
  this.self.addClass('search-term');
  this.self.prepend(msg);
}
/**
 * End of message box class
 */


/**
 * Start of program headers class
 *
 * @param {string} context the id of the container
 * @param {array} featured_packages array of featured packages
 * @param {integer} column_width the column width
 */

var programmingHeaders = function(context, featured_packages, column_width){
    this.container = $('#' + context);
    this.featured_packages = featured_packages;
    this.headers = [];
    this.column_width = column_width;
    this.render = function(){
        this.featured_packages.reverse();
        for(var i = 0; i < this.featured_packages.length; i++){
            var rotated_header = $('<div class="pull-left narrower" id="head_'+i+'"><span>'+this.featured_packages[i].display_name+'</span></div>');
            this.headers.push(rotated_header); //fill the headers property
            this.container.prepend(rotated_header);    
        }
        for(var i = 0; i < this.headers.length; i++){
          this.headers[i].attr("style","width:" + this.column_width+"px"); 
        }        
    };
    this.onHoverIn = function(e){
                var target = (e.currentTarget) ? e.currentTarget : e.srcElement;
                target.style.cursor = "hand";               
    };
    this.onHoverOut = function(e){
        var target = (e.currentTarget) ? e.currentTarget : e.srcElement;
        target.style.cursor="pointer";
    };    
};



/**
 * This function will rotate the programming headers on a given degree
 * 
 * @param {boolean} localhost determines if we're running on localhost or not
 * @param {integer} rect_deg the degree of inclination for the programming headers
 * @param {integer} y_diff the height adjustment factor
 */
programmingHeaders.prototype.rotate = function(localhost,rect_deg, y_diff){
      
    var formatter = new UrlFormatter(localhost);
    var util = new Utility(); 
    
    var oThis = this;
    var rect_height = 150; //height of the rotated wrapper
    var text_deg = rect_deg - 90; //calculate degree of rotattion of text to be parallel w/ container div
    var featured_packages = this.featured_packages;
    var width = this.column_width;
    var headers = this.headers;
    var column_height = headers[0].height();
    
    var rect_y_coord =  column_height - rect_height;
    var rect_x_coord = util.calculateTangentWidth(rect_deg,column_height);

    var count = headers.length;
    var is_even_count = (0 === count % 2); //true if even then false otherwise

    $.each(headers, function(i, v) {        
        var index = i;
        var div = headers[i];
        
        var url = featured_packages[index].url;
        url = formatter.adjustUrl(url);
       
        var tooltip_msg = featured_packages[index].description;       
        var span = div.find('span');
        var height = div.height();        
        var text = span.text();
       
        var R = Raphael(div.attr('id'), width, 0); //create the canvas         
        //draw the rectangle that wraps the text
        var rect = R.rect(rect_x_coord, rect_y_coord, width, rect_height);
        
        var is_odd = (0 !== index % 2);        
        var rect_fill = is_even_count ? (is_odd ? '#86b9ec':'#cde1f5') : (is_odd ? '#cde1f5':'#86b9ec');

        rect.attr({
            'fill': rect_fill,
            'stroke':'#fff'         
        }).rotate(rect_deg,0,0).click(function(){
                window.open(url, '_blank');                
        }).hover(
            oThis.onHoverIn, oThis.onHoverOut
        );
        
        
        var text_width = span.textWidth();          
        var text_y_coord = height/2 - text_width/2 + y_diff;     
        var adjacent_height = height - text_y_coord;
        var text_x_coord = util.calculateTangentWidth(rect_deg, adjacent_height); 
        text_x_coord = text_x_coord + width/2; //center it by adding half of the column width
        
        //draw the text
        var paper = R.text(text_x_coord, text_y_coord);
        paper.attr({
                "font-family":"helvetica", 
                "font-size":"12", 
                "text-anchor":"center",                       
                "text": text,
                "fill":"#000"              
        }).rotate(text_deg,false)
        .click(function(){
             window.open(url, '_blank');
        }).hover(
                 oThis.onHoverIn, oThis.onHoverOut
        );     
        
        //activate the tooltip for this featured package
        var tool_tip = new toolTip(div);
        tool_tip.packageHeaderTooltip(tooltip_msg);
        
        span.hide();//hide the span text        
    });      
     
};

/**
 * End of program headers class
 */


/**
 * Class for sorting ability on each fixed columns
 * 
 */
var columnSorter = function(sortType,nameSorter,channelNumberSorter,callLetterSorter,genreSorter,
                                channelNameSortStart,channelNumberSortStart,callLetterSortStart,genreSortStart){
    //set properties
    this.sortType = sortType;
    this.nameSorter = nameSorter;
    this.channelNumberSorter = channelNumberSorter;
    this.callLetterSorter = callLetterSorter;
    this.genreSorter = genreSorter;
    this.channelNameSortStart = channelNameSortStart;
    this.channelNumberSortStart = channelNumberSortStart;
    this.callLetterSortStart = callLetterSortStart;
    this.genreSortStart = genreSortStart;
    
    
    this.display = function(){
        
        this.nameSorter.hide();
        this.channelNameSortStart.show();
        
        this.channelNumberSorter.hide();
        this.channelNumberSortStart.show();
        
        this.callLetterSorter.hide();
        this.callLetterSortStart.show();
        
        this.genreSorter.hide();
        this.genreSortStart.show();
        
        var type = this.sortType;
        switch(type) {
            case 'sort_by_channel_name':
                    this.nameSorter.show();
                    this.channelNameSortStart.hide();
                    break;
            case 'sort_by_channel_number':
                    this.channelNumberSorter.show();
                    this.channelNumberSortStart.hide();
                    break;
            case 'sort_by_call_letter':
                    this.callLetterSorter.show();
                    this.callLetterSortStart.hide();
                    break;
            case 'sort_by_genre':
                    this.genreSorter.show();
                    this.genreSortStart.hide();
                    break;
            default:
                    this.nameSorter.show();
                    this.channelNameSortStart.hide();
        }
        
    };
    
    this.sort = function(){
        var type = this.sortType;
        switch(type) {
            case 'sort_by_channel_name':
                  this.sortByChannelName();
                  break;
            case 'sort_by_channel_number':
                  this.sortByChannelNumber();
                   break;
            case 'sort_by_call_letter':
                  this.sortByCallLetters();
                  break;
            case 'sort_by_genre':
                  this.sortByGenre();
                  break;
            default:
                  this.sortByChannelName();
                  break;
        } 
    };
    
    this.sortByChannelName= function(){        
        var nameSorter = this.nameSorter;  
        var up = nameSorter.find('.up');
        var down = nameSorter.find('.down');
        if (up.hasClass('hidden')) {
            up.removeClass('hidden');
            down.addClass('hidden');
        }
        else{
            up.addClass('hidden');
            down.removeClass('hidden');
        }
        
        $('#container .slick-header-columns').children().eq(0).trigger('click');
    };
    
    this.sortByChannelNumber = function(){
        var channelNumberSorter = this.channelNumberSorter;       
        var up = channelNumberSorter.find('.up');
        var down = channelNumberSorter.find('.down');
        if (up.hasClass('hidden')) {
            up.removeClass('hidden');
            down.addClass('hidden');       
        }
        else{
            up.addClass('hidden');
            down.removeClass('hidden');
        }
        $('#container .slick-header-columns').children().eq(1).trigger('click');
    };
    
    this.sortByCallLetters = function(){
      var callLetterSorter = this.callLetterSorter;
      var up = callLetterSorter.find('.up');
      var down = callLetterSorter.find('.down');;
      if (up.hasClass('hidden')) {
          up.removeClass('hidden');
          down.addClass('hidden');
      }
      else{
          up.addClass('hidden');
          down.removeClass('hidden');       
      }
      $('#container .slick-header-columns').children().eq(2).trigger('click');
    };
    
    this.sortByGenre = function(){
      var genreSorter = this.genreSorter;
      var up = genreSorter.find('.up');
      var down = genreSorter.find('.down');;
      if (up.hasClass('hidden')) {
          up.removeClass('hidden');
          down.addClass('hidden');
      }
      else{
          up.addClass('hidden');
          down.removeClass('hidden');       
      }
      $('#container .slick-header-columns').children().eq(3).trigger('click');
    };

};

columnSorter.prototype.enableChannelNameSort = function(){
    var oThis = this;    
    var nameSorterLink = oThis.nameSorter.find('a');
    
    nameSorterLink.click(function(){
      oThis.sortType = 'sort_by_channel_name';
      oThis.display();
      oThis.sort();
    });
    oThis.channelNameSortStart.find('a').click(function(){
         nameSorterLink.click();
    });
};

columnSorter.prototype.enableChannelNumberSort = function(){
    var oThis = this;    
    var channelNumberSorterLink = oThis.channelNumberSorter.find('a');
    channelNumberSorterLink.click(function(){
      oThis.sortType = 'sort_by_channel_number';      
      oThis.display();
      oThis.sort();
    });     
    oThis.channelNumberSortStart.find('a').click(function(){
       channelNumberSorterLink.click();
    });
};

columnSorter.prototype.enableCallLetterSort = function(){
    var oThis = this;    
    var callLetterSorterLink = oThis.callLetterSorter.find('a');
    callLetterSorterLink.click(function(){    
      oThis.sortType = 'sort_by_call_letter';      
      oThis.display();
      oThis.sort();
    });    
    oThis.callLetterSortStart.find('a').click(function(){
       callLetterSorterLink.click();
    });
};

columnSorter.prototype.enableGenreSort = function(){
    var oThis = this;
    var genreSorterLink = oThis.genreSorter.find('a');
    genreSorterLink.click(function(){    
      oThis.sortType = 'sort_by_genre';      
      oThis.display();
      oThis.sort();
    });    
    oThis.genreSortStart.find('a').click(function(){
       genreSorterLink.click();
    });    
};
/**
 * end Class for sorting ability
 * 
 */

/**
 * The Reset Class
 * 
 * @param {string} context the id of the element to attach 
 */
var reset = function(context){
    var oThis = this;
    this.self = $('#' + context);
    this.activate = function(grid,search_box,messageBoxId){
        var util = new Utility();
        var message_box = new messageBox(messageBoxId,grid);
        this.self.addClass('active');
        this.self.unbind().click(function(e){
            grid.package_channels = false;
            util.normalizeNumLink();
            search_box.val('');
            message_box.clear();
            grid.searchString = search_box.val();
            grid.updateFilter();           
            oThis.self.removeClass('active');
            //make sure to execute deactivate only when called programatically
            if (!e) 
              oThis.deactivate();
            dcsMultiTrack("DCSext.channel_lineup_search_term","reset button hit");
        });
    };
    this.deactivate = function(){
      oThis.self.click();      
    };
};
/**
 * End of reset class
 */


/**
 * Helper class that contains some url formatting functions
 *
 * @param {boolean} localhost determines if we're running on localhost or on actual remote server
 */
var UrlFormatter = function(localhost){
    this.localhost = localhost;
    this.formatUrl = function(url){
        if (typeof url != 'string')
            throw new Error('Enter a valid url.');        
        url = url.replace(/\s/g, ''); //remove spaces
        var base = "href='";
        var index = url.indexOf(base);
        if (-1 === index)
           return this.adjustUrl(url.replace(/["']/g, ""));
        
        url = url.replace(/http:\/\/agentanswercenterstg.directv.com/g, "");
        url = url.substring(index + base.length,url.length - 1);        
        return this.adjustUrl(url.replace(/["']/g, ""));
    };
    /**
     * Adjust url to relative server location
     */
    this.adjustUrl = function(url){
            if (this.localhost && url)
               url = url.replace(/\/en-us\/res\//g, getServerPath(true));
            return url;
    };    
};


/**
 * Helper class that contains some clean-up functions
 */
var Utility = function(){
    //checks if the number is an integer
    this.isInteger = function(n){
       return parseInt(n) === n;
    };
    this.randomizeClassName = function(name){
        var rand = Math.floor(Math.random()*3);       
        return name+rand;
    };
    this.normalizeNumLink = function(){
        $( ".numLink" ).each(function() {
            var el = $(this);
            if(el.hasClass('activeLink')){
               el.removeClass('activeLink');
               return false; 
            }
        });
    };
    this.isIE = function() {
        var ua = window.navigator.userAgent;
        var msie = ua.indexOf("MSIE ");
    
        if (msie > 0)    
            return true;
        else               
          return false;
    };
    this.calculateTangentWidth = function(deg,opposite_height){
        if (isNaN(deg))
           throw new Error('Enter a valid degree value.');
        if (isNaN(opposite_height)) 
           throw new Error('Enter a valid opposite height value.');        
        var tan_width = Math.tan(Raphael.rad(deg))*(opposite_height);
        if (!this.isIE()) {
          return (Math.round(tan_width * 100) / 100);
        }
        else
          return (Math.round(tan_width * 100) / 100) - 2; //need to compensate 2 units if IE    
    };  
};

/**
 * The Error class
 */
var Error = function(message){
    this.message = message;
};

Error.prototype.toString = function(){
    return this.message;
};
/**
 * End of Error class
 */


/**
 * Calculate the width of word or text in the document
 *
 * @returns {integer} the pixel width
 */
$.fn.textWidth = function(text, font) {
    if (!$.fn.textWidth.fakeEl) $.fn.textWidth.fakeEl = $('<span>').hide().appendTo(document.body);
    $.fn.textWidth.fakeEl.text(text || this.val() || this.text()).css('font', font || this.css('font'));
    return $.fn.textWidth.fakeEl.width();
};


/**
* Pops out a new window
*/
var pop_at = function(a, b, c, d) {
    1 == isNaN(b) && (b = 800);
    1 == isNaN(c) && (c = 600);
    1 == isNaN(d) && (d = "_blank");
    width = b;
    height = c;
    newWin = window.open(a, d, ",status=no,toolbar=no,menubar=no,location=no,scrollbars=yes,resizable=yes width=" + width + ",height=" + height + "");
    newWin.focus()
};

/**
 * Creates the comment button
 *
 * @param {object} container the main container object that will hold the comment button
 * @param {string} class_name preferred class name for the inner container
 * @param {string} root_url the root url to call
 */
var commentBtn = function(container, class_name, root_url){
    this.self = container;    
    this.class_name = class_name;
    this.root_url = root_url;
    var that = this;
    /**
     * Initialize function
     * @param {object} tool_author DOM element that holds the name of the tool's author
     */
    this.init = function(tool_author){
        if (!tool_author || null === tool_author)
           tool_author = $('#tool-author-id');
        var feedback_btn = '<div class='+this.class_name+'><span class="btn-feedback btns" shape="rect" title="Provide Feedback">Provide Feedback</span></div>';
        this.self.append(feedback_btn); //append to itself      
        $('.'+this.class_name+' span.btn-feedback').click(function(e){
            var url = window.top.location.pathname;
            var aID = tool_author.val();
            var w = 375;
            var h = 375;
            var winl = (screen.width-w)/2;
            var wint = ((screen.height-h)/2) - (h/2);  
            var feedbackForm = window.open (that.root_url + 'system/scripts/add-feedback-tools.jsp?pid=' + url + '&aid=' + aID + '','feedbackForm','location=0,status=0,scrollbars=0,  width=' + w +',height=' + h + '');
            feedbackForm.moveTo(winl, wint);
            feedbackForm.focus();                
        });
    };    
};






