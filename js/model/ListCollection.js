/**
 * Created by meathill on 14-3-12.
 */
;(function (ns) {
  ns.ListCollection = Backbone.Collection.extend({
    total: 0,
    page: 0,
    pagesize: 20,
    param: {},
    initialize: function(models, options) {
      Backbone.Collection.prototype.initialize.call(this, models, options);
      if (options.url) {
        this.url = options.url;
      }
      if (options.pagesize) {
        this.pagesize = options.pagesize;
      }
      if (options.param) {
        this.param = options.param;
      }
      this.fetch();
    },
    fetch: function (param) {
      param = param || this.param;
      Backbone.Collection.prototype.fetch.call(this, {
        reset: true,
        data: _.extend(param, {
          page: this.page,
          pagesize: this.pagesize
        })
      });
    },
    parse: function (response) {
      this.total = response.total / this.pagesize;
      return response.list;
    }
  });
}(Nervenet.createNameSpace('dianjoy.model')));