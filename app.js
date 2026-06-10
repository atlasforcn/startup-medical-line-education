const trackLabels = { emergency: "急診", nursing: "護理", public: "公衛" };

let courses = [
  { id: 1, title: "急診初判流程", track: "emergency", questions: 42, progress: 76 },
  { id: 2, title: "照護紀錄與交班", track: "nursing", questions: 36, progress: 64 },
  { id: 3, title: "社區健康風險", track: "public", questions: 28, progress: 58 },
  { id: 4, title: "臨床溝通演練", track: "nursing", questions: 24, progress: 82 },
];

let weakPoints = [
  { title: "敗血症警訊", score: 48 },
  { title: "藥物交互作用", score: 62 },
  { title: "衛教重點摘要", score: 70 },
];

let messages = [
  "老師回覆：先把生命徵象變化與主訴分開判讀。",
];

const trackFilter = document.querySelector("#trackFilter");
const courseList = document.querySelector("#courseList");
const questionBox = document.querySelector("#questionBox");
const weakList = document.querySelector("#weakList");
const messageForm = document.querySelector("#messageForm");
const messageList = document.querySelector("#messageList");

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
      <div class="course-progress">${course.progress}%</div>
    </article>
  `).join("");
}

function renderQuestion() {
  const weakest = weakPoints[0];
  questionBox.innerHTML = `
    <strong>${weakest.title}</strong>
    <p>病人主訴發燒與意識改變，請判斷需要優先追蹤的三個指標。</p>
  `;
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

document.querySelector("#answerButton").addEventListener("click", () => {
  weakPoints = weakPoints.map((point, index) => ({ ...point, score: Math.min(95, point.score + 6 - index) }));
  courses = courses.map((course, index) => ({ ...course, progress: Math.min(100, course.progress + 2 + index) }));
  renderWeakPoints();
  renderCourses();
  updateProgress();
});

trackFilter.addEventListener("input", renderCourses);

messageForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const data = new FormData(messageForm);
  messages.unshift(`學生提問：${data.get("message")}`);
  messageForm.reset();
  renderMessages();
});

renderCourses();
renderQuestion();
renderWeakPoints();
renderMessages();
updateProgress();
