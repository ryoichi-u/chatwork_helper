
// ==UserScript==
// @name         chatwork helper
// @match        https://www.chatwork.com/*
// @version 1.3
/* load jQuery */
// @require https://ajax.googleapis.com/ajax/libs/jquery/2.1.3/jquery.min.js
// ==/UserScript==

(function (callback) {
  var script = document.createElement("script");
  script.setAttribute("src", "//ajax.googleapis.com/ajax/libs/jquery/2.1.3/jquery.min.js");
  script.addEventListener('load', function() {
    var script = document.createElement("script");
    script.textContent = "(" + callback.toString() + ")(jQuery.noConflict(true));";
    document.body.appendChild(script);
  }, false);
  document.body.appendChild(script);
})(function ($) {
  var _chatText = $('#_chatText');
  var _taskNameInput = $('#_taskNameInput');
  
  // shortcut for main massege area
  _chatText.on('keypress', function(e) {
    // @+@+enter
    if (e.keyCode == 13) {
      if (/(^|\n)[@＠]{2}/.test(_chatText.val())) {
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
         
          if (toList.length > 0) {
            var val = _chatText.val();
            _chatText.val(val.replace(/[@＠]{2}/, toList.join(' ')));
          }
          _chatText.focus();
        }
        setToAllUser();
      }

      // show toList ':to'+enter
      if (/(^|\n):to($|\n)/.test(_chatText.val())) {
        var openToList = function() {
            $('#_to').click();
            var val = _chatText.val();
            _chatText.val(val.replace(/:to/, ''));
        }
        openToList();
      }

      // show fileUpload ':file'+enter
      if (/(^|\n):file($|\n)/.test(_chatText.val())) {
        var openFileUpload = function() {
            $('#_file').click();
            var val = _chatText.val();
            _chatText.val(val.replace(/:file/, ''));
        }
        openFileUpload();
      }

      //  search ':f'+enter
      if (/(^|\n):f($|\n)/.test(_chatText.val())) {
        var showAllMessage = function() {
            $("#_search").focus();
            var val = _chatText.val();
            _chatText.val(val.replace(/:f/, ''));
        }
        showAllMessage();
      }

      
      // show onli to me ':me'+enter
      if (/(^|\n):me($|\n)/.test(_chatText.val())) {
        var onlyMe = function() {
            $("._message").show();
            $("._message:not(.chatTimeLineMessageMention)").hide();
            var val = _chatText.val();
            _chatText.val(val.replace(/:me/, ''));
        }
        onlyMe();
      }
      // show only mine ':mine'+enter
      if (/(^|\n):mine($|\n)/.test(_chatText.val())) {
        var onlyMine = function() {
            $("._message").show();
            $("._message:not(.chatTimeLineMessageMine )").hide();
            var val = _chatText.val();
            _chatText.val(val.replace(/:mine/, ''));
        }
        onlyMine();
      }
      // show all ':all'+enter
      if (/(^|\n):all($|\n)/.test(_chatText.val())) {
        var showAllMessage = function() {
            $("._message").show();
            var val = _chatText.val();
            _chatText.val(val.replace(/:all/, ''));
        }
        showAllMessage();
      }


      // message send to task ':task'+enter
      if (/(^|\n):task($|\n)/.test(_chatText.val())) {
        var openToList = function() {          
            var val = _chatText.val();
            
            _taskNameInput.val(val.replace(/:task/, ''));
            _chatText.val('');
            _taskNameInput.focus();
        }
        openToList();
      }
      

      //make tag ex) ':info'+enter
      var tags = ['info', 'title', 'code'];
      tags.forEach(function(tag) {
        var regTagMatch = new RegExp("(^|\n):" + tag +"($|\n)");
        var regTagReplace = new RegExp(":" + tag);
    
        if (_chatText.val().match(regTagMatch)) {
          var makeInfoTag = function() {
            var val = _chatText.val();
            _chatText.val(val.replace(regTagReplace, "[" + tag + "]\n[/" + tag + "]"));
          }
          makeInfoTag();
        }
      });
    }

  });



  // shortcut maketask area
  _taskNameInput.on('keypress', function(e) {
    // show toList ':to'+enter
    if (e.keyCode == 13 && /(^|\n):to($|\n)/.test(_taskNameInput.val())) {
      var openToList = function() {
          $('#_inchargeEmpty').click();
          var val = _taskNameInput.val();
          _taskNameInput.val(val.replace(/:to/, ''));
      }
      openToList();
    }
  });




  // all openedButton
  var allOpenedButton = '<button id="_openedButton" style="margin-left:10px" class="button btnPrimary">全て既読</button>';
  $('#_openedButton').remove();
  $('#_sideContentTitleText').append(allOpenedButton);

  $('#_openedButton').on('click', function(e) {
    var d=new Date();
    var rid;
    $('.roomUnread').each(function(i, element){
        rid = $(element).data('rid');
        $.getJSON('https://www.chatwork.com/gateway.php?cmd=read&myid='+myid+'&_v='+client_ver+'&_av=4&_t='+ACCESS_TOKEN+'&ln=ja&room_id='+rid+'&last_chhkkt_id='+$('._message[data-rid='+rid+']:last').data('mid')+'&_='+d.getDate());
    });
  });
});
