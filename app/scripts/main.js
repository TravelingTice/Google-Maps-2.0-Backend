// the folder in which the Json file is being put CHANGE THESE FOR JAYOE WEBSITE
// const websiteUrl = 'https://jayoe.com';
// const jsonFilePath = '/wp-content/uploads/google-maps/';
// const iconPath = '/wp-content/uploads/google-maps/icons';
// const imagePath = 'wp-content/uploads/google-maps/icons';

const websiteUrl = '';
const jsonFilePath = '/scripts/utils/';
const iconPath = '/images/icons/';
const imagePath = '/images/';
// The locations array
let locations = [];

function loadJson () {
// Fetch info of all locations in json file
fetch(`${websiteUrl}${jsonFilePath}locations.json`).then(resp => resp.json()).then(resp => {
  locations = resp;
  // next step: put data on screen
  loadHTML();
});
}

function loadHTML() {
  let html = '';
  locations.forEach(function(loc, i) {
    // load the template for each element
    html += `<div class="loc-module" id="${i}"><div class="grip-item"><i class="fas fa-grip-vertical"></i></div><div class='location'>
    <img class='icon-img' src='${websiteUrl}${iconPath}${loc.icon}'>
    <h3>${loc.title}</h3>
    </div></div>`
    // When all html is loaded, load it on the screen
    if (i+1 === locations.length) {
      loadScreen(html);
    }
  });
}

function loadScreen(html) {
  const container = document.getElementById('content');
  container.innerHTML = '';
  container.innerHTML = html;
  addListeners();
}

// once all elements are loaded, add the click listeners to each tile + the export button
function addListeners () {
  // Get all the tiles
  const tileList = document.querySelectorAll('.location');
  // Add event listener to each tile that will load the edit screen
  tileList.forEach(function(tile) {
    tile.addEventListener('click', function() {
      loadEditScreen(tile);
    });
  });
  // Add listener to export button
  const exportBtn = document.getElementById('export-btn');
  exportBtn.addEventListener('click', function() {
    exportJSON();
  });
}

// Export the json and update the file with an Http request
function exportJSON() {
  const newData = JSON.stringify(locations);
  // We're gonna do it with an ajax request
  $.ajax({
    type: 'PUT',
    url: 'C:/Users/matth/Desktop/Work/Google-Maps-Tours-2.0/Backend/app/scripts/utils/locations.json',
    contentType: 'application/json',
    data: newData,
    success: function(result) {
      location.reload();
    }
});
}

function loadEditScreen(t) {
  // Target the edit page and display it
  const editPage = document.getElementById('edit-page');
  editPage.classList.remove('hidden');
  // Select the right location object we need to paste
  const l = (selectLoc(t.children[1].innerHTML, locations));
  // Create the edit window
  const html = `
  <div class='edit-window'>
  <div class="top">
  <span id="closeBtn"><i class="fas fa-times"></i></span>
  </div>
  <main>
  <form>
    <p>Icon: <input id="icon-edit" type="text" value="${l.icon ? l.icon : null}"></p>
    <p>Title: <input id="title-edit" type="text" value="${l.title ? l.title : null}"></p>
    <p>Location: </p>
    <span>lat: </span><input id="lat-edit" type="text" value="${l.location.lat ? l.location.lat : null}">
    <span>lng: </span><input id="lng-edit" type="text" value="${l.location.lng ? l.location.lng : null}">
    <p>Date: <input id="date-edit" type="text" value="${l.date ? l.date : null}"></p>
    <p>Description:</p>
    <textarea id="desc-edit" rows="6" cols="60">${l.description ? l.description : null}"</textarea>
    <p>Youtube Id: <input id="yt-edit" type="text" value="${l.youtube ? l.youtube : null}"></p>
    <p>Image: <input id="img-edit" type="text" value="${l.image ? l.image : null}"></p>
    <p>rideData Url: <input id="rideData-edit" type="text" value="${l.rideData ? l.rideData : null}"></p>
    <p>zIndex: <input id="zIndex-edit" type="text" value="${l.zIndex ? l.zIndex : null}"></p>
  </form>
  </main>
  </div>`;
  editPage.innerHTML = html;
  // add close listener to cross button
  document.getElementById('closeBtn').addEventListener('click', function(){
    updateLoc(l);
    loadHTML();
  });
  // add listener when enter button is pressed
  document.querySelectorAll('input').forEach(function(el) {
    el.addEventListener('keypress', function(e) {
      if (e.keyCode === 13) {
        updateLoc(l);
        loadHTML();
      }
    });
  });
}

// close edit window screen
function closeScreen() {
  document.getElementById('edit-page').className += ' hidden';
}

// Filter the right object from the array of objects that corresponds with the name property of that object
function selectLoc(name, array) {
  let l;
  array.forEach(function(loc) {
    if (loc.title === name) {
      l = loc;
    }
  });
  return l;
}

// Find location position in locations array by title
function selectLocPos(name, array) {
  let pos;
  array.forEach(function(loc, i) {
    if (loc.title === name) {
      pos = i;
    }
  });
  return pos;
}

// Update the location's information with the new information. Make sure it stays in the same order of locations, then reload the screen
function updateLoc(loc) {
  // select position of location in locations array
  const pos = selectLocPos(loc.title, locations);
  // store new values in loc object in locations array
  locations[pos].icon = document.getElementById('icon-edit').value;
  locations[pos].title = document.getElementById('title-edit').value;
  locations[pos].location.lat = document.getElementById('lat-edit').value;
  locations[pos].location.lng = document.getElementById('lng-edit').value;
  locations[pos].date = document.getElementById('date-edit').value ? document.getElementById('date-edit').value : null;
  locations[pos].description = document.getElementById('desc-edit').innerHTML ? document.getElementById('desc-edit').innerHTML : null;
  locations[pos].youtube = document.getElementById('yt-edit').value ? document.getElementById('yt-edit').value : null;
  locations[pos].image = document.getElementById('img-edit') ? document.getElementById('img-edit') : null;
  locations[pos].rideData = document.getElementById('rideData-edit') ? document.getElementById('rideData-edit') : null;
  locations[pos].zIndex = document.getElementById('zIndex-edit') ? document.getElementById('zIndex-edit') : null;
  closeScreen();
}

$(document).ready(function () {
  // Kick off!!!
  loadJson();
});
