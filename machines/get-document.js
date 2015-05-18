/**
 *
 * @todo support setting ref and token in more way, via cookie, params, etc.
 *
 */
module.exports = {

  friendlyName: 'Get document by id',
  description: 'Get a prismic document by id.',

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
    id: {
      example: '1234',
      description: 'Document id',
      required: true
    },
    slug: {
      example: 'my-great-post',
      description: 'Slug of document for given id.',
      required: false
    },
    ref: {
      example: 'VUYf7y0AAJkBHcVj',
      description: 'Control which versions of documents we can access. Defaults to master which is all live documents.',
      required: false
    },
    html: {
      example: true,
      description: 'Return document as html?',
      required: false
    }
  },

  defaultExit: 'success',

  exits: {
    error: {
      description: 'An unexpected error occurred'
    },
    newSlug: {
      description: 'Document found via id, but there is a new slug',
    },
    notFound: {
      description: 'Document not found',
    },
    notAuthorized: {
      description: 'Not authorized'
    },
    success: {
      description: 'Document object or html depending on inputs.'
    }
  },

  fn: function(inputs, exits) {

    var Prismic = require('prismic.io').Prismic;

    function linkResolver(doc) {
      if (doc.isBroken) return false;
      return '/documents/' + doc.id + '/' + doc.slug;
    }

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
        .query('[[:d = at(document.id, "' + inputs.id + '")]]')
        .submit(function(err, documents) {
          var results = documents.results;
          var doc = results && results.length ? results[0] : undefined;
          if (err) {
            exits.error(err);
          } else if (doc && (!inputs.slug || doc.slug == inputs.slug)) {
            if (inputs.html) {
              exits.success(doc.asHtml(ctx.linkResolver));
            } else {
              exits.success(doc);
            }
          } else if (doc && doc.slugs.indexOf(inputs.slug) > -1 && exits.newSlug) {
            exits.newSlug(doc);
          } else {
            exits.notFound();
          }
        });
    }, inputs.accessToken);

  }

};







// fin