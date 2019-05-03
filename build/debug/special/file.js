/*!
 * @author Jan Nejedly support@3b-fly.eu
 * @copyright Jan Nejedly
 * @version 2.0.0
 * @license see license in 'LICENSE' file
*/


var bbbfly = bbbfly || {};
bbbfly.fileuploader = {};
bbbfly.fileuploader._onItemsChanged = function(list,items){
  var uploader = this.ParentControl;
  var hasItem = (items.length > 0);

  this.SetInvalid(!hasItem);
  this.Owner.BtnRemoveFiles.SetEnabled(hasItem);

  if(Function.isFunction(uploader.OnFilesChanged)){
    uploader.OnFilesChanged(items);
  }
};

bbbfly.fileuploader._onAddFileEnabledChanged = function(){
  this.Owner.DragAndDropPanel.SetVisible(this.Enabled);
};
bbbfly.fileuploader._onShowWaiting = function(uploader){
  var progressPanel = uploader.Controls.ProgressPanel;
  var bar = progressPanel.Controls.ProgressBar;

  bar.SetPosition(0);
  progressPanel.SetVisible(true);
};
bbbfly.fileuploader._onHideWaiting = function(uploader){
  var progressPanel = uploader.Controls.ProgressPanel;
  if(progressPanel){progressPanel.SetVisible(false);}
};
bbbfly.fileuploader._onUploadProgress = function(uploader,progress){
  var progressPanel = uploader.Controls.ProgressPanel;
  var bar = progressPanel.Controls.ProgressBar;

  if(!Number.isNumber(progress)){progress = 0;}
  bar.SetPosition(progress);
};
bbbfly.fileuploader._onGetAddBtnText = function(){
  var uploader = this.Owner.Owner;
  return (uploader.MaxFilesCount > 1)
    ? ngTxt('bbbfly_fileuploader_add_more')
    : ngTxt('bbbfly_fileuploader_add_one');
};
bbbfly.fileuploader._onGetRemoveBtnText = function(){
  var uploader = this.Owner.Owner;
  return (uploader.MaxFilesCount > 1)
    ? ngTxt('bbbfly_fileuploader_remove_more')
    : ngTxt('bbbfly_fileuploader_remove_one');
};
bbbfly.fileuploader._onGetProgressText = function(){
  var uploader = this.ParentControl.ParentControl;
  return (uploader.MaxFilesCount === 1)
    ? ngTxt('bbbfly_fileuploader_upload_one')
    : ngTxt('bbbfly_fileuploader_upload_more');
};
bbbfly.fileuploader._showError = function(data){
  if(!Function.isFunction(this.DoShowError)){return;}
  var message = '';

  switch(this.ErrorLevel){
    case bbbfly.FileUploader.error.minimal:
      if(Object.isObject(data)){
        message +=  ngTxt('bbbfly_fileuploader_error_min_main');
      }
      else if(Array.isArray(data) && (data.length > 0)){
        var text = ngTxt('bbbfly_fileuploader_error_min_general');
        message += text.replace('%errs%',data.length+'x');
      }
    break;
    case bbbfly.FileUploader.error.grouped:
      if(!Array.isArray(data)){data = [data];}
      var errors = {};

      for(var i in data){
        var item = data[i];
        if(!Object.isObject(item)){continue;}

        var error = item.Error;
        if(String.isString(error)){error = { Message: error };}
        if(!Object.isObject(error)){continue;}

        var fileName = item.Name;
        if(!String.isString(fileName)){fileName = '?';}

        if(error && String.isString(error.Message)){
          if(!errors[error.Message]){errors[error.Message] = new Array();}
          errors[error.Message].push(fileName);
        }
      }

      for(var i in errors){
        var filesCnt = (errors[i].length > 0) ? ''+errors[i].length+'x' : '';
        switch(i){
          case 'ngfup_Error_Main':
            var text = ngTxt('bbbfly_fileuploader_error_grp_main');
            message += text+'\n';
          break;
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
      if(!Array.isArray(data)){data = [data];}

      for(var i in data){
        var item = data[i];
        if(!Object.isObject(item)){continue;}

        var error = item.Error;
        if(String.isString(error)){error = { Message: error };}
        if(!Object.isObject(error)){continue;}

        var fileName = item.Name;
        if(!String.isString(fileName)){fileName = '?';}

        switch(error.Message){
          case 'ngfup_Error_Main':
            var text = ngTxt('bbbfly_fileuploader_error_full_main');
            message += text+'\n';
          break;
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
    break;
  }
  this.DoShowError(message);
};
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
bbbfly.fileuploader._hasFilesToRemove = function(){
  if(this.SelectFileType === ngFupSelect_None){
    var list = this.Controls.ListFiles;
    return (list && (list.Items.length > 0));
  }
  return this.HasFilesToRemove.callParent();
};
bbbfly.fileuploader._getFilesToRemove = function(){
  if(this.SelectFileType === ngFupSelect_None){
    var list = this.Controls.ListFiles;
    return (list) ? list.Items : new Array();
  }
  return this.GetFilesToRemove.callParent();
};
bbbfly.fileuploader._maxSize = function(value){
  if(Number.isInteger(value)){
    var units = new Array('B','kB','MB','GB');
    for(var i in units){
      if(value < 1000){return '('+(Math.floor(value*10)/10)+units[i]+')';}
      value /= 1000;
    }
  }
  return '';
};
bbbfly.fileuploader._maxCnt = function(value){
  return Number.isInteger(value) ? ' ('+Math.floor(value)+')' : '';
};
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
        Type: 'bbbfly.Panel',
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
      OnShowWaiting: bbbfly.fileuploader._onShowWaiting,
      OnHideWaiting: bbbfly.fileuploader._onHideWaiting,
      OnUploadProgress: bbbfly.fileuploader._onUploadProgress,
      OnFilesChanged: null
    },
    Methods: {
      ShowError: bbbfly.fileuploader._showError,
      HasFilesToRemove: bbbfly.fileuploader._hasFilesToRemove,
      GetFilesToRemove: bbbfly.fileuploader._getFilesToRemove,
      DoShowError: null
    }
  });

  return ngCreateControlAsType(def,'ngFileUploader',ref, parent);
};
bbbfly.FileUploader.error = {
  minimal: 1,
  grouped: 2,
  fulllog: 4
};
ngUserControls = ngUserControls || new Array();
ngUserControls['bbbfly_fileuploader'] = {
  OnInit: function(){
    ngRegisterControlType('bbbfly.FileUploader',bbbfly.FileUploader);
  }
};