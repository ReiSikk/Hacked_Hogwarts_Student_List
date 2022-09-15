"use strict";

///TODO: Ernest Macmillan middlename is empty instead of "No middle name"?
const url = "https://petlatkea.dk/2021/hogwarts/students.json";

window.addEventListener("DOMContentLoaded", start);

let firstname, middlename, lastname, nickname, gender, house, image;

const filteredStudents = [];

const Student = {
  firstname: "",
  middlename: "",
  lastname: "",
  nickname: "unknown",
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
    /*  console.log("firstname is : ", firstname); */

    //MiddleName(s) variable
    let middlename = fullname.substring(fullname.indexOf(" "), fullname.lastIndexOf(" "));

    //if middlename is empty display undefined middlename
    if (middlename === "") {
      singleStudent.middlename = "No middle name";
    } else if (middlename.includes(" ")) {
      //if middlename includes a space - replace space with empty character (" " tp "")
      middlename = middlename.replace(" ", "");
    } else {
      middlename = middlename[0].toUpperCase() + middlename.substring(1);
      singleStudent.middlename = middlename;
    }

    //Last Name varaible
    let lastname = fullname.substring(fullname.lastIndexOf(" ") + 1);
    lastname = lastname[0].toUpperCase() + lastname.substring(1).toLowerCase();
    singleStudent.lastname = lastname;

    // Student HOUSE variable
    house = house[0].toUpperCase() + house.substring(1).toLowerCase();
    /* console.log("house is: ", house); */
    singleStudent.house = house;

    //gender variable
    gender = gender[0].toUpperCase() + gender.substring(1);
    singleStudent.gender = gender;

    //NICK NAME variable

    if (!nickname) {
      nickname = fullname.substring(fullname.indexOf('"') + 1, fullname.lastIndexOf('"'));
      singleStudent.nickname = `Nickname:  ${nickname}`;
      console.log(nickname);
    } else {
      singleStudent.nickname = "No nick name";
    }
    /* 
    if (!nickname) {
      singleStudent.nickname = "No nick name";
    } else {
      nickname = fullname.substring(fullname.indexOf(`"`) + 1, fullname.lastIndexOf(`"`) - 1);
      nickname = nickname[0].toUpperCase() + nickname.substring(1).toLowerCase();
      singleStudent.nickname = nickname;
    } */
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
    //push each singleStudent to filteredStudents array.
    filteredStudents.push(singleStudent);
  });
  displayStudentList();
}

function displayStudentList() {
  /*  console.log("Display students list called"); */
  filteredStudents.forEach(displayStudent);
}

function displayStudent(singleStudent) {
  const template = document.querySelector("#template").content;
  // create clone
  const clone = template.cloneNode(true);

  // set clone data
  clone.querySelector("#first_name").textContent = `First name: ${singleStudent.firstname}`;
  clone.querySelector("#middle_name").textContent = ` Middle name: ${singleStudent.middlename}`;
  clone.querySelector("#nick_name").textContent = `${singleStudent.nickname}`;
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
console.log(filteredStudents);
