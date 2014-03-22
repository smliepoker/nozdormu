/** 
 * @overview 操作cookie
 * @author Meathill <lujia.zhai@dianjoy.com>
 * @since 2013-07-11
 */
;(function (ns) {
  var cookie = function () {
    var all = document.cookie,
        arr = all.split(/;\s*/);
    this.data = {};
    for (var i = 0, len = arr.length; i < len; i++) {
      var kv = arr[i].split('=');
      this.data[kv[0]] = kv[1];
    }
  };
  var instance = null;
  cookie.prototype = {
    add: function (key, value, expire) {
      if (!this.has(key)) {
        this.set(key, value, expire);
        return;
      }
      var all = this.get(key).split(',');
      if (all.indexOf(value) === -1) {
        all.length === 1 && all[0] === '' ? all = [value] : all.push(value);
        this.set(key, all.join(','), expire);
      }
    },
    get: function (key) {
      return this.data[key];
    },
    has: function (key) {
      return key in this.data;
    },
    remove: function (key, value) {
      if (!this.has(key)) {
        return;
      }
      var all = this.get(key).split(','),
          index = all.indexOf(value);
      if (index !== -1) {
        all.splice(index, 1);
        value = all.length > 0 ? all.join(',') : '';
        this.set(key, value);
      }
    },
    set: function (key, value, expire, path, domain) {
      var str = key + '=' + value,
          year = new Date();
      year.setDate(year.getDate() + 365);
      str += path ? ';path=' + path : '';
      str += domain ? ';domain=' + domain : '';
      str += ';expire=' + (expire === null ? expire : year.toUTCString());
      document.cookie = str;
      this.data[key] = value;
    },
    toggle: function (key, value, expire) {
      if (!this.has(key)) {
        this.set(key, value, expire);
        return;
      }
      var all = this.get(key).split(',');
      if (all.indexOf(value) === -1) {
        this.add(key, value, expire);
      } else {
        this.remove(key, value);
      }
    },
    unset: function (key) {
      this.set(key, null, 0);
    }
  };
  cookie.getInstance = function () {
    instance = instance || new cookie();
    return instance;
  };
  ns.Cookie = cookie;
}(Nervenet.createNameSpace('dianjoy.component.model')));

