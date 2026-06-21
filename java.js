const userInput = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");
const aiResponse = document.getElementById("aiResponse");

const todoInput = document.getElementById("todoInput");
const categoryInput = document.getElementById("categoryInput");
const addTodoBtn = document.getElementById("addTodoBtn");
const todoList = document.getElementById("todoList");

const clearDoneBtn = document.getElementById("clearDoneBtn");
const themeBtn = document.getElementById("themeBtn");

const totalCount = document.getElementById("totalCount");
const doneCount = document.getElementById("doneCount");
const rateCount = document.getElementById("rateCount");
const progressBar = document.getElementById("progressBar");
const dateTime = document.getElementById("dateTime");

let todos = JSON.parse(localStorage.getItem("todos")) || [];
let currentFilter = "全部";

function saveTodos() {
  localStorage.setItem("todos", JSON.stringify(todos));
}

function updateDateTime() {
  const now = new Date();
  dateTime.textContent = "現在時間：" + now.toLocaleString("zh-TW");
}

setInterval(updateDateTime, 1000);
updateDateTime();

function updateStats() {
  const total = todos.length;
  const done = todos.filter(todo => todo.done).length;
  const rate = total === 0 ? 0 : Math.round((done / total) * 100);

  totalCount.textContent = total;
  doneCount.textContent = done;
  rateCount.textContent = rate + "%";
  progressBar.style.width = rate + "%";
}

function renderTodos() {
  todoList.innerHTML = "";

  let showTodos = todos;

  if (currentFilter !== "全部") {
    showTodos = todos.filter(todo => todo.category === currentFilter);
  }

  showTodos.forEach((todo) => {
    const realIndex = todos.indexOf(todo);

    const li = document.createElement("li");

    const info = document.createElement("div");
    info.className = "todo-info";

    const text = document.createElement("span");
    text.textContent = todo.text;

    if (todo.done) {
      text.classList.add("done");
    }

    const category = document.createElement("span");
    category.className = "category";
    category.textContent = "分類：" + todo.category;

    info.appendChild(text);
    info.appendChild(category);

    const btnBox = document.createElement("div");

    const finishBtn = document.createElement("button");
    finishBtn.textContent = todo.done ? "取消" : "完成";
    finishBtn.className = "finish-btn";
    finishBtn.onclick = function () {
      todos[realIndex].done = !todos[realIndex].done;
      saveTodos();
      renderTodos();
    };

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "刪除";
    deleteBtn.className = "delete-btn";
    deleteBtn.onclick = function () {
      todos.splice(realIndex, 1);
      saveTodos();
      renderTodos();
    };

    btnBox.appendChild(finishBtn);
    btnBox.appendChild(deleteBtn);

    li.appendChild(info);
    li.appendChild(btnBox);

    todoList.appendChild(li);
  });

  updateStats();
}

function addTodo(text, category = "其他") {
  if (text.trim() === "") {
    aiResponse.textContent = "AI 回應：請輸入待辦事項內容。";
    return;
  }

  todos.push({
    text: text.trim(),
    category: category,
    done: false
  });

  saveTodos();
  renderTodos();
}

function setFilter(filter) {
  currentFilter = filter;
  renderTodos();
  aiResponse.textContent = "AI 回應：目前顯示「" + filter + "」分類。";
}

addTodoBtn.addEventListener("click", function () {
  addTodo(todoInput.value, categoryInput.value);
  aiResponse.textContent = "AI 回應：已新增待辦事項「" + todoInput.value + "」。";
  todoInput.value = "";
});

sendBtn.addEventListener("click", function () {
  const message = userInput.value.trim();

  if (message === "") {
    aiResponse.textContent = "AI 回應：請先輸入指令。";
    return;
  }

  if (message.includes("新增待辦") || message.includes("加入待辦")) {
    let todoText = message
      .replace("新增待辦：", "")
      .replace("新增待辦:", "")
      .replace("新增待辦", "")
      .replace("加入待辦：", "")
      .replace("加入待辦:", "")
      .replace("加入待辦", "")
      .trim();

    let category = "其他";

    if (todoText.includes("分類：")) {
      const parts = todoText.split("分類：");
      todoText = parts[0].trim();
      category = parts[1].trim();
    }

    if (!["學校", "生活", "工作", "其他"].includes(category)) {
      category = "其他";
    }

    addTodo(todoText, category);
    aiResponse.textContent = "AI 回應：已新增「" + todoText + "」，分類為「" + category + "」。";
  }

  else if (message.includes("完成待辦")) {
    const target = message
      .replace("完成待辦：", "")
      .replace("完成待辦:", "")
      .replace("完成待辦", "")
      .trim();

    const todo = todos.find(item => item.text.includes(target));

    if (todo) {
      todo.done = true;
      saveTodos();
      renderTodos();
      aiResponse.textContent = "AI 回應：已完成待辦「" + todo.text + "」。";
    } else {
      aiResponse.textContent = "AI 回應：找不到這個待辦事項。";
    }
  }

  else if (message.includes("刪除待辦")) {
    const target = message
      .replace("刪除待辦：", "")
      .replace("刪除待辦:", "")
      .replace("刪除待辦", "")
      .trim();

    const index = todos.findIndex(item => item.text.includes(target));

    if (index !== -1) {
      const deleted = todos[index].text;
      todos.splice(index, 1);
      saveTodos();
      renderTodos();
      aiResponse.textContent = "AI 回應：已刪除待辦「" + deleted + "」。";
    } else {
      aiResponse.textContent = "AI 回應：找不到這個待辦事項。";
    }
  }

  else if (message.includes("清除已完成")) {
    todos = todos.filter(todo => !todo.done);
    saveTodos();
    renderTodos();
    aiResponse.textContent = "AI 回應：已清除所有完成的待辦事項。";
  }

  else if (message.includes("有幾個待辦")) {
    aiResponse.textContent =
      "AI 回應：目前共有 " + todos.length +
      " 個待辦事項，其中 " +
      todos.filter(todo => todo.done).length +
      " 個已完成。";
  }

  else if (message.includes("切換主題")) {
    document.body.classList.toggle("light");
    aiResponse.textContent = "AI 回應：已切換網站主題。";
  }

  else {
    aiResponse.textContent =
      "AI 回應：我可以幫你新增、完成、刪除、查詢待辦，也可以切換主題。";
  }

  userInput.value = "";
});

clearDoneBtn.addEventListener("click", function () {
  todos = todos.filter(todo => !todo.done);
  saveTodos();
  renderTodos();
  aiResponse.textContent = "AI 回應：已清除完成項目。";
});

themeBtn.addEventListener("click", function () {
  document.body.classList.toggle("light");
});

renderTodos();