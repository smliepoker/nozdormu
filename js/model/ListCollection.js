/**
 * Created by meathill on 14-3-12.
 */
;(function (ns) {
  'use strict';
  var collections = {};
  var Collection = ns.ListCollection = Backbone.Collection.extend({
      total: 0,
      pagesize: null,
      param: {},
      isLoading: false,
      initialize: function(models, options) {
        Backbone.Collection.prototype.initialize.call(this, models, options);
        if (!options) {
          return;
        }
        if (options.url) {
          this.url = options.url;
        }
        if (options.pagesize) {
          this.pagesize = options.pagesize;
        }
      },
      fetch: function (param) {
        if (this.isLoading) {
          return;
        }
        param = param || {};
        Backbone.Collection.prototype.fetch.call(this, {
          reset: true,
          data: _.extend(param, {
            pagesize: this.pagesize
          })
        });
        this.isLoading = true;
      },
      parse: function (response) {
        this.isLoading = false;
        this.total = response.total;
        return response.list;
      }
    });
  Collection.createInstance = function (models, options) {
    if (options.url in collections) {
      return collections[options.url];
    } else {
      var collection = new Collection(models, options);
      collections[options.url] = collection;
      return collection;
    }
  };
  Collection.destroyInstance = function (url) {
    if (url in collections) {
      delete collections.url;
    }
  }
}(Nervenet.createNameSpace('dianjoy.model')));