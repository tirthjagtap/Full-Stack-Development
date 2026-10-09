
const form = document.getElementById("studentForm");
const errorMessage = document.getElementById("errorMessage");
const resultSection = document.getElementById("resultSection");
const resultContent = document.getElementById("resultContent");
const recordsList = document.getElementById("recordsList");
const jsonBtn = document.getElementById("jsonBtn");
const jsonOutput = document.getElementById("jsonOutput");
const clearBtn = document.getElementById("clearBtn");

const subjects = [
    { id: "html", name: "HTML5" },
    { id: "css", name: "CSS3" },
    { id: "javascript", name: "JavaScript" },
    { id: "database", name: "Database" },
    { id: "programming", name: "Programming" }
];

let currentStudent = null;

function getSavedStudents() {
    try {
        return JSON.parse(localStorage.getItem("students")) || [];
    } catch {
        return [];
    }
}

function displayRecords() {
    const students = getSavedStudents();
    recordsList.replaceChildren();

    if (students.length === 0) {
        recordsList.textContent = "No student records found.";
        return;
    }

    students.forEach(student => {
        const card = document.createElement("div");
        card.className = "student-record";

        const name = document.createElement("h3");
        name.textContent = student.name;

        const roll = document.createElement("p");
        roll.textContent = "Roll Number: " + student.roll;

        const percentage = document.createElement("p");
        percentage.textContent =
            "Percentage: " + student.percentage.toFixed(2) + "%";

        const status = document.createElement("p");
        status.textContent = "Result: " + student.status;

        card.append(name, roll, percentage, status);
        recordsList.appendChild(card);
    });
}

form.addEventListener("submit", function(event) {
    event.preventDefault();
    errorMessage.textContent = "";

    const name = document.getElementById("name").value.trim();
    const roll = document.getElementById("roll").value.trim();
    const email = document.getElementById("email").value.trim();
    const studentClass =
        document.getElementById("studentClass").value.trim();

    if (!name || !roll || !email || !studentClass) {
        errorMessage.textContent = "Please fill in all details.";
        return;
    }

    const marks = {};

    for (const subject of subjects) {
        const input = document.getElementById(subject.id);
        const value = input.value;
        const mark = Number(value);

        if (
            value.trim() === "" ||
            !Number.isInteger(mark) ||
            mark < 0 ||
            mark > 100
        ) {
            errorMessage.textContent =
                subject.name + " marks must be a whole number from 0 to 100.";
            input.focus();
            return;
        }

        marks[subject.name] = mark;
    }

    const students = getSavedStudents();

    const duplicate = students.some(
        student => student.roll.toLowerCase() === roll.toLowerCase()
    );

    if (duplicate) {
        errorMessage.textContent = "Roll number already exists.";
        return;
    }

    const total = Object.values(marks).reduce(
        (sum, mark) => sum + mark, 0
    );

    const maximumMarks = subjects.length * 100;
    const percentage = (total / maximumMarks) * 100;

    const status = Object.values(marks).every(
        mark => mark >= 35
    ) ? "Pass" : "Fail";

    const student = {
        name,
        roll,
        email,
        studentClass,
        marks,
        total,
        maximumMarks,
        percentage,
        status
    };

    try {
        students.push(student);

        // Convert student records into JSON and save them.
        localStorage.setItem("students", JSON.stringify(students));

        currentStudent = student;

        displayResult(student);
        displayRecords();

        form.reset();

        resultSection.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    } catch {
        errorMessage.textContent =
            "Unable to save records in Local Storage.";
    }
});

function displayResult(student) {
    resultContent.replaceChildren();

    const details = [
        ["Name", student.name],
        ["Roll Number", student.roll],
        ["Email", student.email],
        ["Class / Course", student.studentClass],
        ["HTML5", student.marks.HTML5],
        ["CSS3", student.marks.CSS3],
        ["JavaScript", student.marks.JavaScript],
        ["Database", student.marks.Database],
        ["Programming", student.marks.Programming],
        ["Total", student.total + " / " + student.maximumMarks],
        ["Percentage", student.percentage.toFixed(2) + "%"],
        ["Result", student.status]
    ];

    details.forEach(([label, value]) => {
        const paragraph = document.createElement("p");
        paragraph.textContent = label + ": " + value;
        resultContent.appendChild(paragraph);
    });

    resultSection.hidden = false;
}

jsonBtn.addEventListener("click", function() {
    if (!currentStudent) return;

    jsonOutput.textContent = JSON.stringify(currentStudent, null, 2);
    jsonOutput.hidden = !jsonOutput.hidden;
});

clearBtn.addEventListener("click", function() {
    const students = getSavedStudents();

    if (students.length === 0) {
        errorMessage.textContent = "No records to clear.";
        return;
    }

    if (confirm("Delete all saved student records?")) {
        try {
            localStorage.removeItem("students");
            currentStudent = null;
            resultSection.hidden = true;
            jsonOutput.hidden = true;
            errorMessage.textContent = "";
            displayRecords();
        } catch {
            errorMessage.textContent = "Unable to clear records.";
        }
    }
});

// Display saved records when the page opens.
displayRecords();
