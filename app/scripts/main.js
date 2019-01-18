// the folder in which the Json file is being put
const jsonFilePath = '/scripts/utils/';
const imgPath = '/images/icons/';
// The locations array
let locations = [];

function loadJson () {
// Fetch info of all locations in json file
fetch(`${jsonFilePath}locations.json`).then(resp => resp.json()).then(resp => {
  locations = resp;
  // next step: put data on screen
  loadHTML();
});
}

function loadHTML() {
  let html = '';
  locations.forEach(function(loc, i) {
    // load the template for each element
    html += `<div class='location'>
    <img class='icon-img' src='${imgPath}${loc.icon}'>
    <h3>${loc.title}</h3>
    </div>`
    // When all html is loaded, load it on the screen
    if (i+1 === locations.length) {
      loadScreen(html);
    }
  });
}

function loadScreen(html) {
  const container = document.getElementById('content');
  container.innerHTML = html;
  addListeners();
}

// once all elements are loaded, add the click listeners to each tile
function addListeners () {
  // Get all the tiles
  const tileList = document.querySelectorAll('.location');
  // Add event listener to each tile that will load the edit screen
  tileList.forEach(function(tile) {
    tile.addEventListener('click', function() {
      loadEditScreen(tile);
    });
  });
}

function loadEditScreen(t) {
  // Target the edit page and display it
  const editPage = document.getElementById('edit-page')
  editPage.classList.remove('hidden');
  // Create the edit window
  const html = `<div class='edit-window'>
  <div class="top"><span><i class="fas fa-times"></i></span></div>
  </div>`;
  console.log(t);
  editPage.innerHTML = html;
}

(function () {
  // Kick off!!!
  loadJson();
})();
