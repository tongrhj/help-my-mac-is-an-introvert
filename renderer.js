(async () => {
  let currentRounds = []; // Array<ReturnType<typeof setTimeout>>

  const breakCountdownManager = {
    openModal: () => {
      window.electron.send("FULLSCREEN_BREAK");
    },
    closeModal: () => {
      window.electron.send("CLOSE_BREAK");
    },
  };

  const showBreakNotification = () => {
    console.log("Show break notification");
    window.electron.send("NOTIFY_BREAK_STARTING");
  };

  const doneSound = new Audio("./assets/ping.wav");

  const startFocusRound /* number */ = () => {
    const roundDuration = 20 * 60 * 1000;
    console.log("Start focus round");

    currentRounds = [
      setTimeout(() => {
        console.log("Break notification timeout");
        showBreakNotification();
      }, roundDuration - 10 * 1000),
      setTimeout(() => {
        if (currentRounds && currentRounds.length) {
          console.log(currentRounds);
          for (const round of currentRounds) {
            clearTimeout(round);
          }
        }

        console.log("Focus Round timeout");
        startBreakRound();
      }, roundDuration),
    ];
    console.log(currentRounds);
  };

  const startSnoozeRound = (minutes /*: number */) => {
    const roundDuration = minutes * 60 * 1000;
    console.log("Start snooze round");
    if (currentRounds && currentRounds.length) {
      console.log("Halting all existing rounds");
      console.log(currentRounds);
      for (const round of currentRounds) {
        console.log(`Clearing timeout id ${round}`);
        clearTimeout(round);
      }
    }

    currentRounds = [
      setTimeout(() => {
        if (currentRounds && currentRounds.length) {
          console.log(currentRounds);
          for (const round of currentRounds) {
            clearTimeout(round);
          }
        }
        startFocusRound();
      }, roundDuration),
    ];
    console.log(currentRounds);
  };
  window.electron.receive("SNOOZE", startSnoozeRound);

  const startBreakRound /* number */ = () => {
    breakCountdownManager.openModal();
    console.log("Start break round");
    const roundDuration = 20 * 1000;

    currentRounds = [
      setTimeout(() => {
        if (currentRounds && currentRounds.length) {
          console.log(currentRounds);
          for (const round of currentRounds) {
            clearTimeout(round);
          }
        }

        console.log("Closing break modal");
        breakCountdownManager.closeModal();

        console.log("Break Round timeout");
        startFocusRound();

        doneSound.play();
      }, roundDuration),
    ];
    console.log(currentRounds);
  };

  const skipBtn = document.getElementById("skip");
  skipBtn.onclick = () => {
    console.log("skip button clicked");
    if (currentRounds && currentRounds.length) {
      console.log(currentRounds);
      for (const round of currentRounds) {
        clearTimeout(round);
      }
    }
    breakCountdownManager.closeModal();
    currentRounds = [startFocusRound()];
    console.log(currentRounds);
  };

  /**
   * TODO:
   * - Update countdown time remaining in tray menu
   **/

  console.log("Initialize with focus round");
  startFocusRound();
})();
