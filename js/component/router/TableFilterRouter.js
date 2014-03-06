/**
 * @overview 用于在表格中实现筛选的router
 * @author Meathill
 * @since 1.8.3
 */
;(function (ns) {
  ns.TableFilterRouter = Backbone.Router.extend({
    routes: {
      'ch/:cid/ad/:aid/owner/:oid': 'useFilters',
    },
    initialize: function (model) {
      this.model = model;
      model.on('change:adlabel change:chlabel change:ownerlabel', this.model_filterChangeHandler, this);
    },
    useFilters: function (ch, ad, owner) {
      this.model.set({
        'chlabel': ch,
        'adlabel': ad,
        'ownerlabel': owner,
      });
      this.model.trigger('translate', ch, ad, owner);
    },
    model_filterChangeHandler: function (model, value, map) {
      this.navigate('ch/' + model.get('chlabel') + '/ad/' + model.get('adlabel') + '/owner/' + model.get('ownerlabel'), {
        silent: true,
      });
    },
  });
}($.namespace('dianjoy.router')));

