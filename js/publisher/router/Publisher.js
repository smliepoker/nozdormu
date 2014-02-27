(function (ns) {
  var page,
      init = {
        initialize: function (options) {
          page = options;
        },
        routes: {
          ':op/:start/:end/:id' : 'showPage',
          ':op/:start/:end' : 'showPage',
          ':op' : 'showPage',
        },
        showPage: function(op, start, end, id) {
          id = id || '';
          start = start || '';
          end = end || '';
          page.openSubPage(op + '.php?id=' + id + '&start=' + start + '&end=' + end);
        },
      };
  ns.Publisher = Backbone.Router.extend(init);
}(Nervenet.createNameSpace('Dianjoy.publisher.router')));
