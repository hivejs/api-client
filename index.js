var request = require('superagent')
  , gulf = require('gulf')

module.exports = function(root_url, API_key) {
  var api = {
    document: {
      create: function(type, cb) {
        request
        .post(root_url+'/api/v1/documents')
        .send({type: type})
        .set('X-API-Key', API_key)
        .end(function loadDocument(err, res) {
          if(err) return cb(err)
          if(res.status != 200) return cb(res.toError())
          cb(null, res.body)
        })
      }
    , get: function(id, cb) {
        request
        .get(root_url+'/api/v1/documents/'+id)
        .set('X-API-Key', API_key)
        .end(function loadDocument(err, res) {
          if(err) return cb(err)
          if(res.status != 200) return cb(res.toError())
          cb(null, res.body)
        })
      }
    , delete: function(id, cb) {
        request
        .delete(root_url+'/api/v1/documents/'+id)
        .set('X-API-Key', API_key)
        .end(function loadDocument(err, res) {
          if(err) return cb(err)
          if(res.status != 200) return cb(res.toError())
          cb(null, res.body)
        })
      }
    , getSnapshots: function(id, cb) {
        request
        .get(root_url+'/api/v1/documents/'+id+'/snapshots')
        .set('X-API-Key', API_key)
        .end(function(err, res) {
          if(err) return cb(err)
          if(res.status != 200) return cb(res.toError())
          cb(null, res.body)
        })
      }
    , getSnapshotsSince: function(id, since, cb) {
        request
        .get(root_url+'/api/v1/documents/'+id+'/snapshots?since='+since)
        .set('X-API-Key', API_key)
        .end(function(err, res) {
          if(err) return cb(err)
          if(res.status != 200) return cb(res.toError())
          cb(null, res.body)
        })
      }
    , sendPendingChanges: function(id, cs, parent, user, cb) {
        request
        .post(root_url+'/api/v1/documents/'+id+'/pendingChanges')
        .send({changes: cs, parent: parent, user: user})
        .set('X-API-Key', API_key)
        .end(function(err, res) {
          if(err) return cb(err)
          if(res.status != 200) return cb(res.toError())
          cb(null, res.body)
        })
      }
    }
  , user: {
      create: function(type, cb) {
          request
          .post(root_url+'/api/v1/users')
          .send({type: type})
          .set('X-API-Key', API_key)
          .end(function loadDocument(err, res) {
            if(err) return cb(err)
            if(res.status != 200) return cb(res.toError())
            cb(null, res.body)
          })
        }
      , get: function(id, cb) {
          request
          .get(root_url+'/api/v1/users/'+id)
          .set('X-API-Key', API_key)
          .end(function loadDocument(err, res) {
            if(err) return cb(err)
            if(res.status != 200) return cb(res.toError())
            cb(null, res.body)
          })
        }
      , delete: function(id, cb) {
          request
          .delete(root_url+'/api/v1/users/'+id)
          .set('X-API-Key', API_key)
          .end(function loadDocument(err, res) {
            if(err) return cb(err)
            if(res.status != 200) return cb(res.toError())
            cb(null, res.body)
          })
        }
      , getDocuments: function(id, cb) {
        request
        .get(root_url+'/api/v1/users/'+id+'/documents')
        .set('X-API-Key', API_key)
        .end(function(err, res) {
          if(err) return cb(err)
          if(res.status != 200) return cb(res.toError())
          cb(null, res.body)
        })
      }
      , getSnapshots: function(id, cb) {
        request
        .get(root_url+'/api/v1/users/'+id+'/snapshots')
        .set('X-API-Key', API_key)
        .end(function(err, res) {
          if(err) return cb(err)
          if(res.status != 200) return cb(res.toError())
          cb(null, res.body)
        })
      }
    }
  , snapshot: {
      get: function(id, cb) {
        request
        .get(root_url+'/api/v1/snapshots/'+id)
        .set('X-API-Key', API_key)
        .end(function loadDocument(err, res) {
          if(err) return cb(err)
          if(res.status != 200) return cb(res.toError())
          cb(null, res.body)
        })
      }
    }
  , link: function(docId) {
      var link = new gulf.Link
        , snapshot
        , document

      link.on('link:requestInit', init)
      function init() {
        // Try to load document
        api.document.get(docId, function(err, doc) {
          if(err) return link.emit('error', err)

          document = doc

          // Try to fetch the latest snapshot
          api.snapshot.get(document.snapshot, function(err, s) {
            if(err) return link.emit('error', err)

            snapshot = s

            // send init and poll server for new changes
            link.send('init', {content: snapshot.content, initialEdit:"{\"id\":"+document.snapshot+"}"})
            createDownlink()
          })
        })
      }

      var myEdits = []
        , editInFlight = false

      link.on('link:edit', function(edit) {
        editInFlight = true
        edit = JSON.parse(edit)
        // Try to fetch the latest snapshot
        api.document.sendPendingChanges(document.id, edit.cs, edit.parent, 1, function(err, s) {
          if(err) return init()

          document.snapshot = s.id
          snapshot = s
          myEdits.push(sy.id)
          link.send('ack', s.id)
          editInFlight = false
        })
      })

      function createDownlink() {
        setInterval(function() {
          api.document.getSnapshotsSince(document.id, document.snapshot, function(err, snapshots) {
            if(err) return alert(err.message || res.body.message)

            if(editInFlight) return

            snapshots.forEach(function(s) {
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
  }

  return api
}

/**
 * ```
 * var doc = hiveClient.EditableDocument(textOT)
 *   , apiLink = hiveClient(root_url, API_key).link(id)
 * apiLink.pipe(doc.masterLink()).pipe(apiLink)
 * hiveClient.attachTextarea(doc, textarea)
 * ```
 */
module.exports.EditableDocument = function(ottype) {
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
