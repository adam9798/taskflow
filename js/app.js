const client = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ---- Elements ----
const authView = document.getElementById("authView");
const appView = document.getElementById("appView");
const userBar = document.getElementById("userBar");
const userEmailEl = document.getElementById("userEmail");

const showLoginTab = document.getElementById("showLoginTab");
const showRegisterTab = document.getElementById("showRegisterTab");
const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");
const loginError = document.getElementById("loginError");
const registerError = document.getElementById("registerError");
const registerSuccess = document.getElementById("registerSuccess");
const logoutBtn = document.getElementById("logoutBtn");

const taskForm = document.getElementById("taskForm");
const taskTitleInput = document.getElementById("taskTitle");
const taskList = document.getElementById("taskList");
const emptyState = document.getElementById("emptyState");
const filterBtns = document.querySelectorAll(".filter-btn");

let currentUser = null;
let currentFilter = "all";
let tasks = [];

// ---- Auth tab switching ----
showLoginTab.addEventListener("click", () => {
  showLoginTab.classList.add("active");
  showRegisterTab.classList.remove("active");
  loginForm.classList.remove("hidden");
  registerForm.classList.add("hidden");
});

showRegisterTab.addEventListener("click", () => {
  showRegisterTab.classList.add("active");
  showLoginTab.classList.remove("active");
  registerForm.classList.remove("hidden");
  loginForm.classList.add("hidden");
});

// ---- Register ----
registerForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  registerError.textContent = "";
  registerSuccess.textContent = "";

  const email = document.getElementById("registerEmail").value.trim();
  const password = document.getElementById("registerPassword").value;

  const { error } = await client.auth.signUp({ email, password });

  if (error) {
    registerError.textContent = error.message;
    return;
  }

  registerSuccess.textContent = "Account created! You can now log in.";
  registerForm.reset();
});

// ---- Login ----
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  loginError.textContent = "";

  const email = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value;

  const { error } = await client.auth.signInWithPassword({ email, password });

  if (error) {
    loginError.textContent = error.message;
  }
});

// ---- Logout ----
logoutBtn.addEventListener("click", async () => {
  await client.auth.signOut();
});

// ---- Auth state changes ----
client.auth.onAuthStateChange((_event, session) => {
  currentUser = session ? session.user : null;
  renderAuthState();
  if (currentUser) {
    loadTasks();
  }
});

function renderAuthState() {
  if (currentUser) {
    authView.classList.add("hidden");
    appView.classList.remove("hidden");
    userBar.classList.remove("hidden");
    userEmailEl.textContent = currentUser.email;
  } else {
    authView.classList.remove("hidden");
    appView.classList.add("hidden");
    userBar.classList.add("hidden");
    tasks = [];
    renderTasks();
  }
}

// ---- Tasks CRUD ----
async function loadTasks() {
  const { data, error } = await client
    .from("tasks")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to load tasks:", error.message);
    return;
  }

  tasks = data;
  renderTasks();
}

taskForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const title = taskTitleInput.value.trim();
  if (!title) return;

  const { error } = await client
    .from("tasks")
    .insert({ title, completed: false, user_id: currentUser.id });

  if (error) {
    console.error("Failed to add task:", error.message);
    return;
  }

  taskTitleInput.value = "";
  loadTasks();
});

async function toggleTask(id, completed) {
  const { error } = await client
    .from("tasks")
    .update({ completed: !completed })
    .eq("id", id);

  if (error) {
    console.error("Failed to update task:", error.message);
    return;
  }
  loadTasks();
}

async function deleteTask(id) {
  const { error } = await client.from("tasks").delete().eq("id", id);

  if (error) {
    console.error("Failed to delete task:", error.message);
    return;
  }
  loadTasks();
}

// ---- Filters ----
filterBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    filterBtns.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    currentFilter = btn.dataset.filter;
    renderTasks();
  });
});

// ---- Render ----
function renderTasks() {
  taskList.innerHTML = "";

  const filtered = tasks.filter((t) => {
    if (currentFilter === "active") return !t.completed;
    if (currentFilter === "completed") return t.completed;
    return true;
  });

  emptyState.classList.toggle("hidden", filtered.length > 0);

  filtered.forEach((task) => {
    const li = document.createElement("li");
    li.className = "task-item" + (task.completed ? " completed" : "");

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = task.completed;
    checkbox.addEventListener("change", () => toggleTask(task.id, task.completed));

    const title = document.createElement("span");
    title.className = "task-title";
    title.textContent = task.title;

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "task-delete";
    deleteBtn.textContent = "Delete";
    deleteBtn.addEventListener("click", () => deleteTask(task.id));

    li.appendChild(checkbox);
    li.appendChild(title);
    li.appendChild(deleteBtn);
    taskList.appendChild(li);
  });
}
