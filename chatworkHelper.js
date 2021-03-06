// ==UserScript==
// @name         chatwork helper
// @match        https://www.chatwork.com/*
// @match        https://kcw.kddi.ne.jp/*
// @version      2.3.0
/* load jQuery */
// @require https://ajax.googleapis.com/ajax/libs/jquery/3.1.1/jquery.min.js
// ==/UserScript==

(function (callback) {
  setTimeout(function(){
    var script = document.createElement("script");
    script.setAttribute("src", "//ajax.googleapis.com/ajax/libs/jquery/3.1.1/jquery.min.js");
    script.addEventListener('load', function() {
      var script = document.createElement("script");
      script.textContent = "(" + callback.toString() + ")(jQuery.noConflict(true));";
      document.body.appendChild(script);
    }, false);
    document.body.appendChild(script);
  }, 3000);
})(function ($) {

  const allOpenedButton = '<div id="_openedButton" class="roomListHeader__myChatButton"><svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="16px" height="16px" viewBox="0 0 512 512" enable-background="new 0 0 256 256" xml:space="preserve"><polygon points="211.344,306.703 160,256 128,288 211.414,368 384,176 351.703,144 "/><path d="M256,0C114.609,0,0,114.609,0,256s114.609,256,256,256s256-114.609,256-256S397.391,0,256,0z M256,472 c-119.297,0-216-96.703-216-216S136.703,40,256,40s216,96.703,216,216S375.297,472,256,472z"/></svg></div>';
  const attachingElementSelector = '#_sideChatMoveMyChat';

  var _chatText = $('#_chatText');
  var _taskNameInput = $('#_taskNameInput');

  var shortcutConf = [
    {
      key: '[@＠]{2}',
      action: function() {
        _chatText.val(_chatText.val().replace(/[@＠]{2}/, '[toall]')).focus();
      }
    },
    {
      key: ':to',
      action: function() {
        $('#_to').click();
        _chatText.val(_chatText.val().replace(/:to/, ''));
      }
    },
    {
      key: ':file',
      action: function() {
        $('#_file').click();
        _chatText.val(_chatText.val().replace(/:file/, ''));
      }
    },
    {
      key: ':f',
      action: function() {
        $("#_search").focus();
        _chatText.val(_chatText.val().replace(/:f/, ''));
      }
    },
    {
      key: ':me',
      action: function() {
        $("._message").show();
        $("._message:not(.chatTimeLineMessageMention)").hide();
        _chatText.val(_chatText.val().replace(/:me/, ''));
      }
    },
    {
      key: ':mine',
      action: function() {
        $("._message").show();
        $("._message:not(.chatTimeLineMessageMine )").hide();
        _chatText.val(_chatText.val().replace(/:mine/, ''));
      }
    },
    {
      key: ':all',
      action: function() {
        $("._message").show();
        _chatText.val(_chatText.val().replace(/:all/, ''));
      }
    },
    {
      key: ':task',
      action: function() {
        _taskNameInput.val(_chatText.val().replace(/:task/, ''));
        _chatText.val('');
        _taskNameInput.focus();
      }
    },
    {
      key: ':to',
      action: function() {
        $('#_inchargeEmpty').click();
        _taskNameInput.val(_taskNameInput.val().replace(/:to/, ''));
      }
    },
  ];

  // shortcut for main massege area
  _chatText.on('keypress', function(e) {
    if (e.keyCode != 13) {
        return;
    }

    // each action
    shortcutConf.forEach(function(conf) {
      var regMatch = new RegExp("(^|\n)" + conf.key +"($|\n)");
      if (_chatText.val().match(regMatch)) {
        conf.action();
      }
    });

    //make tag ex) ':info'+enter
    ['info', 'title', 'code'].forEach(function(tag) {
      var regTagMatch = new RegExp("(^|\n):" + tag +"($|\n)");
      var regTagReplace = new RegExp(":" + tag);

      if (_chatText.val().match(regTagMatch)) {
        var makeInfoTag = function() {
          var val = _chatText.val();
          _chatText.val(val.replace(regTagReplace, "[" + tag + "]\n[/" + tag + "]"));
        };
        makeInfoTag();
      }
    });
  });


  // shortcut maketask area
  _taskNameInput.on('keypress', function(e) {
    // show toList ':to'+enter
    if (e.keyCode == 13 && /(^|\n):to($|\n)/.test(_taskNameInput.val())) {
      shortcutAction.openTaskAssigneeList();
    }
  });


  // all openedButton
  $('#_openedButton').remove();
  $(attachingElementSelector).after(allOpenedButton);


  $('#_openedButton').on('click', function(e) {
    var d=new Date();
    var rid;
    $("li.roomListItem:has(p.roomListItem__roomName--unread)").each(function(i, element){
        rid = $(element).data('rid');
        $.post('https://'+window.location.hostname+'/gateway.php?cmd=read&myid='+MYID+'&_v='+CLIENT_VER+'&_av=5&ln='+LANGUAGE, {"room_id": rid,"unread":0,"last_chat_id":$('._message[data-rid='+rid+']:last').data('mid'),"_t":ACCESS_TOKEN});
    });
  });
});
