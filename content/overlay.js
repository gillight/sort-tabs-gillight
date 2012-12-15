var SortTabs = {
  onLoad: function() {
    // initialization code
    // this.initialized = true;
  },
  
  default_sort: function(a, b){
	  return (a.linkedBrowser.currentURI.asciiSpec < 
	  b.linkedBrowser.currentURI.asciiSpec) ? -1 : 1;
  },
  
  cmp_variant: function(a, b){
	  if(typeof a == typeof b){
		  if(a > b){
			  return 1;
		  }else if(a < b){
			  return -1;
		  }else{
			  return 0;
		  }
	  }else{
		  if(typeof a == 'number'){
			  return -1;
		  }else{
			  return 1;
		  }
	  }
  },
  
  cmp_domain: function(a, b){
	  if(a.toLocaleLowerCase() == b.toLocaleLowerCase()){
		  return 0;
	  }
	  var a_dc_arr = a.split('.');
	  var b_dc_arr = b.split('.');
	  a_dc_arr.reverse();
	  b_dc_arr.reverse();
	  var BreakException ={};
	  var ret = 0;
	  try{
		  a_dc_arr.forEach(function(a_dc, a_i){
			  if(typeof b_dc_arr[a_i] == 'undefined'){
				  ret = 1;
				  throw BreakException;
			  }
			  var cmp = a_dc.toLocaleLowerCase().localeCompare(b_dc_arr[a_i].toLocaleLowerCase());
			  if(cmp != 0){
				  ret = cmp;
				  throw BreakException;
			  }
		  });
	  }catch(e){
		if (e!==BreakException) throw e;
		return ret;
      }
	  return -1;
  },
  
  get_host: function(aURI){
	  var host = '';
	  try{
		  host = aURI.host;
	  }catch(e){}
	  return host;
  },

  domain_sort: function(a, b){
	  SortTabs.log(a.label);
	  SortTabs.log(b.label);
	  var cmp = SortTabs.cmp_domain(SortTabs.get_host(a.linkedBrowser.currentURI), SortTabs.get_host(b.linkedBrowser.currentURI));
	  if(cmp != 0){ return cmp; }
	  return a.linkedBrowser.currentURI.path.localeCompare(b.linkedBrowser.currentURI.path);
  },
  
  log: function(m){
	  return;
	  Services.console.logStringMessage(m);
  },
  
  run: function(){
    // Components.utils.import("resource://gre/modules/Services.jsm");
    // var gWindow = Services.wm.getMostRecentWindow("navigator:browser");
    // var gBrowser = gWindow.gBrowser;
    // var TabView = gWindow.TabView;
    // var selectedTab = gBrowser.selectedTab;
    function getGroupID(tab){
      if(window.document.getElementById('tab-view') == null){
        TabView._initFrame();
      }
      var defItem = { parent: { id: null } };
      return (tab.tabItem || tab._tabViewTabItem || defItem).parent.id;
    }
    function forEachTab(items, func){
      for (var i = 0; i < items.length; i++){
        func(items[i], i, items);
      }
    }
    var tgtGroupID = getGroupID(gBrowser.selectedTab);
    var tabs = [];
    forEachTab(gBrowser.tabs, function(tab){
      if(getGroupID(tab) == tgtGroupID){
        tabs[tabs.length] = tab; 
      }
    });
    SortTabs.log(tabs.length);
    tabs.forEach(function(item){
		SortTabs.log(item.label);
	});
	tabs.sort(this.domain_sort);
    tabs.forEach(gBrowser.moveTabTo.bind(gBrowser));
  },
};

//SortTabs.run();

window.addEventListener("load", function(e) { SortTabs.onLoad(e); }, false); 
