(function () {
  "use strict";

  var theme, source, run, error, bare, header, editor, destination, change, changeTheme, changeSource, evalCode;

  theme = document.getElementById('themes');
  source = document.getElementById('source');
  run = document.getElementById('run');
  error = document.getElementById('error');
  bare = document.getElementById('bare');
  header = document.getElementById('header');

  editor = ace.edit("editor");
  editor.setTheme("ace/theme/monokai");
  editor.getSession().setMode("ace/mode/coffee");

  destination = ace.edit("destination");
  destination.setReadOnly(true);
  destination.setTheme("ace/theme/monokai");
  destination.getSession().setMode("ace/mode/javascript");

  change = function () {
    var compiledSource;
    if (editor.session.getValue() === '') return false;
    try {
      compiledSource = CoffeeScript.compile(editor.session.getValue(), {
        header: header.checked,
        bare: bare.checked
      });
      destination.session.setValue(compiledSource);
      error.classList.add('hide');
    } catch (e) {
      error.classList.remove('hide');
      error.innerHTML = e.message;
    }
  };

  changeTheme = function (e) {
    var theme = e.srcElement.value;
    editor.setTheme('ace/theme/' + theme);
    destination.setTheme('ace/theme/' + theme);
    editor.focus();
    editor.navigateFileEnd();
  };

  changeSource = function (e) {
    var source = e.srcElement.value;
    var scriptEl = document.createElement('script');
    document.getElementsByTagName('script')[0].remove();
    scriptEl.src = "assets/js/" + source;
    document.head.appendChild(scriptEl);
    scriptEl.onload = change;
  };

  evalCode = function (e) {
    e.preventDefault();
    chrome.devtools.inspectedWindow.eval(destination.session.getValue(), function (result, isException) {
      if ((typeof isException !== "undefined" && isException !== null) && (typeof isException !== "undefined" && isException !== null ? isException.isException : void 0) === true) {
        error.classList.remove('hide');
        error.innerHTML = isException.value;
        var str = JSON.stringify(isException.value);
        chrome.devtools.inspectedWindow.eval('console.error(' + str + ');');
      }
    });
  };

  theme.onchange = changeTheme;
  source.onchange = changeSource;
  bare.onchange = change;
  header.onchange = change;
  editor.on('change', change);
  run.addEventListener('click', evalCode);
}());