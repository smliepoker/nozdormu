/**
 * Created by meathill on 13-12-16.
 */
;(function (ns) {
  "use strict";
  var isLoading = false;
  ns.PageMediator = Backbone.Model.extend({
    // defaults里的字段主要用来筛选table的内容和翻页
    defaults: {
      'show': '',
      'keyword': '',
      'author': '',
      'page': -1
    },
    initialize: function () {
      this.on('change', this.changeHandler, this);
    },
    fetch: function (options) {
      if (isLoading) {
        return;
      }
      isLoading = true;
      Backbone.Model.prototype.fetch.call(this, options);
    },
    parse: function (response, options) {
      isLoading = true;
      return Backbone.Model.prototype.parse.call(this, response, options);
    },
    load: function () {
      var item = localStorage.getItem(location.hash);
      if (item) {
        item = JSON.parse(item);
        this.set(item);
      }
    },
    storeStatus: function () {
      localStorage.setItem(location.hash, JSON.stringify(this.getFilters()));
    },
    getFilters: function () {
      return _.pick(this.attributes, _.keys(this.defaults));
    },
    changeHandler: function () {
      this.storeStatus();
    }
  });
}(Nervenet.createNameSpace('dianjoy.model')));