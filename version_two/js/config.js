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
    localhost:true,
    k_width: 410,
    rowHeightTall:38, //row height for the big grid
    rowHeightShort:30, //row height for the small grid
    y_diff:14, //constant used for calculating distance on rotated text to the bottom
    adChannelUrl: "javascript:document.location.href='"+getServerPath(this.localhost)+"programming/paid_programming_part_time_channels.html'",
    deg: 10, //degree of rotation of the package divs
    search_delims: [',','|','*','#','$'], //array of supported search delimiters
    searchable_columns:['anchors','channel_name','channel_number','call_letters','genre'] //add the name of the columns to be searchable
};