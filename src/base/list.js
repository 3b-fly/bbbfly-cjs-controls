/**
 * @file
 * @author Jan Nejedly [support@3b-fly.eu]
 * @copyright Jan Nejedly
 *
 * @inpackage list
 */

/** @ignore */
var bbbfly = bbbfly || {};
/** @ignore */
bbbfly.list = {};
/** @ignore */
bbbfly.dropdownlist = {};

/** @ignore */
bbbfly.list._normalizeColumns = function(def){
  def.Data.Columns = bbbfly.list._columnsToArray(def.Data.Columns);
};

/** @ignore */
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

/** @ignore */
bbbfly.list._normalizeItems = function(def){
  def.Data.Items = bbbfly.list._itemsToArray(def.Data.Items);
};

/** @ignore */
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

/** @ignore */
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

/** @ignore */
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

/** @ignore */
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

/** @ignore */
bbbfly.list._scrollToItem = function(item){
  if(!item || (typeof item !== 'object')){return false;}
  if(item.ID){item = this.FindItemByID(item.ID);}

  var itemId = this.ItemId(item);
  if(itemId){
    var backNode = document.getElementById(this.ID+'_CB');

    ng_BeginMeasureElement(backNode);
    var listHeight = ng_ClientHeight(backNode);
    ng_EndMeasureElement(backNode);

    var itemNode = document.getElementById(this.ID+'_'+itemId);
    var position = ng_ParentPosition(itemNode,backNode);
    var newTop = position.y + backNode.scrollTop;

    backNode.scrollTop = newTop - Math.round(listHeight/2);
    return true;
  }
  return false;
};

/** @ignore */
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

/** @ignore */
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

/** @ignore */
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

/** @ignore */
bbbfly.list._setInvalid = function(invalid,update){
  invalid = (invalid !== false);
  update = (update !== false);

  if(this.Invalid === invalid){return true;}

  if(this.OnSetInvalid && !this.OnSetInvalid(this,invalid,update)){
    return false;
  }

  this.Invalid = invalid;
  if(this.DoSetInvalid){this.DoSetInvalid(invalid,update);}

  return true;
};

/** @ignore */
bbbfly.list._selectDropDownItemWithFocus = function(item){
  var selected = this.SelectDropDownItem(item);
  var owner = this.DropDownOwner;
  if(selected && owner){
    if(Function.isFunction(owner.SetFocusAfter)){owner.SetFocusAfter();}
    else if(Function.isFunction(owner.SetFocus)){owner.SetFocus();}
  }
  return selected;
};

/** @ignore */
bbbfly.dropdownlist._setFocus = function(){
  return false;
};

/** @ignore */
bbbfly.dropdownlist._onIconCreated = function(icon){
  icon.BaseClassName = icon.Owner.BaseClassName+'Icon';
  icon.Owner.Icon = icon;
  return true;
};

/** @ignore */
bbbfly.dropdownlist._onIconClick = function(){
  var edit = this.Owner;
  if(!edit.Enabled || edit.ReadOnly){return;}

  var list = edit.DropDownControl;
  if(list.Visible){edit.HideDropDown();}
  else{edit.DropDown();}
};

/** @ignore */
bbbfly.dropdownlist._onDropDownChanged = function(){
  this.Owner.DropDownButton.Check(this.Visible);
};

/** @ignore */
bbbfly.dropdownlist._onListItemGetText = function(edit,list,item,text){
  if(Function.isFunction(list.OnGetText)){
    return list.OnGetText(list,item);
  }
  return text;
};

/** @ignore */
bbbfly.dropdownlist._onListItemChanged = function(edit,list,item){
  if(this.Icon){
    this.Icon.LeftImg = this.GetIconImg(item);
    this.Update();
  }
  return true;
};

/** @ignore */
bbbfly.dropdownlist._getIconImg = function(item){
  if(item){
    if(item.EditIconImg){return item.EditIconImg;}
    else if(item.Image){return item.Image;}
  }
  return this.DefaultIconImg;
};

/** @ignore */
bbbfly.dropdownlist._onReadOnlyChanged = function(edit,readOnly){
  var ddButton = edit.DropDownButton;
  if(ddButton && (ddButton.Visible !== !readOnly)){
    ddButton.SetVisible(!readOnly);
  }
  this.Update();
};

/**
 * @class
 * @type control
 * @extends ngList
 *
 * @inpackage list
 *
 * @param {object} [def=undefined] - Descendant definition
 * @param {object} [ref=undefined] - Reference owner
 * @param {object|string} [parent=undefined] - Parent DIV element or it's ID
 *
 * @property {integer} [ListIndent=0] - First level indent
 * @property {integer} [DefaultIndent=10] - Each other tree level indent
 * @property {boolean} [Invalid=false] - If list is invalid
 * @property {string} [HighlightClass='highlight'] - Highlighted item CSS class
 * @property {integer} [HighlightInterval=300] - Interval between highlight flashes
 * @property {integer} [HighlightFlashCnt=2] - Number of highlight flashes
 * @property {array|object} [Columns=null] - Define columns as object to allow their merging
 * @property {array|object} [Items=null] - Define items as object to allow their merging
 */
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

      /** @private */
      _HighlightId: 0

    },
    Events: {
      /** @private */
      OnCalcIndent: bbbfly.list._onCalcIndent,
      /**
       * @event
       * @name OnSetInvalid
       * @memberof bbbfly.List#
       *
       * @param {bbbfly.List} list - List reference
       * @param {boolean} invalid - If validity state should change to invalid
       * @param {boolean} update - If list should be updated
       * @return {boolean} Return false to deny validity change
       *
       * @see {@link bbbfly.List#SetInvalid|SetInvalid()}
       * @see {@link bbbfly.List#DoSetInvalid|DoSetInvalid()}
       */
      OnSetInvalid: null
    },
    Methods: {
      /** @private */
      SelectDropDownItemWithFocus: bbbfly.list._selectDropDownItemWithFocus,
      /**
       * @function
       * @name GetExpanded
       * @memberof bbbfly.List#
       *
       * @return {object[]} Aray of expanded items with IDs as keys
       *
       * @see {@link bbbfly.List#ExpandItems|ExpandItems()}
       * @see {@link bbbfly.List#CollapseItems|CollapseItems()}
       */
      GetExpanded: bbbfly.list._getExpanded,
      /**
       * @function
       * @name ExpandItems
       * @memberof bbbfly.List#
       *
       * @param {object[]} items - Will expand to item with the same ID if passed item contains ID property
       * @return {boolean} If items to expand were valid
       *
       * @see {@link bbbfly.List#GetExpanded|GetExpanded()}
       * @see {@link bbbfly.List#CollapseItems|CollapseItems()}
       */
      ExpandItems: bbbfly.list._expandItems,
      /**
       * @function
       * @name CollapseItems
       * @memberof bbbfly.List#
       *
       * @param {object[]} items - Will collapse item with the same ID if passed item contains ID property
       * @return {boolean} If items to expand were valid
       *
       * @see {@link bbbfly.List#GetExpanded|GetExpanded()}
       * @see {@link bbbfly.List#ExpandItems|ExpandItems()}
       */
      CollapseItems: bbbfly.list._collapseItems,
      /**
       * @function
       * @name ScrollToItem
       * @memberof bbbfly.List#
       *
       * @param {object} item - Will scroll to item with the same ID if passed item contains ID property
       * @return {boolean} If item was found in list
       */
      ScrollToItem: bbbfly.list._scrollToItem,
      /**
       * @function
       * @name ExpandToItem
       * @memberof bbbfly.List#
       *
       * @param {object} item - Will expand to item with the same ID if passed item contains ID property
       * @return {boolean} If item was found in list
       */
      ExpandToItem: bbbfly.list._expandToItem,
      /**
       * @function
       * @name HighlightItem
       * @memberof bbbfly.List#
       *
       * @param {object} item - Will highlight item with the same ID if passed item contains ID property
       * @return {boolean} If item was found in list
       */
      HighlightItem: bbbfly.list._highlightItem,
      /**
       * @function
       * @name SetInvalid
       * @memberof bbbfly.List#
       *
       * @param {boolean} invalid - If set invalid or valid
       * @param {boolean} [update=true] - If update list
       * @return {boolean} If validity change was not denied by OnSetInvalid()
       *
       * @see {@link bbbfly.List#DoSetInvalid|DoSetInvalid()}
       * @see {@link bbbfly.List#event:OnSetInvalid|OnSetInvalid}
       */
      SetInvalid: bbbfly.list._setInvalid,
      /**
       * @function
       * @abstract
       * @name DoSetInvalid
       * @memberof bbbfly.List#
       * @description Use this method to implement validity change
       *
       * @param {boolean} invalid - Validity state
       * @param {boolean} [update=true] - If update list
       * @return {boolean} If validity change was not denied by OnSetInvalid()
       *
       * @see {@link bbbfly.List#SetInvalid|SetInvalid()}
       * @see {@link bbbfly.List#event:OnSetInvalid|OnSetInvalid}
       */
      DoSetInvalid: null
    }
  });

  bbbfly.list._normalizeColumns(def);
  bbbfly.list._normalizeItems(def);

  return ngCreateControlAsType(def,'ngList',ref,parent);
};

/**
 * @class
 * @type control
 * @extends ngDropDownList
 *
 * @inpackage list
 *
 * @param {object} [def=undefined] - Descendant definition
 * @param {object} [ref=undefined] - Reference owner
 * @param {object|string} [parent=undefined] - Parent DIV element or it's ID
 *
 * @property {boolean} [ShowIcon=false] - If DropDownList should show selected item icon
 * @property {boolean} [DefaultIconImg=null] - Icon shown when no item is selected
 */
bbbfly.DropDownList = function(def,ref,parent){
  def = def || {};

  ng_MergeDef(def,{
    Data: {
      ShowIcon: false,
      DefaultIconImg: null,

      /** @private */
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
    /** @private */
    DropDown: {
      Type: 'bbbfly.List',
      Events: {
        OnVisibleChanged: bbbfly.dropdownlist._onDropDownChanged
      }
    },
    Events: {
      /** @private */
      OnListItemGetText: bbbfly.dropdownlist._onListItemGetText,
      /** @private */
      OnListItemChanged: bbbfly.dropdownlist._onListItemChanged,
      /** @private */
      OnReadOnlyChanged: bbbfly.dropdownlist._onReadOnlyChanged
    },
    Methods: {
      /** @private */
      SetFocus: bbbfly.dropdownlist._setFocus,
      /**
       * @function
       * @name GetIconImg
       * @memberof bbbfly.DropDownList#
       *
       * @return {image} Image to display in edit
       *
       * @see {@link bbbfly.DropDownList|DefaultIconImg}
       * @see {@link bbbfly.DropDownList.ListItem|EditIconImg}
       */
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

/** @ignore */
ngUserControls = ngUserControls || new Array();
ngUserControls['bbbfly_list'] = {
  OnInit: function(){
    ngRegisterControlType('bbbfly.List',bbbfly.List);
    ngRegisterControlType('bbbfly.DropDownList',bbbfly.DropDownList);
  }
};

/**
 * @typedef {ngListItem} ListItem
 * @memberOf bbbfly.DropDownList
 *
 * @property {integer} EditIconImg - Icon shown in edit when item is selected
 */
