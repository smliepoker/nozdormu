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
    }
  });
}(Nervenet.createNameSpace('dianjoy.model')));