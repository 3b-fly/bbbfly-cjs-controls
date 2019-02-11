/**
 * @file
 * @author Jan Nejedly [support@3b-fly.eu]
 * @copyright Jan Nejedly
 *
 * @inpackage file
 */

/** @ignore */
var bbbfly = bbbfly || {};
/** @ignore */
bbbfly.fileuploader = {};

/** @ignore */
bbbfly.fileuploader._onItemsChanged = function(list,items){
  var uploader = this.ParentControl;
  var hasItem = (items.length > 0);

  this.SetInvalid(!hasItem);
  this.Owner.BtnRemoveFiles.SetEnabled(hasItem);

  if(typeof uploader.OnFilesChanged === 'function'){
    uploader.OnFilesChanged(items);
  }
};

bbbfly.fileuploader._onAddFileEnabledChanged = function(){
  this.Owner.DragAndDropPanel.SetVisible(this.Enabled);
};

/** @ignore */
bbbfly.fileuploader._onShowWaiting = function(uploader){
  var progressPanel = uploader.Controls.ProgressPanel;
  var bar = progressPanel.Controls.ProgressBar;

  bar.SetPosition(0);
  progressPanel.SetVisible(true);
};

/** @ignore */
bbbfly.fileuploader._onHideWaiting = function(uploader){
  var progressPanel = uploader.Controls.ProgressPanel;
  if(progressPanel){progressPanel.SetVisible(false);}
};

/** @ignore */
bbbfly.fileuploader._onUploadProgress = function(uploader,progress){
  var progressPanel = uploader.Controls.ProgressPanel;
  var bar = progressPanel.Controls.ProgressBar;

  if(!Number.isNumber(progress)){progress = 0;}
  bar.SetPosition(progress);
};

/** @ignore */
bbbfly.fileuploader._onGetAddBtnText = function(){
  var uploader = this.Owner.Owner;
  return (uploader.MaxFilesCount > 1)
    ? ngTxt('bbbfly_fileuploader_add_more')
    : ngTxt('bbbfly_fileuploader_add_one');
};

/** @ignore */
bbbfly.fileuploader._onGetRemoveBtnText = function(){
  var uploader = this.Owner.Owner;
  return (uploader.MaxFilesCount > 1)
    ? ngTxt('bbbfly_fileuploader_remove_more')
    : ngTxt('bbbfly_fileuploader_remove_one');
};

/** @ignore */
bbbfly.fileuploader._onGetProgressText = function(){
  var uploader = this.ParentControl.ParentControl;
  return (uploader.MaxFilesCount === 1)
    ? ngTxt('bbbfly_fileuploader_upload_one')
    : ngTxt('bbbfly_fileuploader_upload_more');
};

/** @ignore */
bbbfly.fileuploader._showError = function(data){
  if(typeof this.DoShowError !== 'function'){return;}

  if(!Array.isArray(data)){data = new Array(data);}

  var message = '';
  switch(this.ErrorLevel){
    case bbbfly.FileUploader.error.minimal:
      var filesCnt = (data.length > 0) ? ''+data.length+'x' : '';

      var text = ngTxt('bbbfly_fileuploader_error_min_general');
      message += text.replace('%errs%',filesCnt);
    break;
    case bbbfly.FileUploader.error.grouped:
      var errors = {};

      for(var i in data){
        var item = data[i];
        if(typeof item !== 'object'){continue;}

        var fileName = item.Name;
        var error = item.Error;

        if(error && error.Message){
          if(!errors[error.Message]){errors[error.Message] = new Array();}
          errors[error.Message].push(fileName ? fileName : true);
        }
      }

      for(var i in errors){
        var filesCnt = (errors[i].length > 0) ? ''+errors[i].length+'x' : '';
        switch(i){
          case 'ngfup_Error_General':
            var text = ngTxt('bbbfly_fileuploader_error_grp_general');
            message += text.replace('%errs%',filesCnt)+'\n';
          break;
          case 'ngfup_Error_Extension':
            var exts = bbbfly.fileuploader._fileNameExtsToString(errors[i]);
            var text = ngTxt('bbbfly_fileuploader_error_grp_extension');
            message += text.replace('%exts%',exts)+'\n';
          break;
          case 'ngfup_Error_Size':
            var maxSize = bbbfly.fileuploader._maxSize(this.MaxFileSize);
            var text = ngTxt('bbbfly_fileuploader_error_grp_maxsize');
            message += text.replace('%size%',maxSize).replace('%errs%',filesCnt)+'\n';
          break;
          case 'ngfup_Error_MaxBatch':
            var maxSize = bbbfly.fileuploader._maxSize(this.MaxBatchSize);
            var text = ngTxt('bbbfly_fileuploader_error_grp_batch');
            message += text.replace('%size%',maxSize).replace('%errs%',filesCnt)+'\n';
          break;
          case 'ngfup_Error_MaxFiles':
            var maxCnt = bbbfly.fileuploader._maxCnt(this.MaxFilesCount);
            var text = ngTxt('bbbfly_fileuploader_error_grp_maxcnt');
            message += text.replace('%cnt%',maxCnt).replace('%errs%',filesCnt)+'\n';
          break;
        }
      }
    break;
    case bbbfly.FileUploader.error.fulllog:
      for(var i in data){
        var item = data[i];
        if(typeof item !== 'object'){continue;}

        var fileName = item.Name;
        var error = item.Error;

        if(fileName && error && error.Message){
          switch(error.Message){
            case 'ngfup_Error_General':
              var text = ngTxt('bbbfly_fileuploader_error_full_general');
              message += text.replace('%file%',fileName)+'\n';
            break;
            case 'ngfup_Error_Extension':
              var text = ngTxt('bbbfly_fileuploader_error_full_extension');
              message += text.replace('%file%',fileName)+'\n';
            break;
            case 'ngfup_Error_Size':
              var maxSize = bbbfly.fileuploader._maxSize(this.MaxFileSize);
              var text = ngTxt('bbbfly_fileuploader_error_full_maxsize');
              message += text.replace('%file%',fileName).replace('%size%',maxSize)+'\n';
            break;
            case 'ngfup_Error_MaxBatch':
              var maxSize = bbbfly.fileuploader._maxSize(this.MaxBatchSize);
              var text = ngTxt('bbbfly_fileuploader_error_full_batch');
              message += text.replace('%size%',maxSize)+'\n';
            break;
            case 'ngfup_Error_MaxFiles':
              var maxCnt = bbbfly.fileuploader._maxCnt(this.MaxFilesCount);
              var text = ngTxt('bbbfly_fileuploader_error_full_maxcnt');
              message += text.replace('%cnt%',maxCnt)+'\n';
            break;
          }
        }
      }
    break;
  }
  this.DoShowError(message);
};

/** @ignore */
bbbfly.fileuploader._fileNameExtsToString = function(fileNames){
  var exts = new Array();
  for(var i in fileNames){
    var name = fileNames[i];
    var ext = String.isString(name)
      ? name.substring(name.indexOf(".")) : '';
    if(!exts[ext]){exts[ext] = 1;}
    else{exts[ext]++;}
  }

  var str = '';
  for(var j in exts){
    str += (str ? ', ' : '')+exts[j]+'x '+j;
  }

  return str;
};

/** @ignore */
bbbfly.fileuploader._hasFilesToRemove = function(){
  if(this.SelectFileType === ngFupSelect_None){
    var list = this.Controls.ListFiles;
    return (list && (list.Items.length > 0));
  }
  return this.HasFilesToRemove.callParent();
};

/** @ignore */
bbbfly.fileuploader._getFilesToRemove = function(){
  if(this.SelectFileType === ngFupSelect_None){
    var list = this.Controls.ListFiles;
    return (list) ? list.Items : new Array();
  }
  return this.GetFilesToRemove.callParent();
};

/** @ignore */
bbbfly.fileuploader._maxSize = function(value){
  if(Number.isNumber(value)){
    var units = new Array('B','kB','MB','GB');
    for(var i in units){
      if(value < 1000){return '('+(Math.floor(value*10)/10)+units[i]+')';}
      value /= 1000;
    }
  }
  return '';
};

/** @ignore */
bbbfly.fileuploader._maxCnt = function(value){
  return Number.isNumber(value) ? ' ('+Math.floor(value)+')' : '';
};

/**
 * @class
 * @type control
 * @extends ngFileUploader
 *
 * @description
 *   File uploader with build in progress panel,
 *   better single file upload handling
 *   and more error reporting types.
 *
 * @inpackage file
 *
 * @param {object} [def=undefined] - Descendant definition
 * @param {object} [ref=undefined] - Reference owner
 * @param {object|string} [parent=undefined] - Parent DIV element or its ID
 *
 * @property {bbbfly.FileUploader.error} [ErrorLevel=grouped]
 *   Upload error reporting precision.
 */
bbbfly.FileUploader = function(def,ref,parent){
  def = def || {};

  var oneFile = (def.Data && (def.Data.MaxFilesCount === 1));

  ng_MergeDef(def, {
    Data: {
      ErrorLevel: bbbfly.FileUploader.error.grouped,
      SelectFileType: oneFile ? ngFupSelect_None : ngFupSelect_Select
    },
    Controls: {
      Buttons: {
        style: { zIndex: 1 },
        Controls: {
          BtnAddFile: {
            Events: {
              OnGetText: bbbfly.fileuploader._onGetAddBtnText,
              OnEnabledChanged: bbbfly.fileuploader._onAddFileEnabledChanged
            }
          },
          BtnRemoveFiles: {
            Events: {
              OnGetText: bbbfly.fileuploader._onGetRemoveBtnText
            }
          }
        }
      },
      ListFiles: {
        Type: 'bbbfly.List',
        style: { zIndex: 1 },
        Data: { Invalid: true },
        Events: {
          OnItemsChanged: bbbfly.fileuploader._onItemsChanged
        }
      },
      DragAndDropPanel: {
        style: { zIndex: 2 }
      },
      ProgressPanel: {
        Type: 'ngPanel',
        L:0, R:0, T:0, B:0,
        style: { zIndex: 3 },
        ParentReferences: false,
        Data: { Visible: false },
        Controls: {
          ProgressBar: {
            Type: 'ngProgressBar'
          },
          ProgressMessage: {
            Type: 'ngText',
            Events: {
              OnGetText: bbbfly.fileuploader._onGetProgressText
            }
          }
        }
      }
    },
    Events: {
      /** @private */
      OnShowWaiting: bbbfly.fileuploader._onShowWaiting,
      /** @private */
      OnHideWaiting: bbbfly.fileuploader._onHideWaiting,
      /** @private */
      OnUploadProgress: bbbfly.fileuploader._onUploadProgress,

      /**
       * @event
       * @name OnFilesChanged
       * @memberof bbbfly.FileUploader#
       *
       * @param {array} items - File list items
       */
      OnFilesChanged: null
    },
    Methods: {
      /** @private */
      ShowError: bbbfly.fileuploader._showError,
      /** @private */
      HasFilesToRemove: bbbfly.fileuploader._hasFilesToRemove,
      /** @private */
      GetFilesToRemove: bbbfly.fileuploader._getFilesToRemove,

      /**
       * @function
       * @abstract
       * @name DoShowError
       * @memberof bbbfly.FileUploader#
       * @description Use this method to implement error message.
       *
       * @param {string} text - Message
       */
      DoShowError: null
    }
  });

  return ngCreateControlAsType(def,'ngFileUploader',ref, parent);
};

/**
 * @enum {integer}
 * @description
 *   Possible values for {@link bbbfly.FileUploader#ErrorLevel|ErrorLevel}
 */
bbbfly.FileUploader.error = {
  minimal: 1,
  grouped: 2,
  fulllog: 4
};

/** @ignore */
ngUserControls = ngUserControls || new Array();
ngUserControls['bbbfly_fileuploader'] = {
  OnInit: function(){
    ngRegisterControlType('bbbfly.FileUploader',bbbfly.FileUploader);
  }
};