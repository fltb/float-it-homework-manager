// this is running in browser

function showSubmitDiv() {
    const blackOverlay = document.querySelector(".black-overlay");
    const submitCode = document.querySelector(".submit-code");

    blackOverlay.removeAttribute("class", "disable");
    submitCode.removeAttribute("class", "disable");
    blackOverlay.setAttribute("class", "black-overlay");
    submitCode.setAttribute("class", "submit-code");
}

function closeSubmitDiv() {
    const blackOverlay = document.querySelector(".black-overlay");
    const submitCode = document.querySelector(".submit-code");

    blackOverlay.setAttribute("class", "black-overlay disable");
    submitCode.setAttribute("class", "submit-code disable");
}

document.querySelector(".cancel-submit-code").addEventListener("click", closeSubmitDiv);
document.querySelector(".black-overlay").addEventListener("click", closeSubmitDiv);
