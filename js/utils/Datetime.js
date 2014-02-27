/**
 * Created by meathill on 13-12-4.
 */
;(function (ns) {
  "use strict";
  function format(num) {
    return num < 10 ? '0' + num : num;
  }
  ns.Datetime = {
    formatAsHourMinute: function (num) {
      return format(num / 60 >> 0) + ':' + format(num % 60);
    }
  };
}(Nervenet.createNameSpace('Dianjoy.utils')));