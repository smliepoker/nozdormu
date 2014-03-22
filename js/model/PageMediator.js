/**
 * Created by meathill on 13-12-16.
 */
;(function (ns) {
  "use strict";
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
    load: function () {
      var item = localStorage.getItem(location.hash);
      if (item) {
        item = JSON.parse(item);
        this.set(item);
      }
    },
    save: function () {
      localStorage.setItem(location.hash, JSON.stringify(this.getFilters()));
    },
    getFilters: function () {
      return _.pick(this.attributes, _.keys(this.defaults));
    },
    changeHandler: function () {
      this.save();
    }
  });
}(Nervenet.createNameSpace('dianjoy.model')));