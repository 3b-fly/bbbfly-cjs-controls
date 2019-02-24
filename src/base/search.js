/**
 * @file
 * @author Jan Nejedly [support@3b-fly.eu]
 * @copyright Jan Nejedly
 *
 * @inpackage search
 */

/** @ignore */
var bbbfly = bbbfly || {};
/** @ignore */
bbbfly.search = {};
/** @ignore */
bbbfly.searchedit = {};
/** @ignore */
bbbfly.searchbox = {};
/** @ignore */
bbbfly.listsearchbox = {};

/** @ignore */
bbbfly.search._normalizeText = function(text){
  text = String.trim(text).toLowerCase().replace(
    /[.*+?^${}()|[\]\\]/g, "\\$&"
  );

  var inChars= "áäąăčćďđéěęíĺľłńňóôőöŕřšśşťţúůűüýžźż";
  var outChars="aaaaccddeeeilllnnoooorrsssttuuuuyzzz";

  var normalized = '';
  for(var i=0;i<text.length;i++){
    var character = text.charAt(i);
    var characterIndex = inChars.indexOf(character);
    if (characterIndex !== -1){
      normalized += outChars.charAt(characterIndex);
    }
    else{
      normalized += character;
    }
  }
  return normalized;
};

/** @ignore */
bbbfly.searchedit._search = function(text){
  if(String.isString(text)){this.SetText(text);}

  if(Function.isFunction(this.OnSearch) && !this.OnSearch(text)){
    return false;
  }
  text = this.GetText();
  if(Function.isFunction(this.DoSearch)){
    return this.DoSearch(text);
  }
  return false;
};

/** @ignore */
bbbfly.searchedit._clearSearch = function(){
  this.SetText('');
  if(Function.isFunction(this.HideHint)){this.HideHint('noresults');}
  this.SetFocus(false);
};

/** @ignore */
bbbfly.searchedit._setSearchResults = function(results){
  if(Array.isArray(results)){
    this._SearchResults = {
      count: results.length,
      results: results,
      current: ((results.length > 0) ? 0 : null)
    };

    if(results.length > 0){
      if(Function.isFunction(this.OnSearchResults)){
        this.OnSearchResults(this._SearchResults);
      }
    }
    else if(Function.isFunction(this.OnNoSearchResults)){
      this.OnNoSearchResults();
    }
    return true;
  }
  return false;
};

/** @ignore */
bbbfly.searchedit._onNoSearchResults = function(){
  if(Function.isFunction(this.ShowHint)){this.ShowHint('noresults');}
};

/** @ignore */
bbbfly.searchedit._onTextChanged = function(){
  if(Function.isFunction(this.HideHint)){this.HideHint('noresults');}
};

/** @ignore */
bbbfly.searchedit._onKeyUp = function(event){
  var key = event.which | event.keyCode;
  if(key === 13){
    if(this._ignoreEnter){
      this._ignoreEnter = false;
    }
    else{
      var button = this.GetButton('search');
      if(button && button.Visible && button.Click){
        button.Click();
        this.SetFocus(false);
      }
    }
    return false;
  }
  return true;
};

/** @ignore */
bbbfly.searchbox._onSearchResults = function(results){
  var items = new Array();

  if(results){
    var shortcut = (results.count > this.MaxResultItems);
    var limit = shortcut ? (this.MaxResultItems - 1) : this.MaxResultItems;
    var itemsCnt = 0;

    for(var i=0;i<limit;i++){
      var result = results.results[i];
      if(!result){break;}
      itemsCnt ++;

      var resultNameProperty = String.isString(this.ResultNameProperty)
        ? this.ResultNameProperty : 'text';

      var resultText = String.isString(result[resultNameProperty])
        ? result[resultNameProperty] : '';
      items.push({
        Text: resultText,
        data: result
      });
    }
    if(shortcut){
      var moreText = '';
      var moreCnt = results.count - itemsCnt;

      if(String.isString(this.MoreItemsText_part1)){
        moreText += ngTxt(this.MoreItemsText_part1);
      }
      moreText += moreCnt;
      if(String.isString(this.MoreItemsText_part2)){
        moreText += ngTxt(this.MoreItemsText_part2);
      }

      items.push({
        Count: moreCnt,
        Text: moreText,
        Enabled: false
      });
    }
  }

  this.DropDownControl.SetItems(items);
  this.DropDown();
};

/** @ignore */
bbbfly.searchbox._onNoSearchResults = function(){
  this.ListItem = null;
  this.DropDownControl.SetItems(null);
  this.HideDropDown();
};

/** @ignore */
bbbfly.searchbox._clearSearch = function(){
  this.ClearSearch.callParent();
  this.ListItem = null;
  this.DropDownControl.SetItems(null);
  this.HideDropDown();
};

/** @ignore */
bbbfly.searchbox._onListKeyDown = function(event){
  var key = event.which | event.keyCode;
  switch(key){
    case 13: //Enter
      this.DropDownOwner._ignoreEnter = true;
    break;
    case 27: //Esc
      this.DropDownOwner.SetFocusAfter();
      return false;
    break;
    case 38: //Up
    case 40: //Down
    case 33: //PgUp
    case 34: //PgDown
    case 37: //Left
    case 39: //Right
    break;
    default:
      var edit = this.DropDownOwner;
      edit.SetFocusAfter();
    break;
  }
  return true;
};

/** @ignore */
bbbfly.searchbox._selectListItemWithFocus = function(item){
  var selected = this.SelectDropDownItem(item);
  if(selected){this.DropDownOwner.SetFocusAfter();}
  return selected;
};

/** @ignore */
bbbfly.listsearchbox._onUpdated = function(){
  if(!this._SearchList && this.ListID){
    var list = ngGetControlById(this.ListID);
    if(list){this.SetSearchList(list);}
  }
};

/** @ignore */
bbbfly.listsearchbox._setSearchList = function(list){
  if(
    list
    && Function.isFunction(list.CtrlInheritsFrom)
    && list.CtrlInheritsFrom('bbbfly.List')
  ){
    this._SearchList = list;
    list._ExpandedBySearch = null;
    list.AddEvent('OnCollapsed',function(list,item){
      var expanded = list._ExpandedBySearch;
      if((typeof expanded === 'object') && expanded){
        for(var i in expanded){
          if(expanded[i].ID === item.ID){
            expanded.splice(i,1);
            break;
          }
        }
      }
    });
    return true;
  }
  return false;
};

/** @ignore */
bbbfly.listsearchbox._clearSearch = function(){
  this.ClearSearch.callParent();
  var upButton = this.GetButton('up');
  var downButton = this.GetButton('down');
  if(upButton){upButton.SetVisible(false);}
  if(downButton){downButton.SetVisible(false);}
  this.Update();
};

/** @ignore */
bbbfly.listsearchbox._doSearch = function(text){
  var list = this._SearchList;
  if(!list || !list.Items || (list.Items.length < 1)){return false;}

  text = bbbfly.search._normalizeText(text);
  if(!text){return false;}

  if(Function.isFunction(this.CompareItem)){
    var results = new Array();
    var searchBox = this;

    var searchItems = function(items){
      for(var i in items){
        var item = items[i];

        if(searchBox.CompareItem(list,item,text)){
          results.push(item);
        }

        if(typeof item.Items === 'object'){
          searchItems(item.Items);
        }
      }
    };

    searchItems(list.Items);
    this.SetSearchResults(results);
    return true;
  }

  this.SetSearchResults([]);
  return false;
};

/** @ignore */
bbbfly.listsearchbox._compareItem = function(list,item,text){
  var itemText = null;

  if(Function.isFunction(this.GetItemText)){
    itemText = this.GetItemText(item);
  }
  else if(Function.isFunction(list.OnGetText)){
    itemText = list.OnGetText(list,item);
  }
  else{
    itemText = item.Text;
  }

  if(!String.isString(itemText)){return false;}

  itemText = bbbfly.search._normalizeText(itemText);
  var exp = new RegExp('^(.*)'+text+'(.*)$');
  if(exp.test(itemText)){return true;}
  return false;
};

/** @ignore */
bbbfly.listsearchbox._onNoSearchResult = function(){
  var upButton = this.GetButton('up');
  var downButton = this.GetButton('down');
  if(upButton){upButton.SetVisible(false);}
  if(downButton){downButton.SetVisible(false);}
  this.Update();
};

/** @ignore */
bbbfly.listsearchbox._onSearchResults = function(results){
  var list = this._SearchList;
  if(!list){return;}

  var firstResult = results.results[0];

  bbbfly.listsearchbox._showListItem(list,firstResult);
  list.ScrollToItem(firstResult);
  list.HighlightItem(firstResult);

  var upButton = this.GetButton('up');
  var downButton = this.GetButton('down');
  if(upButton){upButton.SetVisible(false);}
  if(downButton){downButton.SetVisible(results.results.length > 1);}
  this.Update();
  this.SetFocusAfter();
};

/** @ignore */
bbbfly.listsearchbox._onTextChanged = function(){
  var upButton = this.GetButton('up');
  var downButton = this.GetButton('down');
  if(upButton){upButton.SetVisible(false);}
  if(downButton){downButton.SetVisible(false);}
  this.Update();
};

/** @ignore */
bbbfly.listsearchbox._onKeyUp = function(event){
  var key = event.which | event.keyCode;
  var button = null;
  switch(key){
    case 13: button = 'search'; break;
    case 38: button = 'up'; break;
    case 40: button = 'down'; break;
  }
  if(button){
    button = this.GetButton(button);
  }
  if(
    button && button.Visible
    && Function.isFunction(button.Click)
  ){
    button.Click();
    return false;
  }
  return true;
};

/** @ignore */
bbbfly.listsearchbox._showNextResult = function(searchbox,list){
  if(searchbox._SearchResults && list){
    var results = searchbox._SearchResults;
    var newIndex = results.current + 1;
    bbbfly.listsearchbox._showResult(searchbox,list,results,newIndex);
  }
};

/** @ignore */
bbbfly.listsearchbox._showPreviousResult = function(searchbox,list){
  if(searchbox._SearchResults && list){
    var results = searchbox._SearchResults;
    var newIndex = results.current - 1;
    bbbfly.listsearchbox._showResult(searchbox,list,results,newIndex);
  }
};

/** @ignore */
bbbfly.listsearchbox._showResult = function(edit,list,results,index){
  if(list && results){
    if((index > -1) && (index < results.count)){
      var item = results.results[index];

      bbbfly.listsearchbox._showListItem(list,item);
      list.ScrollToItem(item);
      list.HighlightItem(item);

      var upButton = edit.GetButton('up');
      var downButton = edit.GetButton('down');
      if(upButton){
        upButton.SetVisible(index > 0);
      }
      if(downButton){
        downButton.SetVisible(index < (results.count -1));
      }

      results.current = index;
      edit.Update();
    }
  }
};

/** @ignore */
bbbfly.listsearchbox._showListItem = function(list,item){
  list.BeginUpdate();

  bbbfly.listsearchbox._hideListItem(list);

  var collapsedAncs = new Array();
  var getCollapsed = function(item){
    if(item.Parent){
      if(item.Parent.Collapsed){
        collapsedAncs.push(item.Parent);
      }
      getCollapsed(item.Parent);
    }
  };
  getCollapsed(item);

  if(collapsedAncs.length > 0){
    for(var i in collapsedAncs){
      list.Expand(collapsedAncs[i]);
    }
  }
  list._ExpandedBySearch = collapsedAncs;

  list.EndUpdate();
};

/** @ignore */
bbbfly.listsearchbox._hideListItem = function(list){
  list.BeginUpdate();
  if(list._ExpandedBySearch && (list._ExpandedBySearch.length > 0)){
    var itemsToCollapse = new Array();
    for(var i in list._ExpandedBySearch){
      itemsToCollapse.push(list._ExpandedBySearch[i]);
    }
    for(var j in itemsToCollapse){
      list.Collapse(itemsToCollapse[j]);
    }
  }
  list._ExpandedBySearch = null;

  list.EndUpdate();
};

/**
 * @class
 * @type control
 * @extends bbbfly.Edit
 *
 * @inpackage search
 *
 * @param {object} [def=undefined] - Descendant definition
 * @param {object} [ref=undefined] - Reference owner
 * @param {object|string} [parent=undefined] - Parent DIV element or it's ID
 *
 * @property {object} HintMessages
 * @property {resource} [HintMessages.noresults='bbbfly_searchedit_noresults']
 * @property {image} [SearchImg=null] - Search button image
 */
bbbfly.SearchEdit = function(def,ref,parent){
  def = def || {};

  ng_MergeDef(def, {
    Data: {
      HintMessages: {
        noresults: 'bbbfly_searchedit_noresults'
      },
      SearchImg: null,

      /** @private */
      _SearchResults: null
    },
    Events: {
      /** @private */
      OnTextChanged: bbbfly.searchedit._onTextChanged,
      /** @private */
      OnKeyUp: bbbfly.searchedit._onKeyUp,
      /**
       * @event
       * @name OnSearch
       * @memberof bbbfly.SearchEdit#
       *
       * @param {string} text
       * @return {boolean} If continue to search
       *
       * @see {@link bbbfly.SearchEdit#Search|Search()}
       * @see {@link bbbfly.SearchEdit#DoSearch|DoSearch()}
       */
      OnSearch: null,
      /**
       * @event
       * @name OnSearchResults
       * @memberof bbbfly.SearchEdit#
       * @description Called when any anything was found.
       *
       * @param {bbbfly.SearchEdit.searchResults} results
       *
       * @see {@link bbbfly.SearchEdit#Search|Search()}
       * @see {@link bbbfly.SearchEdit#DoSearch|DoSearch()}
       * @see {@link bbbfly.SearchEdit#SetSearchResults|SetSearchResults()}
       */
      OnSearchResults: null,
      /**
       * @event
       * @name OnNoSearchResults
       * @memberof bbbfly.SearchEdit#
       * @description Called when nothing was found.
       *
       * @see {@link bbbfly.SearchEdit#Search|Search()}
       * @see {@link bbbfly.SearchEdit#DoSearch|DoSearch()}
       * @see {@link bbbfly.SearchEdit#SetSearchResults|SetSearchResults()}
       */
      OnNoSearchResults: bbbfly.searchedit._onNoSearchResults
    },
    Methods: {
      /**
       * @function
       * @name Search
       * @memberof bbbfly.SearchEdit#
       * @description
       *   Search for passed text or text filled in edit.
       *
       * @param {string} [text=undefined] - Edit text will be used if undefined
       * @return {boolean} If text was valid
       *
       * @see {@link bbbfly.SearchEdit#DoSearch|DoSearch()}
       * @see {@link bbbfly.SearchEdit#ClearSearch|ClearSearch()}
       * @see {@link bbbfly.SearchEdit#event:OnSearch|OnSearch}
       * @see {@link bbbfly.SearchEdit#event:OnSearchResults|OnSearchResults}
       * @see {@link bbbfly.SearchEdit#event:OnNoSearchResults|OnNoSearchResults}
       */
      Search: bbbfly.searchedit._search,
      /**
       * @function
       * @name ClearSearch
       * @memberof bbbfly.SearchEdit#
       *
       * @see {@link bbbfly.SearchEdit#Search|Search()}
       */
      ClearSearch: bbbfly.searchedit._clearSearch,
      /**
       * @function
       * @name SetSearchResults
       * @memberof bbbfly.SearchEdit#
       *
       * @param {bbbfly.SearchEdit.searchResults} results
       * @return {boolean} If results were valid
       *
       * @see {@link bbbfly.SearchEdit#event:OnSearchResults|OnSearchResults}
       * @see {@link bbbfly.SearchEdit#event:OnNoSearchResults|OnNoSearchResults}
       */
      SetSearchResults: bbbfly.searchedit._setSearchResults,
      /**
       * @function
       * @abstract
       * @name DoSearch
       * @memberof bbbfly.SearchEdit#
       * @description Use this method to implement searching process.
       *
       * @param {string} text - Searched text
       * @return {boolean} If text was valid
       *
       * @see {@link bbbfly.SearchEdit#Search|Search()}
       */
      DoSearch: null
    }
  });

  if(def.Data.SearchImg){
    ng_MergeDef(def, {
      Buttons: {
        search: {
          Type: 'ngButton',
          Data: {
            LeftImg: def.Data.SearchImg
          },
          Events: {
            OnClick: function(){
              this.Owner.Search();
              return true;
            }
          }
        }
      }
    });
  }

  return ngCreateControlAsType(def,'bbbfly.Edit',ref, parent);
};

/**
 * @class
 * @type control
 * @extends bbbfly.SearchEdit
 *
 * @inpackage search
 *
 * @param {object} [def=undefined] - Descendant definition
 * @param {object} [ref=undefined] - Reference owner
 * @param {object|string} [parent=undefined] - Parent DIV element or it's ID
 *
 * @property {integer} [MaxResultItems=5]
 * @property {integer} [ResultNameProperty='name']
 * @property {resource} [MoreItemsText_part1='bbbfly_searchbox_more_part1']
 *   More items item text first part resource name
 * @property {resource} [MoreItemsText_part2='bbbfly_searchbox_more_part2']
 *   More items item text second part resource name
 */
bbbfly.SearchBox = function(def,ref,parent){
  def = def || {};

  ng_MergeDef(def, {
    Data: {
      MaxResultItems: 5,
      ResultNameProperty: 'name',
      MoreItemsText_part1: 'bbbfly_searchbox_more_part1',
      MoreItemsText_part2: 'bbbfly_searchbox_more_part2'
    },
    /** @private */
    DropDown: {
      Type: 'ngList',
      Events: {
        OnKeyDown: bbbfly.searchbox._onListKeyDown
      },
      Methods: {
        SelectDropDownItemWithFocus: bbbfly.searchbox._selectListItemWithFocus
      }
    },
    Events: {
      /** @private */
      OnSearchResults: bbbfly.searchbox._onSearchResults,
      /** @private */
      OnNoSearchResults: bbbfly.searchbox._onNoSearchResults
    },
    Methods: {
      /**
       * @function
       * @name ClearSearch
       * @memberof bbbfly.SearchBox#
       * @override
       *
       * @see {@link bbbfly.SearchEdit#ClearSearch|ClearSearch()}
       */
      ClearSearch: bbbfly.searchbox._clearSearch
    }
  });

  return ngCreateControlAsType(def,'bbbfly.SearchEdit',ref, parent);
};

/**
 * @class
 * @type control
 * @extends bbbfly.SearchEdit
 *
 * @inpackage search
 *
 * @param {object} [def=undefined] - Descendant definition
 * @param {object} [ref=undefined] - Reference owner
 * @param {object|string} [parent=undefined] - Parent DIV element or it's ID
 *
 * @property {string} [ListID=null] - {@link bbbfly.List|bbbfly.List} to search in ID
 * @property {image} [DownImg=null] - Down button image
 * @property {image} [UpImg=null] - Up button image
 */
bbbfly.ListSearchBox = function(def,ref,parent){
  def = def || {};

  ng_MergeDef(def, {
    Data: {
      ListID: null,
      DownImg: null,
      UpImg: null,
      /** @private */
      _SearchList: null
    },
    Events: {
      /** @private */
      OnUpdated: bbbfly.listsearchbox._onUpdated,
      /** @private */
      OnTextChanged: bbbfly.listsearchbox._onTextChanged,
      /** @private */
      OnKeyUp: bbbfly.listsearchbox._onKeyUp,
      /** @private */
      OnNoSearchResults: bbbfly.listsearchbox._onNoSearchResults,
      /** @private */
      OnSearchResults: bbbfly.listsearchbox._onSearchResults
    },
    Methods: {
      /**
       * @function
       * @name SetSearchList
       * @memberof bbbfly.ListSearchBox#
       *
       * @param {bbbfly.List} list
       * @return {boolean} If list was valid
       */
      SetSearchList: bbbfly.listsearchbox._setSearchList,
      /**
       * @function
       * @name ClearSearch
       * @memberof bbbfly.ListSearchBox#
       * @override
       */
      ClearSearch: bbbfly.listsearchbox._clearSearch,
      /**
       * @function
       * @name DoSearch
       * @memberof bbbfly.ListSearchBox#
       * @override
       */
      DoSearch: bbbfly.listsearchbox._doSearch,
      /**
       * @function
       * @name CompareItem
       * @memberof bbbfly.ListSearchBox#
       *
       * @param {bbbfly.List} list - Searched list
       * @param {ngListItem} item - Searched list item
       * @param {string} text - Searched text
       * @return {boolean} If item matches searched text
       */
      CompareItem: bbbfly.listsearchbox._compareItem,
      /**
       * @function
       * @abstract
       * @name GetItemText
       * @memberof bbbfly.ListSearchBox#
       * @description Return text which should be searched in.
       *
       * @param {ngListItem} item
       * @return {string} Searchable item text
       */
      GetItemText: null
    }
  });

  if(def.Data.DownImg){
    ng_MergeDef(def, {
      Buttons: {
        down: {
          Type: 'ngButton',
          Data: {
            LeftImg: def.Data.DownImg,
            Visible: false
          },
          Events: {
            OnClick: function(){
              var edit = this.Owner;
              bbbfly.listsearchbox._showNextResult(edit,edit._SearchList);
              return true;
            }
          }
        }
      }
    });
  }
  if(def.Data.UpImg){
    ng_MergeDef(def, {
      Buttons: {
        up: {
          Type: 'ngButton',
          Data: {
            LeftImg: def.Data.UpImg,
            Visible: false
          },
          Events: {
            OnClick: function(){
              var edit = this.Owner;
              bbbfly.listsearchbox._showPreviousResult(edit,edit._SearchList);
              return true;
            }
          }
        }
      }
    });
  }


  return ngCreateControlAsType(def,'bbbfly.SearchEdit',ref, parent);
};

/** @ignore */
ngUserControls = ngUserControls || new Array();
ngUserControls['bbbfly_search'] = {
  OnInit: function(){
    ngRegisterControlType('bbbfly.SearchEdit',bbbfly.SearchEdit);
    ngRegisterControlType('bbbfly.SearchBox',bbbfly.SearchBox);
    ngRegisterControlType('bbbfly.ListSearchBox',bbbfly.ListSearchBox);
  }
};

/**
 * @typedef {object} searchResults
 * @memberOf bbbfly.SearchEdit
 *
 * @property {integer} count - Number of result items
 * @property {object[]} results - Result items
 * @property {integer|null} current - Currently displayed result item index
 */