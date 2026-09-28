import {
  initializeApp
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js";

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

  apiKey:
    "AIzaSyDoo5RbGkMXhMIiursEXhj7jG8tN_QkmrE",

  authDomain:
    "sprintopoly-74ccd.firebaseapp.com",

  databaseURL:
    "https://sprintopoly-74ccd-default-rtdb.firebaseio.com",

  projectId:
    "sprintopoly-74ccd",

  storageBucket:
    "sprintopoly-74ccd.firebasestorage.app",

  messagingSenderId:
    "235505202765",

  appId:
    "1:235505202765:web:f676ec5d971b020c3d4e04"

};


const app =
  initializeApp(
    firebaseConfig
  );

const db =
  getDatabase(app);


/* =====================================================
   VARIABLES
===================================================== */

const $ =
  id =>
    document.getElementById(id);


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


/*
  Estas variables sirven únicamente
  para las animaciones visuales.
*/

let animationRunning =
  false;

let activeAnimationId =
  null;

let visualPositions =
  {};


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

  return new Promise(

    resolve =>
      setTimeout(
        resolve,
        ms
      )

  );

}


function toast(text) {

  $("toast").textContent =
    text;


  $("toast").style.display =
    "block";


  setTimeout(
    () => {

      $("toast").style.display =
        "none";

    },

    2500

  );

}


function show(id) {

  [

    "home",

    "lobby",

    "game"

  ].forEach(

    screen => {

      $(screen)

        .classList

        .add("hidden");

    }

  );


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


/* =====================================================
   ESCAPAR TEXTO
===================================================== */

function escapeHTML(value) {

  return String(

    value ?? ""

  ).replace(

    /[&<>"']/g,

    character => ({

      "&":
        "&amp;",

      "<":
        "&lt;",

      ">":
        "&gt;",

      '"':
        "&quot;",

      "'":
        "&#039;"

    })[character]

  );

}


/* =====================================================
   CREAR SALA
===================================================== */

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

      host:
        me,

      status:
        "lobby",

      turn:
        0,

      players: {

        [me]: {

          name,

          color:
            colors[0],

          pos:
            0,

          order:
            0

        }

      },

      round:
        null,

      animation:
        null

    }

  );


  localStorage.setItem(

    "sp_me",

    me

  );


  listen();


  show(
    "lobby"
  );

}


/* =====================================================
   UNIRSE
===================================================== */

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

        "rooms/" +
        enteredCode

      )

    );


  if (

    !snapshot.exists()

  ) {

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

    data.status !==
    "lobby"

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

      pos:
        0,

      order

    }

  );


  localStorage.setItem(

    "sp_me",

    me

  );


  listen();


  show(
    "lobby"
  );

}


/* =====================================================
   FIREBASE EN TIEMPO REAL
===================================================== */

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


      /*
        Si Firebase anuncia una animación
        que esta computadora todavía no
        ha reproducido, la ejecutamos.
      */

      if (

        state.animation &&

        state.animation.id !==
        activeAnimationId

      ) {

        runSharedAnimation(

          state.animation

        );

      }

    }

  );

}


/* =====================================================
   RENDER
===================================================== */

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
    NO ocultamos el botón de comenzar.
    Siempre está visible.
    La validación ocurre al hacer clic.
  */


  if (

    state.status ===
    "game"

  ) {

    show(
      "game"
    );


    drawBoard();


    renderPlayers();


    /*
      Durante el movimiento NO mostramos
      todavía la pregunta.
    */

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

    toast(

      "La sala todavía está cargando"

    );

    return;

  }


  if (

    !amIHost()

  ) {

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

      status:
        "game",

      turn:
        0,

      round:
        null,

      animation:
        null

    }

  );

}


/* =====================================================
   COORDENADAS DEL TABLERO
===================================================== */

function boardCoords() {

  const coords =
    [];


  /*
    PARTE SUPERIOR
  */

  for (

    let column = 1;

    column <= 8;

    column++

  ) {

    coords.push(

      [1, column]

    );

  }


  /*
    LADO DERECHO
  */

  for (

    let row = 2;

    row <= 6;

    row++

  ) {

    coords.push(

      [row, 8]

    );

  }


  /*
    PARTE INFERIOR
  */

  for (

    let column = 7;

    column >= 1;

    column--

  ) {

    coords.push(

      [6, column]

    );

  }


  /*
    LADO IZQUIERDO
  */

  for (

    let row = 5;

    row >= 2;

    row--

  ) {

    coords.push(

      [row, 1]

    );

  }


  return coords;

}


/* =====================================================
   DIBUJAR TABLERO
===================================================== */

function drawBoard() {

  const board =
    $("board");


  const coords =
    boardCoords();


  board

    .querySelectorAll(

      ".space,.piece"

    )

    .forEach(

      element =>
        element.remove()

    );


  /*
    CASILLAS
  */

  spaces.forEach(

    (space, index) => {

      const element =

        document.createElement(

          "div"

        );


      element.className =
        "space";


      element.dataset.spaceIndex =
        index;


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


  /*
    FICHAS
  */

  sortedPlayers()

    .forEach(

      ([id, player], index) => {

        /*
          Durante una animación usamos
          visualPositions.

          Fuera de ella usamos la posición
          real guardada en Firebase.
        */

        const shownPosition =

          visualPositions[id] ??

          player.pos;


        const position =

          coords[

            shownPosition %

            spaces.length

          ];


        const piece =

          document.createElement(

            "div"

          );


        piece.className =
          "piece";


        piece.id =
          `piece-${id}`;


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


/* =====================================================
   PANEL DE JUGADORES
===================================================== */

function renderPlayers() {

  const players =

    sortedPlayers();


  if (

    !players.length

  ) {

    return;

  }


  const turnIndex =

    state.turn %

    players.length;


  const current =

    players[turnIndex];


  $("players")

    .innerHTML =

      players

        .map(

          ([id, player], index) => {


            const shownPosition =

              visualPositions[id] ??

              player.pos;


            return `

              <div
                class="
                  player

                  ${
                    index ===
                    turnIndex

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

                    ${shownPosition}

                    ·

                    ${
                      spaces[
                        shownPosition
                      ][0]
                    }

                  </small>

                </div>

              </div>

            `;

          }

        )

        .join("");


  $("turnText")

    .textContent =

      current

        ? `Turno de ${current[1].name}`

        : "";


  /*
    EL DADO SE BLOQUEA:

    - si se está animando
    - si Firebase tiene una animación
    - si no es nuestro turno
    - si hay una pregunta activa
  */

  $("rollBtn")

    .disabled =

      animationRunning ||

      !!state.animation ||

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


/* =====================================================
   TIRAR DADO
===================================================== */

async function roll() {

  const players =

    sortedPlayers();


  if (

    !players.length ||

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


  /*
    Evita doble clic.
  */

  $("rollBtn").disabled =
    true;


  /*
    Generamos el resultado.
  */

  const number =

    1 +

    Math.floor(

      Math.random() * 6

    );


  const from =

    current[1].pos;


  const to =

    (

      from +

      number

    ) %

    spaces.length;


  /*
    En lugar de mover la ficha inmediatamente,
    guardamos una "orden de animación" en Firebase.

    Así TODAS las computadoras pueden ver
    exactamente el mismo lanzamiento.
  */

  const animation = {

    id:

      `${Date.now()}-${me}`,

    roller:
      me,

    from,

    to,

    roll:
      number

  };


  await set(

    ref(

      db,

      `rooms/${room}/animation`

    ),

    animation

  );

}


/* =====================================================
   ANIMACIÓN DEL DADO + FICHA
===================================================== */

async function runSharedAnimation(

  animation

) {

  /*
    No reproducimos dos veces
    la misma animación.
  */

  if (

    !animation ||

    animation.id ===
    activeAnimationId

  ) {

    return;

  }


  activeAnimationId =
    animation.id;


  animationRunning =
    true;


  /*
    IMPORTANTE:

    Cerramos el modal durante
    toda la animación.
  */

  $("promptModal")

    .classList

    .add("hidden");


  $("rollBtn").disabled =
    true;


  const players =

    sortedPlayers();


  const rollerPlayer =

    players.find(

      ([id]) =>

        id ===
        animation.roller

    );


  const rollerName =

    rollerPlayer

      ? rollerPlayer[1].name

      : "Jugador";


  /* =========================
     ANIMAR DADO
  ========================== */

  $("diceMessage")

    .textContent =

      `${rollerName} está tirando...`;


  const die =
    $("die");


  die.classList.add(

    "rolling"

  );


  /*
    Cambiamos rápidamente las caras
    para que parezca que está rodando.
  */

  for (

    let i = 0;

    i < 12;

    i++

  ) {

    die.textContent =

      diceFaces[

        Math.floor(

          Math.random() * 6

        )

      ];


    await sleep(

      75

    );

  }


  /*
    Terminó de rodar.
  */

  die.classList.remove(

    "rolling"

  );


  die.textContent =

    diceFaces[

      animation.roll - 1

    ];


  $("diceMessage")

    .textContent =

      `${rollerName} sacó ${animation.roll}`;


  /*
    Pausita para que todos
    alcancen a ver el resultado.
  */

  await sleep(

    500

  );


  /* =========================
     MOVER FICHA
  ========================== */

  let currentPosition =

    animation.from;


  for (

    let step = 1;

    step <= animation.roll;

    step++

  ) {

    /*
      Avanzamos UNA casilla.
    */

    currentPosition =

      (

        currentPosition +

        1

      ) %

      spaces.length;


    /*
      Posición visual temporal.
    */

    visualPositions[
      animation.roller
    ] =

      currentPosition;


    /*
      Redibujamos.
    */

    drawBoard();


    renderPlayers();


    /*
      Encontramos la ficha
      que está caminando.
    */

    const piece =

      document.getElementById(

        `piece-${animation.roller}`

      );


    if (piece) {

      piece.classList.remove(

        "moving"

      );


      /*
        Fuerza al navegador a reiniciar
        la animación CSS.
      */

      void piece.offsetWidth;


      piece.classList.add(

        "moving"

      );

    }


    $("diceMessage")

      .textContent =

        `${rollerName} avanza ${step}/${animation.roll}`;


    /*
      Velocidad entre casillas.
    */

    await sleep(

      400

    );

  }


  /* =========================
     LLEGÓ A LA CASILLA
  ========================== */

  const finalSpace =

    document.querySelector(

      `.space[data-space-index="${animation.to}"]`

    );


  if (finalSpace) {

    finalSpace.classList.add(

      "landed"

    );

  }


  $("diceMessage")

    .textContent =

      `${rollerName} cayó en ${spaces[animation.to][0]}`;


  /*
    Dejamos ver dónde cayó
    ANTES de abrir la pregunta.
  */

  await sleep(

    850

  );


  delete visualPositions[

    animation.roller

  ];


  /*
    MUY IMPORTANTE:

    Solamente la computadora del jugador
    que lanzó el dado escribe el resultado
    final en Firebase.

    Las demás computadoras solamente
    reprodujeron la animación.
  */

  if (

    animation.roller ===
    me

  ) {

    await finishRoll(

      animation

    );

  }


  animationRunning =
    false;


  /*
    Esperamos un instante a que Firebase
    termine de propagar el nuevo estado.
  */

  await sleep(

    120

  );


  if (state) {

    drawBoard();


    renderPlayers();


    renderRound();

  }

}


/* =====================================================
   FINALIZAR JUGADA
===================================================== */

async function finishRoll(

  animation

) {

  const type =

    spaces[

      animation.to

    ][0];


  /*
    Ahora sí guardamos la posición
    definitiva del jugador.
  */

  await update(

    ref(

      db,

      `rooms/${room}/players/${animation.roller}`

    ),

    {

      pos:
        animation.to

    }

  );


  /* =========================
     OTRA VEZ
  ========================== */

  if (

    type ===
    "OTRA VEZ"

  ) {

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


  /* =========================
     SALIDA
  ========================== */

  if (

    type ===
    "SALIDA"

  ) {

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


  /* =========================
     BUSCAR PREGUNTA
  ========================== */

  let question;


  if (

    type ===
    "SORPRESA"

  ) {

    question =

      surprises[

        Math.floor(

          Math.random() *

          surprises.length

        )

      ];

  }

  else {

    question =

      prompts[type];

  }


  if (

    !question

  ) {

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


  /*
    AQUÍ ESTÁ EL CAMBIO IMPORTANTE.

    La pregunta se crea SOLAMENTE
    cuando toda la animación terminó.

    Por eso ahora ocurre:

    DADO
       ↓
    MOVIMIENTO
       ↓
    LLEGADA
       ↓
    PREGUNTA
  */

  await update(

    ref(

      db,

      "rooms/" + room

    ),

    {

      animation:
        null,


      round: {

        type,

        title:
          question[0],

        question:
          question[1],

        answers:
          {},

        roller:
          animation.roller

      }

    }

  );

}


/* =====================================================
   MOSTRAR PREGUNTA
===================================================== */

function renderRound() {

  /*
    JAMÁS mostrar la pregunta
    mientras se mueve la ficha.
  */

  if (

    animationRunning ||

    state?.animation

  ) {

    $("promptModal")

      .classList

      .add("hidden");


    return;

  }


  if (

    !state?.round

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


  /*
    Si ya respondí, ocultamos
    textarea y botón.
  */

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


  const received =

    Object.keys(

      answers

    ).length;


  $("answerStatus")

    .textContent =

      `${received}/${players.length} respuestas recibidas` +

      (

        myAnswer &&

        received < players.length

          ? " · ✓ Tu respuesta fue enviada"

          : ""

      );


  const allAnswered =

    received ===

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


  /*
    Revelamos solamente cuando
    TODOS respondieron.
  */

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

  else {

    $("revealed")

      .innerHTML =
        "";

  }

}


/* =====================================================
   ENVIAR RESPUESTA
===================================================== */

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


  if (

    !state?.round

  ) {

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


  $("answer").value =
    "";

}


/* =====================================================
   SIGUIENTE TURNO
===================================================== */

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

      state.turn +

      1

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
        null,

      animation:
        null

    }

  );

}


/* =====================================================
   CONTINUAR
===================================================== */

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

    state?.round;


  if (!round) {

    return;

  }


  const players =

    sortedPlayers();


  const answers =

    round.answers || {};


  /*
    Seguridad extra:
    no avanzar si todavía falta alguien.
  */

  if (

    Object.keys(

      answers

    ).length !==

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


  animationRunning =
    false;


  activeAnimationId =
    null;


  visualPositions =
    {};


  const updates = {

    turn:
      0,

    round:
      null,

    history:
      null,

    animation:
      null

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


  $("die").textContent =
    "⚄";


  $("diceMessage").textContent =
    "¡Tira el dado!";

}


/* =====================================================
   RESUMEN
===================================================== */

function showSummary() {

  $("summaryModal")

    .classList

    .remove("hidden");


  const history =

    state?.history || {};


  const groups = {

    EMPEZAR:
      [],

    PARAR:
      [],

    CONTINUAR:
      [],

    KUDOS:
      [],

    SORPRESA:
      []

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


/* =====================================================
   BOTONES
===================================================== */

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