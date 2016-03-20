var request = require('superagent')

module.exports = function(root_url, API_key) {
  var api = {
    document: {
      create: function(body) {
        return new Promise(function(resolve, reject) {
          request
          .post(root_url+'/api/v1/documents')
          .set('Content-type', 'application/vnd.api+json')
          .send({data: body})
          .set('Authorization', 'token '+API_key)
          .end(function (er, res) {
            if(er) return reject(er)
            if(res.status != 201) return reject(res.toError())
            resolve(res.body.data)
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
            resolve(res.body.data)
          })
        })
      }
    , update: function(id, body) {
        return new Promise(function(resolve, reject) {
          request
          .patch(root_url+'/api/v1/documents/'+id)
          .type('application/vnd.api+json')
          .send({data: {type: 'document', id: String(id), attributes: body}})
          .set('Authorization', 'token '+API_key)
          .end(function loadDocument(err, res) {
           if(err) return reject(err)
           if(res.status != 200) return reject(res.toError())
           resolve(res.body.data)
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
            if(res.status != 204) return reject(res.toError())
            resolve()
          })
        })
      }
    , getSnapshots: function(id) {
        return new Promise(function(resolve, reject) {
          request
          .get(root_url+'/api/v1/documents/'+id+'/relationships/snapshots')
          .set('Authorization', 'token '+API_key)
          .end(function(err, res) {
            if(err) return reject(err)
            if(res.status != 200) return reject(res.toError())
            resolve(res.body.included)
          })
        })
      }
    , getSnapshotsSince: function(id, since) {
        return new Promise(function(resolve, reject) {
          request
          .get(root_url+'/api/v1/documents/'+id+'/relationships/snapshots?since='+since)
          .set('Authorization', 'token '+API_key)
          .end(function(err, res) {
            if(err) return reject(err)
            if(res.status != 200) return reject(res.toError())
            resolve(res.body.included)
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
            resolve(res.body.data)
          })
        })
      }
    , import: function(id, blob) {
        return new Promise(function(resolve, reject) {
          request
          .post(root_url+'/api/v1/documents/'+id+'/import')
          .attach('import', blob)
          .set('Authorization', 'token '+API_key)
          .end(function(err, res) {
            if(err) return reject(err)
            if(res.status != 200) return reject(res.toError())
            resolve()
          })
        })
      }
    }
  , user: {
      create: function(body) {
          return new Promise(function(resolve, reject) {
            request
            .post(root_url+'/api/v1/users')
            .set('Content-type', 'application/vnd.api+json')
            .send({data: body})
            .set('Authorization', 'token '+API_key)
            .end(function loadDocument(err, res) {
              if(err) return reject(err)
              if(res.status != 201) return reject(res.toError())
              resolve(res.body.data)
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
              resolve(res.body.data)
            })
          })
        }
      , update: function(id, body) {
          return new Promise(function(resolve, reject) {
            request
            .patch(root_url+'/api/v1/users/'+id)
            .set('Content-type', 'application/vnd.api+json')
            .send({data:{type: 'user', id: String(id), attributes: body}})
            .set('Authorization', 'token '+API_key)
            .end(function loadDocument(err, res) {
             if(err) return reject(err)
             if(res.status != 200) return reject(res.toError())
             resolve(res.body.data)
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
              if(res.status != 204) return reject(res.toError())
              resolve()
            })
          })
        }
      , getDocuments: function(id) {
          return new Promise(function(resolve, reject) {
            request
            .get(root_url+'/api/v1/users/'+id+'/relationships/documents')
            .set('Authorization', 'token '+API_key)
            .end(function(err, res) {
              if(err) return reject(err)
              if(res.status != 200) return reject(res.toError())
              resolve(res.body.included)
            })
          })
      }
      , getSnapshots: function(id) {
          return new Promise(function(resolve, reject) {
            request
            .get(root_url+'/api/v1/users/'+id+'/relationships/snapshots')
            .set('Authorization', 'token '+API_key)
            .end(function(err, res) {
              if(err) return reject(err)
              if(res.status != 200) return reject(res.toError())
              resolve(res.body.included)
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
            resolve(res.body.data)
          })
        })
      }
    , export: function(id, type) {
        return fetch(root_url+'/api/v1/snapshots/'+id+'/export?type='+encodeURIComponent(type), {
          headers: new Headers({'Authorization': 'token '+API_key})
        })
        .then(function(res) {
          if(res.status != 200) throw new Error(res.status+' '+res.statusText)
          return res.blob()
        })
      }
    }
  }

  return api
}

module.exports.authenticate = function(root_url, method, credentials, scope) {
  return new Promise(function(resolve, reject) {
    request
    .post(root_url+'/token')
    .send({grant_type: method, credentials: credentials, scope: scope})
    .end(function(err, res) {
      if(err) return reject(err)
      if(res.status != 200) return reject(res.toError())
      resolve(res.body)
    })
  })
}
