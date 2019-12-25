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
bbbfly.fileuploader._getRPC = function(){
  if(!this._RPC){this._RPC = this.CreateRPC();}
  return this._RPC;
};

/** @ignore */
bbbfly.fileuploader._getForm = function(){
  return this._Form;
};

/** @ignore */
bbbfly.fileuploader._getIframe = function(){
  return this._Iframe;
};

/** @ignore */
bbbfly.fileuploader._updateForm = function(){
  var form = this.GetForm();
  if(!form){return;}

  var input = form['files[]'];
  if(!input){return;}

  var accept = '';
  var multiple = true;

  if(
    Array.isArray(this.AllowedExtensions)
    && (this.AllowedExtensions.length > 0)
  ){
    accept = this.AllowedExtensions.join(',.');
    if(accept !== ''){accept = '.'+accept;}
  }

  if(Number.isInteger(this.MaxFilesCount)){
    multiple = (this.MaxFilesCount < 2);
  }

  input.accept = accept;
  input.multiple = multiple;
};

/** @ignore */
bbbfly.fileuploader._createRPC = function(){
  var rpc = new ngRPC('UploadFiles');
  rpc.nocache = true;
  rpc.Type = rpcJSONPOST;
  rpc.OnHTTPRequest = bbbfly.fileuploader._onRPCUpload;
  rpc.OnReceivedJSON = bbbfly.fileuploader._onRPCUploaded;
  rpc.OnHTTPRequestFailed = bbbfly.fileuploader._onRPCUploadFailed;
  rpc.FileFormData = null;
  rpc.Owner = this;
  return rpc;
};

/** @ignore */
bbbfly.fileuploader._createForm = function(){
  var oldFF = (ngFireFox && (ngFireFoxVersion<22));
  var oldOpera = (ngOpera && (ngOperaVersion<12));
  var useLabel = (!oldFF && !oldOpera);

  var absolute = 'position:absolute;margin:0px;padding:0px;';
  var stretch = 'left:0px;top:0px;width:100%;height:100%;';

  var form = document.createElement('form');
  form.setAttribute('id',this.ID+'_FO');
  form.setAttribute('target',this.ID+'_IF');

  form.setAttribute('action','');
  form.setAttribute('method','POST');
  form.setAttribute('enctype','multipart/form-data');
  form.style.cssText = absolute+stretch
    +'filter: progid:DXImageTransform.Microsoft.Alpha(opacity=0);'
    +'opacity:0;-moz-opacity:0;z-index:4;';

  var input = document.createElement('input');
  input.setAttribute('id',this.ID+'_FO_I');
  input.setAttribute('name','files[]');
  input.setAttribute('type','file');
  input.setAttribute('size','100');
  input.style.cssText = absolute
    +'left:-100%;top:0px;height:100%;'
    +'width:'+(useLabel ? '100%' : '200%')+';'
    +'font-size:10000px;cursor:pointer !important;';

  var uploader = this;
  input.onchange = function(){
    bbbfly.fileuploader._onFormFilesChange(form,uploader);
  };
  form.appendChild(input);

  if(useLabel){
    var label = document.createElement('label');
    label.setAttribute('id',this.ID+'_FO_L');
    label.setAttribute('for',this.ID+'_FO_I');
    label.style.cssText =absolute+stretch+'cursor:pointer !important;';
    form.appendChild(label);
  }

  this._Form = form;
  return form;
};

/** @ignore */
bbbfly.fileuploader._createIframe = function(){
  var iframe = document.createElement('iframe');
  iframe._initialized = false;

  iframe.setAttribute('id',this.ID+'_IF');
  iframe.setAttribute('name',this.ID+'_IF');
  iframe.setAttribute('scrolling','no');
  iframe.setAttribute('frameborder','0');
  iframe.style.cssText = 'position:absolute;'
    +'width:1px;height:1px;left:-1px;top:-1px;'
    +'overflow:hidden;border:0px;';

  var uploader = this;
  iframe.onload = function(){
    bbbfly.fileuploader._onIframeLoad(iframe,uploader);
  };

  this._IFrame = iframe;
  return iframe;
};

/** @ignore */
bbbfly.fileuploader._onCreated = function(ctrl){
  var node = ctrl.Elm();
  if(!node){return;}

  var iframe = ctrl.CreateIframe();
  if(iframe){node.appendChild(iframe);}
};

/** @ignore */
bbbfly.fileuploader._onUpdated = function(){
  this.UpdateForm();
};

/** @ignore */
bbbfly.fileuploader._reset = function(){
  var list = this.Controls.FilesList;
  if(list){list.Clear();}
  this._Files = [];

  this.Update();
  this.HideProgress();
};

bbbfly.fileuploader._isValid = function(){
  var curFiles = this.GetUploadedFiles();

  var min = this.MinFilesCount;
  var max = this.MaxFilesCount;

  if(Number.isInteger(min) && (curFiles.length < min)){return false;}
  if(Number.isInteger(max) && (curFiles.length > max)){return false;}
  return true;
};

/** @ignore */
bbbfly.fileuploader._getUploadedFiles = function(){
  return Array.isArray(this._Files) ? this._Files : [];
};

/** @ignore */
bbbfly.fileuploader._getSelectedFiles = function(){
  var curFiles = this.GetUploadedFiles();
  var list = this.Controls.FilesList;
  var files = {};

  if((this.MaxFilesCount === 1) && (curFiles.length === 1)){
    var file = curFiles[0];
    files[file.Id] = file;
    return files;
  }
  else if(list){
    var selected = list.GetSelected();

    if(selected.length > 0){
      for(var i in selected){
        var item = selected[i];

        if(item && item.File){
          files[item.File.Id] = item.File;
        }
      }
      return files;
    }
  }
  return null;
};

/** @ignore */
bbbfly.fileuploader._onFormFilesChange = function(form,uploader){
  if(!form){form = uploader.GetForm();}
  if(!form){return;}

  var files = [];
  var input = form['files[]'];

  if(Array.isArray(input.files)){
    if(uploader.ValidateFiles(input.files)){
      for(var i in input.files){
        var file = input.files[i];
        if(file.name){files.push(file.name);}
      }
    }
  }
  else{
    var file = input.value;
    var idx = file.lastIndexOf('\\')+1;
    file = file.substring(idx,file.length);
    if(file){files.push(file);}
  }

  if(files.length > 0){
    uploader.UploadFiles(form);
  }
  form.reset();
};

/** @ignore */
bbbfly.fileuploader._uploadFiles = function(form){
  if(!form){form = this.GetForm();}
  if(!form || !String.isString(this.UploadURL)){return;}

  var params = {
    id: this.FileUploadID,
    ts: new Date().getTime()
  };

  if(Function.isFunction(this.OnGetRequestParams)){
    this.OnGetRequestParams(params);
  }

  var urlParams = '';
  for(var param in params){
    urlParams += (urlParams ? '&' : '?');
    urlParams += encodeURIComponent(param)+'=';
    urlParams += encodeURIComponent(params[param]);
  }

  if(window.FormData){
    var rpc = this.GetRPC();
    if(rpc){
      rpc.clearParams();
      rpc.FileFormData = new FormData(form);

      for(var param in params){
        rpc.SetParam(param,params[param]);
      }

      rpc.sendRequest(this.UploadURL+urlParams);
      return;
    }
  }

  this.ShowProgress(true);
  form.action = this.UploadURL+urlParams;
  form.submit();
};

/** @ignore */
bbbfly.fileuploader._onRPCUpload = function(rpc,info){
  if(!rpc.FileFormData){return true;}
  var uploader = this.Owner;

  if(info.XMLHttp.upload){
    uploader.ShowProgress(false);

    info.XMLHttp.onload = function(){
      uploader.UpdateProgress(100);
    };

    info.XMLHttp.upload.onprogress = function(event){
      if(event.lengthComputable && event.total){
        uploader.UpdateProgress(event.loaded / event.total * 100);
      }
    };
  }

  delete info.ReqHeaders['Content-type'];
  delete info.ReqHeaders['Content-length'];

  info.PostParams = rpc.FileFormData;
  return true;
};

/** @ignore */
bbbfly.fileuploader._onRPCUploaded = function(rpc,data){
  if(Object.isObject(data) || Array.isArray(data)){
    var uploader = rpc.Owner;

    uploader.AddUploadedFiles(data);
    uploader.HideProgress();
    return;
  }
  bbbfly.fileuploader._onRPCUploadFailed(rpc);
};

/** @ignore */
bbbfly.fileuploader._onRPCUploadFailed = function(rpc){
  var data = { Error: bbbfly.FileUploader.errortype.main };
  var uploader = rpc.Owner;

  uploader.AddUploadedFiles(data);
  uploader.HideProgress();
};

/** @ignore */
bbbfly.fileuploader._onIframeLoad = function(iframe,uploader){
  if(!uploader){return;}

  if(!iframe){iframe = uploader.GetIframe();}
  if(!iframe){return;}

  var doc = iframe.contentDocument || iframe.contentWindow.document;
  if(!doc || !doc.body){return;}

  var response = doc.body.innerText;
  if(!String.isString(response)){response = '';}

  if((response === '') && !iframe._initialized){
    iframe._initialized = true;
    return;
  }

  var data = null;
  try{data = JSON.parse(response);}catch(e){}
  if(!data){data = { Error: bbbfly.FileUploader.errortype.main };}

  uploader.AddUploadedFiles(data);
  uploader.HideProgress();
};

/** @ignore */
bbbfly.fileuploader._validateFiles = function(files){
  var checkCount = Number.isInteger(this.MaxFilesCount);
  var checkFileSize = Number.isInteger(this.MaxFileSize);
  var checkBatchSize = Number.isInteger(this.MaxBatchSize);
  var checkExtensions = Array.isArray(this.AllowedExtensions);

  var errors = [];

  if(checkCount){
    var curFiles = this.GetUploadedFiles();
    var cnt = (curFiles.length + files.length);

    if(cnt > this.MaxFilesCount){
      errors.push({
        Error: {
          Type: bbbfly.FileUploader.errortype.count,
          Data: this.MaxFilesCount
        }
      });
    }
  }

  if((errors.length < 1)){
    var batchSize = 0;
    if(checkFileSize || checkBatchSize || checkExtensions){
      for(var i in files){
        var file = files[i];
        var fileName = file.toLowerCase();

        if(checkExtensions){
          var idx = fileName.lastIndexOf('.');
          var ext = (idx >= 0) ? fileName.substr(idx+1) : null;

          if(!this.AllowedExtensions.includes(ext)){
            errors.push({
              Name: fileName,
              Error: {
                Type: bbbfly.FileUploader.errortype.extension,
                Data: this.AllowedExtensions.join(', ')
              }
            });
            continue;
          }
        }

        if(checkFileSize || checkBatchSize){
          if(typeof file.size !== 'undefined'){
            var size = parseInt(file.size,10);
            if(checkBatchSize){batchSize += size;}

            if(checkFileSize && (size > this.MaxFileSize)){
              errors.push({
                Name: fileName,
                Error: {
                  Type: bbbfly.FileUploader.errortype.size,
                  Data: this.MaxFileSize
                }
              });
              continue;
            }
          }
        }
      }
    }

    if((errors.length < 1)){
      if(checkBatchSize && (batchSize > this.MaxBatchSize)){
        errors.push({
          Error: {
            Type: bbbfly.FileUploader.errortype.batch,
            Data: this.MaxBatchSize
          }
        });
      }
    }

    if((errors.length > 0)){
      this.ShowError(errors);
      return false;
    }
    return true;
  }
  return true;
};

/** @ignore */
bbbfly.fileuploader._addUploadedFiles = function(data){
  if(Object.isObject(data)){data = [data];}
  if(!Array.isArray(data)){return;}

  var curFiles = this.GetUploadedFiles();
  var cnt = curFiles.length;
  var errors = [];

  for(var i in data){

    var fileData = data[i];
    if(!Object.isObject(fileData)){continue;}

    if(data.Error){
      errors.push({
        Name: fileData.Name,
        Error: fileData.Error
      });
      continue;
    }

    if(Number.isInteger(this.MaxFilesCount)){
      if(cnt+1 > this.MaxFilesCount){
        errors.push({
          Name: fileData.Name,
          Error: {
            Type: bbbfly.FileUploader.errortype.count,
            Data: this.MaxFilesCount
          }
        });
        continue;
      }
    }

    var file = {
      Id: fileData.Id,
      Name: fileData.Name
    };

    this._Files.push(file);

    var list = this.Controls.FilesList;
    if(list){
      var item = {
        ID: fileData.Id,
        File: file
      };

      list.Add(item,list);
    }

    cnt += 1;
  }

  if(errors.length > 0){this.ShowError(errors);}

  if(Function.isFunction(this.OnFilesChanged)){
    this.OnFilesChanged();
  }
  this.Update();
};

/** @ignore */
bbbfly.fileuploader._showError = function(errors){
  if(!Function.isFunction(this.DoShowError)){return;}
  var message = '';

  switch(this.ErrorLevel){
    case bbbfly.FileUploader.errorlevel.minimal:
      if(Object.isObject(errors)){
        message +=  ngTxt('bbbfly_fileuploader_error_min_main');
      }
      else if(Array.isArray(errors) && (errors.length > 0)){
        var text = ngTxt('bbbfly_fileuploader_error_min_general');
        message += text.replace('%errs%',errors.length+'x');
      }
    break;
    case bbbfly.FileUploader.errorlevel.grouped:
      if(!Array.isArray(errors)){errors = [errors];}
      var errs = {};

      for(var i in errors){
        var item = errors[i];
        if(!Object.isObject(item)){continue;}

        var error = item.Error;
        if(Number.isInteger(error)){error = { Type: error };}
        if(!Object.isObject(error)){continue;}

        var fileName = item.Name;
        if(!String.isString(fileName)){fileName = '?';}

        if(error && Number.isInteger(error.Type)){
          if(!errs[error.Type]){errs[error.Type] = new Array();}
          errs[error.Type].push(fileName);
        }
      }

      for(var i in errs){
        var filesCnt = (errs[i].length > 0) ? ''+errs[i].length+'x' : '';
        switch(i){
          case bbbfly.FileUploader.errortype.main:
            var text = ngTxt('bbbfly_fileuploader_error_grp_main');
            message += text+'\n';
          break;
          case bbbfly.FileUploader.errortype.general:
            var text = ngTxt('bbbfly_fileuploader_error_grp_general');
            message += text.replace('%errs%',filesCnt)+'\n';
          break;
          case bbbfly.FileUploader.errortype.extension:
            var exts = bbbfly.fileuploader._fileNameExtsToString(errs[i]);
            var text = ngTxt('bbbfly_fileuploader_error_grp_extension');
            message += text.replace('%exts%',exts)+'\n';
          break;
          case bbbfly.FileUploader.errortype.size:
            var maxSize = bbbfly.fileuploader._maxSize(this.MaxFileSize);
            var text = ngTxt('bbbfly_fileuploader_error_grp_maxsize');
            message += text.replace('%size%',maxSize).replace('%errs%',filesCnt)+'\n';
          break;
          case bbbfly.FileUploader.errortype.batch:
            var maxSize = bbbfly.fileuploader._maxSize(this.MaxBatchSize);
            var text = ngTxt('bbbfly_fileuploader_error_grp_batch');
            message += text.replace('%size%',maxSize).replace('%errs%',filesCnt)+'\n';
          break;
          case bbbfly.FileUploader.errortype.count:
            var maxCnt = bbbfly.fileuploader._maxCnt(this.MaxFilesCount);
            var text = ngTxt('bbbfly_fileuploader_error_grp_maxcnt');
            message += text.replace('%cnt%',maxCnt).replace('%errs%',filesCnt)+'\n';
          break;
        }
      }
    break;
    case bbbfly.FileUploader.errorlevel.fulllog:
      if(!Array.isArray(errors)){errors = [errors];}

      for(var i in errors){
        var item = errors[i];
        if(!Object.isObject(item)){continue;}

        var error = item.Error;
        if(Number.isInteger(error)){error = { Type: error };}
        if(!Object.isObject(error)){continue;}

        var fileName = item.Name;
        if(!String.isString(fileName)){fileName = '?';}

        switch(error.Type){
          case bbbfly.FileUploader.errortype.main:
            var text = ngTxt('bbbfly_fileuploader_error_full_main');
            message += text+'\n';
          break;
          case bbbfly.FileUploader.errortype.general:
            var text = ngTxt('bbbfly_fileuploader_error_full_general');
            message += text.replace('%file%',fileName)+'\n';
          break;
          case bbbfly.FileUploader.errortype.extension:
            var text = ngTxt('bbbfly_fileuploader_error_full_extension');
            message += text.replace('%file%',fileName)+'\n';
          break;
          case bbbfly.FileUploader.errortype.size:
            var maxSize = bbbfly.fileuploader._maxSize(this.MaxFileSize);
            var text = ngTxt('bbbfly_fileuploader_error_full_maxsize');
            message += text.replace('%file%',fileName).replace('%size%',maxSize)+'\n';
          break;
          case bbbfly.FileUploader.errortype.batch:
            var maxSize = bbbfly.fileuploader._maxSize(this.MaxBatchSize);
            var text = ngTxt('bbbfly_fileuploader_error_full_batch');
            message += text.replace('%size%',maxSize)+'\n';
          break;
          case bbbfly.FileUploader.errortype.count:
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

/** @ignore */
bbbfly.fileuploader._maxCnt = function(value){
  return Number.isInteger(value) ? ' ('+Math.floor(value)+')' : '';
};

/** @ignore */
bbbfly.fileuploader._showProgress = function(process){
  var progressPanel = this.Controls.ProgressPanel;
  var progressBar = progressPanel.Controls.ProgressBar;

  if(process){progressBar.StartProcess();}
  else{this.UpdateProgress(0);}

  progressPanel.SetVisible(true);
};

/** @ignore */
bbbfly.fileuploader._updateProgress = function(progress){
  var progressPanel = this.Controls.ProgressPanel;
  var progressBar = progressPanel.Controls.ProgressBar;

  if(!Number.isNumber(progress)){progress = 0;}

  progressBar.EndProcess();
  progressBar.SetProgress(progress);
};

/** @ignore */
bbbfly.fileuploader._hideProgress = function(){
  var progressPanel = this.Controls.ProgressPanel;

  progressPanel.SetVisible(false);
  this.UpdateProgress(0);
};

/** @ignore */
bbbfly.fileuploader._canAddFiles = function(){
  if(!Number.isInteger(this.MaxFilesCount)){return true;}

  var curFiles = this.GetUploadedFiles();
  return (this.MaxFilesCount > curFiles.length);
};

/** @ignore */
bbbfly.fileuploader._canRemoveFiles = function(){
  var selFiles = this.GetSelectedFiles();
  return Object.isObject(selFiles);
};

/** @ignore */
bbbfly.fileuploader._onAddBtnUpdate = function(){
  var uploader = this.ParentControl.ParentControl;
  this.Enabled = uploader.CanAddFiles();
  return true;
};

/** @ignore */
bbbfly.fileuploader._onRemoveBtnUpdate = function(){
  var uploader = this.ParentControl.ParentControl;
  this.Enabled = uploader.CanRemoveFiles();
  return true;
};

/** @ignore */
bbbfly.fileuploader._onRemoveBtnClick = function(){
  var uploader = this.ParentControl.ParentControl;

  var selFiles = uploader.GetSelectedFiles();
  if(!Object.isObject(selFiles)){return false;}

  var files = uploader.GetUploadedFiles();
  for(var j=files.length;j > 0;j--){
    var fileIdx = j-1;

    if(selFiles[files[fileIdx].Id]){
      files.splice(fileIdx,1);
    }
  }

  var list = uploader.Controls.FilesList;
  if(!list){return;}

  list.BeginUpdate();
  for(var id in selFiles){
    var item = list.FindItemByID(id);
    if(item){list.Remove(item);}
  }
  list.need_update = 0;
  list.EndUpdate();

  if(Function.isFunction(uploader.OnFilesChanged)){
    uploader.OnFilesChanged();
  }

  uploader.Update();
};

/** @ignore */
bbbfly.fileuploader._onFilesListUpdate = function(){
  var uploader = this.ParentControl.ParentControl;
  this.Invalid = !uploader.IsValid();
  return true;
};

/** @ignore */
bbbfly.fileuploader._onGetFilesListText = function(list,item,column){
  if((column.ID === 'name') && item.File){return item.File.Name;}
  return this.OnGetText.callParent(list,item,column);
};

/** @ignore */
bbbfly.fileuploader._onFilesListSelectChanged = function(){
  var uploader = this.ParentControl.ParentControl;
  var buttons = uploader.Controls.ButtonsPanel;
  if(buttons){buttons.Update();}
};

/** @ignore */
bbbfly.fileuploader._doUpdateAddBtn = function(node){
  var uploader = this.ParentControl.ParentControl;
  var form = uploader.GetForm();

  if(!form && node){
    form = uploader.CreateForm();
    if(form){node.appendChild(form);}
  }

  if(form){
    form.style.display = (this.Enabled) ? 'block' : 'none';
  }

  this.DoUpdate.callParent(node);
};

/** @ignore */
bbbfly.fileuploader._getAddBtnText = function(){
  var uploader = this.ParentControl.ParentControl;
  return (uploader.MaxFilesCount > 1)
    ? ngTxt('bbbfly_fileuploader_add_more')
    : ngTxt('bbbfly_fileuploader_add_one');
};

/** @ignore */
bbbfly.fileuploader._getRemoveBtnText = function(){
  var uploader = this.ParentControl.ParentControl;
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

/**
 * @class
 * @type control
 * @extends bbbfly.Frame
 *
 * @description
 *   File uploader with build in progress panel,
 *   better single file upload handling
 *   and more error reporting types.
 *
 * @inpackage file
 *
 * @param {ngControl.Definition} [def=undefined] - Descendant definition
 * @param {object} [ref=undefined] - Reference owner
 * @param {object|string} [parent=undefined] - Parent DIV element or its ID
 *
 * @property {url} [UploadURL]
 * @property {url} [FileUploadID] - Upload configuration ID
 * @property {integer} [MaxFileSize=undefined] - Each file maximal size
 * @property {integer} [MaxBatchSize=undefined] - Maximal size of files batch
 * @property {integer} [MinFilesCount=undefined] - Minimal count of all files
 * @property {integer} [MaxFilesCount=undefined] - Maximal count of all files
 * @property {string[]} [AllowedExtensions=undefined] - Lower case extensions
 * @property {bbbfly.FileUploader.errorlevel} [ErrorLevel=grouped]
 *   - Error message precision
 */
bbbfly.FileUploader = function(def,ref,parent){
  def = def || {};

  var oneFile = (def.Data && (def.Data.MaxFilesCount === 1));

  ng_MergeDef(def,{
    ParentReferences: false,
    Data: {
      UploadURL: null,
      FileUploadID: null,

      MaxFileSize: undefined,
      MaxBatchSize: undefined,
      MinFilesCount: undefined,
      MaxFilesCount: undefined,
      AllowedExtensions: undefined,
      ErrorLevel: bbbfly.FileUploader.errorlevel.grouped,

      /** @private */
      _Files: [],
      /** @private */
      _RPC: null,
      /** @private */
      _Form: null,
      /** @private */
      _IFrame: null
    },
    Controls: {
      ButtonsPanel: {
        Type: 'bbbfly.Panel',
        style: { zIndex: 1 },
        ParentReferences: false,
        Controls: {
          AddFiles: {
            Type: 'bbbfly.Btn',
            Events: {
              OnUpdate: bbbfly.fileuploader._onAddBtnUpdate
            },
            Methods: {
              GetText: bbbfly.fileuploader._getAddBtnText,
              DoUpdate: bbbfly.fileuploader._doUpdateAddBtn
            }
          },
          RemoveFiles: {
            Type: 'bbbfly.Btn',
            Events: {
              OnUpdate: bbbfly.fileuploader._onRemoveBtnUpdate,
              OnClick: bbbfly.fileuploader._onRemoveBtnClick
            },
            Methods: {
              GetText: bbbfly.fileuploader._getRemoveBtnText
            }
          }
        }
      },
      ContentPanel: {
        Type: 'bbbfly.Panel',
        Controls: {
          FilesList: {
            Type: 'bbbfly.List',
            style: { zIndex: 1 },
            Data: {
              SelectType: oneFile ? nglSelectNone : nglSelectMultiExt,
              ShowHeader: false,
              Invalid: true,
              Columns: {
                name: { TextRes: 'bbbfly_fileuploader_file' }
              }
            },
            Events: {
              OnUpdate: bbbfly.fileuploader._onFilesListUpdate,
              OnSelectChanged: bbbfly.fileuploader._onFilesListSelectChanged
            },
            OverrideEvents: {
              OnGetText: bbbfly.fileuploader._onGetFilesListText
            }
          }
        }
      },
      ProgressPanel: {
        Type: 'bbbfly.Panel',
        L:0,R:0,T:0,B:0,
        style: { zIndex: 3 },
        ParentReferences: false,
        Data: { Visible: false },
        Controls: {
          ProgressBar: {
            Type: 'bbbfly.ProgressBar'
          },
          ProgressMessage: {
            Type: 'ngText', //TODO: add bbbfly.Text control
            Events: {
              OnGetText: bbbfly.fileuploader._onGetProgressText
            }
          }
        }
      }
    },
    OnCreated: bbbfly.fileuploader._onCreated,
    Events: {
      /** @private */
      OnUpdated: bbbfly.fileuploader._onUpdated,
      /**
       * @event
       * @name OnGetRequestParams
       * @memberof bbbfly.FileUploader#
       *
       * @param {object} params
       */
      OnGetRequestParams: null,
      /**
       * @event
       * @name OnFilesChanged
       * @memberof bbbfly.FileUploader#
       */
      OnFilesChanged: null
    },
    Methods: {
      /** @private */
      GetRPC: bbbfly.fileuploader._getRPC,
      /** @private */
      GetForm: bbbfly.fileuploader._getForm,
      /** @private */
      GetIframe: bbbfly.fileuploader._getIframe,
      /** @private */
      UpdateForm: bbbfly.fileuploader._updateForm,
      /** @private */
      CreateRPC: bbbfly.fileuploader._createRPC,
      /** @private */
      CreateForm: bbbfly.fileuploader._createForm,
      /** @private */
      CreateIframe: bbbfly.fileuploader._createIframe,
      /** @private */
      ValidateFiles: bbbfly.fileuploader._validateFiles,
      /** @private */
      AddUploadedFiles: bbbfly.fileuploader._addUploadedFiles,

      /**
       * @function
       * @name Reset
       * @memberof bbbfly.FileUploader#
       */
      Reset: bbbfly.fileuploader._reset,
      /**
       * @function
       * @name IsValid
       * @memberof bbbfly.FileUploader#
       *
       * @return {boolean} - If number of files is valid
       */
      IsValid: bbbfly.fileuploader._isValid,
      /**
       * @function
       * @name UploadFiles
       * @memberof bbbfly.FileUploader#
       */
      UploadFiles: bbbfly.fileuploader._uploadFiles,
      /**
       * @function
       * @name GetUploadedFiles
       * @memberof bbbfly.FileUploader#
       *
       * @return {bbbfly.FileUploader.File[]} - Uploaded files
       */
      GetUploadedFiles: bbbfly.fileuploader._getUploadedFiles,
      /**
       * @function
       * @name GetSelectedFiles
       * @memberof bbbfly.FileUploader#
       *
       * @return {object|null} - Files with ID as key
       */
      GetSelectedFiles: bbbfly.fileuploader._getSelectedFiles,
      /**
       * @function
       * @name ShowError
       * @memberof bbbfly.FileUploader#
       *
       * @param {bbbfly.FileUploader.Error|bbbfly.FileUploader.Error[]} errors
       */
      ShowError: bbbfly.fileuploader._showError,
      /**
       * @function
       * @name ShowProgress
       * @memberof bbbfly.FileUploader#
       *
       * @param {boolean} process - If show ifinite process
       */
      ShowProgress: bbbfly.fileuploader._showProgress,
      /**
       * @function
       * @name UpdateProgress
       * @memberof bbbfly.FileUploader#
       *
       * @param {number} [progress=0] - Percentual progress
       */
      UpdateProgress: bbbfly.fileuploader._updateProgress,
      /**
       * @function
       * @name HideProgress
       * @memberof bbbfly.FileUploader#
       */
      HideProgress: bbbfly.fileuploader._hideProgress,
      /**
       * @function
       * @name CanAddFiles
       * @memberof bbbfly.FileUploader#
       *
       * @return {boolean}
       */
      CanAddFiles: bbbfly.fileuploader._canAddFiles,
      /**
       * @function
       * @name CanRemoveFiles
       * @memberof bbbfly.FileUploader#
       *
       * @return {boolean}
       */
      CanRemoveFiles: bbbfly.fileuploader._canRemoveFiles,

      /**
       * @function
       * @abstract
       * @name DoShowError
       * @memberof bbbfly.FileUploader#
       * @description Use this method to show error message.
       *
       * @param {string} text - Message
       */
      DoShowError: null
    }
  });

  return ngCreateControlAsType(def,'bbbfly.Frame',ref,parent);
};

/**
 * @enum {integer}
 */
bbbfly.FileUploader.errortype = {
  main: 1,
  general: 2,
  extension: 3,

  size: 4,
  count: 5,
  batch: 6
};

/**
 * @enum {integer}
 * @description
 *   Possible values for
 *     {@link bbbfly.FileUploader|bbbfly.FileUploader.ErrorLevel}
 */
bbbfly.FileUploader.errorlevel = {
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

/**
 * @typedef {object} File
 * @memberOf bbbfly.FileUploader
 *
 * @description
 *   Uploaded file data
 *
 * @property {string} Id - File id
 * @property {string} Name - File name
 */

/**
 * @typedef {object} Error
 * @memberOf bbbfly.FileUploader
 *
 * @description
 *   Upload error data
 *
 * @property {string} Name - File name
 * @property {bbbfly.FileUploader.errortype|object} Error - Error type or object
 * @property {bbbfly.FileUploader.errortype} Error.Type - Error type
 * @property {mixed} Error.Data - Error data
 */