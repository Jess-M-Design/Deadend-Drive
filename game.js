window.onload = function () {
  const characters = [
    { name: "Aunt Agatha", id: "agatha", position: { x: 0, y: 0 }, alive: true },
    { name: "Smothers", id: "smothers", position: { x: 1, y: 0 }, alive: true },
    { name: "Chef", id: "chef", position: { x: 2, y: 0 }, alive: true },
    { name: "Butler", id: "butler", position: { x: 3, y: 0 }, alive: true },
    { name: "Nephew", id: "nephew", position: { x: 4, y: 0 }, alive: true },
    { name: "Actress", id: "actress", position: { x: 5, y: 0 }, alive: true },
  ];

  const exitSpace = { x: 5, y: 9 };
  const trapSpaces = [
    { type: "chandelier", x: 2, y: 2, icon: "🕯" },
    { type: "bookcase", x: 7, y: 3, icon: "📚" },
    { type: "fireplace", x: 1, y: 7, icon: "🔥" },
    { type: "armor", x: 8, y: 6, icon: "🛡" }
  ];

  let portraitDeck = [...characters];
  let trapDeck = ["chandelier", "bookcase", "fireplace", "armor"];

  function shuffle(array) { return array.sort(() => Math.random() - 0.5); }

  let currentPlayerIndex = 0;
  let diceRoll = 0;
  let movesThisTurn = 0;
  let selectedCharacter = null;

  const players = [
    { name: "Player 1", type: "human", hand: [] },
    { name: "Player 2", type: "human", hand: [] },
    { name: "Player 3", type: "cpu", hand: [] },
    { name: "Player 4", type: "cpu", hand: [] },
  ];

  shuffle(portraitDeck);
  players.forEach(player => {
    const count = Math.floor(portraitDeck.length / players.length);
    player.hand = portraitDeck.splice(0, count);
  });

  const board = document.getElementById("board");
  const playerInfo = document.getElementById("player-info");
  const cardsDiv = document.getElementById("cards");
  const rollButton = document.getElementById("rollDice");
  const diceResult = document.getElementById("diceResult");

  // Draw the board
  function drawBoard() {
    board.innerHTML = "";
    for (let y = 0; y < 10; y++) {
      for (let x = 0; x < 10; x++) {
        const cell = document.createElement("div");
        cell.classList.add("board-cell");
        cell.dataset.x = x;
        cell.dataset.y = y;

        if (x === exitSpace.x && y === exitSpace.y) {
          cell.classList.add("exit-cell");
          cell.innerHTML = "🚪";
        }

        const trap = trapSpaces.find(t => t.x === x && t.y === y);
        if (trap) {
          cell.classList.add("trap-cell");
          const trapEl = document.createElement("div");
          trapEl.classList.add("trap-icon");
          trapEl.innerText = trap.icon;
          trapEl.title = trap.type;
          cell.appendChild(trapEl);
        }

        characters.forEach((char, index) => {
          if (char.alive && char.position.x === x && char.position.y === y) {
            const token = document.createElement("div");
            token.classList.add("token");
            const colors = ["#e74c3c", "#3498db", "#f1c40f", "#9b59b6", "#1abc9c", "#e67e22"];
            token.style.backgroundColor = colors[index % colors.length];
            token.innerText = char.name[0];
            token.title = char.name;
            cell.appendChild(token);
          }
        });

        cell.addEventListener("click", () => handleCellClick(x, y));
        board.appendChild(cell);
      }
    }
  }

  // Dice roll
 var elDiceOne = document.getElementById('dice1');
var elDiceTwo = document.getElementById('dice2');
var elRollButton = document.getElementById('roll'); // or 'rollDice' depending on your HTML

elRollButton.onclick = function () {
    // Roll dice
    var diceOne = Math.floor(Math.random() * 6) + 1;
    var diceTwo = Math.floor(Math.random() * 6) + 1;

    // Show dice faces
    for (var i = 1; i <= 6; i++) {
        elDiceOne.classList.remove('show-' + i);
        elDiceTwo.classList.remove('show-' + i);
    }
    elDiceOne.classList.add('show-' + diceOne);
    elDiceTwo.classList.add('show-' + diceTwo);

    // Update game variables
    diceRoll = diceOne + diceTwo;
    movesThisTurn = 0;

    // Update UI
    updateUI();

    // Optionally show numeric result
    document.getElementById('diceResult').innerText = `Dice: ${diceOne} + ${diceTwo} = ${diceRoll}`;
};


  // Handle human clicks
  function handleCellClick(x, y) {
    const player = players[currentPlayerIndex];
    if (player.type !== "human") return;
    if (movesThisTurn >= diceRoll) return;

    if (!selectedCharacter) {
      selectedCharacter = characters.find(c => c.alive && c.position.x === x && c.position.y === y);
    } else {
      selectedCharacter.position = { x, y };
      movesThisTurn++;
      checkTrap(selectedCharacter);
      checkWinConditions();
      selectedCharacter = null;
      drawBoard();
      updateUI();
      if (movesThisTurn >= diceRoll) endTurn();
    }
  }

  function checkTrap(character) {
    const trap = trapSpaces.find(t => t.x === character.position.x && t.y === character.position.y);
    if (!trap) return;
    const player = players[currentPlayerIndex];
    if (!player.hand.includes(trap.type)) return;
    if (player.type === "human") {
      const useTrap = confirm(`${player.name}, activate ${trap.type} trap on ${character.name}?`);
      if (useTrap) activateTrap(trap, character, player);
    } else {
      activateTrap(trap, character, player);
    }
  }

  function activateTrap(trap, character, player) {
    alert(`${character.name} was eliminated by the ${trap.type} trap!`);
    character.alive = false;
    const idx = player.hand.indexOf(trap.type);
    if (idx > -1) player.hand.splice(idx, 1);
    drawBoard();
    checkWinConditions();
  }

  function updateUI() {
    const player = players[currentPlayerIndex];
    playerInfo.innerText = `${player.name}'s Turn - Remaining moves: ${diceRoll - movesThisTurn}`;
    cardsDiv.innerHTML = "";

    player.hand.forEach(card => {
      const el = document.createElement("div");
      el.classList.add("card");

      if (card.name) { // character
        el.innerText = card.name;
        el.title = card.name;
        el.style.backgroundColor = "#3498db";
      } else { // trap
        const trap = trapSpaces.find(t => t.type === card);
        el.innerText = trap ? trap.icon + " " + card : card;
        el.title = card;
        el.style.backgroundColor = "#b22222";
      }
      cardsDiv.appendChild(el);
    });
  }

  function endTurn() {
    movesThisTurn = 0;
    selectedCharacter = null;
    currentPlayerIndex = (currentPlayerIndex + 1) % players.length;
    updateUI();
    if (players[currentPlayerIndex].type === "cpu") setTimeout(cpuTurn, 1000);
    else rollDice();
  }

  function cpuTurn() {
    const cpu = players[currentPlayerIndex];
    if (trapDeck.length > 0) cpu.hand.push(trapDeck.pop());

    const dice = Math.floor(Math.random() * 6) + 1 + Math.floor(Math.random() * 6) + 1;
    for (let i = 0; i < dice; i++) {
      const aliveChars = characters.filter(c => c.alive);
      if (!aliveChars.length) break;
      const char = aliveChars[Math.floor(Math.random() * aliveChars.length)];
      const dx = Math.random() > 0.5 ? 1 : -1;
      const dy = Math.random() > 0.5 ? 1 : -1;
      char.position.x = Math.max(0, Math.min(9, char.position.x + dx));
      char.position.y = Math.max(0, Math.min(9, char.position.y + dy));
      checkTrap(char);
      checkWinConditions();
    }
    drawBoard();
    endTurn();
  }

  function checkWinConditions() {
    characters.forEach(c => {
      if (c.alive && c.position.x === exitSpace.x && c.position.y === exitSpace.y) {
        const owner = players.find(p => p.hand.some(card => card.name === c.name));
        if (owner) { alert(`${owner.name} wins! ${c.name} escaped!`); endGame(); }
      }
    });

    const aliveChars = characters.filter(c => c.alive);
    if (aliveChars.length === 1) {
      const last = aliveChars[0];
      const owner = players.find(p => p.hand.some(card => card.name === last.name));
      if (owner) { alert(`${owner.name} wins! ${last.name} is the last heir!`); endGame(); }
    }
  }

  function endGame() {
    board.innerHTML = "";
    playerInfo.innerText = "Game Over";
  }

  drawBoard();
  rollButton.onclick = rollDice;
  rollDice(); // start first turn
};
