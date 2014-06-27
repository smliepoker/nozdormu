/**
 * Created by meathill on 13-12-16.
 */
;(function (ns) {
  "use strict";

  var isLoading = false;

  ns.PageMediator = Backbone.Model.extend({
    defaults: {
      keyword: '',
      page: 0
    },
    fetch: function (options) {
      if (isLoading) {
        return;
      }
      isLoading = true;
      Backbone.Model.prototype.fetch.call(this, options);
    },
    parse: function (response, options) {
      isLoading = false;
      return Backbone.Model.prototype.parse.call(this, response, options);
    },
    set: function (key, value, options) {
      if (key === null) {
        return;
      }
      if (key === 'keyword') {
        var attr = {
          keyword: value,
          page: 0
        };
        return Backbone.Model.prototype.set.call(this, attr, options);
      }
      if (_.isObject(key) && 'keyword' in key) {
        key.page = 0;
        return Backbone.Model.prototype.set.call(this, key, value, options);
      }
      return Backbone.Model.prototype.set.call(this, key, value, options);
    }
  });
}(Nervenet.createNameSpace('dianjoy.model')));