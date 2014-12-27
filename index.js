var request = require('superagent')
  , gulf = require('gulf')


/**
 * ```
 * var doc = hiveClient(textOT)
 *   , apiLink = hiveClient.httpAPI(root_url, API_key, id)
 * apiLink.pipe(doc.masterLink()).pipe(apiLink)
 * hiveClient.attachTextarea(editDoc, textarea)
 * ```
 */
module.exports = function(ottype) {
  var editableDoc = new gulf.EditableDocument(ottype)

  return editableDoc
}

module.exports.attachTextarea = function(editableDoc, textarea) {
  var oldval

  // on incoming changes
  editableDoc._change = function(newcontent, cs) {
    console.log('_change:', newcontent, cs)
    // remember selection
    var oldSel = [textarea.selectionStart, textarea.selectionEnd]

    // set new content
    oldval = textarea.value = newcontent

    if(cs) { // in case of a hard reset this isn't available
      // take care of selection
      var newSel = this.ottype.transformSelection(oldSel, cs)
      textarea.selectionStart = newSel[0]
      textarea.selectionEnd = newSel[1]
    }
  }

  // before _change() and on any edit event
  editableDoc._collectChanges = function() {
    var cs = []
      , newval = textarea.value

    // The following code is taken from shareJS:
    // https://github.com/share/ShareJS/blob/3843b26831ecb781344fb9beb1005cfdd2/lib/client/textarea.js

    if (oldval === newval) return;

    var commonStart = 0;
    while (oldval.charAt(commonStart) === newval.charAt(commonStart)) {
      commonStart++;
    }
    var commonEnd = 0;
    while (oldval.charAt(oldval.length - 1 - commonEnd) === newval.charAt(newval.length - 1 - commonEnd) &&
      commonEnd + commonStart < oldval.length && commonEnd + commonStart < newval.length) {
      commonEnd++;
    }
    if (oldval.length !== commonStart + commonEnd) {
      if(commonStart) cs.push(commonStart)
      cs.push({d: oldval.length - commonStart - commonEnd });
    }
    if (newval.length !== commonStart + commonEnd) {
      if(commonStart && !cs.length) cs.push(commonStart)
      cs.push(newval.slice(commonStart, newval.length - commonEnd));
    }

    oldval = newval
    console.log(cs)
    this.update(cs)
  }

  var eventNames = ['textInput', 'keydown', 'keyup', 'cut', 'paste', 'drop', 'dragend'];
  for (var i = 0; i < eventNames.length; i++) {
    var e = eventNames[i];
    if (textarea.addEventListener) {
      textarea.addEventListener(e, genOp, false);
    } else {
      textarea.attachEvent('on' + e, genOp);
    }
  }
  function genOp(evt) {
    console.log(evt)
    editableDoc._collectChanges()
  }
}

module.exports.httpAPI = function (root_url, API_key, docId) {
  var link = new gulf.Link
    , snapshot
    , document

  link.on('link:requestInit', init)
  function init() {
    request// Try to load document
    .get(root_url+'/api/v1/documents/'+docId)
    .set('X-API-Key', API_key)
    .end(function loadDocument(err, res) {
      if(err) return link.emit('error', err)
      if(res.status != 200) return link.emit('error', new Error('Couldn\'t load document'))

      document = res.body

      request// Try to fetch the latest snapshot
      .get(root_url+'/api/v1/snapshots/'+document.snapshot)
      .set('X-API-Key', API_key)
      .end(function(err, res) {
        if(err) return link.emit('error', err)

        snapshot = res.body
        link.send('init', {content: snapshot.content, initialEdit:"{\"id\":"+document.snapshot+"}"})

        createUplink()
      })
    })
  }

  var myEdits = []
    , editInFlight = false

  link.on('link:edit', function(edit) {
    editInFlight = true
    edit = JSON.parse(edit)
    request// Try to fetch the latest snapshot
    .post(root_url+'/api/v1/documents/'+document.id+'/pendingChanges')
    .send({changes: edit.cs, parent: document.snapshot, user: 1})
    .set('X-API-Key', API_key)
    .end(function(err, res) {
      if(err || 200 != res.status) return init()

      document.snapshot = res.body.id
      snapshot = res.body
      myEdits.push(res.body.id)
      link.send('ack', res.body.id)
      editInFlight = false
    })
  })

  function createUplink() {
    setInterval(function() {
      request
      .get(root_url+'/api/v1/documents/'+document.id+'/snapshots?since='+document.snapshot)
      .set('X-API-Key', API_key)
      .end(function(err, res) {
        if(err || 200 != res.status) return alert(err.message || res.body.message)

        if(editInFlight) return

        res.body.forEach(function(s) {
          if(~myEdits.indexOf(s.id)) return
          link.send('edit', JSON.stringify({id: s.id, cs: s.changeset, parent: s.parent}))
          document.snapshot = s.id
          snapshot = s
        })
      })
    }, 1000)
  }

  return link
}
