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
    window.electron.send("NOTIFY_BREAK_STARTING");
  };

  const doneSound = new Audio(window.electron.notificationFile());

  const startFocusRound /* number */ = () => {
    const roundDuration = 20 * 60 * 1000;

    currentRounds = [
      setTimeout(() => {
        showBreakNotification();
      }, roundDuration - 10 * 1000),
      setTimeout(() => {
        if (currentRounds && currentRounds.length) {
          console.log(currentRounds);
          for (const round of currentRounds) {
            clearTimeout(round);
          }
        }

        startBreakRound();
      }, roundDuration),
    ];
  };

  const startSnoozeRound = (minutes /*: number */) => {
    const roundDuration = minutes * 60 * 1000;
    if (currentRounds && currentRounds.length) {
      for (const round of currentRounds) {
        clearTimeout(round);
      }
    }

    currentRounds = [
      setTimeout(() => {
        if (currentRounds && currentRounds.length) {
          for (const round of currentRounds) {
            clearTimeout(round);
          }
        }
        startFocusRound();
      }, roundDuration),
    ];
  };
  window.electron.receive("SNOOZE", startSnoozeRound);

  const startBreakRound /* number */ = () => {
    breakCountdownManager.openModal();
    const roundDuration = 20 * 1000;

    currentRounds = [
      setTimeout(() => {
        if (currentRounds && currentRounds.length) {
          for (const round of currentRounds) {
            clearTimeout(round);
          }
        }

        breakCountdownManager.closeModal();
        startFocusRound();
        doneSound.play();
      }, roundDuration),
    ];
  };

  const skipBtn = document.getElementById("skip");
  skipBtn.onclick = () => {
    if (currentRounds && currentRounds.length) {
      for (const round of currentRounds) {
        clearTimeout(round);
      }
    }
    breakCountdownManager.closeModal();
    currentRounds = [startFocusRound()];
  };

  /**
   * TODO:
   * - Update countdown time remaining in tray menu
   **/

  startFocusRound();
})();
