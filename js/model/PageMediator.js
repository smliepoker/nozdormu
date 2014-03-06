/**
 * Created by meathill on 13-12-16.
 */
;(function (ns) {
  "use strict";
  ns.PageMediator = Backbone.Model.extend({
    // defaults里的字段都会被保存下来
    defaults: {
      'show': '',
      'keyword': '',
      'owner': -1,
      'ad-label': '-',
      'ch-label': '-'
    },
    initialize: function () {
      this.on('change', this.changeHandler, this);
    },
    fetch: function () {
      var item = localStorage.getItem(this.cid);
      if (item) {
        item = JSON.parse(item);
        this.set(item);
      }
    },
    save: function () {
      localStorage.setItem(this.cid, JSON.stringify(this.getLabels()));
    },
    getFilters: function () {
      return _.pick(this.attributes, 'ad', 'ch', 'owner', 'pub', 'country', 'status', 'jt', 'tt');
    },
    getLabels: function () {
      return _.pick(this.attributes, _.keys(this.defaults));
    },
    changeHandler: function () {
      if (_.intersection(_.keys(this.changed), _.keys(this.defaults)).length > 0) {
        this.save();
      }
    }
  });
}(Nervenet.createNameSpace('dianjoy.model')));