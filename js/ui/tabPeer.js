var ui = (function(module, shareit){
var _priv = module._priv = module._priv || {}


_priv.TabPeer = function(uid, tabsId, preferencesDialogOpen, onclickFactory)
{
  // Tabs
  var div = document.createElement('DIV');
      div.id = tabsId + '-' + uid;
      div.dataset.role = 'page'
      div.setAttribute('data-add-back-btn', true);

  $(div).appendTo('#' + tabsId);

  // Tab
  if($.mobile)
  {
    var header = document.createElement('DIV');
        header.dataset.role = 'header'
        header.dataset.position = 'fixed'
        header.setAttribute('class', 'only-mobile');

    var h1 = document.createElement('H1');
        h1.appendChild(document.createTextNode('UID: ' + uid));

    $(h1).appendTo(header);

    $(header).appendTo(div);
  }
  else
  {
    $('#tabs').tabs('refresh');
    $('#tabs').tabs('option', 'active', -1);
  }

  // Table
  var table = document.createElement('TABLE');
  div.appendChild(table);

  // Tab panel
  var thead = document.createElement('THEAD');
  table.appendChild(thead);

  var tr = document.createElement('TR');
  thead.appendChild(tr);

  var th = document.createElement('TH');
      th.scope = 'col';
      th.abbr = 'Filename';
      th.width = '100%';
      th.appendChild(document.createTextNode('Filename'));
  tr.appendChild(th);

  var th = document.createElement('TH');
      th.scope = 'col';
      th.abbr = 'Type';
      th.appendChild(document.createTextNode('Type'));
  tr.appendChild(th);

  var th = document.createElement('TH');
      th.scope = 'col';
      th.abbr = 'Size';
      th.appendChild(document.createTextNode('Size'));
  tr.appendChild(th);

  var th = document.createElement('TH');
      th.scope = 'col';
      th.abbr = 'Action';
      th.appendChild(document.createTextNode('Action'));
  tr.appendChild(th);

  this.tbody = document.createElement('TBODY');
  table.appendChild(this.tbody);

  var tr = document.createElement('TR');
  this.tbody.appendChild(tr);

  var td = document.createElement('TD');
      td.colSpan = 4;
      td.align = 'center';
      td.appendChild(document.createTextNode('Waiting for the peer data'));
  tr.appendChild(td);


  var self = this;

  function buttonFactory(fileentry)
  {
    var div = document.createElement('DIV');
    div.id = fileentry.hash;

    div.transfer = function()
    {
      var transfer = document.createElement('A');
      transfer.onclick = onclickFactory(fileentry);
      transfer.appendChild(document.createTextNode('Transfer'));

      while (div.firstChild)
        div.removeChild(div.firstChild);
      div.appendChild(transfer);
    };

    div.progressbar = function(value)
    {
      if (value == undefined) value = 0;

      var progress = document.createTextNode(Math.floor(value * 100) + '%');

      while(div.firstChild)
        div.removeChild(div.firstChild);
      div.appendChild(progress);
    };

    div.open = function(blob)
    {
      var open = document.createElement('A');
      open.href = window.URL.createObjectURL(blob);
      open.target = '_blank';
      open.appendChild(document.createTextNode('Open'));

      while(div.firstChild)
      {
        window.URL.revokeObjectURL(div.firstChild.href);
        div.removeChild(div.firstChild);
      }
      div.appendChild(open);
    };

    // Show if file have been downloaded previously or if we can transfer it
    if(fileentry.bitmap)
    {
      var chunks = fileentry.size / shareit.chunksize;
      if(chunks % 1 != 0)
         chunks = Math.floor(chunks) + 1;

      div.progressbar(fileentry.bitmap.indexes(true).length / chunks);
    }
    else if(fileentry.blob)
      div.open(fileentry.blob);
    else
      div.transfer();

    $(self).on(fileentry.hash + '.begin', function(event)
    {
      div.progressbar();
    });
    $(self).on(fileentry.hash + '.update', function(event, value)
    {
      div.progressbar(value);
    });
    $(self).on(fileentry.hash + '.end', function(event)
    {
      div.open(fileentry.blob);
    });

    return div;
  }

  function noFilesCaption()
  {
    // Compose no files shared content (fail-back)
    var captionCell = _priv.spanedCell(table);
    captionCell.appendChild(document.createTextNode('Remote peer is not sharing files.'));

//    var anchor = document.createElement('A')
//        anchor.id = 'ConnectUser'
//        anchor.style.cursor = 'pointer'
//    captionCell.appendChild(anchor)
//
//    $(anchor).click(preferencesDialogOpen)
//
//    var span = document.createElement('SPAN')
//        span.setAttribute("class", "user")
//        span.appendChild(document.createTextNode("Connect to a user"))
//    anchor.appendChild(span)
    captionCell.appendChild(document.createTextNode(" Why don't ask him about doing it?"));

    return captionCell;
  }
  this.noFilesCaption = noFilesCaption();


  function rowFactory(fileentry)
  {
    var tr = document.createElement('TR');

    var td = document.createElement('TD');
    tr.appendChild(td);

    var type = (fileentry.type != undefined) ? fileentry.type : fileentry.file.type;

    // Name & icon
    var span = document.createElement('SPAN');
        span.className = _priv.filetype2className(type);
        span.appendChild(document.createTextNode(fileentry.name || fileentry.file.name));
    td.appendChild(span);

    // Type
    var td = document.createElement('TD');
        td.appendChild(document.createTextNode(type || '(unknown)'));
    tr.appendChild(td);

    // Size
    var size = (fileentry.size != undefined) ? fileentry.size : fileentry.file.size;
    var td = document.createElement('TD');
        td.className = 'filesize';
        td.appendChild(document.createTextNode(humanize.filesize(size)));
    tr.appendChild(td);

    // Action
    var td = document.createElement('TD');
        td.class = 'end';
        td.appendChild(buttonFactory(fileentry));
    tr.appendChild(td);

    return tr;
  }

  this.updateFiles = function(fileslist)
  {
    var prevPath = '';

    for(var i = 0, fileentry; fileentry = fileslist[i]; i++)
    {
      // Add folder row
      prevPath = _priv.rowFolder(this.tbody, prevPath, fileentry.path);

      // Add file row
      var tr = rowFactory(fileentry);

      if(prevPath)
        tr.setAttribute('class', 'child-of-'+_priv.classEscape(prevPath));

      this.tbody.appendChild(tr);
    }
  };
}
_priv.TabPeer.prototype = _priv.FilesTable;

return module
})(ui || {}, shareit)