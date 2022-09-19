"use strict";

//everything global
const url = "https://petlatkea.dk/2021/hogwarts/students.json";
const bloodUrl = "https://petlatkea.dk/2021/hogwarts/families.json";

window.addEventListener("DOMContentLoaded", start);

let allStudents = [];

const settings = {
  filterBy: "all",
  sortBy: "firstname",
  sortDir: "asc",
  blood: undefined,
};

const Student = {
  fullname: "",
  firstname: "",
  middlename: "",
  lastname: "",
  nickname: "No nickname",
  gender: "",
  house: "",
  image: "",
  expelled: false,
  bloodLine: "",
  inqSquad: false,
  prefect: false,
};

//* INITIALIZE
async function start() {
  console.log("start");
  await loadJSON();
  registerButtons();
  buildList();
}

function registerButtons() {
  document.querySelectorAll(".sort_me").forEach((button) => button.addEventListener("click", selectSort));
  document
    .querySelectorAll("[data-action='filter']")
    .forEach((button) => button.addEventListener("click", selectFilter));
}
//fetch the data and pass data to prepareData function
async function loadJSON() {
  const response = await fetch(url);
  const jsonData = await response.json();
  const response2 = await fetch(bloodUrl);
  const bloodData = await response2.json();

  settings.blood = bloodData;
  // when loaded, prepare data objects
  prepareStudentsData(jsonData);
}

function prepareStudentsData(jsonData) {
  allStudents = jsonData.map(prepareStudentData);
  //* The map() method creates a new array populated with the results of calling a provided function on every element in the calling array.
  //filter and sort on the first load
  buildList();
}

//* function that defines the student object

function prepareStudentData(jsonObject) {
  // create object from the student template
  const singleStudent = Object.create(Student);

  //for each object read the properties
  let fullname = jsonObject.fullname;
  let gender = jsonObject.gender.trim();
  let house = jsonObject.house;
  let image;
  // clean extra spaces
  fullname = fullname.replace(/\s+/g, " ").trim();
  house = house.replace(/\s+/g, " ").trim();

  //First Name variable
  let firstname = fullname.substring(fullname.substring(0, 1), fullname.indexOf(" "));
  firstname = firstname.substring(0, 1).toUpperCase() + firstname.substring(1).toLowerCase();
  singleStudent.firstname = firstname;

  // defining the middlename property
  let middlename =
    fullname.substring(fullname.indexOf(" "), fullname.lastIndexOf(" ")).trim().substring(0, 1).toUpperCase() +
    fullname.substring(fullname.indexOf(" "), fullname.lastIndexOf(" ")).trim().substring(1).toLowerCase();
  singleStudent.middlename = middlename;

  //define word between two "" as nickname and capitalize
  if (fullname.includes(`"`)) {
    singleStudent.nickname =
      fullname.substring(fullname.indexOf(`"`) + 1, fullname.indexOf(`"`) + 2).toUpperCase() +
      fullname.substring(fullname.indexOf(`"`) + 2, fullname.lastIndexOf(`"`)).toLowerCase();

    // removing the name from the middlename because its a nickname
    singleStudent.middlename = "";
  } else if (singleStudent.nickname === "") {
    singleStudent.nickname === "No nickname";
  }

  //Last Name varaible
  let lastname = fullname.substring(fullname.lastIndexOf(" ") + 1);
  if (singleStudent.firstname === "Leanne") {
    singleStudent.lastname === "Unknown";
  } else {
    lastname = lastname[0].toUpperCase() + lastname.substring(1).toLowerCase();
    singleStudent.lastname = lastname;
  }

  //check if lastname has hyphen in it and capitalise both last names
  if (lastname.includes("-")) {
    let charAfterHyphen = lastname.indexOf("-") + 1;
    lastname = lastname.replace(lastname[charAfterHyphen], lastname[charAfterHyphen].toUpperCase());
    singleStudent.lastname = lastname;
  }

  // Student HOUSE variable
  house = house[0].toUpperCase() + house.substring(1).toLowerCase();
  singleStudent.house = house;

  //gender variable
  gender = gender[0].toUpperCase() + gender.substring(1);
  singleStudent.gender = gender;

  //Single Student image
  if (!fullname.includes(" ")) {
    image = `no image`;

    //sorting images for students with the same last name - Patil
  } else if (fullname.toLowerCase().includes("patil")) {
    image = `./imagesHogwarts/${lastname.toLowerCase()}_${firstname.toLowerCase()}.png`;
  }
  // if student includes "-" Finch-Fletchley
  else if (fullname.includes("-")) {
    image = `./imagesHogwarts/${fullname
      .substring(fullname.lastIndexOf("-") + 1)
      .toLowerCase()}_${singleStudent.firstname[0].toLowerCase()}.png`;
  } else {
    image = `./imagesHogwarts/${fullname
      .substring(fullname.lastIndexOf(" ") + 1)
      .toLowerCase()}_${singleStudent.firstname[0].toLowerCase()}.png`;
  }
  singleStudent.image = image;

  //fullname
  singleStudent.fullname = `${singleStudent.firstname} ` + `${singleStudent.middlename} ` + `${singleStudent.lastname}`;

  //blood
  singleStudent.bloodLine = findBloodType(singleStudent.lastname);
  return singleStudent;
}

//* ********************************************************************************* Set sort and set filter functions ****************************************** */
function findBloodType(lastname) {
  let pureblood = settings.blood.pure;
  let halfblood = settings.blood.half;
  if (pureblood.includes(lastname) && halfblood.includes(lastname)) {
    return "Halfblood";
  } else if (pureblood.includes(lastname) && !halfblood.includes(lastname)) {
    return "Pureblood";
  } else {
    return "Muggle";
  }
}

function selectFilter(event) {
  const filter = event.target.dataset.filter;
  //console.log(`User selected: ${filter}`);
  setFilter(filter);
}

function selectSort(event) {
  console.log("selectSort called");
  const sortBy = event.target.dataset.sort;
  const sortDir = event.target.dataset.sortDirection;
  console.log(sortBy);

  //find "old" sortBy element and remove "sortBy"
  const oldElement = document.querySelector(`[data-sort="${settings.sortBy}"]`);
  oldElement.classList.remove("sortby");

  //indicate active sort direction
  event.target.classList.add("sortby");

  // toggle the direction
  if (sortDir === "asc") {
    event.target.dataset.sortDirection = "desc";
  } else {
    event.target.dataset.sortDirection = "asc";
  }
  console.log(`User selected ${sortBy} - ${sortDir}`);
  setSort(sortBy, sortDir);
  /* setFilter(filter); */
}

function setFilter(filter) {
  settings.filterBy = filter;
  buildList();
}

function setSort(sortBy, sortDir) {
  //storing values
  settings.sortBy = sortBy;
  settings.sortDir = sortDir;
  //updating list with the sorting
  buildList();
}

function buildList() {
  const currentList = filterList(allStudents);
  /* console.log(currentList); */
  const sortedList = sortList(currentList);
  //console.log(sortedList);
  displayStudentList(sortedList);
}

function filterList(filteredList) {
  if (settings.filterBy === "slytherin") {
    //create a filtered list of only slytherin house members
    filteredList = allStudents.filter(isSlytherin);
  }
  if (settings.filterBy === "hufflepuff") {
    filteredList = allStudents.filter(isHufflepuff);
  }
  if (settings.filterBy === "ravenclaw") {
    filteredList = allStudents.filter(isRavenclaw);
  }
  if (settings.filterBy === "gryffindor") {
    filteredList = allStudents.filter(isGryffindor);
  }
  if (settings.filterBy === "pureblood") {
    filteredList = allStudents.filter(isPureBlood);
  }
  if (settings.filterBy === "halfblood") {
    filteredList = allStudents.filter(isHalfBlood);
  }
  if (settings.filterBy === "allblood") {
    filteredList = allStudents.filter(isMuggle);
  }
  if (settings.filterBy === "boys") {
    filteredList = allStudents.filter(filterByBoys);
  }
  if (settings.filterBy === "girls") {
    filteredList = allStudents.filter(filterByGirls);
  }

  return filteredList;
}
function isSlytherin(singleStudent) {
  return singleStudent.house === "Slytherin";
}
function isGryffindor(singleStudent) {
  return singleStudent.house === "Gryffindor";
}
function isHufflepuff(singleStudent) {
  return singleStudent.house === "Hufflepuff";
}
function isRavenclaw(singleStudent) {
  return singleStudent.house === "Ravenclaw";
}
function filterByGirls(singleStudent) {
  return singleStudent.gender === "Girl";
}
function filterByBoys(singleStudent) {
  return singleStudent.gender === "Boy";
}
function isPureBlood(singleStudent) {
  return singleStudent.bloodLine === "Pureblood";
}
function isHalfBlood(singleStudent) {
  return singleStudent.bloodLine === "Halfblood";
}
function isMuggle(singleStudent) {
  return singleStudent.bloodLine === "Muggle";
}

// Sorting function
function sortList(sortedList) {
  let direction = 1;
  if (settings.sortDir === "desc") {
    direction = -1;
  } else {
    direction = 1;
  }
  sortedList = sortedList.sort(sortByProperty);

  function sortByProperty(studentA, studentB) {
    if (studentA[settings.sortBy] < studentB[settings.sortBy]) {
      return -1 * direction;
    } else {
      return 1 * direction;
    }
  }
  return sortedList;
}

//* ******************  DISPLAY FUNCTIONS  ************************************* */

function displayStudentList(students) {
  document.querySelector(".student_grid").innerHTML = "";
  //number of students currently displayed
  document.querySelector("[data-filter-type='displayednow']").textContent = `${students.length} Students`;
  //build a new list
  students.forEach(displayStudent);
}

function displayStudent(singleStudent) {
  const template = document.querySelector("#template").content;
  // create clone
  const clone = template.cloneNode(true);

  // set clone data
  clone.querySelector("#full_name").textContent = `${singleStudent.fullname}`;
  clone.querySelector("#first_name").textContent = `First name: ${singleStudent.firstname}`;
  clone.querySelector("#middle_name").textContent = ` Middle name: ${singleStudent.middlename}`;
  clone.querySelector("#nick_name").textContent = `Nick name: ${singleStudent.nickname}`;
  clone.querySelector("#last_name").textContent = `Last name: ${singleStudent.lastname}`;
  clone.querySelector("#gender").textContent = `Gender: ${singleStudent.gender}`;
  clone.querySelector("#house").textContent = `House: ${singleStudent.house}`;
  clone.querySelector("#blood_type span").textContent = `${singleStudent.bloodLine}`;
  clone.querySelector("#image").src = singleStudent.image;
  clone.querySelector("#image").alt;

  //grab the parent
  const parent = document.querySelector(".student_grid");
  // append clone to list
  parent.appendChild(clone);
}
