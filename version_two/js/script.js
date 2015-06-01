//cache our data
var featured_packages = data.featured_packages;
var channels = data.channels;
var ad_channels = AdSales.channels;
var data_type = data.type;

$(function () {
    
    //initialize the small(top) grid
    var small_grid = new smallGrid(config.rowHeightShort,'containerSmall',featured_packages);
    small_grid.setOptions(true,false);
    small_grid.setColumns();    
    small_grid.setChannels();
    small_grid.render();
    
    //small grid columns are the same with the big grid
    var columns = small_grid.getColumns();
    
    //initialize the big grid
    var big_grid = new bigGrid(config.rowHeightTall,'container',featured_packages,data_type);
    big_grid.setOptions(true,false);
    big_grid.setColumns(columns);   
    big_grid.setChannels(channels);
    big_grid.setChannels(ad_channels);
    big_grid.render();
    
    //activate the search box
    var search_box = new searchBox('txtSearch',big_grid,'messageBox');
    search_box.autoSearch();
    
    //activate the package filters
    big_grid.activateHdChannelsFilter(search_box,'messageBox');
    big_grid.activateRegularChannelsFilter(search_box,'messageBox');
    
    //get the width for each big_grid cell
    var cell_width = big_grid.getNarrowCellWidth();
    var programming_headers = new programmingHeaders('packageHeaderContainer',featured_packages,cell_width);
    programming_headers.render();
    
    //rotate package headers
    programming_headers.rotate(config.localhost,config.deg,config.y_diff);
    
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
    column_sorter.enableChannelNameSort();
    column_sorter.enableChannelNumberSort();
    column_sorter.enableCallLetterSort();
    column_sorter.enableGenreSort();
    
    //initialize reset button
    var reset_btn = new reset('reset');
    reset_btn.activate(big_grid,search_box,'messageBox');
    
    //initialize tooltip
    var tool_tip_btn = $('#genreLegend');
    var tooltip = new toolTip(tool_tip_btn);
    //activate the genre codes tooltip
    var genre_codes_container = $('#genreCodes');
    tooltip.genreToolTip(genre_codes_container);
    
    //initiate the comment btn
    var btn = $('#comment_btn');
    var root_url = '%%pub%%';
    var class_name = 'comment-btn'; //add a class of comment-btn
    var comment_btn = new commentBtn(btn,class_name,root_url);
    comment_btn.init();
    
});
