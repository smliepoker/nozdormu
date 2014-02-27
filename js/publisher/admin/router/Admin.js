(function (ns) {
  var page,
      init = {
        initialize: function (options) {
          page = options;
        },
        routes: {
          'pub/:op' : 'showPubPage',
          'pub/:op/:param' : 'showPubPage',
          'pub/:op/:param/:start/:end' : 'showPubPage',
          'publisher/:op' : 'showPublisherPage',
          'publisher/:op/:id' : 'showPublisherPage',
          'stat/:op' : 'showStatPage',
          'stat/:op/:start/:end' : 'showStatPage',
          'stat/:op/:start/:end/:param' : 'showStatPage',
        },
        showPubPage: function(op, param, start, end) {
          param = param || '';
          start = start || '';
          end = end || '';
          page.openSubPage('./pub/' + op + '.php?param=' + param + '&start=' + start + '&end=' + end);
        },
        showPublisherPage: function(op, id) {
          id = id || '';
          page.openSubPage('./publisher/' + op + '.php?id=' + id);
        },
        showStatPage: function(op, start, end, param) {
          start = start || '';
          end = end || '';
          param = param || '';
          page.openSubPage('./stat/' + op + '.php?start=' + start + '&end=' + end + '&param=' + param);
        },
      };
  ns.Admin = Backbone.Router.extend(init);
}(Nervenet.createNameSpace('Dianjoy.publisher.router')));
