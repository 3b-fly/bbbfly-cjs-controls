/**
 * @author Jan Nejedly support@3b-fly.eu
 * @copyright Jan Nejedly
 * @version 2.0.0
 * @license see license in 'LICENSE' file
 */

var bbbfly = bbbfly || {};
bbbfly.search = {};
bbbfly.searchedit = {};
bbbfly.searchbox = {};
bbbfly.listsearchbox = {};
bbbfly.search._normalizeText = function(text){
  text = text.trim().toLowerCase().replace(
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
bbbfly.searchedit._search = function(text){
  if(typeof text === 'string'){this.SetText(text);}

  if((typeof this.OnSearch === 'function') && !this.OnSearch(text)){
    return false;
  }
  text = this.GetText();
  if(typeof this.DoSearch === 'function'){
    return this.DoSearch(text);
  }
  return false;
};
bbbfly.searchedit._clearSearch = function(){
  this.SetText('');
  if(typeof this.HideHint === 'function'){this.HideHint('noresults');}
  this.SetFocus(false);
};
bbbfly.searchedit._setSearchResults = function(results){
  if(Array.isArray(results)){
    this._SearchResults = {
      count: results.length,
      results: results,
      current: ((results.length > 0) ? 0 : null)
    };

    if(results.length > 0){
      if(typeof this.OnSearchResults === 'function'){
        this.OnSearchResults(this._SearchResults);
      }
    }
    else if(typeof this.OnNoSearchResults === 'function'){
      this.OnNoSearchResults();
    }
    return true;
  }
  return false;
};
bbbfly.searchedit._onNoSearchResults = function(){
  if(typeof this.ShowHint === 'function'){this.ShowHint('noresults');}
};
bbbfly.searchedit._onTextChanged = function(){
  if(typeof this.HideHint === 'function'){this.HideHint('noresults');}
};
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

      var resultNameProperty = (typeof this.ResultNameProperty === 'string')
        ? this.ResultNameProperty : 'text';

      var resultText = (typeof result[resultNameProperty] === 'string')
        ? result[resultNameProperty] : '';
      items.push({
        Text: resultText,
        data: result
      });
    }
    if(shortcut){
      var moreText = '';
      var moreCnt = results.count - itemsCnt;

      if(typeof this.MoreItemsText_part1 === 'string'){
        moreText += ngTxt(this.MoreItemsText_part1);
      }
      moreText += moreCnt;
      if(typeof this.MoreItemsText_part2 === 'string'){
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
bbbfly.searchbox._onNoSearchResults = function(){
  this.ListItem = null;
  this.DropDownControl.SetItems(null);
  this.HideDropDown();
};
bbbfly.searchbox._clearSearch = function(){
  this.ClearSearch.callParent();
  this.ListItem = null;
  this.DropDownControl.SetItems(null);
  this.HideDropDown();
};
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
bbbfly.searchbox._selectListItemWithFocus = function(item){
  var selected = this.SelectDropDownItem(item);
  if(selected){this.DropDownOwner.SetFocusAfter();}
  return selected;
};
bbbfly.listsearchbox._onUpdated = function(){
  if(!this._SearchList && this.ListID){
    var list = ngGetControlById(this.ListID);
    if(list){this.SetSearchList(list);}
  }
};
bbbfly.listsearchbox._setSearchList = function(list){
  if(
    list
    && (typeof list.CtrlInheritsFrom === 'function')
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
bbbfly.listsearchbox._clearSearch = function(){
  this.ClearSearch.callParent();
  var upButton = this.GetButton('up');
  var downButton = this.GetButton('down');
  if(upButton){upButton.SetVisible(false);}
  if(downButton){downButton.SetVisible(false);}
  this.Update();
};
bbbfly.listsearchbox._doSearch = function(text){
  var list = this._SearchList;
  if(!list || !list.Items || (list.Items.length < 1)){return false;}

  text = bbbfly.search._normalizeText(text);
  if(!text){return false;}

  if(typeof this.CompareItem === 'function'){
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
bbbfly.listsearchbox._compareItem = function(list,item,text){
  var itemText = null;

  if(typeof this.GetItemText === 'function'){
    itemText = this.GetItemText(item);
  }
  else if(typeof list.OnGetText === 'function'){
    itemText = list.OnGetText(list,item);
  }
  else{
    itemText = item.Text;
  }

  if(typeof itemText !== 'string'){return false;}

  itemText = bbbfly.search._normalizeText(itemText);
  var exp = new RegExp('^(.*)'+text+'(.*)$');
  if(exp.test(itemText)){return true;}
  return false;
};
bbbfly.listsearchbox._onNoSearchResult = function(){
  var upButton = this.GetButton('up');
  var downButton = this.GetButton('down');
  if(upButton){upButton.SetVisible(false);}
  if(downButton){downButton.SetVisible(false);}
  this.Update();
};
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
bbbfly.listsearchbox._onTextChanged = function(){
  var upButton = this.GetButton('up');
  var downButton = this.GetButton('down');
  if(upButton){upButton.SetVisible(false);}
  if(downButton){downButton.SetVisible(false);}
  this.Update();
};
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
  if(button && button.Visible && (typeof button.Click === 'function')){
    button.Click();
    return false;
  }
  return true;
};
bbbfly.listsearchbox._showNextResult = function(searchbox,list){
  if(searchbox._SearchResults && list){
    var results = searchbox._SearchResults;
    var newIndex = results.current + 1;
    bbbfly.listsearchbox._showResult(searchbox,list,results,newIndex);
  }
};
bbbfly.listsearchbox._showPreviousResult = function(searchbox,list){
  if(searchbox._SearchResults && list){
    var results = searchbox._SearchResults;
    var newIndex = results.current - 1;
    bbbfly.listsearchbox._showResult(searchbox,list,results,newIndex);
  }
};
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
bbbfly.SearchEdit = function(def,ref,parent){
  def = def || {};

  ng_MergeDef(def, {
    Data: {
      HintMessages: {
        noresults: 'bbbfly_searchedit_noresults'
      },
      SearchImg: null,
      _SearchResults: null
    },
    Events: {
      OnTextChanged: bbbfly.searchedit._onTextChanged,
      OnKeyUp: bbbfly.searchedit._onKeyUp,
      OnSearch: null,
      OnSearchResults: null,
      OnNoSearchResults: bbbfly.searchedit._onNoSearchResults
    },
    Methods: {
      Search: bbbfly.searchedit._search,
      ClearSearch: bbbfly.searchedit._clearSearch,
      SetSearchResults: bbbfly.searchedit._setSearchResults,
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
bbbfly.SearchBox = function(def,ref,parent){
  def = def || {};

  ng_MergeDef(def, {
    Data: {
      MaxResultItems: 5,
      ResultNameProperty: 'name',
      MoreItemsText_part1: 'bbbfly_searchbox_more_part1',
      MoreItemsText_part2: 'bbbfly_searchbox_more_part2'
    },
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
      OnSearchResults: bbbfly.searchbox._onSearchResults,
      OnNoSearchResults: bbbfly.searchbox._onNoSearchResults
    },
    Methods: {
      ClearSearch: bbbfly.searchbox._clearSearch
    }
  });

  return ngCreateControlAsType(def,'bbbfly.SearchEdit',ref, parent);
};
bbbfly.ListSearchBox = function(def,ref,parent){
  def = def || {};

  ng_MergeDef(def, {
    Data: {
      ListID: null,
      DownImg: null,
      UpImg: null,
      _SearchList: null
    },
    Events: {
      OnUpdated: bbbfly.listsearchbox._onUpdated,
      OnTextChanged: bbbfly.listsearchbox._onTextChanged,
      OnKeyUp: bbbfly.listsearchbox._onKeyUp,
      OnNoSearchResults: bbbfly.listsearchbox._onNoSearchResults,
      OnSearchResults: bbbfly.listsearchbox._onSearchResults
    },
    Methods: {
      SetSearchList: bbbfly.listsearchbox._setSearchList,
      ClearSearch: bbbfly.listsearchbox._clearSearch,
      DoSearch: bbbfly.listsearchbox._doSearch,
      CompareItem: bbbfly.listsearchbox._compareItem,
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