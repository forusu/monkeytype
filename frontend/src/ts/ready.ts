import * as ManualRestart from "./test/manual-restart-tracker";
import Config, * as UpdateConfig from "./config";
import * as Misc from "./utils/misc";
import * as JSONData from "./utils/json-data";
import * as MonkeyPower from "./elements/monkey-power";
import * as NewVersionNotification from "./elements/version-check";
import * as Notifications from "./elements/notifications";
import * as Focus from "./test/focus";
import * as CookiesModal from "./modals/cookies";
import * as PSA from "./elements/psa";
import * as ConnectionState from "./states/connection";
import * as FunboxList from "./test/funbox/funbox-list";
//@ts-expect-error
import Konami from "konami";
import { envConfig } from "./constants/env-config";
import * as ServerConfiguration from "./ape/server-configuration";

if (Misc.isDevEnvironment()) {
  $("footer .currentVersion .text").text("localhost");
  $("body").prepend(
    `<a class='button configureAPI' href='${envConfig.backendUrl}/configure/' target='_blank' aria-label="Configure API" data-balloon-pos="right"><i class="fas fa-fw fa-server"></i></a>`
  );
} else {
  JSONData.getLatestReleaseFromGitHub()
    .then((v) => {
      $("footer .currentVersion .text").text(v);
      void NewVersionNotification.show(v);
    })
    .catch((e) => {
      $("footer .currentVersion .text").text("unknown");
    });
}

void UpdateConfig.loadFromLocalStorage();
Focus.set(true, true);

$(document).ready(() => {
  Misc.loadCSS("/css/slimselect.min.css", true);
  Misc.loadCSS("/css/balloon.min.css", true);

  CookiesModal.check();

  //this line goes back to pretty much the beginning of the project and im pretty sure its here
  //to make sure the initial theme application doesnt animate the background color
  $("body").css("transition", "background .25s, transform .05s");
  const merchBannerClosed =
    window.localStorage.getItem("merchbannerclosed") === "true";
  if (!merchBannerClosed) {
    Notifications.addBanner(
      `Check out our merchandise, available at <a target="_blank" rel="noopener" href="https://monkeytype.store/">monkeytype.store</a>`,
      1,
      "./images/merch2.png",
      false,
      () => {
        window.localStorage.setItem("merchbannerclosed", "true");
      },
      true
    );
  }

  // const plushieBannerClosed2 =
  //   window.localStorage.getItem("plushieBannerClosed2") === "true";
  // if (!plushieBannerClosed2) {
  //   const string = formatDistanceStrict(1711882800000, Date.now(), {
  //     roundingMethod: "floor",
  //   });
  //   Notifications.addBanner(
  //     `Our limited plushie will be gone in ${string} - don't miss out! <a target="_blank" rel="noopener" href="https://mktp.co/plushie2">monkeytype.store</a>`,
  //     1,
  //     "./images/plushiebanner.png",
  //     true,
  //     () => {
  //       window.localStorage.setItem("plushieBannerClosed2", "true");
  //     },
  //     true
  //   );
  // }

  setTimeout(() => {
    FunboxList.get(Config.funbox).forEach((it) =>
      it.functions?.applyGlobalCSS?.()
    );
  }, 500); //this approach will probably bite me in the ass at some point

  $("#app")
    .css("opacity", "0")
    .removeClass("hidden")
    .stop(true, true)
    .animate({ opacity: 1 }, 250);
  if (ConnectionState.get()) {
    void PSA.show();
    void ServerConfiguration.sync().then(() => {
      if (!ServerConfiguration.get()?.users.signUp) {
        $(".signInOut").addClass("hidden");
        $(".register").addClass("hidden");
        $(".login").addClass("hidden");
        $(".disabledNotification").removeClass("hidden");
      }
    });
  }
  MonkeyPower.init();

  new Konami("https://keymash.io/");

  if (Misc.isDevEnvironment()) {
    void navigator.serviceWorker
      .getRegistrations()
      .then(function (registrations) {
        for (const registration of registrations) {
          void registration.unregister();
        }
      });
  }
});
