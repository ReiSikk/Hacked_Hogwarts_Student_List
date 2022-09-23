"use strict";

//everything global
const url = "https://petlatkea.dk/2021/hogwarts/students.json";
const bloodUrl = "https://petlatkea.dk/2021/hogwarts/families.json";

window.addEventListener("DOMContentLoaded", start);

let allStudents = [];
let expelledStudents = [];
let prefectArray = [];

const settings = {
  filterBy: "all",
  sortBy: "firstname",
  sortDir: "asc",
  searchBy: "",
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
  loadJSON();
  registerButtons();
}

function registerButtons() {
  document
    .querySelectorAll("[data-action='filter']")
    .forEach((button) => button.addEventListener("click", selectFilter));
  document.querySelectorAll("[data-action='sort']").forEach((button) => {
    button.addEventListener("click", selectSort);
  });
  document.querySelector(".search_bar").addEventListener("input", searchString);
}
//fetch the data and pass data to prepareData function
async function loadJSON() {
  const response = await fetch(url);
  const jsonData = await response.json();
  //console.log("jsonData loaded");
  const response2 = await fetch(bloodUrl);
  const bloodData = await response2.json();
  //console.log("bloodData loaded");

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
    image = `./imagesHogwarts/userIcon.png`;

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
function searchString() {
  const searchBy = document.querySelector(".search_bar").value;
  settings.searchBy = searchBy.toLowerCase();
  const searchedList = allStudents.filter(isTheSearchedStudent);
  function isTheSearchedStudent(singleStudent) {
    if (
      singleStudent.firstname.toLowerCase().includes(searchBy) ||
      singleStudent.lastname.toLowerCase().includes(searchBy)
    )
      return singleStudent;
  }
  displayStudentList(searchedList);
}

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
  console.log(`User selected: ${filter}`);
  setFilter(filter);
}
function setFilter(filter) {
  settings.filterBy = filter;
  buildList();
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
  if (settings.filterBy === "expelled") {
    filteredList = expelledStudents.filter(isExpelled);
  }
  if (settings.filterBy === "notexpelled") {
    filteredList = allStudents.filter(isNotExpelled);
  }
  if (settings.filterBy === "prefect") {
    filteredList = allStudents.filter(isPrefect);
  }
  return filteredList;
}

function selectSort(event) {
  console.log("selectSort called");
  const sortBy = event.target.dataset.sort;
  const sortDir = event.target.dataset.sortDirection;

  //find "old" sortBy element and remove "sortBy"
  /*   console.log(`settings.sortBy is: ${settings.sortBy}`);
  const oldElement = document.querySelector(`[data-sort="${settings.sortBy}"]`);
  console.log(oldElement);
  oldElement.classList.remove("sortby"); */

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
}

function setSort(sortBy, sortDir) {
  console.log("setSort called");
  //storing values

  settings.sortBy = sortBy;
  //console.log(`settings.sortBy is: ${settings.sortBy}`);
  settings.sortDir = sortDir;
  //console.log(`settings.sortDir is: ${settings.sortDir}`);
  //updating list with the sorting
  buildList();
}
// Sorting function
function sortList(sortedList) {
  let direction = 1;
  if (settings.sortDir === "desc") {
    direction = -1;
  } else {
    settings.direction = 1;
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

function buildList() {
  console.log("buildList called");
  const currentList = filterList(allStudents);
  /* console.log(currentList); */
  const sortedList = sortList(currentList);
  //console.log(sortedList);
  displayStudentList(sortedList);
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
function isExpelled(singleStudent) {
  return singleStudent.expelled === true;
}
function isNotExpelled(singleStudent) {
  return singleStudent.expelled === false;
}
function isPrefect(singleStudent) {
  return singleStudent.prefect === true;
}

//* ******************  DISPLAY FUNCTIONS  ************************************* */

function displayStudentList(students) {
  document.querySelector(".student_grid").innerHTML = "";
  //number of students currently displayed
  document.querySelector("[data-filter-type='displayednow']").textContent = `${students.length} Students`;
  document.querySelector("[data-filter='slytherinstats']").textContent = `Slytherin: ${
    allStudents.filter(isSlytherin).length
  } Students`;
  document.querySelector("[data-filter='hufflepuffstats']").textContent = `Hufflepuff: ${
    allStudents.filter(isHufflepuff).length
  } Students`;
  document.querySelector("[data-filter='ravenclawstats']").textContent = `Ravenclaw: ${
    allStudents.filter(isRavenclaw).length
  } Students`;
  document.querySelector("[data-filter='gryffindorstats']").textContent = `Gryffindor: ${
    allStudents.filter(isGryffindor).length
  } Students`;

  document.querySelector(
    "[data-filter='expelled-stats']"
  ).textContent = `Expelled: ${expelledStudents.length} Students`;
  document.querySelector(
    "[data-filter='notexpelled-stats']"
  ).textContent = `Not expelled: ${allStudents.length} Students`;
  document.querySelector("[data-filter='prefect-stats']").textContent = `Prefects: ${prefectArray.length} Students`;
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
  //clone.querySelector("#middle_name").textContent = ` Middle name: ${singleStudent.middlename}`;
  //clone.querySelector("#nick_name").textContent = `Nick name: ${singleStudent.nickname}`;
  clone.querySelector("#last_name").textContent = `Last name: ${singleStudent.lastname}`;
  clone.querySelector("#gender").textContent = `Gender: ${singleStudent.gender}`;
  clone.querySelector("#prefect").textContent = `Prefect: ${singleStudent.prefect}`;

  if (singleStudent.prefect === true) {
    clone.querySelector("#prefect[data-prefect='false']").dataset.prefect = true;
    //clone.querySelector(".card_wrapper").style.backgroundImage = `var(--crest-${singleStudent.house.toLowerCase()})`;
  }
  //clone.querySelector("#house").textContent = `House: ${singleStudent.house}`;
  //clone.querySelector("#blood_type span").textContent = `${singleStudent.bloodLine}`;

  clone.querySelector("#image").src = singleStudent.image;

  clone.querySelector("#image").alt = `${singleStudent.firstname} ${singleStudent.lastname}`;
  clone.querySelector("#open_popup").addEventListener("click", clickModal);

  //DETAILS MODAL
  function clickModal() {
    openModal(singleStudent);
    //console.log(singleStudent);
  }

  //grab the parent
  const parent = document.querySelector(".student_grid");
  // append clone to list
  parent.appendChild(clone);
}

function openModal(singleStudent) {
  //console.log("openModal");
  document.querySelector(".full_name").textContent = `${singleStudent.fullname}`;
  document.querySelector(".first_name").textContent = `First name: ${singleStudent.firstname}`;
  document.querySelector(".middle_name").textContent = ` Middle name: ${singleStudent.middlename}`;
  document.querySelector(".nick_name").textContent = `Nick name: ${singleStudent.nickname}`;
  document.querySelector(".last_name").textContent = `Last name: ${singleStudent.lastname}`;
  document.querySelector(".gender").textContent = `Gender: ${singleStudent.gender}`;
  document.querySelector(".house").textContent = `House: ${singleStudent.house}`;
  document.querySelector(".blood_type span").textContent = `${singleStudent.bloodLine}`;
  document.querySelector(".image").src = singleStudent.image;
  document.querySelector(".image").alt = `${singleStudent.firstname} ${singleStudent.lastname}`;
  document.querySelector("#prefect_button").addEventListener("click", clickPrefect);
  if (singleStudent.prefect === true) {
    document.querySelector("#prefect_button").textContent = "Revoke prefect status";
  }
  document.querySelectorAll("#expell").forEach((button) => button.addEventListener("click", expellStudent));
  document.querySelector(".closebutton").addEventListener("click", closeModal);
  document.querySelector("#student_info").classList.remove("hide");
  function expellStudent() {
    if (singleStudent.expelled === false) {
      //when they are expelled they can't be any part of perfects or inq squad
      singleStudent.expelled = true;
      singleStudent.prefect = false;
      singleStudent.inquisitorialSquad = false;
      //remove eventlistener from expellBtn
      document.querySelector("#expell").removeEventListener("click", expellStudent);
      //call remove student with the selected student as param
      removeStudent(singleStudent);
      //console.log(`the student is expelled: ${singleStudent.expelled}`);
    }
  }
  function removeStudent(singleStudent) {
    console.log("removeStudent");
    //const expelledStudentIndex = prefectArray.indexOf(singleStudent);
    const expelled = expelledStudents.push(singleStudent);

    //console.log("The expelled students array: ", expelledStudents);
    //console.log(`The expelled student is ${singleStudent.fullname}`);
    allStudents = allStudents.filter(isNotExpelled);

    //console.log(`Nr of all students is: ${allStudents.length}`);
    buildList();
    //console.log("The remaining students are", allStudents);
  }
  //check if student is prefect or not
  function clickPrefect(event) {
    //console.log("clickPrefect called");
    if (singleStudent.prefect === true) {
      singleStudent.prefect = false;
    } else {
      tryToMakePrefect(singleStudent);
    }
    buildList();
  }
}
//make student a prefect
function tryToMakePrefect(prefectCandidate) {
  console.log("tryToMakePrefect");
  //filter of all prefects
  const prefects = allStudents.filter((singleStudent) => singleStudent.prefect);
  // all the prefects where the house is the same as the selected prefect (array object)
  const other = prefects.filter((singleStudent) => singleStudent.house === prefectCandidate.house);
  //nr of prefects
  const nrOfPrefects = other.length;
  // if there is another student of the same house
  if (nrOfPrefects >= 2) {
    removeAorB(other[0], other[1]);
  } else {
    makePrefect(prefectCandidate);
  }
  function removeAorB(prefectA, prefectB) {
    // ask the user to ignore or remove A or B
    document.querySelector("#remove_aorb").classList.remove("hide");
    document.querySelector("#remove_aorb .closebutton").addEventListener("click", closeDialog);
    document.querySelector("#remove_aorb #removea").addEventListener("click", clickRemoveA);
    document.querySelector("#remove_aorb #removeb").addEventListener("click", clickRemoveB);

    // show names on the buttons
    document.querySelector("#remove_aorb .candidate1").textContent = `${prefectA.firstname}, from ${prefectA.house}`;
    document.querySelector("#remove_aorb .candidate2").textContent = `${prefectB.firstname}, from ${prefectB.house}`;
    //if ignore do nothing

    function closeDialog() {
      document.querySelector("#remove_aorb").classList.add("hide");
      document.querySelector("#remove_aorb .closebutton").removeEventListener("click", closeDialog);
      document.querySelector("#removea").removeEventListener("click", clickRemoveA);
      document.querySelector("#removeb").removeEventListener("click", clickRemoveB);
    }
    // if remove A
    function clickRemoveA() {
      //console.log(prefectA);
      removePrefect(prefectA);
      //console.log(prefectA, " is not a prefect anymore");
      makePrefect(prefectCandidate);
      buildList();
      closeDialog();
    }
    // if remove B
    function clickRemoveB() {
      removePrefect(prefectB);
      makePrefect(prefectCandidate);
      buildList();
      closeDialog();
      //console.log("click B is not a prefect anymore");
      //console.log("prefects after clickremoveB are", prefects);
    }
    function removePrefect(studentPrefect) {
      console.log("removePrefect called", studentPrefect);
      /* const studentToBeExpelled = prefectArray.indexOf(studentPrefect);
      prefectArray.splice(studentToBeExpelled, 1);
      console.log(studentToBeExpelled); */
      studentPrefect.prefect = false;
      //prefectArray.splice();

      //console.log(prefectArray, "after removePrefect is called");
    }
  }
  function makePrefect(singleStudent) {
    console.log("makePrefect called");
    console.log(singleStudent);
    if (singleStudent.expelled === false) {
      singleStudent.prefect = true;
      const prefect = prefectArray.push(singleStudent);
    } else {
      alert("Not possible to set expelled student as prefect!");
    }
    //console.log(`This ${singleStudent.fullname} is now a prefect: ${singleStudent.prefect}`);
  }
}
function clickModal(singleStudent) {
  console.log("openModal");
  document.querySelector(".closebutton").addEventListener("click", closeModal);
  document.querySelector("#student_info").classList.remove("hide");
}
function closeModal() {
  console.log("closemodal called");
  document.querySelector("#student_info").classList.add("hide");
  document.querySelector(".student_modal .closebutton").removeEventListener("click", closeModal);
}
