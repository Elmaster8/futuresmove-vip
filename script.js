const form = document.getElementById("emailForm");
const emailInput = document.getElementById("email");
const success = document.getElementById("emailSuccess");
const gateNotice = document.getElementById("gateNotice");
const paymentButtons = document.querySelectorAll("[data-payment]");


/* =========================
   EMAIL GATE
========================= */

function setPaymentAccess(unlocked) {

  paymentButtons.forEach((button) => {

    button.disabled = !unlocked;

    button.classList.toggle("locked", !unlocked);

    button.setAttribute(
      "aria-disabled",
      String(!unlocked)
    );

  });

}


/* =========================
   EMAIL FORM
========================= */

form.addEventListener("submit", (event) => {

  event.preventDefault();

  if (!emailInput.checkValidity()) {
    emailInput.reportValidity();
    return;
  }

  const email = emailInput.value.trim().toLowerCase();

  if (!email) return;


  // Save email for this browser
  localStorage.setItem(
    "futuresmove_email",
    email
  );


  // Confirmation
  success.style.display = "block";

  form.querySelector("button").textContent =
    "Email Confirmed ✓";


  gateNotice.classList.remove("show");


  // Unlock payment options
  setPaymentAccess(true);


  // Move user to membership
  setTimeout(() => {

    document.getElementById("membership").scrollIntoView({
      behavior: "smooth",
      block: "start"
    });

  }, 300);

});


/* =========================
   PAYMENT BUTTONS
========================= */

paymentButtons.forEach((button) => {

  button.addEventListener("click", () => {

    const email =
      localStorage.getItem("futuresmove_email");


    // Safety check
    if (!email) {

      setPaymentAccess(false);

      gateNotice.classList.add("show");

      document.getElementById("invitation").scrollIntoView({
        behavior: "smooth",
        block: "center"
      });

      setTimeout(() => {
        emailInput.focus();
      }, 650);

      return;
    }


    // Remember which payment option was selected
    const paymentType =
      button.dataset.payment || "unknown";

    localStorage.setItem(
      "futuresmove_payment_type",
      paymentType
    );


    // Open payment page
    const link = button.dataset.link;

    if (link) {

      window.open(
        link,
        "_blank",
        "noopener,noreferrer"
      );

    }

  });

});


/* =========================
   RESTORE EMAIL SESSION
========================= */

const savedEmail =
  localStorage.getItem("futuresmove_email");


if (savedEmail) {

  emailInput.value = savedEmail;

  success.style.display = "block";

  form.querySelector("button").textContent =
    "Email Confirmed ✓";

  setPaymentAccess(true);

} else {

  setPaymentAccess(false);

}


/* =========================
   SCROLL REVEAL
========================= */

const observer =
  new IntersectionObserver(
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
  .forEach((el) => {

    observer.observe(el);

  });


/* =========================
   COMMUNITY COUNTERS
========================= */

const counters =
  document.querySelectorAll(".counter");


const counterObserver =
  new IntersectionObserver(
    (entries, obs) => {

      entries.forEach((entry) => {

        if (!entry.isIntersecting) return;


        const el = entry.target;

        const target =
          Number(el.dataset.target);

        const duration = 1200;

        const start =
          performance.now();


        function animate(now) {

          const progress =
            Math.min(
              (now - start) / duration,
              1
            );


          const eased =
            1 - Math.pow(
              1 - progress,
              3
            );


          el.textContent =
            Math.floor(
              target * eased
            );


          if (progress < 1) {

            requestAnimationFrame(
              animate
            );

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
