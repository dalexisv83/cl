/**************************************************************
*               Configuration File                            *
*                                                             *
*               Holds the application's constant              *
*               values for customization.                     *
*                                                             *
*               @author: jcapillo@directv.com                 *
**************************************************************/

/**
 * Returns the proper server path
 * @param {boolean} localhost determines if we're running the application in localhost or remote server(Tridion)
 * @return {string} the correct server path
 */
var getServerPath = function(localhost){
    'use strict';
    if (!localhost) {
        return '%%pub%%';
    }    
    return 'http://agentanswercenterstg.directv.com/en-us/res/';
};


/**
 * Constant values for customization.
 */
var config = {
    localhost:false, //important to set this value to true when running on local computer
    k_width: 410, //total width of the div that holds the featured packages
    rowHeightTall:38, //row height for the big grid
    rowHeightShort:30, //row height for the small grid
    y_diff:14, //constant used for calculating distance on rotated text to the bottom
    adChannelUrl: "document.location.href='"+getServerPath(this.localhost)+"programming/paid_programming_part_time_channels.html'", //forms the url for networks classified as Ad Channels
    deg: 10, //degree of rotation of the featured packages divs; 
    search_delims: [','], //collection of supported search delimiters; add symbols like #,* etc. to be used as search delimiters
    searchable_columns:['anchors','channel_name','channel_number','call_letters','genre'] //add the name of the columns to be searchable; remove a column if don't want to be searchable
};