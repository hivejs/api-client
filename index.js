var request = require('superagent')

module.exports = function(root_url, API_key) {
  var api = {
    document: {
      create: function(body) {
        return new Promise(function(resolve, reject) {
          request
          .post(root_url+'/api/v1/documents')
          .send(body)
          .set('Authorization', 'token '+API_key)
          .end(function (er, res) {
            if(er) return reject(er)
            if(res.status != 200) return reject(res.toError())
            resolve(res.body)
          })
        })
      }
    , get: function(id) {
        return new Promise(function(resolve, reject) {
          request
          .get(root_url+'/api/v1/documents/'+id)
          .set('Authorization', 'token '+API_key)
          .end(function loadDocument(err, res) {
            if(err) return reject(err)
            if(res.status != 200) return reject(res.toError())
            resolve(res.body)
          })
        })
      }
    , delete: function(id) {
        return new Promise(function(resolve, reject) {
          request
          .delete(root_url+'/api/v1/documents/'+id)
          .set('Authorization', 'token '+API_key)
          .end(function loadDocument(err, res) {
            if(err) return reject(err)
            if(res.status != 200) return reject(res.toError())
            resolve(res.body)
          })
        })
      }
    , getSnapshots: function(id) {
        return new Promise(function(resolve, reject) {
          request
          .get(root_url+'/api/v1/documents/'+id+'/snapshots')
          .set('Authorization', 'token '+API_key)
          .end(function(err, res) {
            if(err) return reject(err)
            if(res.status != 200) return reject(res.toError())
            resolve(res.body)
          })
        })
      }
    , getSnapshotsSince: function(id, since) {
        return new Promise(function(resolve, reject) {
          request
          .get(root_url+'/api/v1/documents/'+id+'/snapshots?since='+since)
          .set('Authorization', 'token '+API_key)
          .end(function(err, res) {
            if(err) return reject(err)
            if(res.status != 200) return reject(res.toError())
            resolve(res.body)
          })
        })
      }
    , change: function(id, cs, parent) {
        return new Promise(function(resolve, reject) {
          request
          .post(root_url+'/api/v1/documents/'+id+'/snapshots')
          .send({changes: cs, parent: parent})
          .set('Authorization', 'token '+API_key)
          .end(function(err, res) {
            if(err) return reject(err)
            if(res.status != 200) return reject(res.toError())
            resolve(res.body)
          })
        })
      }
    }
  , user: {
      create: function(body) {
          return new Promise(function(resolve, reject) {
            request
            .post(root_url+'/api/v1/users')
            .send(body)
            .set('Authorization', 'token '+API_key)
            .end(function loadDocument(err, res) {
              if(err) return reject(err)
              if(res.status != 200) return reject(res.toError())
              resolve(res.body)
            })
          })
        }
      , get: function(id) {
          return new Promise(function(resolve, reject) {
            request
            .get(root_url+'/api/v1/users/'+id)
            .set('Authorization', 'token '+API_key)
            .end(function loadDocument(err, res) {
              if(err) return reject(err)
              if(res.status != 200) return reject(res.toError())
              resolve(res.body)
            })
          })
        }
      , update: function(id, body) {
          return new Promise(function(resolve, reject) {
            request
            .put(root_url+'/api/v1/users/'+id)
            .send(body)
            .set('Authorization', 'token '+API_key)
            .end(function loadDocument(err, res) {
             if(err) return reject(err)
             if(res.status != 200) return reject(res.toError())
             resolve(res.body)
            })
          })
        }
      , delete: function(id) {
          return new Promise(function(resolve, reject) {
            request
            .delete(root_url+'/api/v1/users/'+id)
            .set('Authorization', 'token '+API_key)
            .end(function loadDocument(err, res) {
              if(err) return reject(err)
              if(res.status != 200) return reject(res.toError())
              resolve(res.body)
            })
          })
        }
      , getDocuments: function(id) {
          return new Promise(function(resolve, reject) {
            request
            .get(root_url+'/api/v1/users/'+id+'/documents')
            .set('Authorization', 'token '+API_key)
            .end(function(err, res) {
              if(err) return reject(err)
              if(res.status != 200) return reject(res.toError())
              resolve(res.body)
            })
          })
      }
      , getSnapshots: function(id) {
          return new Promise(function(resolve, reject) {
            request
            .get(root_url+'/api/v1/users/'+id+'/snapshots')
            .set('Authorization', 'token '+API_key)
            .end(function(err, res) {
              if(err) return reject(err)
              if(res.status != 200) return reject(res.toError())
              resolve(res.body)
            })
          })
      }
    }
  , snapshot: {
      get: function(id) {
        return new Promise(function(resolve, reject) {
          request
          .get(root_url+'/api/v1/snapshots/'+id)
          .set('Authorization', 'token '+API_key)
          .end(function loadDocument(err, res) {
            if(err) return reject(err)
            if(res.status != 200) return reject(res.toError())
            resolve(res.body)
          })
        })
      }
    }
  }

  return api
}

module.exports.authenticate = function(root_url, method, credentials) {
  return new Promise(function(resolve, reject) {
    request
    .post(root_url+'/token')
    .send({grant_type: method, credentials: credentials})
    .end(function(err, res) {
      if(err) return reject(err)
      if(res.status != 200) return reject(res.toError())
      resolve(res.body)
    })
  })
}
