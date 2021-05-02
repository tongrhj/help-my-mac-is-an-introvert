(async () => {
  const FOCUS_COUNTDOWN_ID = "focusCountdown";
  const BREAK_COUNTDOWN_ID = "breakCountdown";
  let focusCountdown = document.getElementById(FOCUS_COUNTDOWN_ID);
  let breakCountdown = document.getElementById(BREAK_COUNTDOWN_ID);
  let breakModal = document.getElementById("breakModal");
  let currentRounds = []; // Array<ReturnType<typeof setTimeout>>

  const setTimer = (duration /* string */, id /* string */) => {
    switch (id) {
      case FOCUS_COUNTDOWN_ID: {
        focusCountdown.textContent = duration;
        break;
      }
      case BREAK_COUNTDOWN_ID: {
        breakCountdown.textContent = duration;
        break;
      }
    }
  };

  const breakCountdownManager = {
    openModal: () => {
      breakModal.classList.remove("hidden");
      window.electron.send("FULLSCREEN_BREAK");
    },
    closeModal: () => {
      breakModal.classList.add("hidden");
      window.electron.send("CLOSE_BREAK");
    },
  };

  const showBreakNotification = () => {
    console.log("Show break notification");
    new window.Notification("It's time for a break", {
      body: "Your break time is about to start",
    });
  };

  const startFocusRound /* number */ = () => {
    const roundDuration = 20 * 60 * 1000;
    setTimer("20:00", FOCUS_COUNTDOWN_ID);
    console.log("Start focus round");

    currentRounds = [
      setTimeout(() => {
        console.log("Break notification timeout");
        showBreakNotification();
      }, roundDuration - 10 * 1000),
      setTimeout(() => {
        if (currentRounds) {
          for (const round of currentRounds) {
            clearTimeout(round);
          }
        }

        console.log("Focus Round timeout");
        currentRounds = [startBreakRound()];
      }, roundDuration),
    ];
  };

  const startBreakRound /* number */ = () => {
    setTimer("00:20", BREAK_COUNTDOWN_ID);
    breakCountdownManager.openModal();
    console.log("Start break round");

    currentRounds = [
      setTimeout(() => {
        if (currentRounds) {
          for (const round of currentRounds) {
            clearTimeout(round);
          }
        }

        console.log("Closing break modal");
        breakCountdownManager.closeModal();

        console.log("Break Round timeout");
        currentRounds = [startFocusRound()];
      }, 21 * 1000),
    ];
  };

  /**
   * TODO:
   * - Snooze current round for x duration(s)
   * - Trigger next round immediately
   * - No UI, no dock, just tray menu
   * - Update countdown time remaining in tray menu
   **/

  console.log("Initialize with focus round");
  startFocusRound();
})();
