
/* DARK MODE AND LIGHT MODE START */

function modes() {
  const mode = document.getElementById("mode");
  if (!mode) return; // <-- agar mode icon page pe nahi hai, to aage mat jao

  mode.addEventListener("click", () => {
    document.body.classList.toggle("light");

    if (document.body.classList.contains("light")) {
      mode.innerHTML = "🌙";
    } else {
      mode.innerHTML = "☀️";
    }
  });
}
modes();

/*DARK MODE AND LIGHT MODE END */


// --- SIGNUP PAGE START ---
function signup() {
  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  const bio = document.getElementById("bio").value.trim();
  const avatarFile = document.getElementById("avatar").files[0];

  if (!name || !email || !password) {
    alert("Please fill all required fields!");
    return;
  }

  let users = JSON.parse(localStorage.getItem("users")) || [];
  if (users.find(u => u.email === email)) {
    alert("Email already registered! Please login.");
    window.location.href = "index.html";
    return;
  }

  const reader = new FileReader();
  reader.onload = function(e) {
    const avatar = e.target.result || null;
    const newUser = { name, email, password, bio, avatar };
    users.push(newUser);
    localStorage.setItem("users", JSON.stringify(users));
    alert("Signup successful! Please login.");
    window.location.href = "login.html";
  };
  if (avatarFile) reader.readAsDataURL(avatarFile);
  else reader.onload({ target: { result: null } });
}
//----- SIGNUP PAGE END ----


// --- LOGIN PAGE START---
function login() {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!email || !password) {
    alert("Please enter all fields!");
    return;
  }

  const users = JSON.parse(localStorage.getItem("users")) || [];
  const user = users.find(u => u.email === email && u.password === password);

  if (!user) return alert("Invalid email or password!");

  localStorage.setItem("loggedInUser", JSON.stringify(user));
  alert("Login successful!");
  window.location.href = "Dashboard.html";
}

// --- CHECK LOGIN STATUS FUNCTION ---
function checkLogin() {
  const user = JSON.parse(localStorage.getItem("loggedInUser"));
  if (!user) {
    window.location.href = "login.html";
  } else {
    console.log("Logged in as:", user.name);
  }
}

// --- LOGOUT FUNCTION ---
function logout() {
  localStorage.removeItem("loggedInUser");
  alert("Logged out successfully!");
  window.location.href = "login.html";
}
// --- LOGIN PAGE END---




// -------------------------------------------------------------------
// --- SOCIAL MEDIA SECTION ---
// -------------------------------------------------------------------

// --- Predefined Users with bio & avatar ---
let usersList = {
  alex: { name: "Alex", bio: "Tech enthusiast 💻 | Vlogger 📷", avatar: "https://i.pravatar.cc/150?img=3" },
  john: { name: "John", bio: "Traveler ✈️ | Photographer 📷", avatar: "https://i.pravatar.cc/150?img=5" },
  sara: { name: "Sara", bio: "Foodie 🍕 | Designer 🎨", avatar: "https://i.pravatar.cc/150?img=9" },
};

// --- Merge predefined users + new signup users ---
const savedUsers = JSON.parse(localStorage.getItem("users")) || [];
savedUsers.forEach(u => {
  usersList[u.email] = { name: u.name, bio: u.bio, avatar: u.avatar };
});



// --- DOM Elements ---
const userSelect = document.getElementById("userSelect");
const feed = document.getElementById("feed");
const profileSection = document.getElementById("profileSection");
const createPostBtn = document.getElementById("createPost");
const searchBtn = document.getElementById("searchBtn");
const searchInput = document.getElementById("searchInput");
const resetBtn = document.getElementById("resetBtn");
const userAvatar = document.getElementById("userAvatar");
const userName = document.getElementById("userName");
const userBio = document.getElementById("userBio");

// --- Load Saved Posts ---
let posts = JSON.parse(localStorage.getItem("posts")) || [];

// --- Populate User Dropdown ---
Object.keys(usersList).forEach(u => {
  const opt = document.createElement("option");
  opt.value = u;
  opt.textContent = usersList[u].name;
  userSelect.appendChild(opt);
});

// --- Default logged in user selected ---
const loggedUser = JSON.parse(localStorage.getItem("loggedInUser"));
if (loggedUser) {
  const foundKey = Object.keys(usersList).find(k => usersList[k].name === loggedUser.name);
  userSelect.value = foundKey || Object.keys(usersList)[0];
}

updateUserInfo();

// --- Change User Info ---
userSelect.addEventListener("change", updateUserInfo);
function updateUserInfo() {
  const current = usersList[userSelect.value];
  if (!current) return;
  userAvatar.src = current.avatar;
  userName.textContent = current.name;
  userBio.textContent = current.bio;
  renderPosts();
}

// --- Create Post ---
createPostBtn.addEventListener("click", () => {
  const text = document.getElementById("postText").value.trim();
  const imageInput = document.getElementById("postImage");
  const currentUser = userSelect.value;

  if (!text && !imageInput.files.length) return alert("Write something or upload image!");

  const reader = new FileReader();
  reader.onload = function (e) {
    const post = {
      id: Date.now(),
      user: currentUser,
      text,
      image: imageInput.files.length ? e.target.result : null,
      likes: [],
      comments: [],
      timestamp: new Date().toLocaleString(),
      sharedFrom: null
    };
    posts.unshift(post);
    savePosts();
    document.getElementById("postText").value = "";
    imageInput.value = "";
    renderPosts();
  };
  if (imageInput.files.length) reader.readAsDataURL(imageInput.files[0]);
  else reader.onload();
});

// --- Render Posts ---
function renderPosts() {
  feed.innerHTML = "";
  profileSection.classList.add("hidden");

  posts.forEach(p => {
    const user = usersList[p.user];
    if (!user) return;
    const postEl = document.createElement("div");
    postEl.className = "post";

    let shared = p.sharedFrom
      ? `<p><em>${user.name} shared ${usersList[p.sharedFrom].name}'s post</em></p>`
      : `<p><strong>${user.name}</strong> • <small>${p.timestamp}</small></p>`;

    postEl.innerHTML = `
      ${shared}
      <p>${p.text}</p>
      ${p.image ? `<img src="${p.image}">` : ""}
      <div class="actions">
        <button onclick="toggleLike(${p.id})">❤️ ${p.likes.length}</button>
        <button onclick="toggleComments(${p.id})">💬 ${p.comments.length}</button>
        <button onclick="sharePost(${p.id})">🔁</button>
      </div>
      <div id="comments-${p.id}" class="comment-section hidden"></div>
    `;
    feed.appendChild(postEl);
  });
}

// --- Likes ---
function toggleLike(id) {
  const u = userSelect.value;
  const post = posts.find(p => p.id === id);
  if (!post) return;
  post.likes.includes(u)
    ? (post.likes = post.likes.filter(x => x !== u))
    : post.likes.push(u);
  savePosts();
  renderPosts();
}

// --- Comments ---
function toggleComments(id) {
  const box = document.getElementById(`comments-${id}`);
  box.classList.toggle("hidden");
  if (!box.classList.contains("hidden")) showComments(id);
}

function showComments(id) {
  const post = posts.find(p => p.id === id);
  const box = document.getElementById(`comments-${id}`);
  box.innerHTML = `
    <input type="text" id="cmt-${id}" placeholder="Write a comment...">
    <button onclick="addComment(${id})">Add</button>
  `;
  post.comments.forEach((c, i) => {
    const uname = usersList[c.user]?.name || "Unknown";
    box.innerHTML += `
      <div class="comment">
        <strong>${uname}</strong>: ${c.text}
        <small style="color:gray;">(${c.time})</small>
        ${c.user === userSelect.value ? `
          <button onclick="editComment(${id}, ${i})">✏</button>
          <button onclick="deleteComment(${id}, ${i})">🗑</button>` : ""}
      </div>`;
  });
}

function addComment(id) {
  const input = document.getElementById(`cmt-${id}`);
  const text = input.value.trim();
  if (!text) return;
  const p = posts.find(x => x.id === id);
  p.comments.push({ user: userSelect.value, text, time: new Date().toLocaleString() });
  input.value = "";
  savePosts();
  showComments(id);
}

function editComment(pid, idx) {
  const p = posts.find(x => x.id === pid);
  const txt = prompt("Edit comment:", p.comments[idx].text);
  if (txt) {
    p.comments[idx].text = txt;
    savePosts();
    showComments(pid);
  }
}

function deleteComment(pid, idx) {
  const p = posts.find(x => x.id === pid);
  p.comments.splice(idx, 1);
  savePosts();
  showComments(pid);
}

// --- Share ---
function sharePost(id) {
  const original = posts.find(p => p.id === id);
  const shared = {
    ...original,
    id: Date.now(),
    user: userSelect.value,
    sharedFrom: original.user,
    likes: [],
    comments: [],
    timestamp: new Date().toLocaleString()
  };
  posts.unshift(shared);
  savePosts();
  renderPosts();
}

// --- Search User / Profile ---
searchBtn.addEventListener("click", () => {
  const name = searchInput.value.trim().toLowerCase();
  if (!name) return renderPosts();

  const foundKey = Object.keys(usersList).find(u => usersList[u].name.toLowerCase() === name);
  if (!foundKey) return alert("User not found!");

  const userPosts = posts.filter(p => p.user === foundKey);
  const totalLikes = userPosts.reduce((a, b) => a + b.likes.length, 0);
  const totalComments = userPosts.reduce((a, b) => a + b.comments.length, 0);
  const u = usersList[foundKey];

  profileSection.innerHTML = `
    <div class="create-post">
    <h2>Your Friends Profile </h2>
      <div class="user-info">
        <img src="${u.avatar}" width="60">
        <div><h3>${u.name}</h3><p>Bio, ${u.bio}</p></div>
      </div>
      <p><strong>Total Likes:</strong> ${totalLikes} | <strong>Total Comments:</strong> ${totalComments}</p>
      <hr>
    </div>
  `;

  userPosts.forEach(p => {
    const div = document.createElement("div");
    div.className = "post";
    div.innerHTML = `<p>${p.text}</p>${p.image ? `<img src="${p.image}">` : ""}<small>${p.timestamp}</small>`;
    profileSection.appendChild(div);
  });

  profileSection.classList.remove("hidden");
  feed.innerHTML = "";
});

// --- Reset ---
resetBtn.addEventListener("click", () => {
  if (confirm("Clear all posts?")) {
    localStorage.removeItem("posts");
    posts = [];
    renderPosts();
  }
});

function savePosts() {
  localStorage.setItem("posts", JSON.stringify(posts));
}

renderPosts();
