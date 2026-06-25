const dateText = "25 June";
const dateChars = dateText.split("");
let dateIndex = 0;
const dateEl = document.querySelector(".date__of__birth span");

setTimeout(() => {
    const dateTimer = setInterval(() => {
        if (dateIndex < dateChars.length) {
            dateEl.textContent += dateChars[dateIndex];
            dateIndex++;
        } else {
            const star = document.createElement("i");
            star.className = "fa-solid fa-star";
            const wrap = document.querySelector(".date__of__birth");
            wrap.prepend(star);
            wrap.appendChild(star.cloneNode(true));
            clearInterval(dateTimer);
        }
    }, 100);
}, 12000);

const mailBox = document.querySelector(".mail");
const boxMail = document.querySelector(".boxMail");
const boxMailClose = document.querySelector(".fa-xmark");
const boxMailContainer = document.querySelector(".boxMail-container");
const boxMailCover = document.querySelector(".boxMail-container .card1");
if (mailBox && boxMail) {
    mailBox.addEventListener("click", () => {
        mailBox.classList.toggle("active");
        boxMail.classList.add("active");
        if (boxMailContainer) boxMailContainer.classList.remove("open");
    });
    if (boxMailClose) {
        boxMailClose.addEventListener("click", () => {
            boxMail.classList.remove("active");
            if (boxMailContainer) boxMailContainer.classList.remove("open");
        });
    }
}

if (boxMailCover && boxMailContainer) {
    boxMailCover.addEventListener("click", () => boxMailContainer.classList.add("open"));
}

const hugTab = document.getElementById("hug-tab");
const hugOverlay = document.getElementById("hug-overlay");
const hugClose = document.querySelector(".hug-close");
if (hugTab && hugOverlay) {
    hugTab.addEventListener("click", () => hugOverlay.classList.add("open"));
    hugClose.addEventListener("click", () => hugOverlay.classList.remove("open"));
}

const aboutTab = document.getElementById("about-tab");
const aboutOverlay = document.getElementById("about-overlay");
const aboutClose = document.querySelector(".about-close");
if (aboutTab && aboutOverlay) {
    aboutTab.addEventListener("click", () => aboutOverlay.classList.add("open"));
    aboutClose.addEventListener("click", () => aboutOverlay.classList.remove("open"));
    aboutOverlay.addEventListener("click", (e) => {
        if (e.target === aboutOverlay) aboutOverlay.classList.remove("open");
    });
}
