import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { 
  getFirestore, collection, addDoc, getDocs, query, orderBy, serverTimestamp 
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

// 1. 본인의 Firebase 설정값으로 교체하세요
const firebaseConfig = {
  apiKey: "AIzaSyCA5N11Wgq0kxXdpUvhOBnxYZJX5n2pg-o",
  authDomain: "my-project-63a34.firebaseapp.com",
  projectId: "my-project-63a34",
  storageBucket: "my-project-63a34.firebasestorage.app",
  messagingSenderId: "268077417385",
  appId: "1:268077417385:web:0fb152f463556e334f3ab8"
};

// 2. Firebase 및 Firestore 초기화
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const guestbookCol = collection(db, "guestbook"); // 'guestbook' 컬렉션 참조

const form = document.getElementById("guestbook-form");
const listEl = document.getElementById("guestbook-list");

// 3. 데이터 불러오기 (Read - getDocs)
async function loadMessages() {
  listEl.innerHTML = "불러오는 중...";
  // 작성 시간(createdAt) 내림차순 정렬 쿼리
  const q = query(guestbookCol, orderBy("createdAt", "desc"));
  const querySnapshot = await getDocs(q);
  
  listEl.innerHTML = "";
  if (querySnapshot.empty) {
    listEl.innerHTML = "<p>첫 번째 방명록을 남겨보세요!</p>";
    return;
  }

  querySnapshot.forEach((doc) => {
    const data = doc.data();
    const dateStr = data.createdAt ? data.createdAt.toDate().toLocaleString() : "방금 전";
    
    const item = document.createElement("div");
    item.className = "entry";
    item.innerHTML = `
      <div class="nickname">${escapeHTML(data.nickname)} <span class="date">(${dateStr})</span></div>
      <div>${escapeHTML(data.message)}</div>
    `;
    listEl.appendChild(item);
  });
}

// 4. 데이터 저장하기 (Create - addDoc)
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const nicknameInput = document.getElementById("nickname");
  const messageInput = document.getElementById("message");

  try {
    await addDoc(guestbookCol, {
      nickname: nicknameInput.value.trim(),
      message: messageInput.value.trim(),
      createdAt: serverTimestamp() // 서버 기준 현재 시간 기록
    });
    
    nicknameInput.value = "";
    messageInput.value = "";
    await loadMessages(); // 등록 후 목록 새로고침
  } catch (error) {
    console.error("저장 실패:", error);
    alert("메시지 저장 중 오류가 발생했습니다.");
  }
});

// XSS 공격 방지를 위한 간단한 HTML 이스케이프 처리
function escapeHTML(str) {
  return str.replace(/[&<>'"]/g, tag => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
  }[tag]));
}

// 초기 실행
loadMessages();