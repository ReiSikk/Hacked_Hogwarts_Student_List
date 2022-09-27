"use strict";

//everything global
const url = "https://petlatkea.dk/2021/hogwarts/students.json";
const bloodUrl = "https://petlatkea.dk/2021/hogwarts/families.json";

window.addEventListener("DOMContentLoaded", start);

let allStudents = [];
let expelledStudents = [];
let prefectArray = [];
let inquisitorArray = [];
let sequence = [];
let randomBloodArray = ["Muggle", "Halfblood", "Pureblood"];

const settings = {
  filterBy: "all",
  sortBy: "firstname",
  sortDir: "asc",
  searchBy: "",
  blood: undefined,
  direction: "1",
  wasHacked: false,
  hackFlag1: false,
  hackFlag2: false,
  hackFlag3: false,
  hackFlag4: false,
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
  randomBlood: 0,
};
const Rei = {
  fullname: "Rei Sikk",
  firstname: "Rei",
  lastname: "Sikk",
  gender: "Boy",
  image: "./imagesHogwarts/rei.png",
  expelled: false,
  bloodLine: "Pureblood",
  inqSquad: false,
  prefect: false,
  house: "",
};

//* INITIALIZE
async function start() {
  console.log("start");
  loadJSON();
  registerButtons();
  document.querySelector("#sort").value = "default";
}

function registerButtons() {
  document
    .querySelectorAll("[data-action='filter']")
    .forEach((button) => button.addEventListener("click", selectFilter));
  /*  document.querySelectorAll("[data-action='sort']").forEach((button) => {
    button.addEventListener("click", selectSort);
  }); */
  document.querySelector("#sort").addEventListener("change", selectSort);
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
  //console.log(`User selected filter: ${filter}`);
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
  if (settings.filterBy === "inqsquad") {
    filteredList = allStudents.filter(isInInqSquad);
  }
  return filteredList;
}

function selectSort(event) {
  /*   console.log("selectSort called");
  const sortBy = event.target.dataset.sort;
  console.log("sortBy: ", sortBy);
  const sortDir = event.target.dataset.sortDirection;
  console.log("sortDir: ", sortDir); */

  //pass sort property and direction in one value and split it
  let options = event.target.value.split(" ");

  //find "old" sortBy element and remove "sortBy"
  /*   console.log(`settings.sortBy is: ${settings.sortBy}`);
  const oldElement = document.querySelector(`[data-sort="${settings.sortBy}"]`);
  console.log(oldElement);
  oldElement.classList.remove("sortby"); */

  //indicate active sort direction
  //event.target.classList.add("sortby");
  // toggle the direction
  /*   if (sortDir === "asc") {
    event.target.dataset.sortDirection = "desc";
  } else {
    event.target.dataset.sortDirection = "asc";
  } */
  setSort(options[0], options[1]);
}

function setSort(sortBy, sortDir) {
  let direction;
  //storing values
  settings.sortBy = sortBy;
  settings.sortDir = sortDir;
  settings.direction = direction;
  if (sortBy !== "default") {
    if ((sortDir = "asc")) {
      direction = 1;
    }
    if (sortDir === "desc") {
      settings.direction = -1;
    }
    //console.log(`Sorting: ${sortBy}, ${sortDir},${direction}`);
  }
  //updating list with the sorting
  buildList();
}
// Sorting function
function sortList(sortedList) {
  if (settings.sortDir === "desc") {
    settings.direction = -1;
  } else {
    settings.direction = 1;
  }
  sortedList = sortedList.sort(sortByProperty);
  console.log(`Sorting: ${settings.sortBy}, ${settings.sortDir},${settings.direction}`);

  function sortByProperty(studentA, studentB) {
    if (studentA[settings.sortBy] < studentB[settings.sortBy]) {
      return -1 * settings.direction;
    } else {
      return 1 * settings.direction;
    }
  }

  return sortedList;
}

function buildList() {
  console.log("buildList called");
  const currentList = filterList(allStudents);
  /* console.log(currentList); */
  const sortedList = sortList(currentList);
  console.log(sortedList);
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
function isInInqSquad(singleStudent) {
  return singleStudent.inqSquad === true;
}

//* ******************  DISPLAY FUNCTIONS  ************************************* */

function displayStudentList(students) {
  if (students.length === 0) {
    //document.querySelector(".nothing_to_show").classList.remove("dis_none");
    alert("Nobody in this list yet!");
  }
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
  document.querySelector(
    "[data-filter='inquisitor-stats']"
  ).textContent = `Inquisitors: ${inquisitorArray.length} Students`;
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

  //clone.querySelector("#prefect").textContent = `Prefect: ${singleStudent.prefect}`;
  if (singleStudent.prefect === true) {
    clone.querySelector("#prefect img").classList.remove("dis_none");
  }
  if (singleStudent.inqSquad === true) {
    clone.querySelector("#inquisitor img").classList.remove("dis_none");
  }
  clone.querySelector(".house_crest").src = `./imagesHogwarts/${singleStudent.house.toLowerCase()}-logo.png`;
  clone.querySelector(".house_crest").alt = `${singleStudent.house}`;
  if (singleStudent.house === "Slytherin") {
    clone.querySelector(".card_wrapper").style.borderColor = "var(--slytherin)";
    clone.querySelector(".house_crest").classList.add("slytherin");
  }
  if (singleStudent.house === "Gryffindor") {
    clone.querySelector(".card_wrapper").style.borderColor = "var(--gryffindor)";
    clone.querySelector(".house_crest").classList.add("gryffindor");
  }
  if (singleStudent.house === "Hufflepuff") {
    clone.querySelector(".card_wrapper").style.borderColor = "var(--hufflepuff)";
    clone.querySelector(".house_crest").classList.add("hufflepuff");
  }
  if (singleStudent.house === "Ravenclaw") {
    clone.querySelector(".card_wrapper").style.borderColor = "var(--ravenclaw)";
    clone.querySelector(".house_crest").classList.add("ravenclaw");
  }
  if (singleStudent.prefect === true) {
    clone.querySelector("#prefect[data-prefect='false']").dataset.prefect = true;
  }
  if (singleStudent.inqSquad === true) {
    clone.querySelector("[data-inquisitorial='false']").dataset.inquisitorial = true;
  }
  clone.querySelector("#image").src = singleStudent.image;
  clone.querySelector("#image").alt = `${singleStudent.firstname} ${singleStudent.lastname}`;
  clone.querySelector("#open_popup").addEventListener("click", clickModal);

  //HACKING IF's
  if (settings.wasHacked === true) {
    if (singleStudent.bloodLine === "Halfblood" || singleStudent.bloodLine === "Muggle") {
      singleStudent.bloodLine = "Pureblood";
    }
    if (singleStudent.bloodLine === "Pureblood") {
      //get a random number
      const bloodIndex = Math.floor(Math.random() * 3);
      //assign each student a random number
      allStudents.forEach((el) => {
        singleStudent.randomBlood = bloodIndex;
      });
      if (singleStudent.randomBlood === 0) {
        singleStudent.bloodLine = "Pureblood";
      }
      if (singleStudent.randomBlood === 1) {
        singleStudent.bloodLine = "Halfblood";
      }
      if (singleStudent.randomBlood === 2) {
        singleStudent.bloodLine = "Muggle";
      }
      console.log(singleStudent.bloodLine);
    }
  }
  //HACKING ENDS

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
  console.log("openModal");
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
  document.querySelector(".modal_house_crest").src = `./imagesHogwarts/${singleStudent.house.toLowerCase()}-logo.png`;
  document.querySelector(".modal_house_crest").alt = `${singleStudent.house}`;

  if (singleStudent.prefect === true) {
    document.querySelector("#modal_prefect[data-prefect='false']").dataset.prefect = true;
  }

  //house colors and styling
  if (singleStudent.house === "Slytherin") {
    document.querySelector(".student_modal").style.borderColor = "var(--slytherin)";
    document.querySelector(".student_modal").style.backgroundColor = "var(--slytherin)";
    document.querySelector(".student_modal").style.color = "#fff";
    document.querySelector(".student_modal").style.boxShadow = "2px 4px 10px var(--slytherin)";
    document.querySelector(".modal_house_crest").classList.add("slytherin_modal");
  }
  if (singleStudent.house === "Gryffindor") {
    document.querySelector(".student_modal").style.borderColor = "var(--gryffindor)";
    document.querySelector(".student_modal").style.backgroundColor = "var(--gryffindor)";
    document.querySelector(".student_modal").style.boxShadow = "2px 4px 10px var(--gryffindor)";
    document.querySelector(".modal_house_crest").classList.add("gryffindor_modal");
  }
  if (singleStudent.house === "Hufflepuff") {
    document.querySelector(".student_modal").style.borderColor = "var(--hufflepuff)";
    document.querySelector(".student_modal").style.backgroundColor = "var(--hufflepuff)";
    document.querySelector(".student_modal").style.boxShadow = "2px 4px 10px var(--hufflepuff)";
    document.querySelector(".modal_house_crest").classList.add("hufflepuff_modal");
  }
  if (singleStudent.house === "Ravenclaw") {
    document.querySelector(".student_modal").style.borderColor = "var(--ravenclaw)";
    document.querySelector(".student_modal").style.backgroundColor = "var(--ravenclaw)";
    document.querySelector(".student_modal").style.color = "#fff";
    document.querySelector(".student_modal").style.boxShadow = "2px 4px 10px var(--ravenclaw)";
    document.querySelector(".modal_house_crest").classList.add("ravenclaw_modal");
  }
  //event listeners for buttons
  document
    .querySelectorAll("[data-action='choice']")
    .forEach((button) => button.addEventListener("click", selectChoice));
  function selectChoice(event) {
    const selectedChoice = event.target.dataset.field;
    setChoice(selectedChoice);
  }
  function setChoice(choice) {
    console.log("setChoice");
    //store the choice
    settings.choice = choice;
    if (settings.choice === "expel_student") {
      if (singleStudent.firstname === "Rei") {
        alert("Can't expell me hehe");
      } else {
        expellStudent(singleStudent);
        expellAnimation();
      }
    } else if (settings.choice === "add_inquisitorial") {
      makeInquisitor(singleStudent);
      buildList();
    } else if (settings.choice === "make_prefect") {
      if (singleStudent.prefect === true) {
        singleStudent.prefect = false;
        const prefectIndex = prefectArray.indexOf(singleStudent);
        prefectArray.splice(prefectIndex, 1);
      } else {
        tryToMakePrefect(singleStudent);
      }
      buildList();
    }
  }
  document.querySelector(".closebutton").addEventListener("click", closeModal);
  if (singleStudent.prefect === true) {
    document.querySelector("#prefect_button").textContent = "Revoke prefect status";
  }
  if (singleStudent.inqSquad === true) {
    document.querySelector("#make_inquisitor").textContent = "Remove from Inquisitorial Squad";
  }
  document.querySelector("#student_info").classList.remove("hide");
  function expellStudent() {
    if (singleStudent.expelled === false) {
      singleStudent.expelled = true;

      // if they are a prefect
      if (singleStudent.inqSquad === true && singleStudent.prefect === true) {
        // if student is both an inquisitor and prefect
        singleStudent.inqSquad = false;
        const inquisitorToBeExpelledIndex = inquisitorArray.indexOf(singleStudent);
        inquisitorArray.splice(inquisitorToBeExpelledIndex, 1);
        //remove prefect status
        singleStudent.prefect = false;
        const prefectToBeExpelledIndex = prefectArray.indexOf(singleStudent);
        prefectArray.splice(prefectToBeExpelledIndex, 1);
      } else if (singleStudent.prefect === true) {
        singleStudent.prefect = false;
        const prefectToBeExpelledIndex = prefectArray.indexOf(singleStudent);
        prefectArray.splice(prefectToBeExpelledIndex, 1);
      } else if (singleStudent.inqSquad === true) {
        //if student is an inquisitor
        singleStudent.inqSquad = false;
        const inquisitorToBeExpelledIndex = inquisitorArray.indexOf(singleStudent);
        inquisitorArray.splice(inquisitorToBeExpelledIndex, 1);
      }
      //remove eventlistener from expellBtn
      document.querySelector("#expell").removeEventListener("click", expellStudent);
      //call remove student with the selected student as param
      removeStudent(singleStudent);
      setTimeout(() => {
        buildList();
      }, 1500);
    }
  }
  function removeStudent(singleStudent) {
    console.log("Singlestudent in removeStudent function: ", singleStudent);
    console.log("removeStudent");
    const expelled = expelledStudents.push(singleStudent);
    allStudents = allStudents.filter(isNotExpelled);
  }

  //adding to the inquisitorial squad
  function makeInquisitor(singleStudent) {
    if (singleStudent.inqSquad === false) {
      if (
        singleStudent.house === "Slytherin" &&
        singleStudent.bloodLine === "Pureblood" &&
        singleStudent.expelled === false
      ) {
        if (settings.wasHacked === false) {
          singleStudent.inqSquad = true;
          inquisitorArray.push(singleStudent);
          console.log("This student is now an inqusitor: ", singleStudent.inqSquad);
          console.log(inquisitorArray);
        }
        if (settings.wasHacked === true) {
          singleStudent.inqSquad = true;
          inquisitorArray.push(singleStudent);
          setTimeout(() => {
            hackedRemoveInquisitor();
          }, 1000);
        }
      } else {
        alert("This student can't be added to the inquisitorial squad");
      }
    } else {
      //if student is already in inq squad remove them from the array and set inq=false
      const inquisitorIndex = inquisitorArray.indexOf(singleStudent);
      singleStudent.inqSquad = false;
      inquisitorArray.splice(inquisitorIndex, 1);
      //console.log(inquisitorArray);
    }
    function hackedRemoveInquisitor() {
      let studentIndexWhileHacked = inquisitorArray.indexOf(singleStudent);
      //console.log(studentIndexWhileHacked);
      singleStudent.inqSquad = false;
      console.log(singleStudent.inqSquad);
      inquisitorArray.splice(studentIndexWhileHacked, 1);
      buildList();
      alert("Hehe this student has been removed from the Inquisitors");
    }
    //buildList();
  }

  function closeModal() {
    document
      .querySelectorAll("[data-action='choice']")
      .forEach((button) => button.removeEventListener("click", selectChoice));
    console.log("closemodal called");
    document.querySelector("#student_info").classList.add("hide");
    document.querySelector(".student_modal .closebutton").removeEventListener("click", closeModal);
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
      studentPrefect.prefect = false;
      const removedPrefect = prefectArray.indexOf(studentPrefect);
      prefectArray.splice(removedPrefect, 1);
      console.log(removedPrefect);

      //console.log(prefectArray, "after removePrefect is called");
    }
  }
  function makePrefect(singleStudent) {
    //console.log("makePrefect called");
    //console.log(singleStudent);
    if (singleStudent.expelled === false) {
      singleStudent.prefect = true;
      prefectArray.push(singleStudent);
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
function expellAnimation() {
  console.log("expellAnimation called");
  document.querySelector(".expellmodal").classList.remove("hide");
  document.querySelector(".expell_message").classList.remove("hide");
  const expellBtn = document.querySelector("#expell");
  const slideout = document.querySelector(".expelled");
}

//*********** ******** HACK THE SYSTEM ******* *********** */
document.addEventListener("keyup", (event) => {
  const key = event.key.toLowerCase();
  //console.log(key);
  if (key === "h") {
    settings.hackFlag1 = true;
  }
  if (key === "a") {
    settings.hackFlag2 = true;
  }
  if (key === "c") {
    settings.hackFlag3 = true;
  }
  if (key === "k") {
    settings.hackFlag4 = true;
  }

  // do something
  if (
    settings.hackFlag1 === true &&
    settings.hackFlag2 === true &&
    settings.hackFlag3 === true &&
    settings.hackFlag4 === true
  ) {
    if (settings.wasHacked === false) {
      hackTheSystem();
    }
  }
});

// add myself to the list
function hackTheSystem() {
  document.querySelector(".hack_audio").play();
  settings.hackFlag1 = false;
  settings.hackFlag2 = false;
  settings.hackFlag3 = false;
  settings.hackFlag4 = false;
  settings.wasHacked = true;
  console.log("hackTheSystem called");
  const rei = Object.create(Student);
  rei.fullname = "Rei Sikk";
  rei.firstname = "Rei";
  rei.lastname = "Sikk";
  rei.gender = "Boy";
  rei.bloodLine = "Pureblood";
  rei.house = "Slytherin";
  rei.expelled = false;
  rei.inqSquad = false;
  rei.prefect = false;
  rei.image = "./imagesHogwarts/rei.png";
  allStudents.unshift(rei);
  setTimeout(() => {
    displayHackScreen();
  }, 200);
  setTimeout(() => {
    displayStudentList(allStudents);
  }, 500);
  setTimeout(() => {
    hackVisuals();
  }, 300);
}

/// function to indicate "hacking" has begun
function displayHackScreen() {
  document.querySelector(".close_hack").addEventListener("click", closeHackModal);
  document.querySelector("#hack_screen").classList.remove("hide");
  setTimeout(() => {
    closeHackModal();
  }, 2500);
}
function closeHackModal() {
  console.log("closeHackModal called");
  document.querySelector("#hack_screen").classList.add("hide");
  document.querySelector(".close_hack").removeEventListener("click", closeHackModal);
}
function hackVisuals() {
  document.querySelector("body").style.background = "#2C3E50";
  document.querySelector("header").style.color = "#166D3B";
  document.querySelector("header").style.backgroundColor = "#000000";
  document.querySelector("header").classList.add("text_shadow");
  document.querySelector("body").style.color = "#fff";
  document.querySelector(".stats_bar").style.color = "#000000";
  document.querySelector(".side_bar").style.color = "#000000";
}
