const contact = document.getElementById("contact");

function decode(values) {
  return String.fromCharCode(...values);
}

if (contact) {
  contact.addEventListener("click", () => {
    const user = decode([104, 101, 108, 108, 111]);
    const domain = decode([104, 114, 111, 110, 105, 114, 46, 100, 101, 118]);
    const address = `${user}${decode([64])}${domain}`;

    contact.querySelector("span").textContent = address;
    window.location.href = `${decode([109, 97, 105, 108, 116, 111, 58])}${address}`;
  });
}
