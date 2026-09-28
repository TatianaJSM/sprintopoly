import { initializeApp } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js";

import {

  getDatabase,

  ref,

  set,

  get,

  update,

  onValue,

  push

} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-database.js";

/* =====================================================

   FIREBASE

===================================================== */

const firebaseConfig = {

  apiKey: "AIzaSyDoo5RbGkMXhMIiursEXhj7jG8tN_QkmrE",

  authDomain: "sprintopoly-74ccd.firebaseapp.com",

  databaseURL: "https://sprintopoly-74ccd-default-rtdb.firebaseio.com",

  projectId: "sprintopoly-74ccd",

  storageBucket: "sprintopoly-74ccd.firebasestorage.app",

  messagingSenderId: "235505202765",

  appId: "1:235505202765:web:f676ec5d971b020c3d4e04"

};

const app = initializeApp(firebaseConfig);

const db = getDatabase(app);

/* =====================================================

   VARIABLES

===================================================== */

const $ = id => document.getElementById(id);

const colors = [

  "#ff4f78",

  "#3d9cff",

  "#32c66d",

  "#ff9d27",

  "#9258ee"

];

const diceFaces = [

  "⚀",

  "⚁",

  "⚂",

  "⚃",

  "⚄",

  "⚅"

];

let room = "";

let me = "";

let state = null;

let animationRunning = false;

let activeAnimationId = null;

let visualPositions = {};

let rollPending = false;

/* =====================================================

   TABLERO

===================================================== */

const spaces = [

  ["SALIDA", "🏁", "#ffd4e2"],

  ["EMPEZAR", "●", "#b8efca"],

  ["PARAR", "●", "#ffc0c0"],

  ["CONTINUAR", "●", "#ffd9a5"],

  ["KUDOS", "●", "#b9d8fb"],

  ["SORPRESA", "●", "#d8c3fa"],

  ["OTRA VEZ", "●", "#fff0a0"],

  ["EMPEZAR", "●", "#b8efca"],

  ["PARAR", "●", "#ffc0c0"],

  ["KUDOS", "●", "#b9d8fb"],

  ["CONTINUAR", "●", "#ffd9a5"],

  ["SORPRESA", "●", "#d8c3fa"],

  ["EMPEZAR", "●", "#b8efca"],

  ["OTRA VEZ", "●", "#fff0a0"],

  ["PARAR", "●", "#ffc0c0"],

  ["CONTINUAR", "●", "#ffd9a5"],

  ["KUDOS", "●", "#b9d8fb"],

  ["SORPRESA", "●", "#d8c3fa"],

  ["EMPEZAR", "●", "#b8efca"],

  ["SORPRESA", "●", "#d8c3fa"],

  ["KUDOS", "●", "#b9d8fb"],

  ["OTRA VEZ", "●", "#fff0a0"],

  ["CONTINUAR", "●", "#ffd9a5"],

  ["PARAR", "●", "#ffc0c0"]

];

/* =====================================================

   PREGUNTAS

===================================================== */

const prompts = {
  EMPEZAR: [
    ["🌱 EMPEZAR", "¿Qué te gustaría que empezáramos a hacer en el próximo Sprint?"],
    ["💡 NUEVA IDEA", "¿Qué cosa nueva podríamos probar en el próximo Sprint?"],
    ["🚀 MEJORAR", "¿Qué podríamos hacer para que el próximo Sprint sea mejor?"],
    ["🤝 EQUIPO", "¿Qué podríamos empezar a hacer para trabajar mejor como equipo?"],
    ["📢 COMUNICACIÓN", "¿Qué podríamos hacer para mejorar nuestra comunicación?"],
    ["🎯 OBJETIVOS", "¿Qué podríamos hacer para tener más claros nuestros objetivos?"],
    ["⏱️ ORGANIZACIÓN", "¿Qué podríamos empezar a hacer para organizarnos mejor?"],
    ["✨ ALGO NUEVO", "¿Hay algo que todavía no hacemos y te gustaría intentar como equipo?"],
    ["🔄 PRÓXIMO SPRINT", "¿Qué te gustaría hacer diferente en el próximo Sprint?"],
    ["⭐ UNA MEJORA", "Si pudieras agregar una mejora para el próximo Sprint, ¿cuál sería?"]
  ],
  PARAR: [
    ["🛑 PARAR", "¿Hay algo que crees que deberíamos dejar de hacer?"],
    ["😕 NO ME GUSTÓ", "¿Qué fue lo que menos te gustó de este Sprint?"],
    ["🔧 CAMBIAR", "¿Qué cambiarías de nuestra forma de trabajar?"],
    ["⌛ TIEMPO", "¿Hay algo en lo que crees que podríamos aprovechar mejor el tiempo?"],
    ["📋 ORGANIZACIÓN", "¿Hay algo de nuestra organización que cambiarías?"],
    ["📢 COMUNICACIÓN", "¿Hay algo de nuestra comunicación que podríamos hacer diferente?"],
    ["🤝 EQUIPO", "¿Hay alguna dinámica del equipo que te gustaría cambiar?"],
    ["🔄 DIFERENTE", "¿Qué harías diferente si pudiéramos repetir este Sprint?"],
    ["❌ QUITAR", "Si pudieras eliminar una cosa de nuestra forma de trabajar, ¿cuál sería?"],
    ["💭 TU OPINIÓN", "¿Hay algo que hacemos actualmente que consideras que podríamos cambiar?"]
  ],
  CONTINUAR: [
    ["🔄 CONTINUAR", "¿Qué deberíamos seguir haciendo en el próximo Sprint?"],
    ["😊 SALIÓ BIEN", "¿Qué consideras que salió bien durante este Sprint?"],
    ["⭐ LO MEJOR", "¿Qué fue lo que más te gustó de este Sprint?"],
    ["📈 MEJORAMOS", "¿En qué crees que mejoramos con respecto al Sprint anterior?"],
    ["🔙 RETRO ANTERIOR", "¿Crees que mejoramos algo que habíamos hablado en la retrospectiva anterior?"],
    ["💪 FUNCIONÓ", "¿Qué sentís que funcionó bien durante este Sprint?"],
    ["🤝 EQUIPO", "¿Qué consideras que hicimos bien como equipo?"],
    ["📢 COMUNICACIÓN", "¿Qué te gustó de la forma en que nos comunicamos durante este Sprint?"],
    ["✨ MANTENER", "¿Qué te gustaría mantener igual en el próximo Sprint?"],
    ["💚 BUENA PRÁCTICA", "¿Qué forma de trabajar consideras que vale la pena continuar?"]
  ],
  KUDOS: [
    ["👏 KUDOS", "¿Qué hiciste bien durante este Sprint?"],
    ["🌟 ORGULLO", "¿De qué aporte tuyo durante este Sprint te sentís orgulloso?"],
    ["💬 GRACIAS", "¿A quién del equipo te gustaría agradecer y por qué?"],
    ["💪 MI APORTE", "¿Qué aporte tuyo te gustaría destacar de este Sprint?"],
    ["🤝 COMPAÑERO", "¿Qué hizo bien alguno de tus compañeros durante este Sprint?"],
    ["🏆 LOGRO PERSONAL", "¿Qué logro personal de este Sprint te gustaría reconocer?"],
    ["🙌 RECONOCIMIENTO", "¿A qué compañero te gustaría reconocer por su trabajo en este Sprint?"],
    ["🧠 MEJORA PERSONAL", "¿En qué sentís que mejoraste personalmente durante este Sprint?"],
    ["✨ ALGO BUENO", "Menciona algo bueno de tu trabajo durante este Sprint."],
    ["💚 EQUIPO", "Menciona algo bueno que hizo el equipo durante este Sprint."]
  ]
};

const surprises = [
  ["🎯 EL SPRINT", "En general, ¿qué te pareció este Sprint?"],
  ["😊 LO MEJOR", "¿Qué fue lo mejor de este Sprint?"],
  ["😕 LO MENOS BUENO", "¿Qué fue lo que menos te gustó de este Sprint?"],
  ["🔧 MEJORAR", "¿Qué crees que podríamos mejorar para el próximo Sprint?"],
  ["📈 PROGRESO", "¿Sentís que este Sprint fue mejor que el anterior? ¿Por qué?"],
  ["🔙 SPRINT ANTERIOR", "¿Qué sentís que hicimos mejor que en el Sprint anterior?"],
  ["🔄 CAMBIOS", "¿Hay algo que te gustaría hacer diferente en el próximo Sprint?"],
  ["✅ RESULTADO", "¿Qué opinás del resultado que obtuvimos en este Sprint?"],
  ["🎯 OBJETIVOS", "¿Cómo te sentiste con los objetivos de este Sprint?"],
  ["⏰ TIEMPO", "¿Qué te pareció la forma en que manejamos el tiempo?"],
  ["📋 ORGANIZACIÓN", "¿Qué te pareció la organización del equipo durante este Sprint?"],
  ["📢 COMUNICACIÓN", "¿Qué te pareció la comunicación del equipo durante este Sprint?"],
  ["🤝 TRABAJO EN EQUIPO", "¿Qué te pareció la forma en que trabajamos como equipo?"],
  ["🎒 TRABAJO", "¿Qué te pareció la cantidad de trabajo que tuvimos en este Sprint?"],
  ["🌀 PORTAL", "¿Qué cambiarías de este Sprint?"],
  ["⚡ POWER-UP", "¿Qué sentís que hicimos bien como equipo?"],
  ["🔥 DESAFÍO", "¿Qué fue lo más difícil para vos durante este Sprint?"],
  ["😌 TRANQUILO", "¿Qué fue lo más sencillo para vos durante este Sprint?"],
  ["⌛ APROVECHAR", "¿Hay algo en lo que podríamos aprovechar mejor nuestro tiempo?"],
  ["🧠 APRENDIZAJE", "¿Qué aprendiste durante este Sprint?"],
  ["💡 LECCIÓN", "¿Qué te gustaría recordar de este Sprint para el próximo?"],
  ["↩️ CTRL + Z", "Si pudieras cambiar una sola cosa de este Sprint, ¿qué sería?"],
  ["🎮 NUEVA PARTIDA", "Si volviéramos a empezar este Sprint, ¿qué harías diferente?"],
  ["🚀 PRÓXIMO SPRINT", "¿Qué te gustaría que fuera mejor en el próximo Sprint?"],
  ["💚 MANTENER", "¿Qué te gustaría mantener igual para el próximo Sprint?"],
  ["🎁 BONUS", "¿Qué cosa positiva destacarías de este Sprint?"],
  ["⭐ EN POCAS PALABRAS", "¿Cómo describirías este Sprint en pocas palabras?"],
  ["🏆 LOGRO", "¿Qué logro del equipo destacarías de este Sprint?"],
  ["🌡️ EQUIPO", "¿Cómo te sentiste trabajando con el equipo durante este Sprint?"],
  ["🎲 SORPRESA", "Si pudieras pedir una sola mejora para el próximo Sprint, ¿cuál sería?"]
];

/* =====================================================
   UTILIDADES
===================================================== */

function generateCode() {

  return Math.random()

    .toString(36)

    .slice(2, 7)

    .toUpperCase();

}

function sleep(ms) {

  return new Promise(resolve => setTimeout(resolve, ms));

}

function toast(text) {

  const toastElement = $("toast");

  if (!toastElement) {

    console.log(text);

    return;

  }

  toastElement.textContent = text;

  toastElement.style.display = "block";

  setTimeout(() => {

    toastElement.style.display = "none";

  }, 2500);

}

function show(id) {

  ["home", "lobby", "game"].forEach(screen => {

    const element = $(screen);

    if (element) {

      element.classList.add("hidden");

    }

  });

  const selected = $(id);

  if (selected) {

    selected.classList.remove("hidden");

  }

}

function amIHost() {

  return !!state && state.host === me;

}

function sortedPlayers() {

  return Object.entries(state?.players || {})

    .sort((a, b) => a[1].order - b[1].order);

}

function escapeHTML(value) {

  return String(value ?? "").replace(

    /[&<>"']/g,

    character => ({

      "&": "&amp;",

      "<": "&lt;",

      ">": "&gt;",

      '"': "&quot;",

      "'": "&#039;"

    })[character]

  );

}

/* =====================================================

   PREGUNTAS SIN REPETICIÓN

===================================================== */

function getQuestionPool(type) {

  if (type === "SORPRESA") {

    return surprises;

  }

  return prompts[type] || [];

}

function chooseUnusedQuestion(type) {

  const pool = getQuestionPool(type);

  if (!pool.length) {

    return null;

  }

  const used = state?.usedQuestions?.[type] || {};

  const available = [];

  pool.forEach((question, index) => {

    if (!used[index]) {

      available.push(index);

    }

  });

  if (available.length > 0) {

    const randomPosition = Math.floor(

      Math.random() * available.length

    );

    const index = available[randomPosition];

    return {

      index,

      question: pool[index],

      recycled: false

    };

  }

  const index = Math.floor(

    Math.random() * pool.length

  );

  return {

    index,

    question: pool[index],

    recycled: true

  };

}

/* =====================================================

   CREAR SALA

===================================================== */

async function createRoom() {

  try {

    const name = $("hostName")?.value.trim();

    if (!name) {

      toast("Escribe tu nombre");

      return;

    }

    room = generateCode();

    me = crypto.randomUUID();

    await set(

      ref(db, "rooms/" + room),

      {

        host: me,

        status: "lobby",

        turn: 0,

        players: {

          [me]: {

            name,

            color: colors[0],

            pos: 0,

            order: 0

          }

        },

        round: null,

        animation: null,

        usedQuestions: null,

        history: null

      }

    );

    localStorage.setItem("sp_me", me);

    listen();

    show("lobby");

  } catch (error) {

    console.error("Error creando sala:", error);

    toast("No se pudo crear la sala");

  }

}

/* =====================================================

   UNIRSE A SALA

===================================================== */

async function joinRoom() {

  try {

    const name = $("joinName")?.value.trim();

    const enteredCode = $("roomCode")

      ?.value

      .trim()

      .toUpperCase();

    if (!name || !enteredCode) {

      toast("Completa nombre y código");

      return;

    }

    const snapshot = await get(

      ref(db, "rooms/" + enteredCode)

    );

    if (!snapshot.exists()) {

      toast("Sala no encontrada");

      return;

    }

    const data = snapshot.val();

    const players = Object.values(

      data.players || {}

    );

    if (players.length >= 5) {

      toast("La sala ya está llena");

      return;

    }

    if (data.status !== "lobby") {

      toast("La partida ya comenzó");

      return;

    }

    room = enteredCode;

    me = crypto.randomUUID();

    const usedOrders = players.map(

      player => player.order

    );

    const order = [0, 1, 2, 3, 4].find(

      number => !usedOrders.includes(number)

    );

    await set(

      ref(db, `rooms/${room}/players/${me}`),

      {

        name,

        color: colors[order],

        pos: 0,

        order

      }

    );

    localStorage.setItem("sp_me", me);

    listen();

    show("lobby");

  } catch (error) {

    console.error("Error uniéndose a sala:", error);

    toast("No se pudo entrar a la sala");

  }

}

/* =====================================================

   ESCUCHAR FIREBASE

===================================================== */

function listen() {

  onValue(

    ref(db, "rooms/" + room),

    snapshot => {

      if (!snapshot.exists()) {

        toast("La sala ya no existe");

        return;

      }

      state = snapshot.val();

      render();

      if (

        state.animation &&

        state.animation.id !== activeAnimationId

      ) {

        runSharedAnimation(state.animation);

      }

    }

  );

}

/* =====================================================

   RENDER GENERAL

===================================================== */

function render() {

  if (!state) {

    return;

  }

  const players = sortedPlayers();

  if ($("lobbyCode")) {

    $("lobbyCode").textContent = room;

  }

  if ($("count")) {

    $("count").textContent =

      `${players.length}/5 jugadores`;

  }

  if ($("lobbyPlayers")) {

    $("lobbyPlayers").innerHTML = players

      .map(([id, player]) => `

        <div class="lobbyPlayer">

          <span

            class="token"

            style="background:${player.color}"

          ></span>

          <b>${escapeHTML(player.name)}</b>

          ${id === state.host ? " 👑" : ""}

        </div>

      `)

      .join("");

  }

 if (

  state.status === "game" ||

  state.status === "finished"

) {

  show("game");

  drawBoard();

  renderPlayers();

  if (

    state.status === "finished"

  ) {

    $("promptModal")

      ?.classList

      .add("hidden");

    showFinishedScreen();

    return;

  }

  $("finishModal")

    ?.classList

    .add("hidden");

  if (

    !animationRunning &&

    !state.animation

  ) {

    renderRound();

  }

}

}

/* =====================================================

   INICIAR JUEGO

===================================================== */

async function startGame() {

  if (!state) {

    toast("La sala todavía está cargando");

    return;

  }

  if (!amIHost()) {

    toast("Solo el anfitrión puede iniciar");

    return;

  }

  const players = sortedPlayers();

  if (players.length < 2) {

    toast("Se necesitan al menos 2 jugadores");

    return;

  }

  if (players.length > 5) {

    toast("Máximo 5 jugadores");

    return;

  }

  await update(

    ref(db, "rooms/" + room),

    {

      status: "game",

      turn: 0,

      round: null,

      animation: null,

      usedQuestions: null,

      history: null

    }

  );

}

/* =====================================================

   COORDENADAS DEL TABLERO

===================================================== */

function boardCoords() {

  const coords = [];

  for (let column = 1; column <= 8; column++) {

    coords.push([1, column]);

  }

  for (let row = 2; row <= 6; row++) {

    coords.push([row, 8]);

  }

  for (let column = 7; column >= 1; column--) {

    coords.push([6, column]);

  }

  for (let row = 5; row >= 2; row--) {

    coords.push([row, 1]);

  }

  return coords;

}

/* =====================================================

   DIBUJAR TABLERO

===================================================== */

function drawBoard() {

  const board = $("board");

  if (!board) {

    return;

  }

  const coords = boardCoords();

  board

    .querySelectorAll(".space,.piece")

    .forEach(element => element.remove());

  spaces.forEach((space, index) => {

    const element =

      document.createElement("div");

    element.className = "space";

    element.dataset.spaceIndex = index;

    element.style.gridRow =

      coords[index][0];

    element.style.gridColumn =

      coords[index][1];

    element.style.background =

      space[2];

    element.innerHTML = `

      <span class="dot">

        ${space[1]}

      </span>

      <span>

        ${space[0]}

      </span>

    `;

    board.appendChild(element);

  });

  sortedPlayers().forEach(

    ([id, player], index) => {

      const shownPosition =

        visualPositions[id] ??

        player.pos;

      const position =

        coords[

          shownPosition %

          spaces.length

        ];

      const piece =

        document.createElement("div");

      piece.className = "piece";

      piece.id = `piece-${id}`;

      piece.style.background = player.color;

      piece.style.gridRow =

        position[0];

      piece.style.gridColumn =

        position[1];

      piece.style.alignSelf =

        "end";

      piece.style.justifySelf =

        "start";

      piece.style.margin =

        `0 0 ${

          5 +

          (index % 2) * 24

        }px ${

          5 +

          Math.floor(index / 2) * 24

        }px`;

      board.appendChild(piece);

    }

  );

}

/* =====================================================

   JUGADORES

===================================================== */

function renderPlayers() {

  const players = sortedPlayers();

  if (!players.length) {

    return;

  }

  const turnIndex =

    state.turn %

    players.length;

  const current =

    players[turnIndex];

  if ($("players")) {

    $("players").innerHTML = players

      .map(([id, player], index) => {

        const shownPosition =

          visualPositions[id] ??

          player.pos;

        return `

          <div class="player ${

            index === turnIndex

              ? "active"

              : ""

          }">

            <span

              class="token"

              style="background:${player.color}"

            ></span>

            <div>

              <b>

                ${escapeHTML(player.name)}

              </b>

              <br>

              <small>

                Casilla ${shownPosition}

                ·

                ${spaces[shownPosition][0]}

              </small>

            </div>

          </div>

        `;

      })

      .join("");

  }

  if ($("turnText")) {

    $("turnText").textContent =

      current

        ? `Turno de ${current[1].name}`

        : "";

  }

  if ($("rollBtn")) {

    $("rollBtn").disabled =

      rollPending ||

      animationRunning ||

      !!state.animation ||

      !current ||

      current[0] !== me ||

      !!state.round;

  }

  document

    .querySelectorAll(".hostOnly")

    .forEach(element => {

      element.style.display =

        amIHost()

          ? "block"

          : "none";

    });

}

/* =====================================================

   TIRAR DADO

===================================================== */

async function roll() {

  const players = sortedPlayers();

  if (

    !players.length ||

    rollPending ||

    animationRunning ||

    state.animation

  ) {

    return;

  }

  const turnIndex =

    state.turn %

    players.length;

  const current =

    players[turnIndex];

  if (

    !current ||

    current[0] !== me ||

    state.round

  ) {

    return;

  }

  rollPending = true;

  renderPlayers();

  const number =

    1 +

    Math.floor(

      Math.random() * 6

    );

  const from =

    current[1].pos;

  const to =

    (from + number) %

    spaces.length;

  const animation = {

    id: `${Date.now()}-${me}`,

    roller: me,

    from,

    to,

    roll: number

  };

  try {

    await set(

      ref(

        db,

        `rooms/${room}/animation`

      ),

      animation

    );

  } catch (error) {

    console.error(

      "Error tirando dado:",

      error

    );

    rollPending = false;

    renderPlayers();

    toast(

      "No se pudo tirar el dado"

    );

  }

}

/* =====================================================

   ANIMACIÓN

===================================================== */

async function runSharedAnimation(animation) {

  if (

    !animation ||

    animation.id === activeAnimationId

  ) {

    return;

  }

  activeAnimationId =

    animation.id;

  animationRunning =

    true;

  rollPending =

    false;

  if ($("promptModal")) {

    $("promptModal")

      .classList

      .add("hidden");

  }

  if ($("rollBtn")) {

    $("rollBtn").disabled = true;

  }

  const players =

    sortedPlayers();

  const rollerPlayer =

    players.find(

      ([id]) =>

        id === animation.roller

    );

  const rollerName =

    rollerPlayer

      ? rollerPlayer[1].name

      : "Jugador";

  if ($("diceMessage")) {

    $("diceMessage").textContent =

      `${rollerName} está tirando el dado...`;

  }

  const die = $("die");

  if (die) {

    die.classList.add("rolling");

  }

  /*

    Aproximadamente 3 segundos

    de animación del dado.

  */

  for (

    let i = 0;

    i < 24;

    i++

  ) {

    if (die) {

      die.textContent =

        diceFaces[

          Math.floor(

            Math.random() * 6

          )

        ];

    }

    await sleep(125);

  }

  if (die) {

    die.classList.remove("rolling");

    die.textContent =

      diceFaces[

        animation.roll - 1

      ];

  }

  if ($("diceMessage")) {

    $("diceMessage").textContent =

      `🎲 ${rollerName} sacó ${animation.roll}`;

  }

  await sleep(1500);

  let currentPosition =

    animation.from;

  for (

    let step = 1;

    step <= animation.roll;

    step++

  ) {

    currentPosition =

      (currentPosition + 1) %

      spaces.length;

    visualPositions[

      animation.roller

    ] = currentPosition;

    drawBoard();

    renderPlayers();

    const piece =

      document.getElementById(

        `piece-${animation.roller}`

      );

    if (piece) {

      piece.classList.remove(

        "moving"

      );

      void piece.offsetWidth;

      piece.classList.add(

        "moving"

      );

    }

    if ($("diceMessage")) {

      $("diceMessage").textContent =

        `🎩 ${rollerName} avanza ${step} de ${animation.roll}`;

    }

    await sleep(1000);

  }

  const finalSpace =

    document.querySelector(

      `.space[data-space-index="${animation.to}"]`

    );

  if (finalSpace) {

    finalSpace.classList.add(

      "landed"

    );

  }

  if ($("diceMessage")) {

    $("diceMessage").textContent =

      `📍 ${rollerName} cayó en ${spaces[animation.to][0]}`;

  }

  await sleep(2000);

  delete visualPositions[

    animation.roller

  ];

  if (

    animation.roller === me

  ) {

    await finishRoll(animation);

  }

  animationRunning = false;

  await sleep(200);

  if (state) {

    drawBoard();

    renderPlayers();

    renderRound();

  }

}

/* =====================================================

   FINALIZAR JUGADA

===================================================== */

async function finishRoll(animation) {

  const type =

    spaces[

      animation.to

    ][0];

  await update(

    ref(

      db,

      `rooms/${room}/players/${animation.roller}`

    ),

    {

      pos: animation.to

    }

  );

  if (type === "OTRA VEZ") {

    await set(

      ref(

        db,

        `rooms/${room}/animation`

      ),

      null

    );

    toast(

      "🎲 ¡Otra vez! Vuelve a tirar."

    );

    return;

  }

  if (type === "SALIDA") {

    await set(

      ref(

        db,

        `rooms/${room}/animation`

      ),

      null

    );

    await nextTurn();

    return;

  }

  const selected =

    chooseUnusedQuestion(type);

  if (!selected) {

    await set(

      ref(

        db,

        `rooms/${room}/animation`

      ),

      null

    );

    await nextTurn();

    return;

  }

  const question =

    selected.question;

  if (selected.recycled) {

    await set(

      ref(

        db,

        `rooms/${room}/usedQuestions/${type}`

      ),

      null

    );

    toast(

      `🔄 Se completó el mazo de ${type}. Se barajó de nuevo.`

    );

  }

  await set(

    ref(

      db,

      `rooms/${room}/usedQuestions/${type}/${selected.index}`

    ),

    true

  );

  await update(

    ref(

      db,

      "rooms/" + room

    ),

    {

      animation: null,

      round: {

        type,

        title: question[0],

        question: question[1],

        questionIndex: selected.index,

        answers: {},

        roller: animation.roller

      }

    }

  );

}

/* =====================================================

   MOSTRAR RONDA

===================================================== */

function renderRound() {

  if (

    animationRunning ||

    state?.animation

  ) {

    $("promptModal")

      ?.classList

      .add("hidden");

    return;

  }

  if (!state?.round) {

    $("promptModal")

      ?.classList

      .add("hidden");

    return;

  }

  const round =

    state.round;

  $("promptModal")

    ?.classList

    .remove("hidden");

  if ($("promptTitle")) {

    $("promptTitle").textContent =

      round.title;

  }

  if ($("promptQuestion")) {

    $("promptQuestion").textContent =

      round.question;

  }

  const answers =

    round.answers || {};

  const myAnswer =

    answers[me];

  $("answer")

    ?.classList

    .toggle(

      "hidden",

      !!myAnswer

    );

  $("submitAnswer")

    ?.classList

    .toggle(

      "hidden",

      !!myAnswer

    );

  const players =

    sortedPlayers();

  const received =

    Object.keys(

      answers

    ).length;

  if ($("answerStatus")) {

    $("answerStatus").textContent =

      `${received}/${players.length} respuestas recibidas` +

      (

        myAnswer &&

        received < players.length

          ? " · ✓ Tu respuesta fue enviada"

          : ""

      );

  }

  const allAnswered =

    received ===

    players.length;

  $("revealed")

    ?.classList

    .toggle(

      "hidden",

      !allAnswered

    );

  $("continueBtn")

    ?.classList

    .toggle(

      "hidden",

      !(

        allAnswered &&

        amIHost()

      )

    );

  if (

    allAnswered &&

    $("revealed")

  ) {

    $("revealed").innerHTML =

      players

        .map(

          ([id, player]) => `

            <div

              class="answerCard"

              style="border-color:${player.color}"

            >

              <b>

                ${escapeHTML(player.name)}

              </b>

              <br>

              ${escapeHTML(

                answers[id] || ""

              )}

            </div>

          `

        )

        .join("");

  } else if ($("revealed")) {

    $("revealed").innerHTML = "";

  }

}

/* =====================================================

   ENVIAR RESPUESTA

===================================================== */

async function submitAnswer() {

  const value =

    $("answer")

      ?.value

      .trim();

  if (!value) {

    toast(

      "Escribe una respuesta"

    );

    return;

  }

  if (!state?.round) {

    toast(

      "Esta pregunta ya terminó"

    );

    return;

  }

  await set(

    ref(

      db,

      `rooms/${room}/round/answers/${me}`

    ),

    value

  );

  if ($("answer")) {

    $("answer").value = "";

  }

}

/* =====================================================

   SIGUIENTE TURNO

===================================================== */

async function nextTurn() {

  const players =

    sortedPlayers();

  if (!players.length) {

    return;

  }

  const next =

    (state.turn + 1) %

    players.length;

  await update(

    ref(

      db,

      "rooms/" + room

    ),

    {

      turn: next,

      round: null,

      animation: null

    }

  );

}

/* =====================================================

   CONTINUAR RONDA

===================================================== */

async function continueRound() {

  if (!amIHost()) {

    toast(

      "Solo el anfitrión puede continuar"

    );

    return;

  }

  const round =

    state?.round;

  if (!round) {

    return;

  }

  const players =

    sortedPlayers();

  const answers =

    round.answers || {};

  if (

    Object.keys(answers).length !==

    players.length

  ) {

    toast(

      "Faltan respuestas del equipo"

    );

    return;

  }

  const historyRef =

    push(

      ref(

        db,

        `rooms/${room}/history`

      )

    );

  await set(

    historyRef,

    round

  );

  await nextTurn();

}

/* =====================================================

   REINICIAR

===================================================== */

async function resetGame() {

  if (!amIHost()) {

    toast(

      "Solo el anfitrión puede reiniciar"

    );

    return;

  }

  if (

    !confirm(

      "¿Reiniciar posiciones, respuestas y preguntas utilizadas?"

    )

  ) {

    return;

  }

  animationRunning = false;

  activeAnimationId = null;

  visualPositions = {};

  rollPending = false;

  const updates = {

    turn: 0,

    round: null,

    history: null,

    animation: null,

    usedQuestions: null

  };

  sortedPlayers().forEach(

    ([id]) => {

      updates[

        `players/${id}/pos`

      ] = 0;

    }

  );

  await update(

    ref(

      db,

      "rooms/" + room

    ),

    updates

  );

  if ($("die")) {

    $("die").textContent = "⚄";

  }

  if ($("diceMessage")) {

    $("diceMessage").textContent =

      "¡Tira el dado!";

  }

}

/* =====================================================

   RESUMEN

===================================================== */

function showSummary() {

  if (!$("summaryModal")) {

    return;

  }

  $("summaryModal")

    .classList

    .remove("hidden");

  const history =

    state?.history || {};

  const groups = {

    EMPEZAR: [],

    PARAR: [],

    CONTINUAR: [],

    KUDOS: [],

    SORPRESA: []

  };

  Object

    .values(history)

    .forEach(round => {

      const group =

        groups[round.type] ||

        groups.SORPRESA;

      group.push({

        title: round.title,

        question: round.question,

        answers: round.answers || {}

      });

    });

  if (!$("summaryContent")) {

    return;

  }

  $("summaryContent").innerHTML =

    Object.entries(groups)

      .map(([type, rounds]) => `

        <div class="section">

          <h3>${type}</h3>

          ${

            rounds.length

              ?

              rounds

                .map(round => `

                  <div class="answerCard">

                    <strong>

                      ${escapeHTML(round.title)}

                    </strong>

                    <p>

                      ${escapeHTML(round.question)}

                    </p>

                    ${

                      Object

                        .entries(round.answers)

                        .map(([playerId, answer]) => {

                          const player =

                            state?.players?.[playerId];

                          const playerName =

                            player?.name ||

                            "Jugador";

                          return `

                            <div

                              style="

                                margin-top:8px;

                                padding-top:8px;

                                border-top:1px solid #ddd;

                              "

                            >

                              <b>

                                ${escapeHTML(playerName)}:

                              </b>

                              ${escapeHTML(answer)}

                            </div>

                          `;

                        })

                        .join("")

                    }

                  </div>

                `)

                .join("")

              :

              `

                <p class="muted">

                  Sin respuestas todavía.

                </p>

              `

          }

        </div>

      `)

      .join("");

}

/* =====================================================

   FIN PARTE 1

   PEGA LA PARTE 2 JUSTO DEBAJO

===================================================== */

/* =====================================================

   DESCARGAR RESUMEN EN PDF

===================================================== */
function downloadSummaryPDF() {

  /*

    jsPDF se carga desde index.html.

    IMPORTANTE:

    si por alguna razón jsPDF no cargó,

    esto NO rompe el resto del juego.

  */

  if (

    !window.jspdf ||

    !window.jspdf.jsPDF

  ) {

    toast(

      "No se pudo cargar el generador de PDF"

    );

    return;

  }

  const {

    jsPDF

  } = window.jspdf;

  const doc =

    new jsPDF({

      orientation: "portrait",

      unit: "mm",

      format: "a4"

    });

  const players =

    sortedPlayers();

  const history =

    state?.history || {};

  const rounds =

    Object.values(history);

  const marginLeft = 18;

  const marginRight = 18;

  const pageWidth = 210;

  const pageHeight = 297;

  const usableWidth =

    pageWidth -

    marginLeft -

    marginRight;

  let y = 20;

  /* =================================================

     NUEVA PÁGINA CUANDO HAGA FALTA

  ================================================= */

  function checkPage(

    requiredSpace = 15

  ) {

    if (

      y + requiredSpace >

      pageHeight - 18

    ) {

      doc.addPage();

      y = 20;

    }

  }

  /* =================================================

     LIMPIAR EMOJIS PARA PDF

  ================================================= */

  function cleanPDFText(text) {

    return String(text ?? "")

      .replace(

        /[\u{1F000}-\u{1FAFF}]/gu,

        ""

      )

      .replace(

        /[\u2600-\u27BF]/g,

        ""

      )

      .trim();

  }

  /* =================================================

     TÍTULO

  ================================================= */

  doc.setFont(

    "helvetica",

    "bold"

  );

  doc.setFontSize(24);

  doc.text(

    "SPRINTOPOLY",

    pageWidth / 2,

    y,

    {

      align: "center"

    }

  );

  y += 9;

  doc.setFont(

    "helvetica",

    "normal"

  );

  doc.setFontSize(14);

  doc.text(

    "Resumen de la retrospectiva",

    pageWidth / 2,

    y,

    {

      align: "center"

    }

  );

  y += 12;

  /* =================================================

     INFORMACIÓN GENERAL

  ================================================= */

  const today =

    new Date();

  const formattedDate =

    today.toLocaleDateString(

      "es-CR",

      {

        year: "numeric",

        month: "long",

        day: "numeric"

      }

    );

  doc.setFontSize(10);

  doc.setTextColor(

    90,

    90,

    90

  );

  doc.text(

    `Fecha: ${formattedDate}`,

    marginLeft,

    y

  );

  y += 6;

  doc.text(

    `Sala: ${room}`,

    marginLeft,

    y

  );

  y += 6;

  const participantNames =

    players

      .map(

        ([id, player]) =>

          player.name

      )

      .join(", ");

  const participantLines =

    doc.splitTextToSize(

      `Participantes: ${participantNames}`,

      usableWidth

    );

  doc.text(

    participantLines,

    marginLeft,

    y

  );

  y +=

    participantLines.length *

    5 +

    8;

  doc.setTextColor(

    0,

    0,

    0

  );

  /* =================================================

     SIN RESPUESTAS

  ================================================= */

  if (

    rounds.length === 0

  ) {

    doc.setFontSize(12);

    doc.text(

      "Todavía no hay respuestas guardadas en esta retrospectiva.",

      marginLeft,

      y

    );

    doc.save(

      `Sprintopoly_${room}_Resumen.pdf`

    );

    toast(

      "📄 Resumen descargado"

    );

    return;

  }

  /* =================================================

     CATEGORÍAS

  ================================================= */

  const categories = [

    "EMPEZAR",

    "PARAR",

    "CONTINUAR",

    "KUDOS",

    "SORPRESA"

  ];

  categories.forEach(

    category => {

      const categoryRounds =

        rounds.filter(

          round =>

            round.type === category

        );

      if (

        categoryRounds.length === 0

      ) {

        return;

      }

      checkPage(25);

      y += 5;

      doc.setFont(

        "helvetica",

        "bold"

      );

      doc.setFontSize(16);

      doc.text(

        category,

        marginLeft,

        y

      );

      y += 8;

      doc.setDrawColor(

        60,

        50,

        90

      );

      doc.line(

        marginLeft,

        y - 3,

        pageWidth -

        marginRight,

        y - 3

      );

      /* =============================================

         RONDAS DE LA CATEGORÍA

      ============================================== */

      categoryRounds.forEach(

        (round, roundIndex) => {

          checkPage(30);

          doc.setFont(

            "helvetica",

            "bold"

          );

          doc.setFontSize(12);

          const cleanTitle =

            cleanPDFText(

              round.title ||

              category

            );

          doc.text(

            cleanTitle ||

            category,

            marginLeft,

            y

          );

          y += 6;

          /* =========================================

             PREGUNTA

          ========================================== */

          doc.setFont(

            "helvetica",

            "normal"

          );

          doc.setFontSize(11);

          const questionLines =

            doc.splitTextToSize(

              cleanPDFText(

                round.question || ""

              ),

              usableWidth

            );

          checkPage(

            questionLines.length *

            5 +

            10

          );

          doc.text(

            questionLines,

            marginLeft,

            y

          );

          y +=

            questionLines.length *

            5 +

            5;

          /* =========================================

             RESPUESTAS

          ========================================== */

          const answers =

            round.answers || {};

          Object

            .entries(answers)

            .forEach(

              ([playerId, answer]) => {

                const player =

                  state?.players?.[

                    playerId

                  ];

                const playerName =

                  player?.name ||

                  "Jugador";

                const responseLines =

                  doc.splitTextToSize(

                    cleanPDFText(

                      String(answer)

                    ),

                    usableWidth - 10

                  );

                const neededSpace =

                  responseLines.length *

                  5 +

                  12;

                checkPage(

                  neededSpace

                );

                doc.setFont(

                  "helvetica",

                  "bold"

                );

                doc.setFontSize(10);

                doc.text(

                  `${cleanPDFText(playerName)}:`,

                  marginLeft + 5,

                  y

                );

                y += 5;

                doc.setFont(

                  "helvetica",

                  "normal"

                );

                doc.text(

                  responseLines,

                  marginLeft + 8,

                  y

                );

                y +=

                  responseLines.length *

                  5 +

                  4;

              }

            );

          y += 4;

          if (

            roundIndex <

            categoryRounds.length - 1

          ) {

            checkPage(8);

            doc.setDrawColor(

              210,

              210,

              210

            );

            doc.line(

              marginLeft,

              y,

              pageWidth -

              marginRight,

              y

            );

            y += 7;

          }

        }

      );

      y += 5;

    }

  );

  /* =================================================

     PIE

  ================================================= */

  checkPage(20);

  y += 5;

  doc.setDrawColor(

    60,

    50,

    90

  );

  doc.line(

    marginLeft,

    y,

    pageWidth -

    marginRight,

    y

  );

  y += 8;

  doc.setFont(

    "helvetica",

    "italic"

  );

  doc.setFontSize(9);

  doc.setTextColor(

    100,

    100,

    100

  );

  doc.text(

    "Generado por Sprintopoly - La retrospectiva que se juega",

    pageWidth / 2,

    y,

    {

      align: "center"

    }

  );

  /* =================================================

     NÚMEROS DE PÁGINA

  ================================================= */

  const totalPages =

    doc.internal

      .getNumberOfPages();

  for (

    let page = 1;

    page <= totalPages;

    page++

  ) {

    doc.setPage(page);

    doc.setFont(

      "helvetica",

      "normal"

    );

    doc.setFontSize(8);

    doc.setTextColor(

      130,

      130,

      130

    );

    doc.text(

      `Página ${page} de ${totalPages}`,

      pageWidth / 2,

      290,

      {

        align: "center"

      }

    );

  }

  /* =================================================

     DESCARGAR

  ================================================= */

  doc.save(

    `Sprintopoly_${room}_Resumen.pdf`

  );

  toast(

    "📄 Resumen descargado"

  );

}

/* =====================================================

   FINALIZAR RETROSPECTIVA

===================================================== */

async function finishRetrospective() {

  if (!amIHost()) {

    toast(

      "Solo el anfitrión puede finalizar la retrospectiva"

    );

    return;

  }

  /*

    No permitimos finalizar mientras

    existe una pregunta activa.

    Así evitamos perder respuestas

    de la ronda actual.

  */

  if (state?.round) {

    toast(

      "Termina primero la ronda actual"

    );

    return;

  }

  const confirmed = confirm(

    "¿Seguro que deseas finalizar la retrospectiva? Después de finalizar ya no se podrán realizar más turnos."

  );

  if (!confirmed) {

    return;

  }

  try {

    /*

      Guardamos en Firebase que

      la retrospectiva terminó.

    */

    await update(

      ref(

        db,

        "rooms/" + room

      ),

      {

        status: "finished",

        animation: null,

        round: null,

        finishedAt: Date.now()

      }

    );

    toast(

      "🏁 Retrospectiva finalizada"

    );

  } catch (error) {

    console.error(

      "Error finalizando retrospectiva:",

      error

    );

    toast(

      "No se pudo finalizar la retrospectiva"

    );

  }

}

/* =====================================================

   MOSTRAR PANTALLA FINAL

===================================================== */

function showFinishedScreen() {

  if (!$("finishModal")) {

    return;

  }

  $("finishModal")

    .classList

    .remove("hidden");

  /*

    Nadie puede volver a tirar.

  */

  if ($("rollBtn")) {

    $("rollBtn").disabled = true;

  }

}

/* =====================================================

   CONECTAR TODOS LOS BOTONES

===================================================== */

/*

  Esto está al FINAL a propósito.

  Y cada botón se comprueba antes de usarlo.

  Así el botón del PDF NO puede romper

  CREAR SALA o UNIRME.

*/

const createBtn =

  $("createBtn");

const joinBtn =

  $("joinBtn");

const startBtn =

  $("startBtn");

const rollBtn =

  $("rollBtn");

const submitAnswerBtn =

  $("submitAnswer");

const continueBtn =

  $("continueBtn");

const resetBtn =

  $("resetBtn");

const summaryBtn =

  $("summaryBtn");

const closeSummaryBtn =

  $("closeSummary");

const downloadPdfBtn =

  $("downloadPdfBtn");

const finishBtn =

  $("finishBtn");

const finalSummaryBtn =

  $("finalSummaryBtn");

const finalPdfBtn =

  $("finalPdfBtn");

if (createBtn) {

  createBtn.addEventListener(

    "click",

    createRoom

  );

}

if (joinBtn) {

  joinBtn.addEventListener(

    "click",

    joinRoom

  );

}

if (startBtn) {

  startBtn.addEventListener(

    "click",

    startGame

  );

}

if (rollBtn) {

  rollBtn.addEventListener(

    "click",

    roll

  );

}

if (submitAnswerBtn) {

  submitAnswerBtn.addEventListener(

    "click",

    submitAnswer

  );

}

if (continueBtn) {

  continueBtn.addEventListener(

    "click",

    continueRound

  );

}

if (resetBtn) {

  resetBtn.addEventListener(

    "click",

    resetGame

  );

}

if (summaryBtn) {

  summaryBtn.addEventListener(

    "click",

    showSummary

  );

}

if (closeSummaryBtn) {

  closeSummaryBtn.addEventListener(

    "click",

    () => {

      $("summaryModal")

        ?.classList

        .add("hidden");

    }

  );

}

if (finishBtn) {

  finishBtn.addEventListener(

    "click",

    finishRetrospective

  );

}

if (finalSummaryBtn) {

  finalSummaryBtn.addEventListener(

    "click",

    () => {

      $("finishModal")

        ?.classList

        .add("hidden");

      showSummary();

    }

  );

}

if (finalPdfBtn) {

  finalPdfBtn.addEventListener(

    "click",

    downloadSummaryPDF

  );

}

/*

  ESTE ES EL CAMBIO IMPORTANTE:

  Antes:

  $("downloadPdfBtn").onclick = ...

  Si el HTML no tenía ese botón,

  JavaScript podía detenerse.

  Ahora solamente lo conecta

  si realmente existe.

*/

if (downloadPdfBtn) {

  downloadPdfBtn.addEventListener(

    "click",

    downloadSummaryPDF

  );

}

/* =====================================================

   APP LISTA

===================================================== */

console.log(

  "🎩 Sprintopoly cargado correctamente"

);