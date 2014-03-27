$(function () {
  'use strict';
  var context = Nervenet.createContext()
    , mediator = new dianjoy.model.PageMediator()
    , mainPage = new dianjoy.view.MainPage({
      el: '#main-page, #sidebar, #footer',
      model: mediator
    })
    , subPage = new dianjoy.view.SubPage({
      el: '#sub-page',
      model: mediator
    })
    , router = new dianjoy.router.AdminPanel();

  context
    .mapValue('mainPage', mainPage)
    .mapValue('subPage', subPage)
    .mapValue('router', router)
    .inject(router)
    .inject(subPage)
    .inject(dianjoy.service.Manager)
    .inject(dianjoy.popup.Manager)
    .mapEvent('add-recent-document', dianjoy.controller.addRecentDocumentCommand)
    .mapEvent('create-excel', dianjoy.controller.createExcelCommand)
    .mapEvent('edit-model', dianjoy.controller.editModelCommand);

  subPage.on('load:start', mainPage.showLoading, mainPage);
  subPage.on('load:complete', mainPage.removeLoading, mainPage);
  subPage.on('load:failed', mainPage.showErrorAlert, mainPage);

  // 服务器返回消息全局处理
  dianjoy.service.Manager.on('complete', function (response) {
    if (response.refresh) {
      Backbone.history.loadUrl(Backbone.history.fragment);
    }
    if (response.hasOwnProperty('url')) {
      if (response.url === location.hash) {
        Backbone.history.loadUrl(Backbone.history.fragment);
      } else {
        router.navigate(response.url);
      }
    }
  });

  // 弹窗控制
  dianjoy.popup.mediator = mediator;

  // GA
  (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
    (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
    m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
  })(window,document,'script','//www.google-analytics.com/analytics.js','ga');

  ga('create', GAid);  // Replace with your property ID.
  ga('send', 'pageview');

  // 路由开始;
  if (!Backbone.history.start()) {
    router.navigate('#/');
  }

  // 用于小屏幕
  if ($('#sidebar-toggle').is(':hidden')) {
    $('#top-bar .collapse').addClass('in');
  }
});

moment.lang('cn', {
  relativeTime : {
    future: "%s 之后",
    past:   "%s 之前",
    s:  "%d 秒",
    m:  "一分钟",
    mm: "%d 分钟",
    h:  "一小时",
    hh: "%d 小时",
    d:  "一天",
    dd: "%d 天",
    M:  "一个月",
    MM: "%d 个月",
    y:  "一年",
    yy: "%d 年"
  }
});
