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
bbbfly.grid._onUpdated = function(){
  var childParent = this.ControlsPanel ? this.ControlsPanel : this;
  var childControls = childParent.ChildControls;

  this._Rows = new Array();
  this._Columns = new Array();

  if(childControls && (childControls.length > 0)){

    var node = childParent.Elm();
    ng_BeginMeasureElement(node);
    var gridWidth = ng_ClientWidth(node);
    ng_EndMeasureElement(node);

    var itemsCnt = childControls.length;
    var columnsCnt = (typeof this.MinColumnWidth === 'number')
      ? Math.floor(gridWidth / this.MinColumnWidth) : 1;

    var itemsPerColumn = Math.ceil(itemsCnt / columnsCnt);
    columnsCnt = Math.ceil(itemsCnt / itemsPerColumn);
    if(columnsCnt < 1){columnsCnt = 1;}

    var columnWidth = Math.floor(gridWidth / columnsCnt);

    if(typeof this.MaxColumnWidth === 'number'){
      columnWidth = Math.min(columnWidth,this.MaxColumnWidth);
    }

    var colIndex = 0;
    var rowIndex = 0;

    for(var i in childControls){
      var item = childControls[i];

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

    var gridHeight = 0;

    for(var j in this._Rows){
      var row = this._Rows[j];
      var rowHeight = 0;

      for(var k in row){
        var item = row[k];

        var itemLeft = (item._GridColumn * columnWidth);
        var itemWidth = columnWidth;

        if((item._GridColumn + 1) === columnsCnt){
          itemWidth = (gridWidth - itemLeft);

          if(typeof this.MaxColumnWidth === 'number'){
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
        if(typeof itemHeight !== 'number'){
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

    if(this.AutoSize){

      var cPanel = this.ControlsPanel;
      if(cPanel && cPanel.Bounds){

        if(typeof cPanel.Bounds.T === 'number'){gridHeight += cPanel.Bounds.T;}
        if(typeof cPanel.Bounds.B === 'number'){gridHeight += cPanel.Bounds.B;}
      }

      if(this.SetBounds({ H: gridHeight })){
        this.Update(false);
      }

      if(typeof this.OnAutoSized === 'function'){
        this.OnAutoSized();
      }
    }
  }
  return true;
};

/**
 * @class
 * @type control
 * @extends ngPanel
 *
 * @description
 *   Panel which places its child controls in columns grid.
 *
 * @inpackage grid
 *
 * @param {object} [def=undefined] - Descendant definition
 * @param {object} [ref=undefined] - Reference owner
 * @param {object|string} [parent=undefined] - Parent DIV element or its ID
 *
 * @property {boolean} [AutoSize=true]
 * @property {px} [MinColumnWidth=200]
 * @property {px} [MaxColumnWidth=undefined]
 */
bbbfly.GridPanel = function(def,ref,parent){
  def = def || {};

  ng_MergeDef(def,{
    ScrollBars: ssAuto,
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
      OnUpdated: bbbfly.grid._onUpdated,
      /**
       * @event
       * @name OnAutoSized
       * @memberof bbbfly.GridPanel#
       */
      OnAutoSized: null
    }
  });

  return ngCreateControlAsType(def,'ngPanel',ref,parent);
};

/**
 * @class
 * @type control
 * @extends ngGroup
 *
 * @description
 *   Group which places its child controls in columns grid.
 *
 * @inpackage grid
 *
 * @param {object} [def=undefined] - Descendant definition
 * @param {object} [ref=undefined] - Reference owner
 * @param {object|string} [parent=undefined] - Parent DIV element or its ID
 *
 * @property {boolean} [AutoSize=true]
 * @property {px} [MinColumnWidth=200]
 * @property {px} [MaxColumnWidth=undefined]
 */
bbbfly.GridGroup = function(def,ref,parent){
  def = def || {};

  ng_MergeDef(def,{
    ScrollBars: ssNone,
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
      /**
       * @event
       * @name OnAutoSized
       * @memberof bbbfly.GridGroup#
       */
      OnAutoSized: null
    }
  });

  return ngCreateControlAsType(def,'ngGroup',ref,parent);
};

/** @ignore */
ngUserControls = ngUserControls || new Array();
ngUserControls['bbbfly_grid'] = {
  OnInit: function(){
    ngRegisterControlType('bbbfly.GridPanel',bbbfly.GridPanel);
    ngRegisterControlType('bbbfly.GridGroup',bbbfly.GridGroup);
  }
};