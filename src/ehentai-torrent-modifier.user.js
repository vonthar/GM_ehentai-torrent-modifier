// ==UserScript==
// @name        E-Hentai Torrent Modifier
// @namespace   vonthar
// @version     1.0
// @description Modifies ehtracker torrent files to include gallery url in their comment field and shows torrent links on gallery page.
// @include     *://exhentai.org/g/*
// @include     *://g.e-hentai.org/g/*
// @author      vonthar
// @license     MPL-2.0
// @icon        data:image/gif;base64,R0lGODlhLAAwAPQfAHFxcJKSki4uLtLQ0P7+/uHi4ru7u1hYWEVFRfX19dKjpAgICKSiomRWV1RHSIqIh2hoZ0dURzg4ODEiIj4+PjxFOxsaG1NTU0U8RGJiYn+Af11dXU1NTSQkJOzs7JOSkyH5BAUAAB8ALAAAAAAsADAAAAX/4CeOZGl+2QYA2+m+8AdcUMAMg2FoR+y/FI2h4PEEOBeAYQD4OUcNhieRIBQ6FqxAw2w+YZeOgZAoEgwCiUDQEXu8XxOgswgQitSzZS2xcBIFTHEmCxYSHndVBFZqEnQMd4EQgyNrCwCJBDlLG3sWdlREBnBxFxYLD3dWdB1pFhaQZGUFBAGUIp12iAwLCBoPG1gDsrMFBaSDkLsLFxoAFBYai1ShAwkMtyJSiAMdCBQC0YvEmkMeGtkB1osIC8xj43kJSwXX2R+piO0GiuS1scYm3XpwYx4tRWUUATAEQdGDbELGaaKViQEdAaYwaWpB6QGiehNlEbiwoEMGCCgt/4xJgOwJgAcPNMYjoGEBBwAZMhwIBoEMtlsLJowxs4iXLwgZLiBAIAABGUG3ODAw8IBWAQPQAjw4oPRbmlAPswlAJYoJBAYQLnBYqkYALQ8/gaYic0ZAAA0XukpQ02GYh1HZFlCckkHCAwgH1u6lsEBAlUAtnWjoMM3DAAoZWCSmIAFcnUUeCqA7IfDFhgygEwSQAACxUs5jpY0zQuoAmzWRRVAARZgCYq4I9r4aJhEtCQsQOFAI80KA3wQDEHDYcAG4o14SFxnIMAKAgwcOGjww6QLBlCkBBGw4sDM4m8/ZC5QWQIFpgwZ7T29AiRRjJA8QqLfTBeC0YQFFEh0jAv8AAnAgQXCdYQZBazlBsEBPxgywFnsHFDjWAdmB5sUzF9DHlgDsbaDiTgtIM0ABDFCQIlOt0GFHiOcsKEFOGNS3Rl5qcSBkHdAdQ4GKNLZhY4h3hOWgAgM00FQaS1W51AIMGIPVBRlwoAUFHHCFInGzjfaBBAwo4MCDi1Hg5lKMZXkOAoW1gsABOa1nygLwLCLaCBLc96CbnHXmCBawzNNhBxJMlwKHHLaC0AC2iLBXU0spZ6iBp4zRTlN5QspeXhzARwADYX3g4Jv1feOIAxw0daGFO+q0k62icoAcXQAsUMEIjLLRSiPfYYAABIxZcBKkK56WQl4IWLCBdq2AA0OpoBl00EAA4CCw3np45lShTkJKsABqCZD0DQbXwiaBA5x14KizKOVJnWKXnLoAZxPEcOQawbmJEX8nQQDuvcphsUQbAvQbAxIOOCDdYuLytyISirFBEHdPbCCBAmoW6u1OKurZFWzylvbEBQ4MoAB+nMm44qhsSTABFr/eYgHIxsaMhFoIYMBXKxHcIwKjGGD0poPhMBpBD0aXUK2bbdUXNQyxrkHB1SKEAAA7
// @homepageURL https://github.com/vonthar/GM_ehentai-torrent-modifier
// @supportURL  https://github.com/vonthar/GM_ehentai-torrent-modifier/issues
// @downloadURL https://raw.githubusercontent.com/vonthar/GM_ehentai-torrent-modifier/master/src/ehentai-torrent-modifier.user.js
// @require     https://raw.githubusercontent.com/vonthar/GM_ehentai-torrent-modifier/master/lib/parsetorrent.bundle.js
// @run-at      document-start
// @grant       GM_getValue
// @grant       GM_setValue
// @grant       GM_xmlhttpRequest
// ==/UserScript==


var gallery;
document.addEventListener("DOMContentLoaded", function () {
  if (gallery.torrents) {
    insertTorrentTable();
  }
  gallery.name = document.getElementById("gn").textContent;
  gallery.uploader = document.getElementById("gdn").textContent;
  gallery.posted = new Date(document.getElementById("gdd").getElementsByClassName("gdt2")[0].textContent);
});
getTorrentInfo();


function getTorrentInfo() {
  var tokens = getTokens();
  gallery = {
    url: tokens.base + "g/" + tokens.gid + "/" + tokens.token + "/",
  };
  GM_xmlhttpRequest({
    url: url = tokens.base + "gallerytorrents.php?gid=" + tokens.gid + "&t=" + tokens.token,
    method: "GET",
    onload: function (response) {
      var xmlDocument = new DOMParser().parseFromString(response.responseText, "text/xml");
      gallery.torrents = parseTorrentInfo(xmlDocument);
      if (gallery.name) {
        insertTorrentTable();
      }
    },
    onerror: function (response) {
      console.error(response.statusText);
    }
  });
}

function getTokens() {
  var matches = window.location.href.match(/(.+\/)g\/(\d+)\/([^\/]+)/);
  return {
    base: matches[1],
    gid: matches[2],
    token: matches[3]
  };
}

function getDataUri(buffer, mimeType) {
  buffer = new Buffer(buffer);
  if (!mimeType) {
    mimeType = "text/plain";
  }
  return "data:" + mimeType + ";base64," + buffer.toString("base64");
}

function browserDownload(url, name) {
  var a = document.createElement("a");
  a.href = url;
  if (name) {
    a.download = name;
  }
  a.dispatchEvent(new MouseEvent("click"));
}

function parseSize(value) {
  var matches = value.match(/(\d+) (\S+)/);
  if (matches) {
    value = parseInt(matches[1], 10);
    switch (matches[2]) {
      case "B":
        return value;
      case "KB":
        return value * 1000;
      case "MB":
        return value * 1000000;
      case "GB":
        return value * 1000000000;
    }
  }
  return value;
}

function parseTorrentInfo(xmlDocument) {
  var property = />(.*):<\/span>\s*(.*)$/;
  var torrents = [];
  var forms = xmlDocument.getElementById("torrentinfo").getElementsByTagName("form");
  var i, j, link, fields, matches;
  for (i = 0; i < forms.length - 1; i++) {
    link = forms[i].getElementsByTagName("a")[0];
    torrents[i] = {
      url: link.href,
      name: link.innerText
    };
    fields = forms[i].getElementsByTagName("td");
    for (var j = 0; j < fields.length; j++) {
      matches = fields[j].innerHTML.match(property);
      if (matches) {
        torrents[i][matches[1].toLocaleLowerCase()] = matches[2];
      }
    }
  }
  return torrents;
}

function getTorrentsSorted() {
  var key = GM_getValue("sortKey");
  var order = GM_getValue("sortOrder", "desc");
  switch (key) {
    case "size":
      if (order === "desc") {
        return gallery.torrents.sort(function (a, b) {
          return parseSize(b.size) - parseSize(a.size);
        });
      }
    default:
      key = "downloads";
    case "seeds":
    case "peers":
    case "downloads":
      if (order === "desc") {
        return gallery.torrents.sort(function (a, b) {
          return parseInt(b[key], 10) - parseInt(a[key], 10);
        });
      }
      return gallery.torrents.sort(function (a, b) {
        return parseInt(a[key], 10) - parseInt(b[key], 10);
      });
    case "posted":
    case "uploader":
      if (order === "desc") {
        return gallery.torrents.sort(function (a, b) {
          return String(b.posted).localeCompare(a.posted);
        });
      }
      return gallery.torrents.sort(function (a, b) {
        return String(a.posted).localeCompare(b.posted);
      });
  }
}

function updateSortOrder(event) {
  event.preventDefault();
  var key = GM_getValue("sortKey", "downloads");
  var value;
  switch (event.target.textContent) {
    case "DLs":
      value = "downloads";
      break;
    case "Added":
      value = "posted";
      break;
    default:
      value = name.toLowerCase();
  }
  if (value === key) {
    if (GM_getValue("sortOrder") === "asc") {
      GM_setValue("sortOrder", "desc");
    }
    else {
      GM_setValue("sortOrder", "asc");
    }
  }
  else {
    GM_setValue("sortKey", value);
    GM_setValue("sortOrder", "desc");
  }
  var table = document.getElementById("torrentinfo");
  table.parentNode.replaceChild(createTable(), table);
}

function downloadTorrent(event) {
  if (!parseTorrent) {
    return;
  }
  event.preventDefault();
  var url = event.target.href;
  GM_xmlhttpRequest({
    url: url,
    method: "GET",
    overrideMimeType: "application/x-bittorrent; charset=x-user-defined",
    onload: function (response) {
      var data = new Buffer(response.responseText, "binary");
      if (!data.length) {
        browserDownload(url);
        return;
      }
      var torrent = parseTorrent(data);
      torrent.created = gallery.posted;
      torrent.createdBy = gallery.uploader;
      torrent.comment = gallery.url;
      //torrent.name = gallery.name;
      var uri = getDataUri(parseTorrent.toTorrentFile(torrent), "application/x-bittorrent");
      browserDownload(uri, gallery.name + ".torrent");
    },
    onerror: function () {
      browserDownload(url);
    }
  });
}

function insertTorrentTable() {
  if (gallery.torrents.length) {
    var wrapper = document.createElement("div");
    wrapper.className = "gm";
    wrapper.appendChild(createTable());
    var asm = document.getElementById("asm");
    asm.parentNode.insertBefore(wrapper, asm);
  }
}

function createTable() {
  var header = document.createElement("tr");
  header.appendChild(createLabel("Added", 95));
  var elem = document.createElement("th");
  elem.textContent = "Torrent Name";
  header.appendChild(elem);
  header.appendChild(createLabel("Size", 70));
  header.appendChild(createLabel("Seeds", 35));
  header.appendChild(createLabel("Peers", 35));
  header.appendChild(createLabel("DLs", 40));
  header.appendChild(createLabel("Uploader", 90));
  
  var tbody = document.createElement("tbody");
  tbody.append(header);
  var torrents = getTorrentsSorted();
  for (var i = 0; i < torrents.length; i++) {
    tbody.appendChild(createRow(torrents[i], i % 2));
  }
  
  var table = document.createElement("table");
  table.id = "torrentinfo";
  table.className = "itg";
  table.style = "border:0; padding:0; margin:10px 8px; min-width:0; max-width:calc(100% - 16px); outline:1px solid black";
  table.appendChild(tbody);
  return table;
}

function createLabel(name, width) {
  var a = document.createElement("a");
  a.textContent = name;
  a.href = "#";
  a.onclick = updateSortOrder;
  var elem = document.createElement("th");
  elem.style = "text-align:center; width:" + width + "px";
  elem.appendChild(a);
  return elem;
}

function createRow(torrent, mod) {
  var row = document.createElement("tr");
  row.className = "gtr" + mod;
  row.appendChild(createField(torrent.posted, "width:102px; white-space:nowrap"));
  var a = document.createElement("a");
  a.href = torrent.url;
  a.textContent = torrent.name;
  a.onclick = downloadTorrent;
  var div = document.createElement("div");
  div.style = "height:15px; min-width:300px; max-width:600px; overflow:hidden";
  div.appendChild(a);
  var td = document.createElement("td");
  td.className = "itd";
  td.appendChild(div);
  row.appendChild(td);
  row.appendChild(createField(torrent.size, "text-align:right; width:70px; white-space:nowrap"));
  row.appendChild(createField(torrent.seeds, "text-align:right; width:30px"));
  row.appendChild(createField(torrent.peers, "text-align:right; width:30px"));
  row.appendChild(createField(torrent.downloads, "text-align:right; width:40px"));
  row.appendChild(createField(torrent.uploader, "width:90px"));
  return row;
}

function createField(name, style) {
  var elem = document.createElement("td");
  elem.className = "itd";
  elem.textContent = name;
  elem.style = style;
  return elem;
}

