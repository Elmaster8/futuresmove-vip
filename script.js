const form = document.getElementById("emailForm");
const emailInput = document.getElementById("email");
const success = document.getElementById("emailSuccess");

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const email = emailInput.value.trim();
  if (!email) return;

  localStorage.setItem("futuresmove_email", email);

  success.style.display = "block";
  form.querySelector("button").textContent = "Email Confirmed ✓";
  gateNotice.classList.remove("show");

  document.getElementById("membership").scrollIntoView({
    behavior: "smooth",
    block: "start"
  });
});

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) entry.target.classList.add("visible");
  });
}, { threshold: 0.12 });

document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));

const counters = document.querySelectorAll(".counter");
const counterObserver = new IntersectionObserver((entries, obs) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;

    const el = entry.target;
    const target = Number(el.dataset.target);
    const duration = 1200;
    const start = performance.now();

    function animate(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.floor(target * eased);
      if (progress < 1) requestAnimationFrame(animate);
    }

    requestAnimationFrame(animate);
    obs.unobserve(el);
  });
}, { threshold: 0.6 });

counters.forEach((counter) => counterObserver.observe(counter));

const gateNotice = document.getElementById("gateNotice");

function requireEmail() {
  gateNotice.classList.add("show");
  document.getElementById("invitation").scrollIntoView({
    behavior: "smooth",
    block: "center"
  });

  setTimeout(() => emailInput.focus(), 650);
}

document.querySelectorAll("[data-payment]").forEach((button) => {
  button.addEventListener("click", () => {
    const email = localStorage.getItem("futuresmove_email");

    if (!email) {
      requireEmail();
      return;
    }

    const link = button.dataset.link;
    const paymentType = button.dataset.payment || "unknown";
    localStorage.setItem("futuresmove_payment_type", paymentType);

    if (link) {
      window.open(link, "_blank", "noopener,noreferrer");
    }
  });
});
