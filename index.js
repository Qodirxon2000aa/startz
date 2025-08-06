const gifts = [
  { image: "https://cdn-icons-png.flaticon.com/512/102/102666.png", price: 15, name: "Sovg‘a qutisi" },
  { image: "https://cdn-icons-png.flaticon.com/512/3144/3144456.png", price: 10, name: "Yurak qutisi" },
  { image: "https://cdn-icons-png.flaticon.com/512/1838/1838930.png", price: 25, name: "Atirgul" },
  { image: "https://cdn-icons-png.flaticon.com/512/888/888857.png", price: 50, name: "iPhone" },
  { image: "https://cdn-icons-png.flaticon.com/512/741/741407.png", price: 100, name: "Tesla" },
  { image: "https://cdn-icons-png.flaticon.com/512/949/949123.png", price: 70, name: "PS5" },
  { image: "https://cdn-icons-png.flaticon.com/512/3736/3736935.png", price: 30, name: "Quloqchin" },
];

const elements = {
  track: document.getElementById("spinnerTrack"),
  result: document.getElementById("result"),
  starDisplay: document.getElementById("starCount"),
};

let currentStars = 100; // Boshlang‘ich balans (serverdan olish kerak)

const updateStarsDisplay = () => {
  elements.starDisplay.textContent = currentStars;
};

const createItems = (repeat = 30) => {
  elements.track.innerHTML = "";
  for (let i = 0; i < repeat; i++) {
    const gift = gifts[Math.floor(Math.random() * gifts.length)];
    const item = document.createElement("div");
    item.className = "gift-item";
    item.innerHTML = `
      <img src="${gift.image}" alt="${gift.name}" />
      <div class="gift-price">
        <span class="star">✨</span>
        <span>${gift.price}</span>
      </div>
    `;
    elements.track.appendChild(item);
  }
};

const spin = (callback) => {
  const itemWidth = 100;
  const visibleCount = 3;

  createItems(30);

  const targetIndex = Math.floor(Math.random() * (30 - visibleCount)) + visibleCount;
  const offset = targetIndex * itemWidth;

  elements.track.style.transition = "transform 0.8s ease-out";
  elements.track.style.transform = `translateX(-${offset}px)`;

  const selected = elements.track.children[targetIndex];
  const img = selected.querySelector("img").src;
  const price = selected.querySelector(".gift-price span:last-child").textContent;

  setTimeout(() => {
    elements.result.innerHTML = `🎉 Siz yutdingiz! <br><img src="${img}" style="width:40px"/> ✨ ${price}`;
    callback?.();
  }, 1000);
};

const spinDemo = () => {
  elements.result.innerHTML = "";
  spin();
};

const requestPayment = (cost) => {
  if (!window.Telegram?.WebApp) {
    elements.result.innerHTML = "❌ Telegram Web App topilmadi!";
    return;
  }

  const userId = window.Telegram.WebApp.initDataUnsafe?.user?.id || "test_user";
  const payload = `spin_${userId}_${cost}`;

  // Telegram Stars orqali to‘lov so‘rovi
  window.Telegram.WebApp.showConfirm(`Aylantirish uchun ${cost} ⭐️ ishlatilsinmi?`, (confirmed) => {
    if (confirmed) {
      window.Telegram.WebApp.sendInvoice({
        title: "Aylantirish uchun to‘lov",
        description: `${cost} ⭐️ bilan Sovg‘a Spinner aylantirish`,
        payload: payload,
        currency: "XTR",
        prices: [{ label: "⭐️ Yulduz", amount: cost }],
      }, (response) => {
        if (response.ok) {
          currentStars -= cost; // Frontend’da balansni yangilash
          updateStarsDisplay();
          elements.result.innerHTML = "";
          spin(() => {
            // Botga to‘lov muvaffaqiyatli ekanligini bildirish
            window.Telegram.WebApp.sendData(JSON.stringify({
              action: "spin_payment",
              cost: cost,
              payload: payload,
              userId: userId
            }));
          });
        } else {
          elements.result.innerHTML = "❌ To‘lov amalga oshmadi!";
        }
      });
    }
  });
};

// Boshlang‘ich holatni yangilash
updateStarsDisplay();