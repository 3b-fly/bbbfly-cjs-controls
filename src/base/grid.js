/**
 * @file
 * @author Jan Nejedly [support@3b-fly.eu]
 * @copyright Jan Nejedly
 *
 * @inpackage grid
 */

/** @ignore */
var bbbfly = bbbfly || {};
/** @ignore */
bbbfly.grid = {};

/** @ignore */
bbbfly.grid._onUpdate = function(){
  var cHolder = this.GetControlsHolder();

  if(cHolder && Function.isFunction(cHolder.SetOverflow)){
    var overflowX = bbbfly.Renderer.overflow.hidden;

    var overflowY = this.AutoSize
      ? bbbfly.Renderer.overflow.hidden
      : bbfly.Renderer.overflow.auto;

    cHolder.SetOverflow(overflowX,overflowY,false);
  }
  return true;
};

/** @ignore */
bbbfly.grid._onUpdated = function(){
  var cHolder = this.GetControlsHolder();
  var items = cHolder.ChildControls;

  var gridHeight = 0;

  this._Rows = new Array();
  this._Columns = new Array();

  if(items && (items.length > 0)){
    var cHolderNode = cHolder.Elm();

    ng_BeginMeasureElement(cHolderNode);
    var gridWidth = ng_ClientWidth(cHolderNode);
    ng_EndMeasureElement(cHolderNode);

    var itemsCnt = items.length;
    var columnsCnt = Number.isInteger(this.MinColumnWidth)
      ? Math.floor(gridWidth / this.MinColumnWidth) : 1;

    var itemsPerColumn = Math.ceil(itemsCnt / columnsCnt);
    columnsCnt = Math.ceil(itemsCnt / itemsPerColumn);
    if(columnsCnt < 1){columnsCnt = 1;}

    var columnWidth = Math.floor(gridWidth / columnsCnt);

    if(Number.isInteger(this.MaxColumnWidth)){
      columnWidth = Math.min(columnWidth,this.MaxColumnWidth);
    }

    var colIndex = 0;
    var rowIndex = 0;

    for(var i in items){
      var item = items[i];

      if(!this._Rows[rowIndex]){this._Rows[rowIndex] = new Array();}
      if(!this._Columns[colIndex]){this._Columns[colIndex] = new Array();}

      this._Rows[rowIndex].push(item);
      this._Columns[colIndex].push(item);

      item._GridRow = rowIndex;
      item._GridColumn = colIndex;

      rowIndex ++;
      if(rowIndex === itemsPerColumn){
        rowIndex = 0;
        colIndex ++;
      }
    }

    for(var j in this._Rows){
      var row = this._Rows[j];
      var rowHeight = 0;

      for(var k in row){
        var item = row[k];

        var itemLeft = (item._GridColumn * columnWidth);
        var itemWidth = columnWidth;

        if((item._GridColumn + 1) === columnsCnt){
          itemWidth = (gridWidth - itemLeft);

          if(Number.isInteger(this.MaxColumnWidth)){
            itemWidth = Math.min(itemWidth,this.MaxColumnWidth);
          }
        }

        var itemBounds = {
          T: gridHeight,
          L: itemLeft,
          W: itemWidth
        };

        if(item.SetBounds(itemBounds)){
          item.Update();
        }

        var itemHeight = item.Bounds.H;
        if(!Number.isNumber(itemHeight)){
          var node = item.Elm();
          ng_BeginMeasureElement(node);
          itemHeight = ng_ClientHeight(node);
          ng_EndMeasureElement(node);
        }

        if(itemHeight > rowHeight){
          rowHeight = itemHeight;
        }
      }
      gridHeight += rowHeight;
    }
  }

  if(this.AutoSize){
    var cPanel = this.GetControlsPanel();

    if(cPanel && cPanel.Bounds){
      if(Number.isNumber(cPanel.Bounds.T)){gridHeight += cPanel.Bounds.T;}
      if(Number.isNumber(cPanel.Bounds.B)){gridHeight += cPanel.Bounds.B;}
    }

    if(this.SetBounds({ H: gridHeight })){
      this.Update(false);
    }

    if(Function.isFunction(this.OnAutoSized)){
      this.OnAutoSized();
    }
  }
  return true;
};

/**
 * @class
 * @type control
 * @extends bbbfly.Frame
 *
 * @description
 *   Panel which places its child controls in columns grid.
 *
 * @inpackage grid
 *
 * @param {bbbfly.Grid.Definition} [def=undefined] - Descendant definition
 * @param {object} [ref=undefined] - Reference owner
 * @param {object|string} [parent=undefined] - Parent DIV element or its ID
 *
 * @property {boolean} [AutoSize=true]
 * @property {px} [MinColumnWidth=200]
 * @property {px} [MaxColumnWidth=undefined]
 */
bbbfly.Grid = function(def,ref,parent){
  def = def || {};

  ng_MergeDef(def,{
    Data: {
      AutoSize: true,
      MinColumnWidth: 200,
      MaxColumnWidth: undefined,

      /** @private */
      _Rows: new Array(),
      /** @private */
      _Columns: new Array()
    },
    Events: {
      /** @private */
      OnUpdate: bbbfly.grid._onUpdate,
      /** @private */
      OnUpdated: bbbfly.grid._onUpdated,
      /**
       * @event
       * @name OnAutoSized
       * @memberof bbbfly.Grid#
       */
      OnAutoSized: null
    }
  });

  return ngCreateControlAsType(def,'bbbfly.Frame',ref,parent);
};

/** @ignore */
ngUserControls = ngUserControls || new Array();
ngUserControls['bbbfly_grid'] = {
  OnInit: function(){
    ngRegisterControlType('bbbfly.Grid',bbbfly.Grid);
  }
};

/**
 * @interface Definition
 * @memberOf bbbfly.Grid
 * @extends bbbfly.Frame.Definition
 *
 * @description Grid control definition
 */