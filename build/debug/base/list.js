/*!
 * @author Jan Nejedly support@3b-fly.eu
 * @copyright Jan Nejedly
 * @version 2.0.1
 * @license see license in 'LICENSE' file
*/

var bbbfly = bbbfly || {};
bbbfly.list = {};
bbbfly.dropdownlist = {};
bbbfly.list._normalizeColumns = function(def){
  def.Data.Columns = bbbfly.list._columnsToArray(def.Data.Columns);
};
bbbfly.list._columnsToArray = function(columns){
  if(Array.isArray(columns)){return columns;}
  if(!Object.isObject(columns)){return new Array();}

  var resultColumns = new Array();

  for(var id in columns){
    var column = columns[id];
    ng_MergeVar(column,{
      ID: id,
      Align: 'left'
    });
    resultColumns.push(column);
  }
  return resultColumns;
};
bbbfly.list._normalizeItems = function(def){
  def.Data.Items = bbbfly.list._itemsToArray(def.Data.Items);
};
bbbfly.list._itemsToArray = function(items){
  if(Array.isArray(items)){return items;}
  if(!Object.isObject(items)){return new Array();}

  var resultItems = new Array();

  for(var name in items){
    var itemGroup = items[name];

    if(resultItems.length > 0){
      resultItems.push({Text: '-'});
    }

    for(var id in itemGroup){
      var item = itemGroup[id];

      if(item.Items){
        item.Items = bbbfly.list._itemsToArray(item.Items);
      }
      resultItems.push(item);
    }
  }
  return resultItems;
};
bbbfly.list._getExpanded = function(){
  var expandedItems = Array();
  this.Scan(
    function(list,item){
      if(item.Items && !item.Collapsed){
        expandedItems[item.ID] = item;
      }
      return true;
    }
  );
  return expandedItems;
};
bbbfly.list._expandItems = function(items){
  if(!items || (typeof items !== 'object')){return false;}

  this.BeginUpdate();

  var itemsToExpand = new Array();
  for(var i in items){
    var itemId = items[i].ID;
    if(itemId){itemsToExpand[itemId] = items[i];}
    else{this.Expand(items[i]);}
  }

  this.Scan(
    function(list,item){
      if(!item.Items){return true;}
      if(item.ID && (item.ID in itemsToExpand)){
        list.Expand(item);
      }
      return true;
    }
  );

  this.EndUpdate();
};
bbbfly.list._collapseItems = function(items){
  if(!items || (typeof items !== 'object')){return false;}

  this.BeginUpdate();

  var itemsToCollapse = new Array();
  for(var i in items){
    var itemId = items[i].ID;
    if(itemId){itemsToCollapse[itemId] = items[i];}
    else{this.Collapse(items[i]);}
  }

  this.Scan(
    function(list,item){
      if(!item.Items){return true;}
      if(item.ID && (item.ID in itemsToCollapse)){
        list.Collapse(item);
      }
      return true;
    }
  );

  this.EndUpdate();
};
bbbfly.list._scrollToItem = function(item){
  if(!item || (typeof item !== 'object')){return false;}
  if(item.ID){item = this.FindItemByID(item.ID);}

  var itemId = this.ItemId(item);
  if(itemId){
    var listNode = document.getElementById(this.ID+'_CB');
    if(!listNode){listNode = this.Elm();}
    if(!listNode){return false;}

    ng_BeginMeasureElement(listNode);
    var listHeight = ng_ClientHeight(listNode);
    ng_EndMeasureElement(listNode);

    var itemNode = document.getElementById(this.ID+'_'+itemId);
    var position = ng_ParentPosition(itemNode,listNode);
    var newTop = position.y + listNode.scrollTop;

    listNode.scrollTop = newTop - Math.round(listHeight/2);
    return true;
  }
  return false;
};
bbbfly.list._expandToItem = function(item){
  if(!item || (typeof item !== 'object')){return false;}
  if(item.ID){item = this.FindItemByID(item.ID);}

  this.BeginUpdate();

  this.Expand(item);
  var valid = true;
  if(item.Parent){valid = this.ExpandToItem(item.Parent);}

  this.EndUpdate();
  return valid;
};
bbbfly.list._highlightItem = function(item){
  if(!item || (typeof item !== 'object')){return false;}

  var hlClass = this.HighlightClass;
  var interval = this.HighlightInterval;
  var flashCnt = this.HighlightFlashCnt;

  if(
    String.isString(hlClass)
    && Number.isInteger(interval) && Number.isInteger(flashCnt)
  ){
    var itemId = this.ItemId(item);
    var itemNode = document.getElementById(this.ID+'_'+itemId);

    if(itemNode.className.indexOf(hlClass) < 0){

      var setHighlight = function(showTimes,id,list){
        if(list._HighlightId !== id){return;}
        var cn = itemNode.className;

        if(cn.indexOf(' '+hlClass) < 0){
          itemNode.className = cn+' '+hlClass;
        }
        setTimeout(unsetHighlight,interval,showTimes,id,list);
      };

      var unsetHighlight = function(showTimes,id,list){
        var cn = itemNode.className;
        var hIndex = cn.indexOf(' '+hlClass);
        if(hIndex > -1){
          var sIndex = cn.indexOf(' ',hIndex+1);
          var end = (sIndex > hIndex+1) ? sIndex : cn.length;
          itemNode.className = cn.substring(0,hIndex)+cn.substring(end,cn.length);
        }
        if(showTimes > 1){
          setTimeout(setHighlight,interval,showTimes-1,id,list);
        }
      };

      setHighlight(flashCnt,++(this._HighlightId),this);
    }

    return true;
  }
  return false;
};
bbbfly.list._updateClassName = function(){
  var node = this.Elm();
  if(node){
    var cn = this.BaseClassName;

    if(!this.Enabled){cn = cn+' '+cn+'Disabled';}
    else if(this.Invalid){cn = cn+' '+cn+'Invalid';}

    node.className = cn;
  }
};

bbbfly.list._onUpdated = function(){
  this.UpdateClassName();
};
bbbfly.list._onCalcIndent = function(list,item,id,level){
  var indent = 0;
  if(level > 0){
    if(Number.isInteger(list.DefaultIndent)){
      indent += level*list.DefaultIndent;
    }

    if(Number.isInteger(item.Indent)){
      indent += item.Indent;
    }
  }
  indent += list.CalcItemIndent(item);
  return indent;
};
bbbfly.list._setInvalid = function(invalid,update){
  invalid = (invalid !== false);
  update = (update !== false);

  if(this.Invalid === invalid){return true;}

  if(
    Function.isFunction(this.OnSetInvalid)
    && !this.OnSetInvalid(this,invalid,update)
  ){
    return false;
  }

  this.Invalid = invalid;
  if(Function.isFunction(this.DoSetInvalid)){
    this.DoSetInvalid(invalid,update);
  }
  if(Function.isFunction(this.OnInvalidChanged)){
    this.OnInvalidChanged();
  }

  return true;
};
bbbfly.list._onInvalidChanged = function(){
  this.UpdateClassName();
};
bbbfly.list._onEnabledChanged = function(){
  this.UpdateClassName();
};
bbbfly.list._onGetColumnCaption = function(list,column){
  if(!column){return null;}

  if(String.isString(column.Text)){
    return column.Text;
  }
  else if(String.isString(column.TextRes)){
    return ngTxt(column.TextRes);
  }
  return null;
};
bbbfly.list._onGetText = function(list,item,column){
  if(!item){return null;}

  var text = item.Text;
  var textRes = item.TextRes;

  if(column){
    if(text){text = text[column.ID];}
    if(textRes){textRes = textRes[column.ID];}
  }

  if(String.isString(text)){return text;}
  else if(String.isString(textRes)){return ngTxt(textRes);}
  return null;
};
bbbfly.list._selectDropDownItemWithFocus = function(item){
  var selected = this.SelectDropDownItem(item);
  var owner = this.DropDownOwner;
  if(selected && owner){
    if(Function.isFunction(owner.SetFocusAfter)){owner.SetFocusAfter();}
    else if(Function.isFunction(owner.SetFocus)){owner.SetFocus();}
  }
  return selected;
};
bbbfly.dropdownlist._setFocus = function(){
  return false;
};
bbbfly.dropdownlist._onIconCreated = function(icon){
  icon.BaseClassName = icon.Owner.BaseClassName+'Icon';
  icon.Owner.Icon = icon;
  return true;
};
bbbfly.dropdownlist._onIconClick = function(){
  var edit = this.Owner;
  if(!edit.Enabled || edit.ReadOnly){return;}

  var list = edit.DropDownControl;
  if(list.Visible){edit.HideDropDown();}
  else{edit.DropDown();}
};
bbbfly.dropdownlist._onDropDownChanged = function(){
  this.Owner.DropDownButton.Check(this.Visible);
};
bbbfly.dropdownlist._onListItemGetText = function(edit,list,item,text){
  if(Function.isFunction(list.OnGetText)){
    text = list.OnGetText(list,item);
  }
  return String.isString(text) ? text : '';
};
bbbfly.dropdownlist._onListItemChanged = function(edit,list,item){
  if(this.Icon){
    this.Icon.LeftImg = this.GetIconImg(item);
    this.Update();
  }
  return true;
};
bbbfly.dropdownlist._getIconImg = function(item){
  if(item){
    if(item.EditIconImg){return item.EditIconImg;}
    else if(item.Image){return item.Image;}
  }
  return this.DefaultIconImg;
};
bbbfly.dropdownlist._onReadOnlyChanged = function(edit,readOnly){
  var ddButton = edit.DropDownButton;
  if(ddButton && (ddButton.Visible !== !readOnly)){
    ddButton.SetVisible(!readOnly);
  }
  this.Update();
};
bbbfly.List = function(def,ref,parent){
  def = def || {};

  ng_MergeDef(def,{
    Data: {
      ListIndent: 0,
      DefaultIndent: 10,
      Invalid: false,
      HighlightClass: 'highlight',
      HighlightInterval: 300,
      HighlightFlashCnt: 2,
      Columns: null,
      Items: null,
      _HighlightId: 0

    },
    Events: {
      OnUpdated: bbbfly.list._onUpdated,
      OnCalcIndent: bbbfly.list._onCalcIndent,
      OnEnabledChanged: bbbfly.list._onEnabledChanged,
      OnSetInvalid: null,
      OnInvalidChanged: bbbfly.list._onInvalidChanged
    },
    OverrideEvents: {
      OnGetColumnCaption: bbbfly.list._onGetColumnCaption,
      OnGetText: bbbfly.list._onGetText
    },
    Methods: {
      UpdateClassName: bbbfly.list._updateClassName,
      SelectDropDownItemWithFocus: bbbfly.list._selectDropDownItemWithFocus,
      GetExpanded: bbbfly.list._getExpanded,
      ExpandItems: bbbfly.list._expandItems,
      CollapseItems: bbbfly.list._collapseItems,
      ScrollToItem: bbbfly.list._scrollToItem,
      ExpandToItem: bbbfly.list._expandToItem,
      HighlightItem: bbbfly.list._highlightItem,
      SetInvalid: bbbfly.list._setInvalid,
      DoSetInvalid: null
    }
  });

  bbbfly.list._normalizeColumns(def);
  bbbfly.list._normalizeItems(def);

  return ngCreateControlAsType(def,'ngList',ref,parent);
};
bbbfly.DropDownList = function(def,ref,parent){
  def = def || {};

  ng_MergeDef(def,{
    Data: {
      ShowIcon: false,
      DefaultIconImg: null,
      IconBtnDef: {
         Type: 'ngButton',
        Data: {
          Cursor: 'default',
          ButtonAlign: 'left'
        },
        OnCreated: bbbfly.dropdownlist._onIconCreated,
        Events: {
          OnClick: bbbfly.dropdownlist._onIconClick
        }
      }
    },
    DropDown: {
      Type: 'bbbfly.List',
      Events: {
        OnVisibleChanged: bbbfly.dropdownlist._onDropDownChanged
      }
    },
    Events: {
      OnListItemGetText: bbbfly.dropdownlist._onListItemGetText,
      OnListItemChanged: bbbfly.dropdownlist._onListItemChanged,
      OnReadOnlyChanged: bbbfly.dropdownlist._onReadOnlyChanged
    },
    Methods: {
      SetFocus: bbbfly.dropdownlist._setFocus,
        GetIconImg: bbbfly.dropdownlist._getIconImg
    }
  });

  if(def.Data.ShowIcon){
    if(!Array.isArray(def.Buttons)){def.Buttons = new Array();}
    var btnDef = ng_CopyVar(def.Data.IconBtnDef);

    ng_MergeDef(def,{
      Data: { LeftImg: def.Data.DefaultIconImg }
    });

    def.Buttons.unshift(btnDef);
  }

  return ngCreateControlAsType(def,'ngDropDownList',ref,parent);
};
ngUserControls = ngUserControls || new Array();
ngUserControls['bbbfly_list'] = {
  OnInit: function(){
    ngRegisterControlType('bbbfly.List',bbbfly.List);
    ngRegisterControlType('bbbfly.DropDownList',bbbfly.DropDownList);
  }
};
