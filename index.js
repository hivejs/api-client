var request = require('superagent')
  , gulf = require('gulf')

module.exports = function(root_url, API_key) {
  var api = {
    document: {
      create: function(type, cb) {
        request
        .post(root_url+'/api/v1/documents')
        .send({type: type})
        .set('Authorization', 'token '+API_key)
        .end(function loadDocument(err, res) {
          if(err) return cb(err)
          if(res.status != 200) return cb(res.toError())
          cb(null, res.body)
        })
      }
    , get: function(id, cb) {
        request
        .get(root_url+'/api/v1/documents/'+id)
        .set('Authorization', 'token '+API_key)
        .end(function loadDocument(err, res) {
          if(err) return cb(err)
          if(res.status != 200) return cb(res.toError())
          cb(null, res.body)
        })
      }
    , delete: function(id, cb) {
        request
        .delete(root_url+'/api/v1/documents/'+id)
        .set('Authorization', 'token '+API_key)
        .end(function loadDocument(err, res) {
          if(err) return cb(err)
          if(res.status != 200) return cb(res.toError())
          cb(null, res.body)
        })
      }
    , getSnapshots: function(id, cb) {
        request
        .get(root_url+'/api/v1/documents/'+id+'/snapshots')
        .set('Authorization', 'token '+API_key)
        .end(function(err, res) {
          if(err) return cb(err)
          if(res.status != 200) return cb(res.toError())
          cb(null, res.body)
        })
      }
    , getSnapshotsSince: function(id, since, cb) {
        request
        .get(root_url+'/api/v1/documents/'+id+'/snapshots?since='+since)
        .set('Authorization', 'token '+API_key)
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
        .set('Authorization', 'token '+API_key)
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
          .set('Authorization', 'token '+API_key)
          .end(function loadDocument(err, res) {
            if(err) return cb(err)
            if(res.status != 200) return cb(res.toError())
            cb(null, res.body)
          })
        }
      , get: function(id, cb) {
          request
          .get(root_url+'/api/v1/users/'+id)
          .set('Authorization', 'token '+API_key)
          .end(function loadDocument(err, res) {
            if(err) return cb(err)
            if(res.status != 200) return cb(res.toError())
            cb(null, res.body)
          })
        }
      , delete: function(id, cb) {
          request
          .delete(root_url+'/api/v1/users/'+id)
          .set('Authorization', 'token '+API_key)
          .end(function loadDocument(err, res) {
            if(err) return cb(err)
            if(res.status != 200) return cb(res.toError())
            cb(null, res.body)
          })
        }
      , getDocuments: function(id, cb) {
        request
        .get(root_url+'/api/v1/users/'+id+'/documents')
        .set('Authorization', 'token '+API_key)
        .end(function(err, res) {
          if(err) return cb(err)
          if(res.status != 200) return cb(res.toError())
          cb(null, res.body)
        })
      }
      , getSnapshots: function(id, cb) {
        request
        .get(root_url+'/api/v1/users/'+id+'/snapshots')
        .set('Authorization', 'token '+API_key)
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
        .set('Authorization', 'token '+API_key)
        .end(function loadDocument(err, res) {
          if(err) return cb(err)
          if(res.status != 200) return cb(res.toError())
          cb(null, res.body)
        })
      }
    }

    /**
     * ```
     * var doc = gulf.EditableDocument(textOT)
     *   , apiLink = hiveClient(root_url, API_key).link(id)
     * apiLink.pipe(doc.masterLink()).pipe(apiLink)
     * ```
     */
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
          api.snapshot.get(document.latestSnapshot, function(err, s) {
            if(err) return link.emit('error', err)

            snapshot = s

            // send init and poll server for new changes
            link.send('init', {contents: snapshot.contents, edit:"{\"id\":"+document.latestSnapshot+"}"})
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

          document.latestSnapshot = s.id
          snapshot = s
          myEdits.push(s.id)
          link.send('ack', s.id)
          editInFlight = false
        })
      })

      function createDownlink() {
        setTimeout(function poll() {
          api.document.getSnapshotsSince(document.id, document.latestSnapshot, function(err, snapshots) {
            if(err) return alert(err.message || res.body.message)

            if(editInFlight) return

            snapshots.forEach(function(s) {
              if(~myEdits.indexOf(s.id)) return
              link.send('edit', JSON.stringify({id: s.id, cs: s.changes, parent: s.parent}))
              document.latestSnapshot = s.id
              snapshot = s
            })
          })
          setTimeout(poll, 1000)
        }, 1000)
      }

      return link
    }
  }

  return api
}