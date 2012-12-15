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
  
  cmp_array: function(a_dc_arr, b_dc_arr){
	  var BreakException ={};
	  var ret = 0;
	  try{
		  a_dc_arr.forEach(function(a_dc, a_i){
			  if(typeof b_dc_arr[a_i] == 'undefined'){
				  ret = 1;
				  throw BreakException;
			  }
			  var cmp = a_dc.localeCompare(b_dc_arr[a_i]);
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
  
  cmp_domain: function(a, b){
	  var a_lc = a.toLocaleLowerCase();
	  var b_lc = b.toLocaleLowerCase();
	  if(a_lc == b_lc){
		  return 0;
	  }
	  var a_dc_arr = a_lc.split('.');
	  var b_dc_arr = b_lc.split('.');
	  a_dc_arr.reverse();
	  b_dc_arr.reverse();
	  return SortTabs.cmp_array(a_dc_arr, b_dc_arr);
  },
  
  get_host: function(aURI){
	  var host = '';
	  try{
		  host = aURI.host;
	  }catch(e){}
	  return host;
  },
  
  cast_URI_to_URL: function(aURI){
	try {
	  return aURI.QueryInterface(Components.interfaces.nsIURL);
	}
	catch(e){
	  return null;
	}	  
  },
  
  decode_query: function(query){
	  var pair_split = query.split('&');
	  var pairs = {};
	  pair_split.forEach(function(item){
		  var temp = item.split('=');
		  if(temp.length > 1){
			pairs[decodeURIComponent(temp[0])] = decodeURIComponent(temp[1]);
		  }else{
			pairs[decodeURIComponent(temp[0])] = '';
		  }
	  });
	  var props = [];
	  for(prop in pairs){
		  SortTabs.log("prop:"+prop+" val:"+pairs[prop]);
		  props[props.length] = prop;
	  }
	  props.sort();
	  var ret = [];
	  props.forEach(function(item){
		  ret[ret.length] = item;
		  ret[ret.length] = pairs[item];
	  });
	  ret.forEach(function(item){
		  SortTabs.log("item: "+item);
	  });
	  return ret;
  },
  
  cmp_query: function(a, b){
	var a_decode = SortTabs.decode_query(a);
	var b_decode = SortTabs.decode_query(b);
	return SortTabs.cmp_array(a_decode, b_decode);
  },
  
  cmp_URL: function(a, b){
	  SortTabs.log(a.filePath);
	  SortTabs.log(b.filePath);
	  var cmp_path = a.filePath.localeCompare(b.filePath);
	  if(cmp_path !=0 ) { return cmp_path; }
	  SortTabs.log(a.query);
	  SortTabs.log(b.query);
	  var cmp_query = SortTabs.cmp_query(a.query, b.query);
	  if(cmp_query !=0 ) { return cmp_query; }
	  SortTabs.log(a.ref);
	  SortTabs.log(b.ref);
	  return  a.ref.localeCompare(b.ref);
  },

  domain_sort: function(a, b){
	  SortTabs.log(a.label);
	  SortTabs.log(b.label);
	  var cmp = SortTabs.cmp_domain(SortTabs.get_host(a.linkedBrowser.currentURI), SortTabs.get_host(b.linkedBrowser.currentURI));
	  if(cmp != 0){ return cmp; }
	  var a_URL = SortTabs.cast_URI_to_URL(a.linkedBrowser.currentURI);
	  var b_URL = SortTabs.cast_URI_to_URL(b.linkedBrowser.currentURI);
	  if(a_URL != null && b_URL != null){
		  return SortTabs.cmp_URL(a_URL, b_URL);
	  }else if(a_URL == null && b_URL != null){
		  return -1;
	  }else if(a_URL != null && b_URL == null){
		  return 1;
	  }else{
		return a.linkedBrowser.currentURI.path.localeCompare(b.linkedBrowser.currentURI.path);
	  }
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
