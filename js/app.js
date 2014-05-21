$(function () {
  'use strict';
  var context = Nervenet.createContext()
    , mediator = new dianjoy.model.PageMediator()
    , mainPage = new dianjoy.view.MainPage({
      el: document.body,
      model: mediator
    })
    , subPage = new dianjoy.view.SubPage({
      el: '#sub-page',
      model: mediator
    })
    , router = new dianjoy.router.AdminPanel();

  context.mediatorMap.isBackbone = true;
  context
    .mapValue('mainPage', mainPage)
    .mapValue('subPage', subPage)
    .mapValue('router', router)
    .inject(router)
    .inject(subPage)
    .inject(dianjoy.service.Manager)
    .inject(dianjoy.popup.Manager)
    .inject(dianjoy.component.Manager)
    .mapEvent('add-recent-document', dianjoy.controller.addRecentDocumentCommand)
    .mapEvent('create-excel', dianjoy.controller.createExcelCommand)
    .mapEvent('edit-model', dianjoy.controller.editModelCommand);

  subPage.on('load:start', mainPage.showLoading, mainPage);
  subPage.on('load:complete', mainPage.removeLoading, mainPage);
  subPage.on('load:failed', mainPage.showErrorAlert, mainPage);

  // 弹窗控制
  dianjoy.popup.mediator = mediator;

  // GA
  (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
    (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o);
    a.async=1;a.src=g;s.body.appendChild(a);
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
    s:  "刚才",
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
