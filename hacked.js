"use strict";

const url = "https://petlatkea.dk/2021/hogwarts/students.json";

window.addEventListener("DOMContentLoaded", start);

let firstname, middlename, lastname, nickname, gender, house, image;

const filteredStudents = [];

const Student = {
  fullname: "",
  firstname: "",
  middlename: "",
  lastname: "",
  nickname: "No nickname",
  gender: "",
  house: "",
  image: "",
};

//INITIALIZE
function start() {
  console.log("start");
  loadJSON();
}

//fetch the data and pass data to prepareData function
function loadJSON() {
  fetch(url)
    .then((response) => response.json())
    .then((jsonData) => {
      //when loaded prepare objects
      prepareData(jsonData);
    });
}

/// prepare data function
function prepareData(jsonData) {
  jsonData.forEach((student) => {
    //for each student in the array create an object with the Student-object-prototype
    const singleStudent = Object.create(Student);

    //for each object read the properties
    let fullname = student.fullname;
    let gender = student.gender.trim();
    let house = student.house;
    // clean extra spaces
    fullname = fullname.replace(/\s+/g, " ").trim();
    house = house.replace(/\s+/g, " ").trim();

    //First Name variable
    let firstname = fullname.substring(fullname.substring(0, 1), fullname.indexOf(" "));
    firstname = firstname.substring(0, 1).toUpperCase() + firstname.substring(1).toLowerCase();
    singleStudent.firstname = firstname;

    // defining the middlename property. trimming the middlename and capitalising the first letter and lowering the rest

    let middlename =
      fullname.substring(fullname.indexOf(" "), fullname.lastIndexOf(" ")).trim().substring(0, 1).toUpperCase() +
      fullname.substring(fullname.indexOf(" "), fullname.lastIndexOf(" ")).trim().substring(1).toLowerCase();
    singleStudent.middlename = middlename;

    //console.log(`${singleStudent.firstname}` + ` ${singleStudent.middlename}`);

    // if the fullname includes " then define the word betwen the two " as a nickname as well as capitalising it
    // as well as defining the nickname property
    if (fullname.includes(`"`)) {
      singleStudent.nickname =
        fullname.substring(fullname.indexOf(`"`) + 1, fullname.indexOf(`"`) + 2).toUpperCase() +
        fullname.substring(fullname.indexOf(`"`) + 2, fullname.lastIndexOf(`"`)).toLowerCase();
      console.log(singleStudent.nickname);
      // removing the name from the middlename because its a nickname
      singleStudent.middlename = "";
    } else if (singleStudent.nickname === "") {
      singleStudent.nickname === "No nickname";
    }

    //Last Name varaible
    let lastname = fullname.substring(fullname.lastIndexOf(" ") + 1);
    lastname = lastname[0].toUpperCase() + lastname.substring(1).toLowerCase();
    singleStudent.lastname = lastname;

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
    ///NOTES: **2 students with the same lastname : Padma Patil and Parvati Patil
    //** all src images have last name written + _ followed by first letter of firstname*/
    //Leanne has no lastname nor image
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
    }
    // if student name has last name and first name and has unique lastname (so everybody else essentially)
    else {
      image = `./imagesHogwarts/${fullname
        .substring(fullname.lastIndexOf(" ") + 1)
        .toLowerCase()}_${singleStudent.firstname[0].toLowerCase()}.png`;
    }
    singleStudent.image = image;

    //fullname
    singleStudent.fullname =
      `${singleStudent.firstname} ` + `${singleStudent.middlename} ` + `${singleStudent.lastname}`;

    //push each singleStudent to filteredStudents array.
    filteredStudents.push(singleStudent);
  });
  displayStudentList();
}

function displayStudentList() {
  filteredStudents.forEach(displayStudent);
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
  clone.querySelector("#image").src = singleStudent.image;
  clone.querySelector("#image").alt;

  //grab the parent
  const parent = document.querySelector(".student_grid");
  // append clone to list
  parent.appendChild(clone);
}
