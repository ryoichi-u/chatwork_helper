// ==UserScript==
// @name         chatwork helper
// @match        https://www.chatwork.com/*
// @match        https://kcw.kddi.ne.jp/*
// @version      1.0.3
/* load jQuery */
// @require https://ajax.googleapis.com/ajax/libs/jquery/3.1.1/jquery.min.js
// ==/UserScript==

(function (callback) {
  var script = document.createElement("script");
  script.setAttribute("src", "//ajax.googleapis.com/ajax/libs/jquery/3.1.1/jquery.min.js");
  script.addEventListener('load', function() {
    var script = document.createElement("script");
    script.textContent = "(" + callback.toString() + ")(jQuery.noConflict(true));";
    document.body.appendChild(script);
  }, false);
  document.body.appendChild(script);
})(function ($) {
  var _chatText = $('#_chatText');
  var txt = '';

  _chatText.on('keyup', function() {
    console.log(txt);
    if(_chatText.val() !== '') {
       txt = _chatText.val();
    }
  });

  var shortcutConf = [
    { 
      key: ':ok',
      action: function() {
        _chatText.val(_chatText.val().replace(/:ok/, '[preview id=123872200 ht=130]'));
      }
    },
    { 
      key: ':thank',
      action: function() {
        _chatText.val(_chatText.val().replace(/:thank/, '[preview id=123916974 ht=130]'));
      }
    },
    { 
      key: ':roger',
      action: function() {
        _chatText.val(_chatText.val().replace(/:roger/, '[preview id=123916999 ht=130]'));
      }
    },
    { 
      key: ':good',
      action: function() {
        _chatText.val(_chatText.val().replace(/:good/, '[preview id=123917003 ht=130]'));
      }
    },
    { 
      key: ':ban',
      action: function() {
        _chatText.val(_chatText.val().replace(/:ban/, '[preview id=123917011 ht=130]'));
      }
    },
    { 
      key: ':bow',
      action: function() {
        _chatText.val(_chatText.val().replace(/:bow/, '[preview id=123917024 ht=130]'));
      }
    },
  ];

  var exec = function() {
    val = _chatText.val() == '' ? txt : _chatText.val();
    // each action 
    shortcutConf.forEach(function(conf) {
      var regMatch = new RegExp("(^|\n)" + conf.key + "($|\n)");
      if (_chatText.val().match(regMatch)) {
        conf.action();
      }
    });
  };

  // shortcut for main massege area
  _chatText.on('keydown', function(e) {
    if (e.keyCode != 13 || (!e.ctrlKey && !e.metaKey && !e.shiftKey)) {
        return;
    }
    exec();
  });
  /*
  $('#_sendButton').on('submit', exec());
  $('#_sendButton').on('click', function(e) {
    exec();
  });
  */

});
