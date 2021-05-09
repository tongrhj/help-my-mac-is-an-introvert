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
    window.electron.send("NOTIFY_BREAK_STARTING")
  };

  const startFocusRound /* number */ = () => {
    const roundDuration = /* 20 * 60 * 1000 */ 20 * 1000;
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
    breakCountdownManager.openModal();
    console.log("Start break round");
    const roundDuration = 10 * 1000;

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
      }, roundDuration),
    ];
  };

  /**
   * TODO:
   * - Snooze current round for x duration(s)
   * - Trigger next round immediately
   * - Update countdown time remaining in tray menu
   **/

  console.log("Initialize with focus round");
  startFocusRound();
})();
