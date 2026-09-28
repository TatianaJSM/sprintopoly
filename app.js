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


/* FIREBASE */

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


/* VARIABLES */

const $ = id =>
  document.getElementById(id);

const colors = [
  "#ff4f78",
  "#3d9cff",
  "#32c66d",
  "#ff9d27",
  "#9258ee"
];

let room = "";
let me = "";
let state = null;


/* TABLERO */

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


/* PREGUNTAS */

const prompts = {

  EMPEZAR: [
    "EMPEZAR",
    "¿Qué deberíamos comenzar a hacer como equipo?"
  ],

  PARAR: [
    "PARAR",
    "¿Qué deberíamos dejar de hacer?"
  ],

  CONTINUAR: [
    "CONTINUAR",
    "¿Qué funcionó bien y deberíamos continuar haciendo?"
  ],

  KUDOS: [
    "KUDOS",
    "Reconoce algo concreto que hizo bien otra persona del equipo."
  ]

};


const surprises = [

  [
    "🐞 BUG INESPERADO",
    "¿Qué fue lo más inesperado que ocurrió durante este Sprint?"
  ],

  [
    "👾 JEFE FINAL",
    "¿Cuál fue el mayor obstáculo del Sprint?"
  ],

  [
    "⚡ POWER-UP",
    "¿Qué hizo que el trabajo fluyera mejor?"
  ],

  [
    "↩️ CTRL + Z",
    "Si pudieras deshacer una decisión del Sprint, ¿cuál sería?"
  ],

  [
    "🔐 NIVEL SECRETO",
    "¿Qué aprendizaje obtuvimos que no esperábamos?"
  ],

  [
    "🔥 MODO DIFÍCIL",
    "¿Qué fue más complicado de lo esperado?"
  ],

  [
    "🎁 BONUS",
    "¿Qué salió bien y casi nadie reconoció?"
  ],

  [
    "🧩 DEUDA TÉCNICA",
    "¿Qué estamos posponiendo y deberíamos atender?"
  ],

  [
    "🧭 CAMBIO DE RUMBO",
    "¿Qué haríamos diferente si repitiéramos este Sprint?"
  ],

  [
    "🎲 SUERTE",
    "¿Qué momento del Sprint te gustaría destacar?"
  ]

];


/* UTILIDADES */

function generateCode() {

  return Math.random()
    .toString(36)
    .slice(2, 7)
    .toUpperCase();

}


function toast(text) {

  $("toast").textContent = text;

  $("toast").style.display =
    "block";

  setTimeout(() => {

    $("toast").style.display =
      "none";

  }, 2500);

}


function show(id) {

  [
    "home",
    "lobby",
    "game"
  ].forEach(screen => {

    $(screen)
      .classList
      .add("hidden");

  });


  $(id)
    .classList
    .remove("hidden");

}


function amIHost() {

  return (
    state &&
    state.host === me
  );

}


function sortedPlayers() {

  return Object
    .entries(
      state?.players || {}
    )
    .sort(
      (a, b) =>
        a[1].order -
        b[1].order
    );

}


/* CREAR SALA */

async function createRoom() {

  const name =
    $("hostName")
      .value
      .trim();


  if (!name) {

    toast(
      "Escribe tu nombre"
    );

    return;

  }


  room =
    generateCode();

  me =
    crypto.randomUUID();


  await set(
    ref(
      db,
      "rooms/" + room
    ),
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

      round: null

    }
  );


  localStorage.setItem(
    "sp_me",
    me
  );


  listen();

  show("lobby");

}


/* UNIRSE */

async function joinRoom() {

  const name =
    $("joinName")
      .value
      .trim();


  const enteredCode =
    $("roomCode")
      .value
      .trim()
      .toUpperCase();


  if (
    !name ||
    !enteredCode
  ) {

    toast(
      "Completa nombre y código"
    );

    return;

  }


  const snapshot =
    await get(
      ref(
        db,
        "rooms/" + enteredCode
      )
    );


  if (!snapshot.exists()) {

    toast(
      "Sala no encontrada"
    );

    return;

  }


  const data =
    snapshot.val();


  const players =
    Object.values(
      data.players || {}
    );


  if (
    players.length >= 5
  ) {

    toast(
      "La sala ya está llena"
    );

    return;

  }


  if (
    data.status !== "lobby"
  ) {

    toast(
      "La partida ya comenzó"
    );

    return;

  }


  room =
    enteredCode;


  me =
    crypto.randomUUID();


  const usedOrders =
    players.map(
      player =>
        player.order
    );


  const order =
    [0, 1, 2, 3, 4]
      .find(
        number =>
          !usedOrders.includes(
            number
          )
      );


  await set(
    ref(
      db,
      `rooms/${room}/players/${me}`
    ),
    {

      name,

      color:
        colors[order],

      pos: 0,

      order

    }
  );


  localStorage.setItem(
    "sp_me",
    me
  );


  listen();

  show("lobby");

}


/* FIREBASE EN TIEMPO REAL */

function listen() {

  onValue(
    ref(
      db,
      "rooms/" + room
    ),

    snapshot => {

      if (
        !snapshot.exists()
      ) {

        toast(
          "La sala ya no existe"
        );

        return;

      }


      state =
        snapshot.val();


      render();

    }
  );

}


/* RENDER */

function render() {

  if (!state) {

    return;

  }


  const players =
    sortedPlayers();


  $("lobbyCode")
    .textContent =
      room;


  $("count")
    .textContent =
      `${players.length}/5 jugadores`;


  $("lobbyPlayers")
    .innerHTML =

      players
        .map(
          ([id, player]) => `

            <div class="lobbyPlayer">

              <span
                class="token"
                style="
                  background:
                  ${player.color}
                "
              ></span>

              <b>
                ${escapeHTML(
                  player.name
                )}
              </b>

              ${
                id === state.host
                  ? " 👑"
                  : ""
              }

            </div>

          `
        )
        .join("");


  /*
    MUY IMPORTANTE:

    NO TOCAMOS startBtn AQUÍ.

    EL BOTÓN PERMANECE VISIBLE.
  */


  if (
    state.status === "game"
  ) {

    show("game");

    drawBoard();

    renderPlayers();

    renderRound();

  }

}


/* INICIAR JUEGO */

async function startGame() {

  if (!state) {

    toast(
      "La sala todavía está cargando"
    );

    return;

  }


  if (!amIHost()) {

    toast(
      "Solo el anfitrión puede iniciar"
    );

    return;

  }


  const players =
    sortedPlayers();


  if (
    players.length < 2
  ) {

    toast(
      "Se necesitan al menos 2 jugadores"
    );

    return;

  }


  if (
    players.length > 5
  ) {

    toast(
      "Máximo 5 jugadores"
    );

    return;

  }


  await update(
    ref(
      db,
      "rooms/" + room
    ),
    {

      status: "game",

      turn: 0,

      round: null

    }
  );

}


/* DIBUJAR TABLERO */

function drawBoard() {

  const board =
    $("board");


  board
    .querySelectorAll(
      ".space,.piece"
    )
    .forEach(
      element =>
        element.remove()
    );


  const coords = [];


  for (
    let column = 1;
    column <= 8;
    column++
  ) {

    coords.push(
      [1, column]
    );

  }


  for (
    let row = 2;
    row <= 6;
    row++
  ) {

    coords.push(
      [row, 8]
    );

  }


  for (
    let column = 7;
    column >= 1;
    column--
  ) {

    coords.push(
      [6, column]
    );

  }


  for (
    let row = 5;
    row >= 2;
    row--
  ) {

    coords.push(
      [row, 1]
    );

  }


  spaces.forEach(
    (space, index) => {

      const element =
        document.createElement(
          "div"
        );


      element.className =
        "space";


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


      board.appendChild(
        element
      );

    }
  );


  sortedPlayers()
    .forEach(
      ([id, player], index) => {

        const position =
          coords[
            player.pos %
            spaces.length
          ];


        const piece =
          document.createElement(
            "div"
          );


        piece.className =
          "piece";


        piece.style.background =
          player.color;


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
            Math.floor(
              index / 2
            ) * 24
          }px`;


        board.appendChild(
          piece
        );

      }
    );

}


/* PANEL DE JUGADORES */

function renderPlayers() {

  const players =
    sortedPlayers();


  if (
    !players.length
  ) {

    return;

  }


  const current =
    players[
      state.turn %
      players.length
    ];


  $("players")
    .innerHTML =

      players
        .map(
          ([id, player], index) => `

            <div
              class="
                player
                ${
                  index ===
                  state.turn %
                  players.length
                    ? "active"
                    : ""
                }
              "
            >

              <span
                class="token"
                style="
                  background:
                  ${player.color}
                "
              ></span>

              <div>

                <b>
                  ${escapeHTML(
                    player.name
                  )}
                </b>

                <br>

                <small>
                  Casilla
                  ${player.pos}
                  ·
                  ${spaces[player.pos][0]}
                </small>

              </div>

            </div>

          `
        )
        .join("");


  $("turnText")
    .textContent =

      current

        ? `Turno de ${current[1].name}`

        : "";


  $("rollBtn")
    .disabled =

      !current ||

      current[0] !== me ||

      !!state.round;


  document
    .querySelectorAll(
      ".hostOnly"
    )
    .forEach(
      element => {

        element.style.display =
          amIHost()
            ? "block"
            : "none";

      }
    );

}


/* TIRAR DADO */

async function roll() {

  const players =
    sortedPlayers();


  if (
    !players.length
  ) {

    return;

  }


  const current =
    players[
      state.turn %
      players.length
    ];


  if (
    !current ||
    current[0] !== me ||
    state.round
  ) {

    return;

  }


  $("rollBtn").disabled =
    true;


  const number =
    1 +
    Math.floor(
      Math.random() * 6
    );


  $("die").textContent =

    [
      "⚀",
      "⚁",
      "⚂",
      "⚃",
      "⚄",
      "⚅"
    ][number - 1];


  const newPosition =

    (
      current[1].pos +
      number
    ) %

    spaces.length;


  const type =
    spaces[newPosition][0];


  await update(
    ref(
      db,
      `rooms/${room}/players/${me}`
    ),
    {

      pos:
        newPosition

    }
  );


  if (
    type === "OTRA VEZ"
  ) {

    toast(
      `${current[1].name} tira otra vez`
    );

    return;

  }


  if (
    type === "SALIDA"
  ) {

    await nextTurn();

    return;

  }


  let question;


  if (
    type === "SORPRESA"
  ) {

    question =

      surprises[
        Math.floor(
          Math.random() *
          surprises.length
        )
      ];

  } else {

    question =
      prompts[type];

  }


  if (!question) {

    await nextTurn();

    return;

  }


  await set(
    ref(
      db,
      `rooms/${room}/round`
    ),
    {

      type,

      title:
        question[0],

      question:
        question[1],

      answers: {},

      roller: me

    }
  );

}


/* MOSTRAR PREGUNTA */

function renderRound() {

  if (
    !state.round
  ) {

    $("promptModal")
      .classList
      .add("hidden");

    return;

  }


  const round =
    state.round;


  $("promptModal")
    .classList
    .remove("hidden");


  $("promptTitle")
    .textContent =
      round.title;


  $("promptQuestion")
    .textContent =
      round.question;


  const answers =
    round.answers || {};


  const myAnswer =
    answers[me];


  $("answer")
    .classList
    .toggle(
      "hidden",
      !!myAnswer
    );


  $("submitAnswer")
    .classList
    .toggle(
      "hidden",
      !!myAnswer
    );


  const players =
    sortedPlayers();


  $("answerStatus")
    .textContent =

      `${
        Object.keys(
          answers
        ).length
      }/${players.length} respuestas recibidas`;


  const allAnswered =

    Object.keys(
      answers
    ).length ===

    players.length;


  $("revealed")
    .classList
    .toggle(
      "hidden",
      !allAnswered
    );


  $("continueBtn")
    .classList
    .toggle(
      "hidden",
      !(
        allAnswered &&
        amIHost()
      )
    );


  if (
    allAnswered
  ) {

    $("revealed")
      .innerHTML =

        players
          .map(
            ([id, player]) => `

              <div
                class="answerCard"
                style="
                  border-color:
                  ${player.color}
                "
              >

                <b>
                  ${escapeHTML(
                    player.name
                  )}
                </b>

                <br>

                ${escapeHTML(
                  answers[id] || ""
                )}

              </div>

            `
          )
          .join("");

  }

}


/* ENVIAR RESPUESTA */

async function submitAnswer() {

  const value =
    $("answer")
      .value
      .trim();


  if (!value) {

    toast(
      "Escribe una respuesta"
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


  $("answer").value =
    "";

}


/* SIGUIENTE TURNO */

async function nextTurn() {

  const players =
    sortedPlayers();


  if (
    !players.length
  ) {

    return;

  }


  const next =

    (
      state.turn + 1
    ) %

    players.length;


  await update(
    ref(
      db,
      "rooms/" + room
    ),
    {

      turn:
        next,

      round:
        null

    }
  );

}


/* CONTINUAR */

async function continueRound() {

  if (
    !amIHost()
  ) {

    toast(
      "Solo el anfitrión puede continuar"
    );

    return;

  }


  const round =
    state.round;


  if (!round) {

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


/* REINICIAR */

async function resetGame() {

  if (
    !amIHost()
  ) {

    toast(
      "Solo el anfitrión puede reiniciar"
    );

    return;

  }


  if (
    !confirm(
      "¿Reiniciar posiciones y respuestas?"
    )
  ) {

    return;

  }


  const updates = {

    turn: 0,

    round: null,

    history: null

  };


  sortedPlayers()
    .forEach(
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

}


/* RESUMEN */

function showSummary() {

  $("summaryModal")
    .classList
    .remove("hidden");


  const history =
    state.history || {};


  const groups = {

    EMPEZAR: [],

    PARAR: [],

    CONTINUAR: [],

    KUDOS: [],

    SORPRESA: []

  };


  Object
    .values(history)
    .forEach(
      round => {

        const group =
          groups[round.type] ||
          groups.SORPRESA;


        Object
          .values(
            round.answers || {}
          )
          .forEach(
            answer => {

              group.push(
                answer
              );

            }
          );

      }
    );


  $("summaryContent")
    .innerHTML =

      Object
        .entries(groups)

        .map(
          ([type, answers]) => `

            <div class="section">

              <h3>
                ${type}
              </h3>

              ${
                answers.length

                  ?

                  answers
                    .map(
                      answer => `

                        <div class="answerCard">

                          ${escapeHTML(
                            answer
                          )}

                        </div>

                      `
                    )
                    .join("")

                  :

                  `

                    <p class="muted">
                      Sin respuestas todavía.
                    </p>

                  `
              }

            </div>

          `
        )

        .join("");

}


/* ESCAPAR TEXTO */

function escapeHTML(value) {

  return String(
    value ?? ""
  )
    .replace(
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


/* BOTONES */

$("createBtn")
  .onclick =
    createRoom;


$("joinBtn")
  .onclick =
    joinRoom;


$("startBtn")
  .onclick =
    startGame;


$("rollBtn")
  .onclick =
    roll;


$("submitAnswer")
  .onclick =
    submitAnswer;


$("continueBtn")
  .onclick =
    continueRound;


$("resetBtn")
  .onclick =
    resetGame;


$("summaryBtn")
  .onclick =
    showSummary;


$("closeSummary")
  .onclick =
    () => {

      $("summaryModal")
        .classList
        .add("hidden");

    };