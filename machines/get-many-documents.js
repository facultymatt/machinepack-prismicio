/**
 *
 * @todo support setting ref and token in more way, via cookie, params, etc.
 *
 */
module.exports = {

  friendlyName: 'Get many documents',
  description: 'Get many documents by Array of ids',

  inputs: {
    apiEndpoint: {
      example: 'https://mycompany.prismic.io/api',
      description: 'Api endpoint for your prismic instance',
      required: true,
    },
    accessToken: {
      example: 'MC5WUWg4VFOHFh.77-9777-9Me-_73vv73vv70rUO-_vWPvv71O77-9ZUPvv73vv71pX--_vQdaNe-_vQ',
      description: 'Token provided via settings/apps/.',
      required: true
    },
    ids: {
      example: ['123', '456'],
      description: 'Array of document ids',
      required: true
    },
    ref: {
      example: 'VUYf7y0AAJkBHcVj',
      description: 'Control which versions of documents we can access. Defaults to master which is all live documents.',
      required: false
    }
  },

  defaultExit: 'success',

  exits: {
    error: {
      description: 'An unexpected error occurred'
    },
    notAuthorized: {
      description: 'Not authorized'
    },
    success: {
      description: 'Array of Documents objects',
      example: []
    }
  },

  fn: function(inputs, exits) {

    var Prismic = require('prismic.io').Prismic;

    function linkResolver(doc) {
      if (doc.isBroken) return false;
      return '/documents/' + doc.id + '/' + doc.slug;
    }

    var mappedIds = inputs.ids.map(function(id) {
      return '"' + id + '"';
    }).join(',');

    var query = '[[:d = any(document.id, [' + mappedIds + '])]]';
    console.log(query);

    Prismic.Api(inputs.apiEndpoint, function(err, Api) {
      if (err && err.toString().indexOf('401') !== -1) {
        return exits.notAuthorized(err);
      } else if (err) {
        return exits.error(err);
      }
      var ctx = {
        api: Api,
        ref: inputs.ref || Api.master(),
        linkResolver: function(doc) {
          return linkResolver(doc);
        }
      };
      ctx.api
        .forms('everything')
        .ref(ctx.ref)
        .query(query)
        .submit(function(err, documents) {
          if (err) {
            return exits.error(err);
          }
          return exits.success(documents.results);
        });
    }, inputs.accessToken);

  }

};







// fin