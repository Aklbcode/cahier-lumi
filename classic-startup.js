/* ES5 startup guard for the classic app; never reads or deletes saved progress. */
(function (win, doc) {
  'use strict';
  var ready = false;
  function element(id) { return doc.getElementById(id); }
  function failed() {
    if (ready) return;
    var title = element('lumi-startup-title');
    var message = element('lumi-startup-message');
    if (title) title.textContent = 'Les jeux n’ont pas pu s’ouvrir';
    if (message) message.textContent = 'Vérifie la connexion, puis touche Réessayer. Les progrès enregistrés sont conservés.';
  }
  win.LumiStartup = {
    ready: function () {
      ready = true;
      var panel = element('lumi-startup');
      if (panel && panel.parentNode) panel.parentNode.removeChild(panel);
    },
    failed: failed
  };
  win.addEventListener('error', failed, true);
  var retry = element('lumi-startup-retry');
  if (retry) retry.addEventListener('click', function () { win.location.reload(); });
  win.setTimeout(failed, 20000);
})(window, document);
