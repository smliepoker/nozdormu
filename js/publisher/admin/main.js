$(function () {
  'use strict';
  var mediator = new Dianjoy.component.model.NavbarTableMediator();
  R.mainPage = new Dianjoy.publisher.view.MainPage({
    el: '#main-body, #navbar',
    model: mediator
  });

  // 表单提交完成
  Dianjoy.service.Manager.autoUpload = true;
  Dianjoy.service.Manager.on('complete', function (response) {
    if (response.hasOwnProperty('url')) {
      if (response.url === location.hash) {
        Backbone.history.loadUrl(Backbone.history.fragment);
      } else {
        R.router.navigate(response.url);
      }
    }
  });

  // 路由
  R.router = new Dianjoy.publisher.router.Admin(R.mainPage);
  var check = Backbone.history.start({
    root: '/Dianjoy/'
  });
  if (!check) {
    R.router.navigate('#/pub/all_pub');
  }

  // 开启最近的活动
  if (Dianjoy.publisher.hasOwnProperty('actDianjoy.publisher.activities.Invite.start();ivities')) {
    Dianjoy.publisher.activities.Invite.start();
  }
  
});
var R = {};