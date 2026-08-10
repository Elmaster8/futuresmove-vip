document.addEventListener("DOMContentLoaded", () => {

  // =========================================================
  // ELEMENTS
  // =========================================================

  const form =
    document.getElementById("emailForm");

  const emailInput =
    document.getElementById("email");

  const success =
    document.getElementById("emailSuccess");

  const gateNotice =
    document.getElementById("gateNotice");

  const membershipGate =
    document.getElementById("membershipGate");

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
  // PAYMENT ACCESS CONTROL
  // =========================================================

  function setPaymentAccess(unlocked) {

    paymentButtons.forEach((button) => {

      button.disabled = !unlocked;

      button.classList.toggle(
        "locked",
        !unlocked
      );

      button.setAttribute(
        "aria-disabled",
        String(!unlocked)
      );

    });


    if (membershipGate) {

      membershipGate.classList.toggle(
        "unlocked",
        unlocked
      );


      if (unlocked) {

        membershipGate.textContent =
          "✓ Email confirmed — your secure membership options are unlocked.";

      } else {

        membershipGate.textContent =
          "🔒 Enter your email above to unlock secure payment access.";

      }

    }

  }


  // =========================================================
  // REQUIRE EMAIL
  // =========================================================

  function requireEmail() {

    if (gateNotice) {
      gateNotice.classList.add("show");
    }


    const invitation =
      document.getElementById(
        "invitation"
      );


    if (invitation) {

      invitation.scrollIntoView({
        behavior: "smooth",
        block: "center"
      });

    }


    setTimeout(() => {

      emailInput.focus();

    }, 650);

  }


  // =========================================================
  // EMAIL FORM
  // =========================================================

  form.addEventListener(
    "submit",
    async (event) => {

      event.preventDefault();


      // Validate email

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
        form.querySelector(
          "button"
        );


      const originalText =
        submitButton.innerHTML;


      // Disable while processing

      submitButton.disabled =
        true;


      submitButton.innerHTML =
        "Verifying email...";


      if (success) {

        success.style.display =
          "none";

      }


      try {

        // =====================================================
        // SEND EMAIL TO CLOUDFLARE
        // =====================================================

        const response =
          await fetch(
            "https://payment-gate.davamadeus8.workers.dev/access-request",
            {

              method: "POST",

              headers: {
                "Content-Type":
                  "application/json"
              },

              body: JSON.stringify({
                email: email
              })

            }
          );


        // =====================================================
        // CHECK CLOUDFLARE RESPONSE
        // =====================================================

        if (!response.ok) {

          throw new Error(
            "Cloudflare request failed"
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


        // =====================================================
        // ONLY AFTER CLOUDFLARE CONFIRMS
        // SAVE EMAIL LOCALLY
        // =====================================================

        localStorage.setItem(
          "futuresmove_email",
          email
        );


        // =====================================================
        // SHOW SUCCESS
        // =====================================================

        if (success) {

          success.style.display =
            "block";

          success.textContent =
            "✓ Email confirmed. Your membership options are now available.";

          success.classList.remove(
            "error"
          );

        }


        submitButton.innerHTML =
          "Email Confirmed ✓";


        if (gateNotice) {

          gateNotice.classList.remove(
            "show"
          );

        }


        // =====================================================
        // UNLOCK PAYMENT BUTTONS
        // =====================================================

        setPaymentAccess(true);


        // =====================================================
        // MOVE USER TO MEMBERSHIP
        // =====================================================

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

        }, 450);


      } catch (error) {

        console.error(
          "FuturesMove email error:",
          error
        );


        // =====================================================
        // FAILURE
        // =====================================================

        submitButton.disabled =
          false;


        submitButton.innerHTML =
          originalText;


        setPaymentAccess(false);


        if (success) {

          success.style.display =
            "block";

          success.textContent =
            "⚠️ We couldn't confirm your email. Please try again.";

          success.classList.add(
            "error"
          );

        }

      }

    }
  );


  // =========================================================
  // PAYMENT BUTTONS
  // =========================================================

  paymentButtons.forEach(
    (button) => {

      button.addEventListener(
        "click",
        () => {

          // ===================================================
          // DOUBLE CHECK EMAIL
          // ===================================================

          const email =
            localStorage.getItem(
              "futuresmove_email"
            );


          if (!email) {

            setPaymentAccess(false);

            requireEmail();

            return;

          }


          // ===================================================
          // GET PAYMENT LINK
          // ===================================================

          const link =
            button.dataset.link;


          const paymentType =
            button.dataset.payment ||
            "unknown";


          // ===================================================
          // SAVE PAYMENT TYPE
          // ===================================================

          localStorage.setItem(
            "futuresmove_payment_type",
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

    }
  );


  // =========================================================
  // RESTORE EMAIL SESSION
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

    }


    const submitButton =
      form.querySelector(
        "button"
      );


    if (submitButton) {

      submitButton.innerHTML =
        "Email Confirmed ✓";

    }


    setPaymentAccess(true);


  } else {

    // =======================================================
    // FIRST VISIT
    // =======================================================

    setPaymentAccess(false);

  }

});
