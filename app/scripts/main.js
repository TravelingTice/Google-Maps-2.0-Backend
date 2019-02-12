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
  console.log(locations);
  let html = '';
  locations.forEach(function(loc, i) {
    // load the template for each element
    html += `<li class="loc-module" id="${i}"><div class='location'>
    <img class='icon-img' src='${websiteUrl}${iconPath}${loc.icon}'>
    <h3>${loc.title}</h3>
    </div><div class="line"></div><div class="plus-icon">+</div></li>`
    // When all html is loaded, load it on the screen
    if (i+1 === locations.length) {
      loadScreen(html);
    }
  });
}

function loadScreen(html) {
  const container = $('#list');
  container.html('');
  container.html(html);
  const modules = $('#list').children();
  // the module at the top shouldnt display a line, because it wont have one
  const firstLine = $(modules[0]).children()[1];
  $(firstLine).hide();
  // make list sortable
  container.sortable({
    update: function() {
      // update the order of id's when list is reordered
      $(modules).each(function(i) {
        $(this).attr('id', i);
      });
      // and update the locations array with the new order
      reorderArray(modules);
    }
  });
  addListeners();
}

// once all elements are loaded, add the click listeners to each tile + the export button
function addListeners () {
  // Add listener to plus icon for new module
  $('.plus-icon').each(function() {
    $(this).click(function(){
      addMarker(this);
    });
  });
  // Add event listener to each tile that will load the edit screen
  $('.location').each(function() {
    $(this).click(function() {
      loadEditScreen(this);
    });
  });
  // Add listener to export button
  $('#export-btn').click(function() {
    formData();
  });
}

function addMarker(item){
  const thisModule = $(item).parent();
  const newModuleId = parseInt($(thisModule).attr('id'),10)+1;
  // create html for new object
  const newModule = `<li class="loc-module" id="${newModuleId}"><div class='location'>
  <img class='icon-img' src='${websiteUrl}${iconPath}default.png'>
  <h3>title</h3>
  </div><div class="line"></div><div class="plus-icon">+</div></li>`;
  // append new module to the one that is clicked
  thisModule.after(newModule);
  // Modify all id's after this one to make the order of id's correct
  const modules = $('#list').children();
  $(modules).each(function(i) {
    if (newModuleId < i) {
      $(item).attr('id', i);
    }
  });
  // invoke the listeners on all the tiles again
  addListeners();
  // create empty object for the locations array
  const newObj = {
    title: 'title',
    location: {
      lat: null,
      lng: null
    }
  }
  // add new module to the locations array at the specific index
  locations.splice(newModuleId, 0, newObj);
  // load edit screen with right tile
  const tile = $($(modules)[newModuleId]).children()[0];
  loadEditScreen(tile);
}

function loadEditScreen(t) {
  // Target the edit page and display it
  const editPage = $('.edit-page');
  editPage.removeClass('hidden');
  // Select the right location object we need to paste
  const tileT = $(t.children[1]).html();
  const l = (selectLoc(tileT, locations));
  // Create the edit window
  const html = `
  <div class='edit-window'>
  <div class="top">
  <span id="closeBtn"><i class="fas fa-times"></i></span>
  </div>
  <main>
  <form>
    <p>Icon: <input id="icon-edit" type="text" value="${l.icon ? l.icon : 'default.png'}"></p>
    <p>Title: <input id="title-edit" type="text" value="${l.title ? l.title : ''}"></p>
    <p>Location: </p>
    <span>lat: </span><input id="lat-edit" type="text" value="${l.location.lat ? l.location.lat : ''}">
    <span>lng: </span><input id="lng-edit" type="text" value="${l.location.lng ? l.location.lng : ''}">
    <p>Date: <input id="date-edit" type="text" value="${l.date ? l.date : ''}"></p>
    <p>Description:</p>
    <textarea id="desc-edit" rows="6" cols="60">${l.description ? l.description : ''}"</textarea>
    <p>Youtube Id: <input id="yt-edit" type="text" value="${l.youtube ? l.youtube : ''}"></p>
    <p>Image: <input id="img-edit" type="text" value="${l.image ? l.image : ''}"></p>
    <p>rideData Url: <input id="rideData-edit" type="text" value="${l.rideData ? l.rideData : ''}"></p>
    <p>zIndex: <input id="zIndex-edit" type="text" value="${l.zIndex ? l.zIndex : ''}"></p>
    <p><label><input id="line-edit" type="checkbox"> Attached to previous point</label></p>
    <span>Line color: <input id="line-color-edit" type="color"></span>
    <span class="line-thickness">Line thickness: <select>
  <option value="1">1</option>
  <option value="2">2</option>
  <option value="3">3</option>
  <option value="4">4</option>
  <option value="5">5</option>
    </select></span>
  </form>
    <button id="delete">Delete</button>
  </main>
  </div>`;
  editPage.html(html);
  // add close listener to cross button
  $('#closeBtn').click(function(){
    updateLoc(l, 'modify');
  });
  // add close listener when outside of the edit window is clicked
  $('.edit-page').click(function(event) {
    if($(event.target).hasClass('edit-page')){
      updateLoc(l, 'modify');
    }
  });
  // add listener when enter button is pressed when editing an input
  $('input').each(function(i) {
    $(this).keypress(function(e) {
      if (e.keyCode === 13) {
        updateLoc(l, 'modify');
      }
    });
  });
  // add listener to delete btn
  $('#delete').click(function() {
    deleteMarker(t);
  });
}

function deleteMarker(tile) {
  const name = $(tile).children()[1].innerHTML;
  const l = selectLoc(name, locations);
  updateLoc(l, 'delete');
}

// close edit window screen
function closeScreen() {
  $('#edit-page').addClass('hidden');
  loadHTML();
}

// Update the location's information with the new information. Make sure it stays in the same order of locations, then reload the screen
function updateLoc(loc, mode) {
  // select position of location in locations array
  const pos = selectLocPos(loc.title, locations);
  // check the mode in which this is evoked
  if (mode === 'delete') {
    // delete the object in the array
    locations.splice(pos, 1);
    closeScreen();
  }
  if  (mode === 'modify') {
    // store new values in loc object in locations array
    locations[pos].icon = $('#icon-edit').val();
    locations[pos].title = $('#title-edit').val();
    locations[pos].location.lat = $('#lat-edit').val();
    locations[pos].location.lng = $('#lng-edit').val();
    locations[pos].date = $('#date-edit').val() ? $('#date-edit').val() : null;
    locations[pos].description = $('#desc-edit').innerHTML ? $('#desc-edit').html() : null;
    locations[pos].youtube = $('#yt-edit').val() ? $('#yt-edit').val() : null;
    locations[pos].image = $('#img-edit') ? $('#img-edit') : null;
    locations[pos].rideData = $('#rideData-edit') ? $('#rideData-edit') : null;
    locations[pos].zIndex = $('#zIndex-edit') ? $('#zIndex-edit') : null;
    closeScreen();
  }
}

// Reorder the locations array according to the id ordering
function reorderArray() {
  // we start by making a new array
  let newOrderedList = [];
  // target new ordered list from screen
  const list = $('#list').children();
  // Get all the names from the screen
  $(list).each(function() {
    const name = $($(this).find('h3')).html();
    // Find corresponding object in locations array
    const obj = selectLoc(name, locations);
    // one by one push to new array
    newOrderedList.push(obj);
  });
  // change the locations array to the new array
  locations = newOrderedList;
  // reload the html
  loadHTML();
}

//THESE ARE DIFFERENT IN THE FINAL FILE
// form the new locations array with the updated properties
function formData() {

  exportJSON(data);
}
// Export the json and update the file with an Http request
function exportJSON(data) {

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

$(document).ready(function () {
  // Kick off!!!
  loadJson();
});
