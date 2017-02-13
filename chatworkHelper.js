// ==UserScript==
// @name         chatwork helper
// @match        https://www.chatwork.com/*
// @match        https://kcw.kddi.ne.jp/*
// @version      1.5.3
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
  var _taskNameInput = $('#_taskNameInput');

  var shortcutConf = [
    {
      key: '[@＠]{2}',
      action: function() {
        var isInit = true;
        var setToAllUser = function() {
          if (isInit) {
            isInit = false;
            $('#_to').click();
            setTimeout(setToAllUser, 300);
            return;
          }
          _chatText.click();

          var userList = $('#_toList ._cwLTList li');
          if (userList.length == 0) {
            return;
          }

          var toList = [];
          userList.each(function() {
            toList.push('[To:' + $(this).data('cwui-lt-value') + ']');
          });

          _chatText.val(_chatText.val().replace(/[@＠]{2}/, toList.join(' '))).focus();
        };
        setToAllUser();
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
  var allOpenedButton = '<button id="_openedButton" style="margin-left:10px" class="button btnPrimary">全て既読</button>';
  $('#_openedButton').remove();
  $('#_sideContentTitleText').append(allOpenedButton);

  $('#_openedButton').on('click', function(e) {
    var d=new Date();
    var rid;
    $("li.roomListItem:has(p.roomListItem__roomName--unread)").each(function(i, element){
        rid = $(element).data('rid');
        $.getJSON('https://'+window.location.hostname+'/gateway.php?cmd=read&myid='+myid+'&_v='+client_ver+'&_av=4&_t='+ACCESS_TOKEN+'&ln=ja&room_id='+rid+'&last_chhkkt_id='+$('._message[data-rid='+rid+']:last').data('mid')+'&_='+d.getDate());
    });
  });
});
