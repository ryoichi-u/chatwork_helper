/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports) {

// ==UserScript==
// @name         chatwork helper
// @match        https://www.chatwork.com/*
// @match        https://kcw.kddi.ne.jp/*
// @version      1.5.6
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
  $('#_sideContentTitle').append(allOpenedButton);

  $('#_openedButton').on('click', function(e) {
    var d=new Date();
    var rid;
    $("li.roomListItem:has(p.roomListItem__roomName--unread)").each(function(i, element){
        rid = $(element).data('rid');
        $.post('https://'+window.location.hostname+'/gateway.php?cmd=read&myid='+MYID+'&_v='+CLIENT_VER+'&_av=5&ln='+LANGUAGE, {"room_id": rid,"unread":0,"last_chat_id":$('._message[data-rid='+rid+']:last').data('mid'),"_t":ACCESS_TOKEN});
    });
  });
});


/***/ })
/******/ ]);