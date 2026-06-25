const trackLabels = { emergency: "急診", nursing: "護理", public: "公衛" };

let courses = [
  { id: 1, title: "急診初判流程", track: "emergency", questions: 42, progress: 76, review: 3 },
  { id: 2, title: "照護紀錄與交班", track: "nursing", questions: 36, progress: 64, review: 2 },
  { id: 3, title: "社區健康風險", track: "public", questions: 28, progress: 58, review: 1 },
  { id: 4, title: "臨床溝通演練", track: "nursing", questions: 24, progress: 82, review: 0 },
];

let weakPoints = [
  { title: "敗血症警訊", score: 48 },
  { title: "藥物交互作用", score: 62 },
  { title: "衛教重點摘要", score: 70 },
];

let messages = [
  "老師回覆：先把生命徵象變化與主訴分開判讀。",
];

let learningLog = [
  { time: "09:10", title: "教師回饋已讀", detail: "敗血症警訊案例：需區分資料不足與立即升級條件。" },
  { time: "昨天", title: "完成反例題 4 題", detail: "2 題信心過高，已加入弱點複習。" },
  { time: "週一", title: "班級題庫更新", detail: "新增 6 題公衛風險溝通案例，均由教師複核。" },
];

const question = {
  title: "敗血症警訊",
  prompt: "模擬案例：病人主訴發燒與意識改變。作為學習練習，下一個最合理的處理方式是？",
  options: [
    { id: "a", text: "只根據單一症狀直接下診斷", correct: false },
    { id: "b", text: "先確認生命徵象、時間變化與可用資料，再依課程流程升級", correct: true },
    { id: "c", text: "等待所有檢驗完成後才記錄變化", correct: false },
  ],
};

let selectedAnswer = "b";
let attempts = 0;

const trackFilter = document.querySelector("#trackFilter");
const courseList = document.querySelector("#courseList");
const questionBox = document.querySelector("#questionBox");
const answerOptions = document.querySelector("#answerOptions");
const weakList = document.querySelector("#weakList");
const messageForm = document.querySelector("#messageForm");
const messageList = document.querySelector("#messageList");
const feedbackBox = document.querySelector("#feedbackBox");
const answerConfidence = document.querySelector("#answerConfidence");
const toast = document.querySelector("#toast");

function updateProgress() {
  const avg = Math.round(courses.reduce((sum, course) => sum + course.progress, 0) / courses.length);
  document.querySelector("#weeklyProgress").textContent = `${avg}%`;
}

function renderCourses() {
  const list = courses.filter((course) => trackFilter.value === "all" || course.track === trackFilter.value);
  courseList.innerHTML = list.map((course) => `
    <article class="course-card">
      <span class="tag">${trackLabels[course.track]}</span>
      <div>
        <h3>${course.title}</h3>
        <p>${course.questions} 題 / 目前進度 ${course.progress}%</p>
      </div>
      <div class="meter"><span style="width: ${course.progress}%"></span></div>
      <div class="course-meta"><strong>${course.progress}%</strong><span>${course.review} 筆待教師回饋</span></div>
    </article>
  `).join("");
}

function renderQuestion() {
  questionBox.innerHTML = `
    <strong>${question.title}</strong>
    <p>${question.prompt}</p>
    <small>此為模擬教育案例，不適用於真實病人。</small>
  `;
  answerOptions.innerHTML = question.options.map((option) => `
    <label class="${option.id === selectedAnswer ? "selected" : ""}">
      <input type="radio" name="answer" value="${option.id}" ${option.id === selectedAnswer ? "checked" : ""}>
      <span><b>${option.id.toUpperCase()}</b>${option.text}</span>
    </label>
  `).join("");
  answerOptions.querySelectorAll("input").forEach((input) => {
    input.addEventListener("change", () => {
      selectedAnswer = input.value;
      renderQuestion();
    });
  });
}

function renderWeakPoints() {
  weakList.innerHTML = weakPoints.map((point) => `
    <div class="weak-item">
      <strong>${point.title}</strong>
      <div class="meter"><span style="width: ${point.score}%"></span></div>
      <span>${point.score} 分</span>
    </div>
  `).join("");
}

function renderMessages() {
  messageList.innerHTML = messages.map((message) => `<div class="message">${message}</div>`).join("");
}

function renderLearningLog() {
  document.querySelector("#learningLog").innerHTML = learningLog.map((entry) => `
    <li><span>${entry.time}</span><div><strong>${entry.title}</strong><p>${entry.detail}</p></div></li>
  `).join("");
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => toast.classList.remove("show"), 2400);
}

document.querySelector("#answerButton").addEventListener("click", () => {
  attempts += 1;
  const selected = question.options.find((option) => option.id === selectedAnswer);
  const confidence = Number(answerConfidence.value);
  const outcome = selected?.correct ? 100 : 0;
  const gap = outcome - confidence;
  document.querySelector("#confidenceGap").textContent = `${gap > 0 ? "+" : ""}${gap}`;

  if (selected?.correct) {
    weakPoints = weakPoints.map((point, index) => ({ ...point, score: Math.min(95, point.score + 6 - index) }));
    courses = courses.map((course, index) => ({ ...course, progress: Math.min(100, course.progress + 2 + index) }));
    feedbackBox.className = "feedback-box correct";
    feedbackBox.innerHTML = `
      <strong>方向正確，但需要說明判斷依據。</strong>
      <p>練習重點是先確認資料與時間變化，再依課程流程升級；題目分數不能取代臨床監督或真實情境判斷。</p>
    `;
  } else {
    feedbackBox.className = "feedback-box incorrect";
    feedbackBox.innerHTML = `
      <strong>這個選項忽略了資料完整性或過早下結論。</strong>
      <p>請回到案例，把「已知資料、未知資料、需要升級的條件」分開。教師會看到本次答題與信心。</p>
    `;
  }

  learningLog.unshift({
    time: new Date().toLocaleTimeString("zh-TW", { hour: "2-digit", minute: "2-digit" }),
    title: `提交第 ${attempts} 次練習答案`,
    detail: `${selected?.correct ? "方向正確" : "需重新檢視"}；作答信心 ${confidence}%，差距 ${gap > 0 ? "+" : ""}${gap}。`,
  });
  learningLog.splice(5);
  renderWeakPoints();
  renderCourses();
  renderLearningLog();
  updateProgress();
  showToast("練習結果、信心與解析已記錄；不代表臨床能力認證。");
});

answerConfidence.addEventListener("input", () => {
  document.querySelector("#confidenceValue").textContent = answerConfidence.value;
});

trackFilter.addEventListener("input", renderCourses);

messageForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const data = new FormData(messageForm);
  const content = String(data.get("message") || "").trim();
  if (!content) return;
  messages.unshift(`學生提問：${content}`);
  learningLog.unshift({
    time: new Date().toLocaleTimeString("zh-TW", { hour: "2-digit", minute: "2-digit" }),
    title: "送出教師討論題",
    detail: "問題已進入教師回饋佇列，尚未形成臨床建議。",
  });
  messageForm.reset();
  renderMessages();
  renderLearningLog();
});

renderCourses();
renderQuestion();
renderWeakPoints();
renderMessages();
renderLearningLog();
updateProgress();
