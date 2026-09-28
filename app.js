/* =====================================================
   DESCARGAR RESUMEN EN PDF
===================================================== */

function downloadSummaryPDF() {

  /*
    Comprobamos que jsPDF
    haya cargado correctamente.
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


  /*
    Creamos el documento.
  */

  const doc =
    new jsPDF({

      orientation:
        "portrait",

      unit:
        "mm",

      format:
        "a4"

    });


  /*
    Datos básicos.
  */

  const players =
    sortedPlayers();


  const history =
    state?.history || {};


  const rounds =
    Object.values(
      history
    );


  /*
    Márgenes.
  */

  const marginLeft =
    18;


  const marginRight =
    18;


  const pageWidth =
    210;


  const pageHeight =
    297;


  const usableWidth =

    pageWidth -

    marginLeft -

    marginRight;


  let y =
    20;


  /* =================================================
     FUNCIÓN PARA CREAR PÁGINA NUEVA
  ================================================= */

  function checkPage(
    requiredSpace = 15
  ) {

    if (
      y + requiredSpace >
      pageHeight - 18
    ) {

      doc.addPage();

      y =
        20;

    }

  }


  /* =================================================
     TÍTULO
  ================================================= */

  doc.setFont(
    "helvetica",
    "bold"
  );


  doc.setFontSize(
    24
  );


  doc.text(
    "SPRINTOPOLY",
    pageWidth / 2,
    y,
    {
      align:
        "center"
    }
  );


  y +=
    9;


  doc.setFont(
    "helvetica",
    "normal"
  );


  doc.setFontSize(
    14
  );


  doc.text(
    "Resumen de la retrospectiva",
    pageWidth / 2,
    y,
    {
      align:
        "center"
    }
  );


  y +=
    12;


  /* =================================================
     FECHA
  ================================================= */

  const today =
    new Date();


  const formattedDate =
    today.toLocaleDateString(
      "es-CR",
      {
        year:
          "numeric",

        month:
          "long",

        day:
          "numeric"
      }
    );


  doc.setFontSize(
    10
  );


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


  y +=
    6;


  doc.text(
    `Sala: ${room}`,
    marginLeft,
    y
  );


  y +=
    6;


  /*
    Lista de participantes.
  */

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
     SI TODAVÍA NO HAY RONDAS
  ================================================= */

  if (
    rounds.length === 0
  ) {

    doc.setFontSize(
      12
    );


    doc.text(
      "Todavía no hay respuestas guardadas en esta retrospectiva.",
      marginLeft,
      y
    );


    doc.save(
      `Sprintopoly_${room}_Resumen.pdf`
    );


    return;

  }


  /* =================================================
     AGRUPAR RONDAS
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
            round.type ===
            category
        );


      /*
        Si no hubo ninguna pregunta
        de esa categoría, no la ponemos.
      */

      if (
        categoryRounds.length === 0
      ) {

        return;

      }


      checkPage(
        25
      );


      /* =============================================
         NOMBRE DE CATEGORÍA
      ============================================== */

      y +=
        5;


      doc.setFont(
        "helvetica",
        "bold"
      );


      doc.setFontSize(
        16
      );


      doc.text(
        category,
        marginLeft,
        y
      );


      y +=
        8;


      /*
        Línea debajo del título.
      */

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
         CADA PREGUNTA
      ============================================== */

      categoryRounds.forEach(
        (round, roundIndex) => {

          checkPage(
            30
          );


          /*
            Título especial de la tarjeta.
          */

          doc.setFont(
            "helvetica",
            "bold"
          );


          doc.setFontSize(
            12
          );


          /*
            Algunos emojis no son soportados
            por las fuentes estándar de PDF.

            Por eso usamos principalmente
            el texto de la pregunta.
          */

          const cleanTitle =

            String(
              round.title || category
            )
              .replace(
                /[^\x00-\x7FÀ-ÿ¿¡]/g,
                ""
              )
              .trim();


          doc.text(
            cleanTitle ||
            category,
            marginLeft,
            y
          );


          y +=
            6;


          /* =========================================
             PREGUNTA
          ========================================== */

          doc.setFont(
            "helvetica",
            "normal"
          );


          doc.setFontSize(
            11
          );


          const questionLines =

            doc.splitTextToSize(
              round.question || "",
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
             RESPUESTAS DE LOS JUGADORES
          ========================================== */

          const answers =
            round.answers || {};


          players.forEach(
            ([playerId, player]) => {

              const answer =
                answers[playerId];


              /*
                Si por alguna razón el jugador
                no respondió esa ronda,
                simplemente lo omitimos.
              */

              if (!answer) {

                return;

              }


              const answerText =

                `${player.name}: ${answer}`;


              const answerLines =

                doc.splitTextToSize(
                  answerText,
                  usableWidth - 8
                );


              const neededSpace =

                answerLines.length *
                5 +

                7;


              checkPage(
                neededSpace
              );


              /*
                Nombre del jugador.
              */

              doc.setFont(
                "helvetica",
                "bold"
              );


              doc.setFontSize(
                10
              );


              doc.text(
                `${player.name}:`,
                marginLeft + 5,
                y
              );


              /*
                Respuesta.
              */

              y +=
                5;


              doc.setFont(
                "helvetica",
                "normal"
              );


              const responseLines =

                doc.splitTextToSize(
                  String(answer),
                  usableWidth - 10
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


          /*
            Separación entre preguntas.
          */

          y +=
            4;


          if (
            roundIndex <
            categoryRounds.length - 1
          ) {

            checkPage(
              8
            );


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


            y +=
              7;

          }

        }

      );


      y +=
        5;

    }

  );


  /* =================================================
     PIE FINAL
  ================================================= */

  checkPage(
    20
  );


  y +=
    5;


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


  y +=
    8;


  doc.setFont(
    "helvetica",
    "italic"
  );


  doc.setFontSize(
    9
  );


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
      align:
        "center"
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

    doc.setPage(
      page
    );


    doc.setFont(
      "helvetica",
      "normal"
    );


    doc.setFontSize(
      8
    );


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
        align:
          "center"
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
   BOTÓN PDF
===================================================== */

$("downloadPdfBtn").onclick =
  downloadSummaryPDF;