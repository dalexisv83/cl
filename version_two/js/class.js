/**
 * This js file holds the re-usable classes for Channel Line-up
 *
 * @author Joel Capillo <jcapillo@directv.com>
 * @version 3
 *
 */

/*jslint todo: true */
/*jslint plusplus: true */
/**
 * Initiate inheritance Functions
 */
if (typeof Object.create !== 'function') {
    Object.create = function (o) {
        "use strict";
        function F(){
            return undefined;
        }
        F.prototype = o;
        return new F();
    };
}

var inheritPrototype = function(childObject, parentObject) {
  "use strict";
  var copyOfParent = Object.create(parentObject.prototype);
  copyOfParent.constructor = childObject;
  childObject.prototype = copyOfParent;
};


/**
 * Start of Base class of grid tables
 *
 * @param {integer} rowHeight the height of each row on the grid
 * @param {string} context the id of the dom element to attach the grid
 * @param {array} featured_packages the array of programming packages to feature
 */
var gridTable = function(rowHeight,context,featured_packages){
    'use strict';
    /*global config,Slick,reset,packageFilter,messageBox  */
    this.environment = '';
    this.rowHeight = rowHeight;
    this.data = [];
    this.columns = [];
    this.context = context;
    this.options = {};
    this.featured_packages = featured_packages;
    this.k_width = config.k_width;

    if (this.featured_packages === undefined || this.featured_packages.length === 0) {
        throw new Error('Featured packages could not be empty.');
    }

    this.getNarrowCellWidth = function(){
        return this.k_width/this.featured_packages.length;
    };
};

gridTable.prototype.render = function(){
  "use strict";
   Slick.Grid("#"+this.context, this.data, this.columns, this.options);
};

gridTable.prototype.setOptions = function(enableCellNavigation,enableColumnReorder){
  "use strict";
    var options = {
        enableCellNavigation:enableCellNavigation,
        enableColumnReorder:enableColumnReorder,
        rowHeight: this.rowHeight
    };
    this.options = options;
};

gridTable.prototype.getOptions = function(){
    "use strict";
    return this.options;
};

gridTable.prototype.getChannels = function(){
  "use strict";
   return this.data;
};

gridTable.prototype.getColumns = function(){
  "use strict";
   return this.columns;
};

gridTable.prototype.setColumns = function(className,minWidth){
   "use strict";
    /*jslint unparam: true */
    var utility = new Utility(config.localhost),
    featured_packages_count = this.featured_packages.length,
    width = this.getNarrowCellWidth(),
    html,
    index,
    div,
    fixRowFormatter,
    columns,
    len,
    i,
    class_name,
    /**
     * Private function used for formatting package cells
     */
    narrowRowFormatter = function(row, cell, value, columnDef, dataContext) {
        if (utility.isInteger(value)) {
          index = cell - 4;
          if (row === 0) {
             html = '<a href="#" id="hd_btn'+index+'" class="numLink" title="click to show '+value+' HD channels" data="'+cell+'">'+value+'</a>';
          }
          else{
              html = '<a href="#" id="reg_btn'+index+'" class="numLink" title="click to show all '+value+' channels" data="'+cell+'">'+value+'</a>';
          }
          value = html;
        }
        return value;
    };

    /**
    * Regular row formatter for fix width columns
    */
    fixRowFormatter = function(row, cell, value, columnDef, dataContext) {
        if (!dataContext.hasOwnProperty('url') || cell > 0) {
           div = '<div class="inner">'+value+'</div>';
        }
        else{
           div = '<div class="inner">'+'<a href="'+dataContext.url+'" target="_blank">'+value+'</a>'+'</div>';
        }
        return div;
    };

    if (!className) {
      className = 'narrower';
    }

    if (!minWidth) {
      minWidth = 5;
    }

    //initatiate fix headers
    columns = [
      { id: "channel_name", name: "Channel Name", field: "channel_name", width: 212, formatter: fixRowFormatter, sortable: true, cssClass:'wide' },
      { id: "channel_number", name: "Channel Number", field: "channel_number", width: 70, sortable: true , cssClass:'narrow', formatter: fixRowFormatter  },
      { id: "call_letters", name: "Call Letters", field: "call_letters", width: 70, sortable: true, cssClass:'narrow', formatter: fixRowFormatter },
      { id: "genre", name: "Genre", field: "genre", width: 70, formatter: fixRowFormatter, sortable: true, cssClass:'narrow genre' }
    ];

    len = columns.length;
    //fill the packages column
    for(i = 0; i < featured_packages_count; i++){
      class_name = '';
      if (i % 2 === 0) {
        class_name = className + ' even';
      }
      else {
        class_name = className + ' odd';
      }
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
    "use strict";
    this.dataType = data_type;
    this.dataView = null;
    this.sortdir = 0;
    this.sortcol = "channel_number";
    this.container = $('#'+context);
    this.package_channels = false;
    this.searchString = '';
    this.search_terms = [];
    var oThis = this,
    x,
    y;
    this.comparer = function(a, b) {

        var sortcol = oThis.sortcol;
        if (!a[sortcol]) {
          a[sortcol] = '';
        }
        if (!b[sortcol]) {
          b[sortcol] = '';
        }

        if (sortcol === 'channel_number'){
          x = parseInt(a[sortcol], 10);
          y = parseInt(b[sortcol], 10);
          if (isNaN(x)) {
            x = 0;
          }
          if (isNaN(y)) {
            y = 0;
          }
        }
        else{
          x = $.trim(a[sortcol].toUpperCase());
          y = $.trim(b[sortcol].toUpperCase());
        }

        return (x === y ? 0 : (x > y ? 1 : -1));

    };
    this.updateFilter = function() {
      var oThis = this;
      this.dataView.setFilterArgs({
        searchString: oThis.searchString
      });
      this.dataView.refresh();
    };
    gridTable.call(this,rowHeight,context,featured_packages);
};
inheritPrototype(bigGrid, gridTable);

bigGrid.prototype.render = function(){
    "use strict";
    /* global config, Slick, messageBox, reset, packageFilter  */
     /*jslint unparam: true */

    this.dataView = new Slick.Data.DataView();
    var grid = new Slick.Grid("#" + this.context, this.dataView, this.columns, this.options),
    oThis = this,
    search_term_len,
    isMatched,
    found = false,
    search_str,
    regex,
    properties,
    hd_regex,
    i,
    //private function for column searching
    searchByColumns = function(rows,columns,search_term){
        var regex = new RegExp(search_term, "i"),
        is_matched = false;
        $.each(columns, function(i, column_name) {
          console.log(rows[column_name]);
            if (rows[column_name].search(regex) !== -1) {
                is_matched = true;
                return false;
            }
        });
        return is_matched;
    },


    //function to modify if want to customize search
    searchFilter = function(rows, args) {
        isMatched  = false;
        search_term_len = oThis.search_terms.length;
        //check if we're doing regular search on the search box
        if (!oThis.package_channels) {
            //check if we have a multi search terms array
            if (search_term_len > 0) {
                for (i = 0; i < search_term_len; i += 1) {
                    search_str = $.trim(oThis.search_terms[i]);
                    if (search_str.length > 0){
                        found = false;
                        found = searchByColumns(rows,config.searchable_columns,search_str);
                        if (found){
                            isMatched = true;
                            break;
                        }
                    }
                }
            }
            else{
                isMatched = searchByColumns(rows,config.searchable_columns,args.searchString);
            }
        } else {
            regex = new RegExp(args.searchString, "i");
            properties = oThis.package_channels.split('||');
            hd_regex = new RegExp('hd', "i");
            if (properties[1]) {
                if(oThis.dataType === 'commercial') {
                    isMatched = rows[properties[0]].search(regex) !== -1 && (rows.channel_name.search(hd_regex) !== -1 ||rows.call_letters.search(hd_regex) !== -1);
                } else {
                    isMatched = rows[properties[0]].search(regex) !== -1 && rows.channel_name.search(hd_regex) !== -1;
                }
            }
            else {
               isMatched = rows[oThis.package_channels].search(regex) !== -1;
            }
        }
        return isMatched;
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

    grid.setSortColumn("channel_name",true); //channel name ascending on page load
};

/**
 * Sets the data for ad and regular channels
 *
 * @param {array} data the array of channels
 */
bigGrid.prototype.setChannels = function(data){
  "use strict";
    var formatter = new UrlFormatter(config.localhost),
    ad_channel_url = formatter.formatUrl(config.adChannelUrl),
    total_count = this.data.length,
    i,
    channel,
    n,
    num,
    property,
    anchor,
    channel_url,
    id,
    channel_name,
    len = data.length,
    featured_pkg_len = this.featured_packages.length,
    channel_num;

    for (i = 0; i < len; i++ ) { //loop through all channels
        channel = data[i];
        if (!channel.hasOwnProperty('genre') || !channel.genre) {
          channel.genre = '';
        }

        if (!channel.hasOwnProperty('callletters') || !channel.callletters) {
          channel.callletters = '';
        }


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
          anchor = channel.anchors ? channel.anchors : '';
          channel_url = channel.url ? formatter.formatUrl(channel.url) : '';
          channel_name = channel.channelnamebold ? channel.channelnamebold : '';
          channel_num = channel.channelnumber ? channel.channelnumber : '';
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

        for(n = 0; n < featured_pkg_len; n++ ){
            num = n + 1;
            property = 'p' + num;
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
    "use strict";
    this.columns = columns;
};

/**
 * Activate the HD Channels Filter
 *
 * @param {object} search_box the search box object
 * @param {string} messageBoxId the id of the message box to attach
 */
bigGrid.prototype.activateHdChannelsFilter = function(search_box,messageBoxId,resetBtnId,activeClass){
    "use strict";
     /*jslint newcap: true */
      /*jslint unparam: true */
    var grid = this,
    message_box = new messageBox(messageBoxId,grid), //initiate the message box
    util = new Utility(),
    reset_btn = new reset(resetBtnId,activeClass),
    context,
    link,
    package_filter = new packageFilter(grid,message_box),
    property;

    $.each(this.featured_packages, function(index, val) {
        context = "hd_btn"+index;
        link = $('#'+context);
        link.click(function() {
            reset_btn.activate(grid,search_box.self,messageBoxId);
            util.normalizeNumLink();
            search_box.self.val('');
            if(!$(this).hasClass('activeLink')) {
               $(this).addClass('activeLink');
             }
            //remove the fix width columns from the equation
            property = parseInt($(this).attr('data'), 10) - 3;
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
bigGrid.prototype.activateRegularChannelsFilter = function(search_box,messageBoxId,resetBtnId,activeClass){
    "use strict";
    /*jslint newcap: true */
    /*jslint unparam: true */
    var grid = this,
    message_box = new messageBox(messageBoxId,grid), //initiate the message box
    util = new Utility(),
    reset_btn = new reset(resetBtnId,activeClass),
    context,
    link,
    package_filter = new packageFilter(grid,message_box),
    property;

    $.each(this.featured_packages, function(index, val) {
      context = "reg_btn"+index;
      link = $('#'+context);
        link.click(function(){
            reset_btn.activate(grid,search_box.self,messageBoxId);
            util.normalizeNumLink();
            search_box.self.val('');

            if(!$(this).hasClass('activeLink')) {
                $(this).addClass('activeLink');
              }
            //remove the fix width columns from the equation
            property = parseInt($(this).attr('data'), 10) - 3;
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
  "use strict";
   gridTable.call(this,rowHeight,context,featured_packages);
};
inheritPrototype(smallGrid, gridTable);



smallGrid.prototype.setChannels = function(){
    "use strict";
    var i,
    channel_name,
    n,
    featured_package,
    featured_pkg_len = this.featured_packages.length,
    property,
    num;

    for (i = 0; i < 2; i++ ){
        channel_name = "Approximate number of HD channels";
        if (i > 0) {
          channel_name = "Approximate channels in per package<span class='red'>**</span>";
        }

        this.data[i] = {
            id:  "id_" + i,
            channel_name: channel_name,
            channel_number: " ",
            call_letters: " ",
            genre:" "
        };


        for(n = 0; n < featured_pkg_len; n++ ){ //loop through all featured packages
          featured_package = this.featured_packages[n];
          num = n + 1;
          property = 'p' + num;
          if (i > 0) {
            this.data[i][property] = featured_package.channelCount;
          }
          else {
            this.data[i][property] = featured_package.hdChannelCount;
          }
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
  "use strict";
    this.grid = grid;
    this.message_box = message_box;
    /**
     * Shows all channels for a given package
     * @param {string} property represents the key value of the package from the data source
     * @param {boolean} hd_only determines if we're filtering hd only for true or all for false
     */
    this.filterChannelsByPackage = function(property,hd_only){
      var msg_box = this.message_box,
      count;
      //start hooking-up to the grid
      this.grid.package_channels = property;
      this.grid.search_terms = [];
      this.grid.searchString = 'x';
      this.grid.updateFilter(); //update the grid
      count = this.grid.dataView.getLength();
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
  "use strict";
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
        this.self.show();
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
var searchBox = function(context,grid,messageBoxId,resetBtnId,activeClass){
   "use strict";
    /*jslint newcap: true */
    this.context = context;
    this.grid = grid;
    this.self = $('#'+this.context);
    this.self.focus();
    this.resetBtnId = resetBtnId;
    this.activeClass = activeClass;

    var thisSearchBox = this;

   this.autoSearch = function(){
        var oThis = this.self,
         oGrid = this.grid,
        msg_box = new messageBox(messageBoxId,this.grid),
        reset_btn = new reset(resetBtnId,activeClass),
        result_count = '',
        utility = new Utility();
        msg_box.clear();

        oThis.keyup(function (e) {
            if (  (e.keyCode === 27) // if escape
               || (((e.keyCode === 8) || (e.keyCode === 46)) // ( [ OR backspace OR delete ]
               && ((oThis.val().match("^\\s*$")))) // AND search term is not a blank string "only spaces" )
               ){
              $('#' + resetBtnId).click();
            } else if (
                      ((!oThis.val().match("^\\s*$")) && (oThis.val().length !== 0)) // if ( term is not empty AND not a blank string "only spaces" )
                      && ((e.keyCode === 8) || (e.keyCode === 32) || (e.keyCode === 46) // AND ( backspace OR space OR delete
                      || ((e.keyCode >= 48) && (e.keyCode <= 57)) // OR [ a keyboard number ]
                      || ((e.keyCode >= 96) && (e.keyCode <= 105)) // OR [ a numpad number ]
                      || ((e.keyCode >= 65) && (e.keyCode <= 90))) // OR [ a letter ] )
                      ){
                reset_btn.activate(oGrid,oThis,messageBoxId);
                oGrid.package_channels = false; //set to false to broadcast we're searching normally
                utility.normalizeNumLink();

                oGrid.searchString = oThis.val();
                result_count = thisSearchBox.doSearch(oGrid,config.search_delims);

                if ((result_count > 0 || result_count === 0) && oGrid.searchString.length > 0){
                   msg_box.createMsg(result_count);
                }

                oThis.focus();
            }
        });

        oThis.keydown(function (e) {
            if (  (e.keyCode === 13) // if enter
               && (oThis.val().length !== 0) // AND search term is not empty
               && (!oThis.val().match("^\\s*$")) // AND search term is not a blank string "only spaces"
               ) {

                var clearedVal = oThis.val(),
                result_count = thisSearchBox.doSearch(oGrid,config.search_delims);
                oThis.val('');

                oGrid.searchString = clearedVal;

                if ((result_count > 0 || result_count === 0) && oGrid.searchString.length > 0){
                   msg_box.createMsg(result_count);
                }

                msg_box.searchTerm(clearedVal.replace(/ /g, '\u00a0'));
                reset_btn.activate(oGrid,oThis,messageBoxId);
            }
        });

    };

    /**
     * Does the actual search
     * @param {object} grid the Grid class to attach
     * @param {object} search_box the searchBox class
     * @param {array} search_delims the accepted search delimiters
     * @return {integer}
     */
    this.doSearch = function(grid,search_delims){
        /*global searchDelimiterMgr */
        /*jslint newcap: true*/
        var delim_mgr = new searchDelimiterMgr(search_delims,grid.searchString);
        grid.search_terms = this.getSearchTerms(delim_mgr);
        grid.updateFilter();
        return grid.dataView.getLength();
    };

    /* Returns an array of multiple search terms
     * @param {object} delim_mgr the searchDelimiterMgr class instantiated
     * @param {string} base_delim
     * @return {array} search_terms
     */
    this.getSearchTerms = function(delim_mgr){
        var base_delimiter = delim_mgr.base_delim,
        search_terms = [];
        if (delim_mgr.checkSearchDelimiter()) {
            search_terms = delim_mgr.syncDelimiterToBase().split(base_delimiter);
        }
        return search_terms;
    };
};




/**
 * Class responsible for search delimiter checking, manipulation, etc.
 * @param {array} supported_delims collection of supported search delimiters
 * @param {string} search_term the term/word to search
 *
 * @todo add an exception throw if supported_delims is not an array or empty
 */
var searchDelimiterMgr = function(supported_delims,search_term){
    "use strict";
    this.supported_delims = supported_delims;
    this.search_term = search_term;
    this.base_delim = supported_delims[0]; //assign the base delimiter
    this.util = new Utility();
};


/**
 * Syncs all the multiple delimiters into one base delimiter
 * @return {string} search term that is now delimited by one delimiter
 */
searchDelimiterMgr.prototype.syncDelimiterToBase = function(){
    "use strict";
    var i,
    supported_delim;
    for (i = 0; i < this.supported_delims.length; i++) {
        supported_delim = $.trim(this.supported_delims[i]);
        if (supported_delim !== this.base_delim) {
           this.search_term = this.util.replaceAll(this.search_term,supported_delim,this.base_delim);
       }
    }
    return this.search_term;
};



/**
 * Check if a search term contains a supported delimiter
 * @return {boolean}
 */
searchDelimiterMgr.prototype.checkSearchDelimiter = function(){
    "use strict";
    var found = false,
    supported_delim,
    supported_delims_len = this.supported_delims.length,
    i;
    for (i = 0; i < supported_delims_len; i++) {
        supported_delim = this.supported_delims[i];
        if (this.search_term.indexOf(supported_delim) !== -1){
           found = true;
           break;
        }
    }
    return found;
};


/**
 * Start of message box class
 *
 */
var messageBox = function(context,grid){
    "use strict";
    this.self = $('#'+context);
    this.grid = grid;
    this.clear = function(){
        this.self.html('To look up multiple networks, use a comma (,) to separate search terms.');
    };
};

messageBox.prototype.createMsg = function(count){
    "use strict";
    var util = new Utility(),
    msg = '';
    if (!util.isInteger(count) || count < 0) {
        throw new Error('Enter a valid count.');
    }

    if (this.self.hasClass('no-channels-found')) {
      this.self.removeClass('no-channels-found');
    }

    if (this.self.hasClass('search-term')) {
      this.self.removeClass('search-term');
    }
    /*global getServerPath */
    if (count === 0) {
      this.self.addClass('no-channels-found');
      msg = '<b>' + count + ' channel(s) found</b>. <br />See <a target="_blank" href="'+getServerPath(config.localhost)+'programming/commercials.html">Programming Requests</a> for points about channels not currently available on DIRECTV.';
    }
    else {
      msg = '<b>' + count + ' channel(s) found</b>.';
    }

    this.self.html(msg);
};


messageBox.prototype.createPackageMsg = function(count,is_hd){
    "use strict";
    var util = new Utility(),
     formatter = new UrlFormatter(config.localhost),
     package_index = '',
     package_name,
     package_link,
     msg;

    if (!util.isInteger(count) || count < 0) {
        throw new Error('Enter a valid count.');
    }

    if (typeof is_hd !== 'boolean') {
        throw new Error('Enter a valid boolean value if hd or not.');
    }

    if (this.self.hasClass('no-channels-found')) {
      this.self.removeClass('no-channels-found');
    }
    //reverse the index
    package_index = (this.grid.featured_packages.length - 1) - package_index;
    package_name = this.grid.featured_packages[package_index].display_name;
    package_link = formatter.adjustUrl(this.grid.featured_packages[package_index].url);

    msg = 'Displaying <b>'+count+'</b> channels for '+'<a href="'+package_link+'" target="_blank">'+package_name+'</a> package.';
    if (is_hd) {
       msg = 'Displaying <b>'+count+'</b> HD channels for '+'<a href="'+package_link+'" target="_blank">'+package_name+'</a> package.';
    }
    this.self.html(msg);
};

messageBox.prototype.searchTerm = function(term) {
    "use strict";
    var msg = "You searched for <b>&ldquo;<span>" + term + "</span>&rdquo;</b><br /><br />";
    this.self.addClass('search-term');
    this.self.prepend(msg);
};
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
    "use strict";
    this.container = $('#' + context);
    this.featured_packages = featured_packages;
    this.headers = [];
    this.column_width = column_width;
    var i,
    rotated_header,
    featured_pkg_len = this.featured_packages.length,
    headers_len = this.headers.length,
    target;
    this.render = function(){
        this.featured_packages.reverse();
        for(i = 0; i < featured_pkg_len; i++){
            rotated_header = $('<div class="pull-left narrower" id="head_'+i+'"><span>'+this.featured_packages[i].display_name+'</span></div>');
            this.headers.push(rotated_header); //fill the headers property
            this.container.prepend(rotated_header);
        }
        for(i = 0; i < headers_len; i++){
          this.headers[i].attr("style","width:" + this.column_width+"px");
        }
    };
    this.onHoverIn = function(e){
                target = (e.currentTarget) || e.srcElement;
                target.style.cursor = "hand";
    };
    this.onHoverOut = function(e){
        target = (e.currentTarget) || e.srcElement;
        target.style.cursor = "pointer";
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
    "use strict";
    /*jslint newcap:true */
    /*jslint unparam: true */

    var formatter = new UrlFormatter(localhost),
    util = new Utility(),
    oThis = this,
    rect_height = 150, //height of the rotated wrapper
    text_deg = rect_deg - 90, //calculate degree of rotattion of text to be parallel w/ container div
    featured_packages = this.featured_packages,
    width = this.column_width,
    headers = this.headers,
    column_height = headers[0].height(),

    rect_y_coord =  column_height - rect_height,
    rect_x_coord = util.calculateTangentWidth(rect_deg,column_height),

    count = headers.length,
    is_even_count = (0 === count % 2); //true if even then false otherwise

    $.each(headers, function(i, header) {
          /*global Raphael */
        var index = i,
        div = header,
        url = featured_packages[index].url,
        tooltip_msg = featured_packages[index].description,
        span = div.find('span'),
        height = div.height(),
        text = span.text(),
        text_width = span.textWidth(),
        text_y_coord = height/2 - text_width/2 + y_diff,
        adjacent_height = height - text_y_coord,
        text_x_coord = util.calculateTangentWidth(rect_deg, adjacent_height),
        calc_text_x_coord = text_x_coord + width/2, //center it by adding half of the column width

        //draw the text
        R = new Raphael(div.attr('id'), width, 0), //create the canvas
        paper,


        //draw the rectangle that wraps the text
        rect = R.rect(rect_x_coord, rect_y_coord, width, rect_height),

        is_odd = (0 !== index % 2),
        rect_fill = is_even_count ? (is_odd ? '#86b9ec':'#cde1f5') : (is_odd ? '#cde1f5':'#86b9ec'),
        tool_tip = new toolTip(div);


        rect.attr({
            'fill': rect_fill,
            'stroke':'#fff'
        }).rotate(rect_deg,0,0).click(function(){
            window.open(formatter.adjustUrl(url), '_blank');
        }).hover(
            oThis.onHoverIn, oThis.onHoverOut
        );

        paper = R.text(calc_text_x_coord, text_y_coord);
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
    "use strict";
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
        var nameSorter = this.nameSorter,
        up = nameSorter.find('.up'),
        down = nameSorter.find('.down');
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
        var channelNumberSorter = this.channelNumberSorter,
        up = channelNumberSorter.find('.up'),
        down = channelNumberSorter.find('.down');
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
        var callLetterSorter = this.callLetterSorter,
        up = callLetterSorter.find('.up'),
        down = callLetterSorter.find('.down');
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
      var genreSorter = this.genreSorter,
      up = genreSorter.find('.up'),
      down = genreSorter.find('.down');
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
    "use strict";
    var oThis = this,
    nameSorterLink = oThis.nameSorter.find('a');
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
    "use strict";
    var oThis = this,
    channelNumberSorterLink = oThis.channelNumberSorter.find('a');
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
    "use strict";
    var oThis = this,
    callLetterSorterLink = oThis.callLetterSorter.find('a');
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
    "use strict";
    var oThis = this,
    genreSorterLink = oThis.genreSorter.find('a');
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
var reset = function(context, activeClass){
    "use strict";
    /*jslint newcap: true */
    var oThis = this;
    this.aClass = activeClass;
    this.self = $('#' + context);
    this.activate = function(grid,search_box,messageBoxId){
        var util = new Utility(),
        message_box = new messageBox(messageBoxId,grid);

        this.self.addClass(oThis.aClass);
        this.self.unbind().click(function(){
          grid.package_channels = false;
          util.normalizeNumLink();
          search_box.val('');
          message_box.clear();
          grid.searchString = search_box.val();
          grid.search_terms = [];
          grid.updateFilter();
          oThis.self.removeClass(oThis.aClass);
            if (grid.environment !== 'test') {
              dcsMultiTrack("DCSext.channel_lineup_search_term","reset button hit");
          }
        });
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
    "use strict";
    this.localhost = localhost;
    this.formatUrl = function(url){
        if (typeof url !== 'string') {
            throw new Error('Enter a valid url.');
        }
        url = url.replace(/\s/g, ''); //remove spaces
        var base = "href='",
        index = url.indexOf(base);
        if (-1 === index) {
           return this.adjustUrl(url.replace(/["']/g, ""));
        }
        url = url.replace(/http:\/\/agentanswercenterstg.directv.com/g, "");
        url = url.substring(index + base.length,url.length - 1);
        return this.adjustUrl(url.replace(/["']/g, ""));
    };
    /**
     * Adjust url to relative server location
     */
    this.adjustUrl = function(url){
        if (this.localhost && url) {
           url = url.replace(/\/en-us\/res\//g, getServerPath(true));
        }
        return url;
    };
};


/**
 * Helper class that contains some clean-up functions
 */
var Utility = function(){
    //checks if the number is an integer
    "use strict";
    this.isInteger = function(n){
       return parseInt(n, 10) === n;
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
        var ua = window.navigator.userAgent,
        msie = ua.indexOf("MSIE ");
        if (msie > 0) {
            return true;
        }
        return false;
    };
    this.calculateTangentWidth = function(deg,opposite_height){
        if (isNaN(deg)) {
           throw new Error('Enter a valid degree value.');
        }
        if (isNaN(opposite_height)) {
           throw new Error('Enter a valid opposite height value.');
        }
        var tan_width = Math.tan(Raphael.rad(deg))*opposite_height;
        if (!this.isIE()) {
          return (Math.round(tan_width * 100) / 100);
        }
        return (Math.round(tan_width * 100) / 100) - 2; //need to compensate 2 units if IE
    };
    this.escapeRegExp = function(string) {
        return string.replace(/([.*+?\^=!:${}()|\[\]\/\\])/g, "\\$1");
    };
    this.replaceAll = function(string, find, replace) {
      return string.replace(new RegExp(this.escapeRegExp(find), 'g'), replace);
    };
};

/**
 * The Error class
 */
var Error = function(message){
    "use strict";
    this.message = message;
};

Error.prototype.toString = function(){
    "use strict";
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
    "use strict";
    if (!$.fn.textWidth.fakeEl) {
        $.fn.textWidth.fakeEl = $('<span>').hide().appendTo(document.body);
    }
    $.fn.textWidth.fakeEl.text(text || this.val() || this.text()).css('font', font || this.css('font'));
    return $.fn.textWidth.fakeEl.width();
};


/**
* Pops out a new window
*/
var pop_at = function(a, b, c, d) {
    "use strict";

  if (d === 'undefined') {
      d = '_blank';
  }
    var width = b,
    height = c,
    newWin = window.open(a, d, ",status=no,toolbar=no,menubar=no,location=no,scrollbars=yes,resizable=yes width=" + width + ",height=" + height);
    newWin.focus();
};

/**
 * Creates the comment button
 *
 * @param {object} container the main container object that will hold the comment button
 * @param {string} class_name preferred class name for the inner container
 * @param {string} root_url the root url to call
 */
var commentBtn = function(container, class_name, root_url){
    "use strict";
    this.self = container;
    this.class_name = class_name;
    this.root_url = root_url;
    var that = this;
    
    /**
     * Initialize function
     * @param {object} tool_author DOM element that holds the name of the tool's author
     */
    this.init = function(tool_author){
        if (!tool_author || null === tool_author) {
           tool_author = $('#tool-author-id');
        }
        var feedback_btn = '<div class='+this.class_name+'><span class="btn-feedback btns" shape="rect" title="Provide Feedback">Provide Feedback</span></div>';
        this.self.append(feedback_btn); //append to itself
        $('.'+this.class_name+' span.btn-feedback').click(function(){
            var url = window.top.location.pathname,
            aID = tool_author.val(),
            feedbackForm,
            w = 375,
            h = 375,
            winl = (screen.width-w)/2,
            wint = ((screen.height-h)/2) - (h/2);

            feedbackForm = window.open(that.root_url + "system/scripts/add-feedback-tools.jsp?pid=" + url + "&aid=" + aID ,"feedbackForm","location=0,status=0,scrollbars=0,  width=" + w + ",height=" + h);

            feedbackForm.moveTo(winl, wint);
            feedbackForm.focus();
        });
    };
};
