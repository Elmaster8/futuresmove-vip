const form = document.getElementById("emailForm");
const emailInput = document.getElementById("email");
const success = document.getElementById("emailSuccess");
const gateNotice = document.getElementById("gateNotice");

const PAYMENT_GATE_URL =
  "https://payment-gate.davamadeus8.workers.dev/access-request";


/* =========================================================
   EMAIL FORM
   ========================================================= */

form.addEventListener("submit", (event) => {

  event.preventDefault();

  const email = emailInput.value.trim();

  if (!email) {
    emailInput.focus();
    return;
  }

  localStorage.setItem(
    "futuresmove_email",
    email
  );

  success.style.display = "block";

  form.querySelector("button").textContent =
    "Email Confirmed ✓";

  gateNotice.classList.remove("show");

  document
    .getElementById("membership")
    .scrollIntoView({
      behavior: "smooth",
      block: "start"
    });

});


/* =========================================================
   REVEAL ANIMATIONS
   ========================================================= */

const observer = new IntersectionObserver(
  (entries) => {

    entries.forEach((entry) => {

      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
      }

    });

  },
  {
    threshold: 0.12
  }
);

document
  .querySelectorAll(".reveal")
  .forEach((el) => observer.observe(el));


/* =========================================================
   COMMUNITY COUNTERS
   ========================================================= */

const counters =
  document.querySelectorAll(".counter");

const counterObserver =
  new IntersectionObserver(
    (entries, obs) => {

      entries.forEach((entry) => {

        if (!entry.isIntersecting) return;

        const el = entry.target;
        const target = Number(el.dataset.target);

        const duration = 1200;
        const start = performance.now();

        function animate(now) {

          const progress =
            Math.min(
              (now - start) / duration,
              1
            );

          const eased =
            1 - Math.pow(1 - progress, 3);

          el.textContent =
            Math.floor(target * eased);

          if (progress < 1) {

            requestAnimationFrame(animate);

          } else {

            el.textContent = target;

          }

        }

        requestAnimationFrame(animate);

        obs.unobserve(el);

      });

    },
    {
      threshold: 0.6
    }
  );

counters.forEach((counter) => {

  counterObserver.observe(counter);

});


/* =========================================================
   EMAIL GATE
   ========================================================= */

function requireEmail() {

  gateNotice.classList.add("show");

  const invitation =
    document.getElementById("invitation");

  invitation.scrollIntoView({
    behavior: "smooth",
    block: "center"
  });

  setTimeout(() => {

    emailInput.focus();

  }, 700);

}


/* =========================================================
   PAYMENT BUTTONS
   ========================================================= */

document
  .querySelectorAll("[data-payment]")
  .forEach((button) => {

    button.addEventListener("click", () => {

      /* ---------------------------------------------------
         CHECK EMAIL FIRST
         --------------------------------------------------- */

      const email =
        localStorage.getItem(
          "futuresmove_email"
        );


      /*
       * NO EMAIL
       *
       * Stop the payment process and
       * send the visitor to the email field.
       */

      if (!email) {

        requireEmail();

        return;

      }


      /* ---------------------------------------------------
         PAYMENT INFORMATION
         --------------------------------------------------- */

      const link =
        button.dataset.link;

      const paymentType =
        button.dataset.payment || "unknown";


      if (!link) {

        console.error(
          "Missing payment link."
        );

        return;

      }


      /* ---------------------------------------------------
         DETERMINE TIER
         --------------------------------------------------- */

      let tier = "Unknown";

      if (
        paymentType === "chill-crypto" ||
        paymentType === "chill-patreon"
      ) {

        tier = "Chill Trader";

      }

      if (
        paymentType === "savage-crypto" ||
        paymentType === "savage-patreon"
      ) {

        tier = "Savage Trader";

      }


      /* ---------------------------------------------------
         DETERMINE PAYMENT METHOD
         --------------------------------------------------- */

      let method = "Unknown";

      if (
        paymentType.includes("crypto")
      ) {

        method = "Crypto";

      }

      if (
        paymentType.includes("patreon")
      ) {

        method = "Patreon";

      }


      localStorage.setItem(
        "futuresmove_payment_type",
        paymentType
      );


      /* ---------------------------------------------------
         SEND EMAIL + TIER + METHOD TO CLOUDFLARE
         --------------------------------------------------- */

      fetch(PAYMENT_GATE_URL, {

        method: "POST",

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify({

          email: email,

          tier: tier,

          method: method,

          timestamp:
            new Date().toISOString()

        })

      })
      .then((response) => {

        if (!response.ok) {

          throw new Error(
            "Cloudflare returned " +
            response.status
          );

        }

        console.log(
          "VIP access request sent successfully."
        );

      })
      .catch((error) => {

        /*
         * IMPORTANT:
         * A Discord notification problem
         * should NEVER stop the customer
         * from reaching the payment page.
         */

        console.error(
          "VIP notification failed:",
          error
        );

      });


      /* ---------------------------------------------------
         OPEN PAYMENT PAGE
         --------------------------------------------------- */

      window.open(
        link,
        "_blank",
        "noopener,noreferrer"
      );

    });

  });


/* =========================================================
   RESTORE SAVED EMAIL
   ========================================================= */

const savedEmail =
  localStorage.getItem(
    "futuresmove_email"
  );

if (savedEmail) {

  emailInput.value = savedEmail;

  success.style.display = "block";

  form.querySelector("button").textContent =
    "Email Confirmed ✓";

}


/* =========================================================
   READY
   ========================================================= */

console.log(
  "FuturesMove website ready."
);
