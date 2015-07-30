var request = require('superagent')

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
    , change: function(id, cs, parent, user, cb) {
        request
        .post(root_url+'/api/v1/documents/'+id+'/snapshots')
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
  }

  return api
}

module.exports.authenticate = function(root_url, method, credentials) {
  request
  .post(root_url+'/token')
  .send({grant_type: method, credentials: credentials})
  .end(function() {
    if(err) return cb(err)
    if(res.status != 200) return cb(res.toError())
    cb(null, res.body)
  })
}