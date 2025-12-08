document.addEventListener("DOMContentLoaded", () => {

    const form = document.querySelector(".my-form");
    const submitBtn = form.querySelector("button[type='submit']");

    function showError(input, message) {
        input.classList.add("input-error");

        let error = input.parentElement.querySelector(".error-text");
        if (!error) {
            error = document.createElement("div");
            error.classList.add("error-text");
            input.parentElement.appendChild(error);
        }
        error.textContent = message;
    }

    function clearError(input) {
        input.classList.remove("input-error");
        const error = input.parentElement.querySelector(".error-text");
        if (error) error.remove();
    }

    // Regex
    const onlyLetters = /^[A-Za-zÀ-ž\s]+$/;
    const emailFormat = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const textFormat = /[A-Za-z]/;
    const phoneFormat = /^\+370 6\d{2} \d{5}$/;

    const phoneInput = form.querySelector('[name="telefonas"]');

    phoneInput.addEventListener("input", () => {
        let digits = phoneInput.value.replace(/\D/g, "");

        if (!digits.startsWith("3706")) {
            digits = "3706" + digits.slice(0);
        }

        digits = digits.slice(0, 12);

        let formatted =
            "+" +
            digits.slice(0, 3) +
            " " +
            digits.slice(3, 4) +
            digits.slice(4, 6) +
            " " +
            digits.slice(6);

        phoneInput.value = formatted.trim();

        if (!phoneFormat.test(formatted)) {
            showError(phoneInput, "Telefonas turi būti formato +370 6xx xxxxx");
        } else {
            clearError(phoneInput);
        }
    });

    form.addEventListener("submit", (e) => {
        e.preventDefault();

        let valid = true;

        const vardas = form.vardas;
        const pavarde = form.pavarde;
        const email = form.email;
        const adresas = form.adresas;

        // Išvalyti senas klaidas
        [vardas, pavarde, email, adresas, phoneInput].forEach(clearError);

        // Tušti laukai
        if (vardas.value.trim() === "") {
            showError(vardas, "Įveskite vardą");
            valid = false;
        } else if (!onlyLetters.test(vardas.value.trim())) {
            showError(vardas, "Vardas turi būti sudarytas tik iš raidžių");
            valid = false;
        }

        if (pavarde.value.trim() === "") {
            showError(pavarde, "Įveskite pavardę");
            valid = false;
        } else if (!onlyLetters.test(pavarde.value.trim())) {
            showError(pavarde, "Pavardė turi būti tik iš raidžių");
            valid = false;
        }

        if (email.value.trim() === "") {
            showError(email, "Įveskite el. paštą");
            valid = false;
        } else if (!emailFormat.test(email.value.trim())) {
            showError(email, "El. paštas neteisingo formato");
            valid = false;
        }

        if (adresas.value.trim() === "") {
            showError(adresas, "Įveskite adresą");
            valid = false;
        } else if (!textFormat.test(adresas.value.trim())) {
            showError(adresas, "Adresas turi būti tekstinis");
            valid = false;
        }

        if (!phoneFormat.test(phoneInput.value.trim())) {
            showError(phoneInput, "Telefonas turi būti formato +370 6xx xxxx");
            valid = false;
        }

        if (!valid) return;

        const data = Object.fromEntries(new FormData(form));

        console.log("Formos duomenys:", data);

        const vidurkis = (
            (Number(data.q1) + Number(data.q2) + Number(data.q3)) / 3
        ).toFixed(1);

        // Rezultatų išvedimas
        let out = document.querySelector("#form-output");
        if (!out) {
            out = document.createElement("div");
            out.id = "form-output";
            out.style.marginTop = "20px";
            out.style.padding = "20px";
            out.style.background = "#eef3ff";
            out.style.border = "1px solid #ccc";
            out.style.borderRadius = "10px";
            form.parentElement.appendChild(out);
        }

        out.innerHTML = `
            <strong>${data.vardas} ${data.pavarde}</strong><br>
            El. paštas: ${data.email}<br>
            Telefonas: ${data.telefonas}<br>
            Adresas: ${data.adresas}<br><br>
            Klausimai: ${data.q1}, ${data.q2}, ${data.q3}<br>
            <strong>Vidurkis: ${vidurkis}</strong>
        `;

        showSuccessPopup();
    });

    function showSuccessPopup() {
        let popup = document.createElement("div");
        popup.classList.add("success-popup");
        popup.textContent = "Duomenys pateikti sėkmingai!";

        document.body.appendChild(popup);
        setTimeout(() => popup.classList.add("show"), 10);

        setTimeout(() => {
            popup.classList.remove("show");
            setTimeout(() => popup.remove(), 400);
        }, 3000);
    }

});

// Memory Game Script

document.addEventListener("DOMContentLoaded", () => {

  const board = document.getElementById("gameBoard");
  const movesText = document.getElementById("moves");
  const matchesText = document.getElementById("matches");
  const winMessage = document.getElementById("winMessage");

  const timeText = document.getElementById("time");
  const bestEasyText = document.getElementById("bestEasy");
  const bestHardText = document.getElementById("bestHard");

  const icons = ["🍎","🚗","🌙","🐶","🎲","💡","🔥","⭐","🍌","🍇","🚀","🎵"];

  let firstCard = null;
  let secondCard = null;
  let lock = false;
  let moves = 0;
  let matches = 0;
  let totalPairs = 0;

  let timer = null;
  let time = 0;

  /* ======================
      LOCAL STORAGE INIT
  ====================== */

  function loadBestScores() {
    bestEasyText.textContent = localStorage.getItem("bestEasy") || "-";
    bestHardText.textContent = localStorage.getItem("bestHard") || "-";
  }

  loadBestScores();

  function saveBestScore(difficulty, score) {
    let key = difficulty === "easy" ? "bestEasy" : "bestHard";

    let currentBest = localStorage.getItem(key);

    if (!currentBest || score < Number(currentBest)) {
      localStorage.setItem(key, score);
      loadBestScores();
    }
  }

  /* ======================
      TIMER
  ====================== */

  function startTimer() {
    time = 0;
    timeText.textContent = "0.0";

    timer = setInterval(() => {
      time += 0.1;
      timeText.textContent = time.toFixed(1);
    }, 100);
  }

  function stopTimer() {
    clearInterval(timer);
  }

  /* ======================
       GAME BOARD
  ====================== */

  function generateBoard(difficulty) {
    board.innerHTML = "";
    winMessage.classList.remove("show");

    moves = 0;
    matches = 0;
    time = 0;

    movesText.textContent = 0;
    matchesText.textContent = 0;
    timeText.textContent = "0.0";

    clearInterval(timer);

    let rows, cols;

    if (difficulty === "easy") {
      rows = 3;
      cols = 4;
    } else {
      rows = 4;
      cols = 6;
    }

    totalPairs = (rows * cols) / 2;

    board.style.gridTemplateColumns = `repeat(${cols}, 100px)`;

    let selectedIcons = icons.slice(0, totalPairs);
    let cards = [...selectedIcons, ...selectedIcons];

    cards.sort(() => Math.random() - 0.5);

    cards.forEach(icon => {
      let card = document.createElement("div");
      card.classList.add("memory-card");
      card.dataset.icon = icon;
      board.appendChild(card);

      card.addEventListener("click", () => flipCard(card));
    });
  }

  /* ======================
         CARD LOGIC
  ====================== */

  function flipCard(card) {
    if (lock || card.classList.contains("flipped") || card.classList.contains("matched"))
      return;

    card.classList.add("flipped");
    card.textContent = card.dataset.icon;

    if (!firstCard) {
      firstCard = card;
      return;
    }

    secondCard = card;
    moves++;
    movesText.textContent = moves;

    checkMatch();
  }

  function checkMatch() {
    if (firstCard.dataset.icon === secondCard.dataset.icon) {
      firstCard.classList.add("matched");
      secondCard.classList.add("matched");

      matches++;
      matchesText.textContent = matches;

      resetTurn();

      if (matches === totalPairs) {
        stopTimer();
        winMessage.classList.add("show");

        // SAVE BEST SCORE
        let diff = document.getElementById("difficulty").value;
        saveBestScore(diff, moves);
      }
    } else {
      lock = true;
      setTimeout(() => {
        firstCard.classList.remove("flipped");
        secondCard.classList.remove("flipped");
        firstCard.textContent = "";
        secondCard.textContent = "";
        resetTurn();
      }, 900);
    }
  }

  function resetTurn() {
    firstCard = null;
    secondCard = null;
    lock = false;
  }

  /* ======================
       BUTTONS
  ====================== */

  document.getElementById("startGame").addEventListener("click", () => {
    let diff = document.getElementById("difficulty").value;
    generateBoard(diff);
    startTimer();
  });

  document.getElementById("resetGame").addEventListener("click", () => {
    let diff = document.getElementById("difficulty").value;
    generateBoard(diff);
    stopTimer();
  });

});
