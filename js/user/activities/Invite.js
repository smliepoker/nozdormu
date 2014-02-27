;(function (ns) {
  var invite = {
    start: function () {
      // zeroclipboard
      var clip = new ZeroClipboard($('#invite-friends-button')[0], {
        moviePath: 'swf/ZeroClipboard.swf'
      });
      clip.on('complete', function () {
        $('#share-popup .alert').slideDown();
      });

      // 提示popover
      $('.account')
        .popover({
          placement: 'bottom',
          title: '推荐得奖金！',
          content: '从2013年1月1日~2013年12月31日，通过网站、微博、QQ群、论坛等途径宣传点乐广告平台，可以获得现金奖励哦。'
        })
        .popover('show')
        .on('click', invite.step2)
        .siblings('.popover')
          .addClass('animated flash infinite slow');
    },
    step2: function () {
      $('.account').popover('destroy');
      $('.invite-friends')
        .popover({
          placement: 'left',
          title: '推荐得奖金！',
          content: '点这里获得您的专属推广链接'
        })
        .popover('show')
        .addClass('active')
        .on('click', invite.step3)
        .siblings('.popover')
          .css({
            left: '-210px',
            top: '30px'
          });
    },
    step3: function () {
      $('.invite-friends').popover('destroy');
    }
  };
  ns.Invite = invite;
}(Nervenet.createNameSpace('Dianjoy.user.activities')));
