/* ==========================================
   SceneNote — script.js
   로그인 / 회원가입 / 페이지 이동 로직
   ========================================== */

// ── 페이지 이동 유틸 ──────────────────────────
function navigateTo(url) {
  window.location.href = url;
}

// ── 로그인 처리 ──────────────────────────────
function handleLogin() {
  const email    = document.getElementById('email')?.value.trim();
  const password = document.getElementById('password')?.value.trim();

  if (!email || !password) {
    alert('이메일과 비밀번호를 입력해주세요.');
    return;
  }

  // 기존 가입된 유저 목록 가져오기
  const users = JSON.parse(localStorage.getItem('users') || '[]');
  const validUser = users.find(u => u.email === email && u.password === password);

  // 하드코딩 테스트 계정 또는 가입된 계정인지 검증
  if ((email === 'test@test.com' && password === '1234') || validUser) {
    const userName = validUser ? validUser.name : 'SceneNote 사용자 (테스트)';
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('userName', userName);
    navigateTo('main.html');
  } else {
    alert('이메일 또는 비밀번호가 올바르지 않습니다.');
  }
}

// ── 회원가입 처리 ─────────────────────────────
function handleSignup() {
  const name     = document.getElementById('signup-name')?.value.trim();
  const email    = document.getElementById('signup-email')?.value.trim();
  const password = document.getElementById('signup-password')?.value.trim();
  const confirmPassword = document.getElementById('signup-password-confirm')?.value.trim();

  if (!name || !email || !password || !confirmPassword) {
    alert('모든 항목을 입력해주세요.');
    return;
  }

  // 비밀번호 확인 체크
  if (password !== confirmPassword) {
    alert('비밀번호가 일치하지 않습니다.');
    return;
  }

  // 사용자 객체 생성
  const userData = {
    name: name,
    email: email,
    password: password, // 실무에서는 암호화가 필요하지만, 요청에 따라 로컬스토리지에 저장합니다.
    createdAt: new Date().toISOString()
  };

  // 기존 사용자 목록 가져오기 (없으면 빈 배열)
  const users = JSON.parse(localStorage.getItem('users') || '[]');

  // 이메일 중복 체크
  if (users.some(user => user.email === email)) {
    alert('이미 가입된 이메일입니다.');
    return;
  }

  // 새로운 사용자 추가 및 저장
  users.push(userData);
  localStorage.setItem('users', JSON.stringify(users));

  alert('회원가입이 완료되었습니다! 로그인 페이지로 이동합니다.');
  navigateTo('login.html');
}

// ── 로그아웃 처리 ─────────────────────────────
function logout() {
  localStorage.clear();
  navigateTo('index.html');
}

// ── main.html 진입 보호 ───────────────────────
function checkAuth() {
  const isLoggedIn = localStorage.getItem('isLoggedIn');
  if (!isLoggedIn) {
    navigateTo('index.html');
    return false;
  }
  return true;
}

// ── 탭 전환 ───────────────────────────────────
function showTab(tabName) {
  // 모든 탭 섹션 숨기기
  const sections = document.querySelectorAll('.tab-content');
  sections.forEach(s => s.style.display = 'none');

  // 모든 탭 버튼 비활성화
  const buttons = document.querySelectorAll('.tab-btn');
  buttons.forEach(b => b.classList.remove('active'));

  // 선택된 탭 표시
  const target = document.getElementById('tab-' + tabName);
  if (target) target.style.display = 'block';

  // 선택된 버튼 활성화
  const activeBtn = document.querySelector(`[data-tab="${tabName}"]`);
  if (activeBtn) activeBtn.classList.add('active');
}

// ────────────────────────────────────────────────
//  스토리보드 (localStorage 키: "sn_scenes")
// ────────────────────────────────────────────────
function getScenes() {
  return JSON.parse(localStorage.getItem('sn_scenes') || '[]');
}

function saveScenes(scenes) {
  localStorage.setItem('sn_scenes', JSON.stringify(scenes));
}

function addScene() {
  const scenes = getScenes();
  const newScene = {
    id:          Date.now(),
    sceneNumber: scenes.length + 1,
    location:    '',
    characters:  '',
    description: '',
    imageUrl:    '',
    duration:    0
  };
  scenes.push(newScene);
  saveScenes(scenes);
  renderScenes();
}

function deleteScene(id) {
  let scenes = getScenes().filter(s => s.id !== id);
  // 씬 번호 재정렬
  scenes = scenes.map((s, i) => ({ ...s, sceneNumber: i + 1 }));
  saveScenes(scenes);
  renderScenes();
}

function saveScene(id, field, value) {
  const scenes = getScenes();
  const idx = scenes.findIndex(s => s.id === id);
  if (idx !== -1) {
    scenes[idx][field] = value;
    // 이미지 URL 변경 시 img 태그 업데이트
    if (field === 'imageUrl') {
      const img = document.getElementById(`img-${id}`);
      if (img) img.src = value;
    }
    saveScenes(scenes);
  }
}

function renderScenes() {
  const container = document.getElementById('scenes-container');
  if (!container) return;

  const scenes = getScenes();

  if (scenes.length === 0) {
    container.innerHTML = `
      <div style="grid-column:1/-1; text-align:center; color:var(--text-muted); padding:40px 0;">
        <p style="font-size:36px; margin-bottom:12px;">🎬</p>
        <p>아직 씬이 없습니다. "+ 씬 추가" 버튼을 눌러 시작하세요.</p>
      </div>`;
    return;
  }

  container.innerHTML = scenes.map(scene => `
    <div class="card scene-card">
      <div class="scene-img-wrap">
        <img id="img-${scene.id}"
          src="${scene.imageUrl || ''}"
          alt="씬 이미지"
          style="display:${scene.imageUrl ? 'block' : 'none'};"
          onerror="this.style.display='none';"
        />
        ${!scene.imageUrl ? '<div class="scene-img-placeholder">🎞 이미지 없음</div>' : ''}
      </div>
      <div class="scene-header">
        <span class="scene-number">SCENE ${String(scene.sceneNumber).padStart(2, '0')}</span>
        <button class="btn-danger" onclick="deleteScene(${scene.id})">씬 삭제</button>
      </div>
      <div class="scene-fields">
        <label class="input-label">장소</label>
        <input class="field-input" value="${scene.location}" placeholder="장소"
          oninput="saveScene(${scene.id},'location',this.value)" />

        <label class="input-label">등장인물</label>
        <input class="field-input" value="${scene.characters}" placeholder="등장인물"
          oninput="saveScene(${scene.id},'characters',this.value)" />

        <label class="input-label">내용</label>
        <textarea class="field-textarea" rows="3" placeholder="씬 내용"
          oninput="saveScene(${scene.id},'description',this.value)">${scene.description}</textarea>

        <label class="input-label">이미지 URL</label>
        <input class="field-input" value="${scene.imageUrl}" placeholder="https://..."
          oninput="saveScene(${scene.id},'imageUrl',this.value)" />

        <label class="input-label">예상 시간</label>
        <div style="display:flex;align-items:center;gap:8px;">
          <input class="field-input" type="number" min="0" value="${scene.duration}"
            style="width:80px;"
            oninput="saveScene(${scene.id},'duration',this.value)" />
          <span style="color:var(--text-muted);font-size:13px;">분</span>
        </div>
      </div>
    </div>
  `).join('');
}

// ────────────────────────────────────────────────
//  아이디어 노트 (localStorage 키: "sn_memos")
// ────────────────────────────────────────────────
function getMemos() {
  return JSON.parse(localStorage.getItem('sn_memos') || '[]');
}

function saveMemos(memos) {
  localStorage.setItem('sn_memos', JSON.stringify(memos));
}

function addMemo() {
  const input = document.getElementById('memo-input');
  if (!input || !input.value.trim()) return;

  const memos = getMemos();
  memos.unshift({
    id:        Date.now(),
    content:   input.value.trim(),
    createdAt: new Date().toLocaleString('ko-KR', {
      year:'numeric', month:'2-digit', day:'2-digit',
      hour:'2-digit', minute:'2-digit'
    })
  });
  saveMemos(memos);
  input.value = '';
  renderMemos();
}

function deleteMemo(id) {
  saveMemos(getMemos().filter(m => m.id !== id));
  renderMemos();
}

function renderMemos() {
  const container = document.getElementById('memos-container');
  if (!container) return;

  const memos = getMemos();

  if (memos.length === 0) {
    container.innerHTML = `
      <div style="text-align:center; color:var(--text-muted); padding:40px 0;">
        <p style="font-size:32px; margin-bottom:12px;">💡</p>
        <p>아이디어가 떠오르면 바로 메모하세요!</p>
      </div>`;
    return;
  }

  container.innerHTML = memos.map(memo => `
    <div class="memo-card">
      <p class="memo-content">${memo.content.replace(/\n/g, '<br>')}</p>
      <div class="memo-footer">
        <span class="memo-date">${memo.createdAt}</span>
        <button class="btn-danger" onclick="deleteMemo(${memo.id})">삭제</button>
      </div>
    </div>
  `).join('');
}

// ────────────────────────────────────────────────
//  회의록 (localStorage 키: "sn_meetings")
// ────────────────────────────────────────────────
function getMeetings() {
  return JSON.parse(localStorage.getItem('sn_meetings') || '[]');
}

function saveMeetings(meetings) {
  localStorage.setItem('sn_meetings', JSON.stringify(meetings));
}

function toggleMeetingForm() {
  const form = document.getElementById('meeting-form');
  if (!form) return;
  form.style.display = form.style.display === 'none' ? 'block' : 'none';
}

function addMeeting() {
  const date    = document.getElementById('meeting-date')?.value;
  const title   = document.getElementById('meeting-title')?.value.trim();
  const content = document.getElementById('meeting-content')?.value.trim();

  if (!date || !title || !content) {
    alert('날짜, 제목, 내용을 모두 입력해주세요.');
    return;
  }

  const meetings = getMeetings();
  meetings.unshift({ id: Date.now(), date, title, content });
  saveMeetings(meetings);

  // 폼 초기화 & 숨기기
  document.getElementById('meeting-date').value    = '';
  document.getElementById('meeting-title').value   = '';
  document.getElementById('meeting-content').value = '';
  toggleMeetingForm();
  renderMeetings();
}

function deleteMeeting(id) {
  saveMeetings(getMeetings().filter(m => m.id !== id));
  renderMeetings();
}

function renderMeetings() {
  const container = document.getElementById('meetings-container');
  if (!container) return;

  const meetings = getMeetings();

  if (meetings.length === 0) {
    container.innerHTML = `
      <div style="text-align:center; color:var(--text-muted); padding:40px 0;">
        <p style="font-size:32px; margin-bottom:12px;">📝</p>
        <p>회의 내용을 기록하고 팀원과 공유하세요.</p>
      </div>`;
    return;
  }

  container.innerHTML = meetings.map(m => `
    <div class="card meeting-card">
      <div class="meeting-header">
        <span class="meeting-date">${m.date}</span>
        <button class="btn-danger" onclick="deleteMeeting(${m.id})">삭제</button>
      </div>
      <h3 class="meeting-title">${m.title}</h3>
      <p class="meeting-content">${m.content.replace(/\n/g, '<br>')}</p>
    </div>
  `).join('');
}

// ────────────────────────────────────────────────
//  소스 라이브러리 (localStorage 키: "sn_sources")
// ────────────────────────────────────────────────
function getSources() {
  return JSON.parse(localStorage.getItem('sn_sources') || '[]');
}

function saveSources(sources) {
  localStorage.setItem('sn_sources', JSON.stringify(sources));
}

function toggleSourceForm() {
  const form = document.getElementById('source-form');
  if (!form) return;
  form.style.display = form.style.display === 'none' ? 'block' : 'none';
}

function addSource() {
  const url  = document.getElementById('source-url')?.value.trim();
  const desc = document.getElementById('source-desc')?.value.trim();
  const type = document.getElementById('source-type')?.value;

  if (!url) {
    alert('URL을 입력해주세요.');
    return;
  }

  const sources = getSources();
  sources.unshift({ id: Date.now(), url, description: desc, type });
  saveSources(sources);

  document.getElementById('source-url').value  = '';
  document.getElementById('source-desc').value = '';
  toggleSourceForm();
  renderSources();
}

function deleteSource(id) {
  saveSources(getSources().filter(s => s.id !== id));
  renderSources();
}

const TYPE_BADGE = {
  '이미지': 'badge--img',
  '영상':   'badge--video',
  '음악':   'badge--music',
  '기타':   'badge--etc'
};

function renderSources() {
  const container = document.getElementById('sources-container');
  if (!container) return;

  const sources = getSources();

  if (sources.length === 0) {
    container.innerHTML = `
      <div style="grid-column:1/-1; text-align:center; color:var(--text-muted); padding:40px 0;">
        <p style="font-size:32px; margin-bottom:12px;">🎞</p>
        <p>참고할 이미지, 영상, 음악 URL을 저장하세요.</p>
      </div>`;
    return;
  }

  container.innerHTML = sources.map(s => `
    <div class="card source-card">
      <div class="source-header">
        <span class="badge ${TYPE_BADGE[s.type] || 'badge--etc'}">${s.type}</span>
        <button class="btn-danger" onclick="deleteSource(${s.id})">삭제</button>
      </div>
      <a href="${s.url}" target="_blank" rel="noopener" class="source-url">${s.url}</a>
      ${s.description ? `<p class="source-desc">${s.description}</p>` : ''}
    </div>
  `).join('');
}

// ────────────────────────────────────────────────
//  페이지 로드 시 초기화
// ────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  const path = window.location.pathname;

  // main.html 진입 보호
  if (path.includes('main.html')) {
    if (!checkAuth()) return;
    showTab('storyboard');
    renderScenes();
    renderMemos();
    renderMeetings();
    renderSources();
  }
});
