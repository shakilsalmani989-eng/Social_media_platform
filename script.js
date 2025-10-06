// --- Predefined Users with bio & avatar ---
const users = {
  alex: { name: "Alex", bio: "Tech enthusiast 💻 | Vloger  📷", avatar: "https://i.pravatar.cc/150?img=3" },
  john: { name: "John", bio: "Traveler ✈️ | Photographer 📷", avatar: "https://i.pravatar.cc/150?img=5" },
  sara: { name: "Sara", bio: "Foodie 🍕 | Designer 🎨", avatar: "https://i.pravatar.cc/150?img=9" },
  shakil: { name: "shakil salmani", bio: "Full Stack Developer", avatar: "../photo/Shakil photo.jpg" },
};

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
Object.keys(users).forEach(u => {
  const opt = document.createElement("option");
  opt.value = u;
  opt.textContent = users[u].name;
  userSelect.appendChild(opt);
});

updateUserInfo();

// --- Change User Info ---
userSelect.addEventListener("change", updateUserInfo);
function updateUserInfo() {
  const current = users[userSelect.value];
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
    const user = users[p.user];
    const postEl = document.createElement("div");
    postEl.className = "post";

    let shared = p.sharedFrom ? `<p><em>${user.name} shared ${users[p.sharedFrom].name}'s post</em></p>` :
      `<p><strong>${user.name}</strong> • <small>${p.timestamp}</small></p>`;

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
  post.likes.includes(u) ? post.likes = post.likes.filter(x => x !== u) : post.likes.push(u);
  savePosts(); renderPosts();
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
    box.innerHTML += `
      <div class="comment">
        <strong>${users[c.user].name}</strong>: ${c.text}
        <small style="color:gray;">(${c.time})</small>
        ${c.user === userSelect.value ? `
          <button onclick="editComment(${id}, ${i})">✏</button>
          <button onclick="deleteComment(${id}, ${i})">🗑</button>
        ` : ""}
      </div>`;
  });
}

function addComment(id) {
  const input = document.getElementById(`cmt-${id}`);
  const text = input.value.trim();
  if (!text) return;
  const p = posts.find(x => x.id === id);
  p.comments.push({ user: userSelect.value, text, time: new Date().toLocaleString() });
  input.value = ""; savePosts(); showComments(id);
}
function editComment(pid, idx) {
  const p = posts.find(x => x.id === pid);
  const txt = prompt("Edit comment:", p.comments[idx].text);
  if (txt) { p.comments[idx].text = txt; savePosts(); showComments(pid); }
}
function deleteComment(pid, idx) {
  const p = posts.find(x => x.id === pid);
  p.comments.splice(idx, 1);
  savePosts(); showComments(pid);
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
  savePosts(); renderPosts();
}

// --- Search User / Profile ---
searchBtn.addEventListener("click", () => {
  const name = searchInput.value.trim().toLowerCase();
  if (!name) return renderPosts();

  const foundUserKey = Object.keys(users).find(u => users[u].name.toLowerCase() === name);
  if (!foundUserKey) return alert("User not found!");

  const userPosts = posts.filter(p => p.user === foundUserKey);
  const totalLikes = userPosts.reduce((a,b)=>a+b.likes.length,0);
  const totalComments = userPosts.reduce((a,b)=>a+b.comments.length,0);
  const u = users[foundUserKey];

  profileSection.innerHTML = `
    <div class="create-post">
      <div class="user-info">
        <img src="${u.avatar}" width="60">
        <div><h3>${u.name}</h3><p>${u.bio}</p></div>
      </div>
      <p><strong>Total Likes:</strong> ${totalLikes} | <strong>Total Comments:</strong> ${totalComments}</p>
      <hr>
    </div>
  `;

  userPosts.forEach(p=>{
    const div=document.createElement("div");
    div.className="post";
    div.innerHTML=`<p>${p.text}</p>${p.image?`<img src="${p.image}">`:""}<small>${p.timestamp}</small>`;
    profileSection.appendChild(div);
  });

  profileSection.classList.remove("hidden");
  feed.innerHTML="";
});

// --- Reset ---
resetBtn.addEventListener("click", ()=>{
  if(confirm("Clear all posts?")){
    localStorage.clear();
    posts=[];
    renderPosts();
  }
});

function savePosts(){ localStorage.setItem("posts", JSON.stringify(posts)); }

renderPosts();
