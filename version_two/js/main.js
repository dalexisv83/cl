/**
 * main configuration file that defines dependencies
 */
require.config({
    urlArgs: "build=#00#", //bust caching
    paths:{       
        //jquery
        jquery:config.baseUrlPath + 'system/js/jquery-1.10.2.min',
        qtip:config.baseUrlPath + 'system/js/jquery.qtip.min',
        eventDrag:config.baseUrlPath + 'system/js/jquery-event-drag',
        
        //raphael
        raphael:config.baseUrlPath + 'system/js/raphael',
        
        //slick grid library
        slickCore:config.baseUrlPath + 'system/js/slick-core',
        slickGrid:config.baseUrlPath + 'rover_tools/channel_list/version_two/js/slick-grid',
        slickDataView:config.baseUrlPath + 'rover_tools/channel_list/version_two/js/slick-dataview',
        
        //residential datasource
        data:config.baseUrlPath + 'rover_tools/channel_list/version_two/data/channels',
        //commercial datasource
        comData:config.baseUrlPath + 'rover_tools/channel_list/version_two/data/com_channels',
        //ad channels
        adChannels:config.baseUrlPath + 'rover_tools/channel_list/version_two/data/ad_channels',
        
        //main class
        mainLib:'class',
        initModule:'initModule'
        
    },
    shim : {
      mainLib:{
          deps : ['jquery','qtip','eventDrag','raphael','slickCore','slickGrid','slickDataView']
      },
      eventDrag:{
          deps: ['jquery']
      },
      slickCore: {
          deps: ['jquery','eventDrag']
      },
      slickGrid: {
          deps: ['slickCore']
      },
      slickDataView: {
          deps: ['slickCore']
      }
    }
});


//kick-start the app
require(['initModule'],function(module){
    "use strict";
    module.bootStrap();
});
