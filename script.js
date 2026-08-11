/* =========================================================
   FUTURESMOVE — MAIN SCRIPT
   ========================================================= */


/* =========================================================
   ELEMENTS
   ========================================================= */

const form = document.getElementById("emailForm");
const emailInput = document.getElementById("email");
const success = document.getElementById("emailSuccess");
const gateNotice = document.getElementById("gateNotice");

const paymentButtons =
  document.querySelectorAll("[data-payment]");


/* =========================================================
   EMAIL GATE / PAYMENT ACCESS
   ========================================================= */

function setPaymentAccess(unlocked) {

  paymentButtons.forEach((button) => {

    button.classList.toggle(
      "locked",
      !unlocked
    );

    button.setAttribute(
      "aria-disabled",
      String(!unlocked)
    );

    /*
     * IMPORTANT:
     * We intentionally DO NOT use:
     *
     * button.disabled = true
     *
     * because a locked button must still be clickable
     * so we can send the visitor to the email field.
     */

  });

}


/* =========================================================
   SHOW EMAIL GATE
   ========================================================= */

function requireEmail() {

  /* Show the invitation notice */

  if (gateNotice) {

    gateNotice.classList.add("show");

  }


  /* Scroll to the email section */

  const invitation =
    document.getElementById("invitation");

  if (invitation) {

    invitation.scrollIntoView({
      behavior: "smooth",
      block: "center"
    });

  }


  /*
   * Put the cursor directly into the email field
   * after the scrolling animation.
   */

  setTimeout(() => {

    if (emailInput) {

      emailInput.focus();

    }

  }, 650);

}


/* =========================================================
   EMAIL FORM
   ========================================================= */

if (form) {

  form.addEventListener(
    "submit",
    (event) => {

      event.preventDefault();


      /*
       * Use the browser's native email validation.
       */

      if (
        !emailInput ||
        !emailInput.checkValidity()
      ) {

        emailInput.reportValidity();

        return;

      }


      /*
       * Normalize the email.
       */

      const email =
        emailInput.value
          .trim()
          .toLowerCase();


      if (!email) {

        return;

      }


      /*
       * Remember the email locally.
       *
       * This is only for the website UX.
       * Copperx remains the source of truth
       * for payment verification.
       */

      localStorage.setItem(
        "futuresmove_email",
        email
      );


      /*
       * Confirmation message.
       */

      if (success) {

        success.style.display =
          "block";

      }


      /*
       * Change the form button.
       */

      const submitButton =
        form.querySelector("button");

      if (submitButton) {

        submitButton.textContent =
          "Email Confirmed ✓";

      }


      /*
       * Hide the warning/gate message.
       */

      if (gateNotice) {

        gateNotice.classList.remove(
          "show"
        );

      }


      /*
       * Unlock payment options.
       */

      setPaymentAccess(true);


      /*
       * Move the visitor to membership.
       */

      setTimeout(() => {

        const membership =
          document.getElementById(
            "membership"
          );

        if (membership) {

          membership.scrollIntoView({
            behavior: "smooth",
            block: "start"
          });

        }

      }, 300);

    }
  );

}


/* =========================================================
   PAYMENT BUTTONS
   ========================================================= */

paymentButtons.forEach(
  (button) => {

    button.addEventListener(
      "click",
      () => {

        /*
         * Check whether the visitor
         * has completed the email step.
         */

        const email =
          localStorage.getItem(
            "futuresmove_email"
          );


        /* -----------------------------------------
           NO EMAIL
           ----------------------------------------- */

        if (!email) {

          /*
           * Keep buttons visually locked.
           */

          setPaymentAccess(false);


          /*
           * Send visitor to email field.
           */

          requireEmail();


          return;

        }


        /* -----------------------------------------
           EMAIL EXISTS
           ----------------------------------------- */

        /*
         * Identify which payment option
         * the visitor selected.
         */

        const paymentType =
          button.dataset.payment ||
          "unknown";


        localStorage.setItem(
          "futuresmove_payment_type",
          paymentType
        );


        /*
         * Get the payment URL from HTML.
         *
         * Example:
         *
         * data-link="https://buy.copperx.io/..."
         */

        const link =
          button.dataset.link;


        if (!link) {

          console.error(
            "Payment link missing:",
            paymentType
          );

          return;

        }


        /*
         * Prevent accidental double-clicks
         * while opening the payment page.
         */

        button.classList.add(
          "opening"
        );


        /*
         * Open payment in a new tab.
         */

        window.open(
          link,
          "_blank",
          "noopener,noreferrer"
        );


        /*
         * Restore button state shortly afterward.
         */

        setTimeout(() => {

          button.classList.remove(
            "opening"
          );

        }, 1200);

      }
    );

  }
);


/* =========================================================
   RESTORE PREVIOUS EMAIL SESSION
   ========================================================= */

const savedEmail =
  localStorage.getItem(
    "futuresmove_email"
  );


if (savedEmail) {

  /*
   * Restore email.
   */

  if (emailInput) {

    emailInput.value =
      savedEmail;

  }


  /*
   * Show confirmation.
   */

  if (success) {

    success.style.display =
      "block";

  }


  /*
   * Update form button.
   */

  if (form) {

    const submitButton =
      form.querySelector("button");

    if (submitButton) {

      submitButton.textContent =
        "Email Confirmed ✓";

    }

  }


  /*
   * Unlock membership.
   */

  setPaymentAccess(true);


} else {

  /*
   * First visit:
   * keep payment options visually locked.
   */

  setPaymentAccess(false);

}


/* =========================================================
   SCROLL REVEAL ANIMATION
   ========================================================= */

const revealElements =
  document.querySelectorAll(
    ".reveal"
  );


if (
  "IntersectionObserver" in window
) {

  const observer =
    new IntersectionObserver(
      (entries) => {

        entries.forEach(
          (entry) => {

            if (
              entry.isIntersecting
            ) {

              entry.target.classList.add(
                "visible"
              );

            }

          }
        );

      },
      {
        threshold: 0.12
      }
    );


  revealElements.forEach(
    (element) => {

      observer.observe(
        element
      );

    }
  );

} else {

  /*
   * Fallback for older browsers.
   */

  revealElements.forEach(
    (element) => {

      element.classList.add(
        "visible"
      );

    }
  );

}


/* =========================================================
   COMMUNITY COUNTERS
   ========================================================= */

const counters =
  document.querySelectorAll(
    ".counter"
  );


if (
  "IntersectionObserver" in window
) {

  const counterObserver =
    new IntersectionObserver(
      (entries, observer) => {

        entries.forEach(
          (entry) => {

            if (
              !entry.isIntersecting
            ) {

              return;

            }


            const element =
              entry.target;


            const target =
              Number(
                element.dataset.target
              );


            if (
              Number.isNaN(target)
            ) {

              return;

            }


            const duration =
              1200;


            const start =
              performance.now();


            function animate(
              currentTime
            ) {

              const progress =
                Math.min(
                  (
                    currentTime -
                    start
                  ) / duration,
                  1
                );


              /*
               * Smooth ease-out.
               */

              const eased =
                1 -
                Math.pow(
                  1 - progress,
                  3
                );


              element.textContent =
                Math.floor(
                  target * eased
                );


              if (
                progress < 1
              ) {

                requestAnimationFrame(
                  animate
                );

              } else {

                /*
                 * Guarantee the exact
                 * final number.
                 */

                element.textContent =
                  target;

              }

            }


            requestAnimationFrame(
              animate
            );


            /*
             * Only animate once.
             */

            observer.unobserve(
              element
            );

          }
        );

      },
      {
        threshold: 0.6
      }
    );


  counters.forEach(
    (counter) => {

      counterObserver.observe(
        counter
      );

    }
  );

} else {

  /*
   * Fallback.
   */

  counters.forEach(
    (counter) => {

      counter.textContent =
        counter.dataset.target;

    }
  );

}


/* =========================================================
   DEBUG INFORMATION
   ========================================================= */

console.log(
  "FuturesMove VIP system loaded."
);

console.log(
  "Email gate:",
  savedEmail
    ? "UNLOCKED"
    : "LOCKED"
);
