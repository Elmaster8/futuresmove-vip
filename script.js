document.addEventListener("DOMContentLoaded", () => {

  // =========================================================
  // ELEMENTS
  // =========================================================

  const form = document.getElementById("emailForm");
  const emailInput = document.getElementById("email");
  const success = document.getElementById("emailSuccess");
  const gateNotice = document.getElementById("gateNotice");

  const paymentButtons =
    document.querySelectorAll("[data-payment]");


  // =========================================================
  // SAFETY CHECK
  // =========================================================

  if (!form || !emailInput) {
    console.error(
      "FuturesMove: email form not found."
    );
    return;
  }


  // =========================================================
  // SHOW EMAIL GATE
  // =========================================================

  function requireEmail() {

    if (gateNotice) {

      gateNotice.classList.add("show");

      gateNotice.scrollIntoView({
        behavior: "smooth",
        block: "center"
      });

    } else {

      const invitation =
        document.getElementById("invitation");

      if (invitation) {

        invitation.scrollIntoView({
          behavior: "smooth",
          block: "center"
        });

      }

    }

    setTimeout(() => {
      emailInput.focus();
    }, 650);
  }


  // =========================================================
  // CHECK WHETHER EMAIL HAS BEEN VERIFIED
  // =========================================================

  function hasVerifiedEmail() {

    const savedEmail =
      localStorage.getItem("futuresmove_email");

    return !!savedEmail;
  }


  // =========================================================
  // EMAIL FORM
  // =========================================================

  form.addEventListener(
    "submit",
    async (event) => {

      event.preventDefault();


      // =====================================================
      // VALIDATE EMAIL
      // =====================================================

      if (!emailInput.checkValidity()) {

        emailInput.reportValidity();

        return;
      }


      const email =
        emailInput.value
          .trim()
          .toLowerCase();


      if (!email) {
        return;
      }


      const submitButton =
        form.querySelector("button");


      if (!submitButton) {
        return;
      }


      const originalText =
        submitButton.innerHTML;


      // =====================================================
      // DISABLE SUBMIT WHILE VERIFYING
      // =====================================================

      submitButton.disabled = true;

      submitButton.innerHTML =
        "Verifying email...";


      if (success) {

        success.style.display = "none";

      }


      try {

        // ===================================================
        // SEND EMAIL TO CLOUDFLARE
        // ===================================================

        const response =
          await fetch(
            "https://payment-gate.davamadeus8.workers.dev/access-request",
            {
              method: "POST",

              headers: {
                "Content-Type": "application/json"
              },

              body: JSON.stringify({
                email: email
              })
            }
          );


        // ===================================================
        // CHECK CLOUDFLARE RESPONSE
        // ===================================================

        if (!response.ok) {

          throw new Error(
            "Cloudflare request failed: " +
            response.status
          );

        }


        const result =
          await response.json();


        if (
          !result ||
          result.success !== true
        ) {

          throw new Error(
            "Email confirmation failed"
          );

        }


        // ===================================================
        // EMAIL CONFIRMED
        // ===================================================

        localStorage.setItem(
          "futuresmove_email",
          email
        );


        // ===================================================
        // SUCCESS MESSAGE
        // ===================================================

        if (success) {

          success.style.display = "block";

          success.textContent =
            "✓ Email confirmed. Your membership options are now available.";

          success.classList.remove("error");

        }


        submitButton.innerHTML =
          "Email Confirmed ✓";


        if (gateNotice) {

          gateNotice.classList.remove("show");

        }


        // ===================================================
        // GO TO MEMBERSHIP
        // ===================================================

        setTimeout(() => {

          const membership =
            document.getElementById("membership");

          if (membership) {

            membership.scrollIntoView({
              behavior: "smooth",
              block: "start"
            });

          }

        }, 450);


      } catch (error) {

        console.error(
          "FuturesMove email error:",
          error
        );


        // ===================================================
        // FAILED
        // ===================================================

        submitButton.disabled = false;

        submitButton.innerHTML =
          originalText;


        if (success) {

          success.style.display = "block";

          success.textContent =
            "⚠️ We couldn't confirm your email. Please try again.";

          success.classList.add("error");

        }

      }

    }
  );


  // =========================================================
  // PAYMENT BUTTONS
  // =========================================================

  paymentButtons.forEach((button) => {

    button.addEventListener(
      "click",
      (event) => {

        // ===================================================
        // CHECK EMAIL FIRST
        // ===================================================

        if (!hasVerifiedEmail()) {

          // Stop payment link from opening
          event.preventDefault();

          requireEmail();

          return;
        }


        // ===================================================
        // EMAIL EXISTS — ALLOW PAYMENT
        // ===================================================

        const link =
          button.dataset.link;


        const paymentType =
          button.dataset.payment ||
          "unknown";


        // Save payment method
        localStorage.setItem(
          "futuresmove_payment_type",
          paymentType
        );


        // Save selected tier
        localStorage.setItem(
          "futuresmove_selected_tier",
          paymentType
        );


        // ===================================================
        // OPEN PAYMENT
        // ===================================================

        if (link) {

          window.open(
            link,
            "_blank",
            "noopener,noreferrer"
          );

        }

      }
    );

  });


  // =========================================================
  // RESTORE PREVIOUS EMAIL SESSION
  // =========================================================

  const savedEmail =
    localStorage.getItem(
      "futuresmove_email"
    );


  if (savedEmail) {

    emailInput.value =
      savedEmail;


    if (success) {

      success.style.display =
        "block";

      success.textContent =
        "✓ Email confirmed. Your membership options are available.";

      success.classList.remove("error");

    }


    const submitButton =
      form.querySelector("button");


    if (submitButton) {

      submitButton.innerHTML =
        "Email Confirmed ✓";

    }

  }

});
