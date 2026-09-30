// =========================================
// app.js : 화면을 그리고 버튼 클릭을 처리하는 곳
// 흐름: 데이터(state)를 바꾼다 → save() → render() 로 화면을 다시 그린다
// =========================================

// ---------- 1. 저장과 불러오기 ----------
// 브라우저의 localStorage 에 저장해서, 새로고침해도 섭외 상태·메모가 남게 합니다.
const STORAGE_KEY = "tubematch-demo";

function load() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    // 저장소를 못 쓰는 환경이면 그냥 예시 데이터로 시작합니다.
  }
  return JSON.parse(JSON.stringify(STARTER_DATA)); // 예시 데이터를 복사해서 사용
}

function save() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {}
}

let state = load();

// 화면 상태(저장할 필요 없는 것): 지금 보는 페이지, 검색어, 필터
const ui = { page: "explore", search: "", category: "전체", size: "전체" };

// ---------- 2. 작은 도우미 함수들 ----------
// 예시 채널 + 사용자가 추가한 채널을 합친 전체 목록
function allChannels() {
  return SAMPLE_CHANNELS.concat(state.addedChannels);
}
function findChannel(id) {
  return allChannels().find((c) => c.id === id);
}

// 284000 → "28만", 143000000 → "1.4억"
function short(n) {
  if (n == null) return "-";
  if (n >= 100000000) return (n / 100000000).toFixed(1).replace(".0", "") + "억";
  if (n >= 10000) return (n / 10000).toFixed(n >= 100000 ? 0 : 1).replace(".0", "") + "만";
  return n.toLocaleString("ko-KR");
}
// 48200 → "48,200"
function comma(n) {
  return n == null ? "-" : n.toLocaleString("ko-KR");
}
// 사용자가 입력한 글자를 화면에 안전하게 넣기 위한 처리 (<script> 같은 걸 막음)
function esc(text) {
  return String(text).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
}
function avatar(c) {
  return `<div class="avatar" style="background:${c.color}">${esc(c.name[0])}</div>`;
}
function toast(message) {
  const el = document.getElementById("toast");
  el.textContent = message;
  el.hidden = false;
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => (el.hidden = true), 2200);
}

// ---------- 3. 페이지 ① 채널 탐색 (기획서 F1, F2) ----------
function renderExplore() {
  // 필터 조건에 맞는 채널만 고르기
  const list = allChannels().filter((c) => {
    const text = (c.name + c.handle).toLowerCase();
    if (ui.search && !text.includes(ui.search.toLowerCase())) return false;
    if (ui.category !== "전체" && c.category !== ui.category) return false;
    if (ui.size === "1만 미만" && c.subs >= 10000) return false;
    if (ui.size === "1만~10만" && (c.subs < 10000 || c.subs >= 100000)) return false;
    if (ui.size === "10만 이상" && c.subs < 100000) return false;
    return true;
  });

  const categories = ["전체", ...new Set(allChannels().map((c) => c.category))];
  const sizes = ["전체", "1만 미만", "1만~10만", "10만 이상"];

  const rows = list.map((c) => {
    const inGroup = state.pipeline[c.id];
    let type = "-";
    if (c.shortsRatio != null) type = c.shortsRatio > 0.5 ? "쇼츠 위주" : "동영상 위주";
    return `
      <tr class="clickable" data-action="open" data-id="${c.id}">
        <td><div class="who">${avatar(c)}<div><b>${esc(c.name)}</b><span>${esc(c.handle)}</span></div></div></td>
        <td><span class="tag">${esc(c.category)}</span></td>
        <td class="right num">${short(c.subs)}</td>
        <td class="right num">${c.lastUpload == null ? "-" : c.lastUpload + "일 전"}</td>
        <td><span class="tag est">${type} · 추정</span></td>
        <td class="right">${
          inGroup
            ? `<span class="tag ad">${inGroup}</span>`
            : `<button class="btn small" data-action="add-to-group" data-id="${c.id}">그룹에 담기</button>`
        }</td>
      </tr>`;
  }).join("");

  return `
    <div class="notice">연습용 데모 · 가상의 채널과 수치입니다</div>
    <div class="head">
      <div><h1>채널 탐색</h1><p class="desc">조건을 골라 섭외 후보 채널을 찾아보세요.</p></div>
    </div>

    <div class="filters">
      <input id="search" class="field" placeholder="채널명·@핸들 검색" value="${esc(ui.search)}">
      <select id="category" class="field">${categories.map((x) => `<option ${x === ui.category ? "selected" : ""}>${x}</option>`).join("")}</select>
      <select id="size" class="field">${sizes.map((x) => `<option ${x === ui.size ? "selected" : ""}>${x}</option>`).join("")}</select>
    </div>

    <div class="box" style="padding:4px 8px">
      <div class="table-wrap"><table>
        <thead><tr><th>채널</th><th>카테고리</th><th class="right">구독자</th><th class="right">최근 업로드</th><th>영상 유형</th><th></th></tr></thead>
        <tbody>${rows || `<tr><td colspan="6" style="text-align:center;padding:28px;color:var(--sub)">조건에 맞는 채널이 없습니다. 아래에서 채널 주소로 추가해 보세요.</td></tr>`}</tbody>
      </table></div>
    </div>
    <p class="small-note">필터는 YouTube 공식 수치(구독자·업로드일)만 씁니다. 행을 누르면 채널 리포트가 열립니다.</p>

    <div class="box" style="margin-top:16px">
      <h2>채널 URL로 추가</h2>
      <div class="row">
        <input id="channel-url" class="field" placeholder="https://www.youtube.com/@handle 또는 @handle">
        <button class="btn primary" data-action="fetch-channel">추가</button>
      </div>
      <p class="small-note">${YOUTUBE_API_KEY ? "API 키가 설정되어 있어 진짜 YouTube 데이터를 가져옵니다." : "지금은 API 키가 없어서 가짜 채널이 만들어집니다. api.js에 키를 넣으면 진짜 데이터로 바뀝니다."}</p>
    </div>`;
}

// ---------- 4. 채널 리포트 창 (기획서 F3, F5) ----------
function openChannel(id) {
  const c = findChannel(id);
  const status = state.pipeline[id];
  const memos = state.memos[id] || [];

  // 최근 영상 표 (예시 템플릿으로 만든 가짜 영상)
  let videoRows = "";
  if (c.avgViews != null) {
    videoRows = SAMPLE_VIDEO_TEMPLATE.map((v) => {
      const views = Math.round(c.avgViews * v.ratio);
      return `<tr>
        <td>${esc(v.title)} ${v.title.startsWith("#shorts") ? '<span class="tag est">쇼츠 추정</span>' : ""} ${v.sponsor ? `<span class="tag ad">협찬 · ${v.sponsor}</span>` : ""}</td>
        <td class="right num">${v.daysAgo + (c.lastUpload || 0)}일 전</td>
        <td class="right num">${comma(views)}</td>
      </tr>`;
    }).join("");
  }

  // 자체 지표 예시: 평균 조회수 ÷ 구독자 (YouTube 공식 지표가 아님)
  const viewRate = c.avgViews != null ? ((c.avgViews / c.subs) * 100).toFixed(1) + "%" : "-";

  document.getElementById("modal-body").innerHTML = `
    <div class="head" style="margin:0">
      <div class="who">${avatar(c)}<div><h1>${esc(c.name)}</h1><span>${esc(c.handle)} · ${esc(c.category)}${c.isFake ? " · 가짜 데이터" : ""}</span></div></div>
      <button class="btn" data-action="close">닫기</button>
    </div>

    <div>
      <h2>YouTube 공식 지표 <span class="tag yt">YouTube 제공</span></h2>
      <div class="tiles">
        <div class="tile"><div class="small-note" style="margin:0">구독자</div><div class="value num">${short(c.subs)}</div></div>
        <div class="tile"><div class="small-note" style="margin:0">누적 조회수</div><div class="value num">${short(c.views)}</div></div>
        <div class="tile"><div class="small-note" style="margin:0">영상 수</div><div class="value num">${comma(c.videoCount)}</div></div>
      </div>
    </div>

    <div class="derived">
      <b>튜브매치 자체 지표</b> · YouTube 공식 지표가 아니라 공식 수치로 계산한 값입니다.<br>
      최근 평균 조회수 <b class="num">${short(c.avgViews)}</b> ÷ 구독자 = 구독자 대비 조회율 <b class="num">${viewRate}</b>
    </div>

    ${videoRows ? `<div>
      <h2>최근 콘텐츠</h2>
      <div class="table-wrap"><table>
        <thead><tr><th>영상</th><th class="right">게시</th><th class="right">조회수</th></tr></thead>
        <tbody>${videoRows}</tbody>
      </table></div>
    </div>` : `<p class="small-note">최근 영상은 아직 불러오지 않았습니다. (api.js의 연습 과제 참고)</p>`}

    <div>
      <h2>섭외 상태</h2>
      <div class="status-btns">
        ${STATUSES.map((s) => `<button class="${s === status ? "on" : ""}" data-action="set-status" data-id="${id}" data-status="${s}">${s}</button>`).join("")}
      </div>
      ${status ? "" : '<p class="small-note">아직 그룹에 담지 않은 채널입니다. 단계를 고르면 섭외 보드에 추가됩니다.</p>'}
    </div>

    <div>
      <h2>팀 메모</h2>
      <div class="memo-list">
        ${memos.map((m) => `<p>${esc(m.text)}<br><span class="small-note">${esc(m.who)} · ${esc(m.when)}</span></p>`).join("") || '<span class="small-note" style="margin:0">메모가 없습니다.</span>'}
      </div>
      <div class="row">
        <input id="memo-input" class="field" placeholder="팀원에게 남길 메모">
        <button class="btn" data-action="add-memo" data-id="${id}">저장</button>
      </div>
    </div>`;

  document.getElementById("modal").hidden = false;
  document.getElementById("modal").dataset.id = id;
}

function closeChannel() {
  document.getElementById("modal").hidden = true;
}

// ---------- 5. 페이지 ② 섭외 보드 (기획서 F4, F5) ----------
function renderBoard() {
  const ids = Object.keys(state.pipeline);

  const columns = STATUSES.map((status, index) => {
    const cards = ids
      .filter((id) => state.pipeline[id] === status)
      .map((id) => {
        const c = findChannel(id);
        const memoCount = (state.memos[id] || []).length;
        return `
          <div class="kcard">
            <div class="who" data-action="open" data-id="${id}" style="cursor:pointer">${avatar(c)}<div><b>${esc(c.name)}</b><span>구독자 ${short(c.subs)} · 메모 ${memoCount}</span></div></div>
            <div class="moves">
              ${index > 0 ? `<button data-action="move" data-id="${id}" data-dir="-1">← 이전</button>` : "<span></span>"}
              ${index < STATUSES.length - 1 ? `<button data-action="move" data-id="${id}" data-dir="1">다음 →</button>` : ""}
            </div>
          </div>`;
      }).join("");
    const count = ids.filter((id) => state.pipeline[id] === status).length;
    return `<div class="column"><h3>${status}<span>${count}</span></h3>${cards}</div>`;
  }).join("");

  return `
    <div class="notice">연습용 데모 · 가상의 채널과 수치입니다</div>
    <div class="head">
      <div><h1>섭외 보드</h1><p class="desc">그룹 "가을 수분크림 런칭" · 버튼으로 카드를 다음 단계로 옮기세요.</p></div>
      <button class="btn" data-action="export">CSV 내보내기</button>
    </div>
    <div class="board">${columns}</div>`;
}

// ---------- 6. 페이지 ③ 캠페인 (기획서 F6) ----------
function renderCampaign() {
  const camp = state.campaign;

  // 합계 구하기
  let totalViews = 0, totalLikes = 0, totalComments = 0, totalFee = 0;
  camp.videos.forEach((v) => {
    totalViews += v.views;
    totalLikes += v.likes;
    totalComments += v.comments;
    totalFee += v.fee;
  });

  const rows = camp.videos.map((v) => {
    const c = findChannel(v.channelId);
    const costPerView = (v.fee / v.views).toFixed(1); // 조회당 비용 = 원고료 ÷ 조회수
    return `<tr>
      <td><div class="who">${avatar(c)}<div><b>${esc(v.title)}</b><span>${esc(c.name)}</span></div></div></td>
      <td class="right num">${comma(v.views)}</td>
      <td class="right num">${comma(v.likes)}</td>
      <td class="right num">${comma(v.comments)}</td>
      <td class="right num">${comma(v.fee)}원</td>
      <td class="right num">${costPerView}원</td>
    </tr>`;
  }).join("");

  // 협찬 영상을 등록할 수 있는 채널 = 섭외 상태가 "확정"인 채널
  const confirmed = Object.keys(state.pipeline).filter((id) => state.pipeline[id] === "확정");

  return `
    <div class="notice">연습용 데모 · 가상의 채널과 수치입니다</div>
    <div class="head">
      <div><h1>${esc(camp.name)}</h1><p class="desc">진행 중 · 협찬 영상 성과를 한곳에서 확인합니다.</p></div>
    </div>

    <div class="stats">
      <div class="box stat"><div class="label">조회수 합계</div><div class="value num">${comma(totalViews)}</div></div>
      <div class="box stat"><div class="label">좋아요 합계</div><div class="value num">${comma(totalLikes)}</div></div>
      <div class="box stat"><div class="label">댓글 합계</div><div class="value num">${comma(totalComments)}</div></div>
      <div class="box stat"><div class="label">집행 원고료 / 예산</div><div class="value num">${short(totalFee)} / ${short(camp.budget)}</div></div>
    </div>

    <div class="box" style="padding:4px 8px">
      <div class="table-wrap"><table>
        <thead><tr><th>영상</th><th class="right">조회수</th><th class="right">좋아요</th><th class="right">댓글</th><th class="right">원고료</th><th class="right">조회당 비용</th></tr></thead>
        <tbody>${rows || '<tr><td colspan="6" style="text-align:center;padding:24px;color:var(--sub)">아직 등록한 영상이 없습니다.</td></tr>'}</tbody>
      </table></div>
    </div>
    <p class="small-note">조회당 비용은 팀이 입력한 원고료 ÷ 조회수로 계산했습니다. YouTube 수치는 캠페인 종료 30일 뒤 삭제됩니다.</p>

    <div class="box" style="margin-top:16px">
      <h2>협찬 영상 등록</h2>
      ${confirmed.length === 0
        ? '<p class="small-note">섭외 보드에서 "확정"된 채널이 있어야 등록할 수 있습니다.</p>'
        : `<div class="add-form">
            <label>채널 (확정된 채널만)<select id="video-channel" class="field">${confirmed.map((id) => `<option value="${id}">${esc(findChannel(id).name)}</option>`).join("")}</select></label>
            <label>영상 제목<input id="video-title" class="field" placeholder="예: 겨울 수분크림 한 달 후기"></label>
            <label>원고료(원)<input id="video-fee" class="field" inputmode="numeric" placeholder="800000"></label>
            <button class="btn primary" data-action="add-video">등록</button>
          </div>
          <p class="small-note">데모에서는 조회수가 임의로 채워집니다. 실제 앱이라면 영상 URL로 videos.list 를 불러 수치를 가져옵니다.</p>`}
    </div>`;
}

// ---------- 7. 화면 그리기 ----------
function render() {
  const page = document.getElementById("page");
  if (ui.page === "explore") page.innerHTML = renderExplore();
  if (ui.page === "board") page.innerHTML = renderBoard();
  if (ui.page === "campaign") page.innerHTML = renderCampaign();

  // 왼쪽 메뉴에서 지금 페이지 버튼만 강조
  document.querySelectorAll(".menu").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.page === ui.page);
  });
}

// ---------- 8. 버튼 클릭 처리 ----------
// 버튼마다 따로 이벤트를 붙이는 대신, 문서 전체에서 클릭을 받아 data-action 으로 구분합니다.
document.addEventListener("click", async (event) => {
  // 메뉴 버튼
  const menu = event.target.closest(".menu");
  if (menu) {
    ui.page = menu.dataset.page;
    render();
    return;
  }

  // 창 바깥(어두운 배경)을 누르면 닫기
  if (event.target.id === "modal") return closeChannel();

  const el = event.target.closest("[data-action]");
  if (!el) return;
  const id = el.dataset.id;

  switch (el.dataset.action) {
    case "open":
      openChannel(id);
      break;

    case "close":
      closeChannel();
      break;

    case "add-to-group":
      event.stopPropagation();
      state.pipeline[id] = "후보";
      save();
      render();
      toast(findChannel(id).name + " 채널을 후보로 담았습니다");
      break;

    case "set-status":
      state.pipeline[id] = el.dataset.status;
      save();
      render();
      openChannel(id); // 창 내용도 새로 그리기
      toast("섭외 상태를 '" + el.dataset.status + "'(으)로 바꿨습니다");
      break;

    case "move": {
      const now = STATUSES.indexOf(state.pipeline[id]);
      const next = STATUSES[now + Number(el.dataset.dir)];
      state.pipeline[id] = next;
      save();
      render();
      toast(findChannel(id).name + ": " + next);
      break;
    }

    case "add-memo": {
      const input = document.getElementById("memo-input");
      if (!input.value.trim()) return toast("메모 내용을 입력하세요");
      if (!state.memos[id]) state.memos[id] = [];
      state.memos[id].push({ who: "나", when: "방금", text: input.value.trim() });
      save();
      openChannel(id);
      render();
      toast("메모를 저장했습니다");
      break;
    }

    case "fetch-channel": {
      const input = document.getElementById("channel-url");
      if (!input.value.trim()) return toast("채널 주소나 @핸들을 입력하세요");
      el.disabled = true;
      el.textContent = "불러오는 중…";
      try {
        const channel = await fetchChannel(input.value); // api.js 의 함수
        state.addedChannels.push(channel);
        save();
        ui.search = "";
        ui.category = "전체";
        ui.size = "전체";
        render();
        openChannel(channel.id);
        toast("채널을 추가했습니다");
      } catch (err) {
        toast(err.message);
        el.disabled = false;
        el.textContent = "추가";
      }
      break;
    }

    case "add-video": {
      const channelId = document.getElementById("video-channel").value;
      const title = document.getElementById("video-title").value.trim() || "제목 없는 협찬 영상";
      const fee = Number(document.getElementById("video-fee").value.replace(/[^0-9]/g, ""));
      if (!fee) return toast("원고료를 숫자로 입력하세요");
      const c = findChannel(channelId);
      const views = Math.round((c.avgViews || 10000) * (0.6 + Math.random())); // 데모용 임의 조회수
      state.campaign.videos.push({
        channelId, title, fee, views,
        likes: Math.round(views * 0.03),
        comments: Math.round(views * 0.003),
      });
      save();
      render();
      toast("영상을 등록했습니다");
      break;
    }

    case "export": {
      // CSV에는 기획서에서 허용한 항목(채널명, 주소, 섭외 상태, 메모 수, 구독자)만 넣습니다.
      const lines = ["채널명,채널 URL,섭외 상태,메모 수,구독자"];
      Object.keys(state.pipeline).forEach((cid) => {
        const c = findChannel(cid);
        lines.push([c.name, "https://www.youtube.com/" + c.handle, state.pipeline[cid], (state.memos[cid] || []).length, c.subs].join(","));
      });
      console.log(lines.join("\n")); // 개발자 도구(F12) 콘솔에서 확인
      toast(lines.length - 1 + "개 채널을 CSV로 만들었습니다 (F12 콘솔에서 확인)");
      break;
    }
  }
});

// 검색창·필터가 바뀌면 목록 다시 그리기
document.addEventListener("input", (event) => {
  if (event.target.id === "search") {
    ui.search = event.target.value;
    render();
    // 다시 그리면 입력창이 새로 만들어지므로 커서를 되돌려 줍니다
    const box = document.getElementById("search");
    box.focus();
    box.setSelectionRange(box.value.length, box.value.length);
  }
});
document.addEventListener("change", (event) => {
  if (event.target.id === "category") { ui.category = event.target.value; render(); }
  if (event.target.id === "size") { ui.size = event.target.value; render(); }
});

// Esc 키로 창 닫기
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeChannel();
});

// 데이터 초기화 버튼
document.getElementById("reset-btn").addEventListener("click", () => {
  state = JSON.parse(JSON.stringify(STARTER_DATA));
  save();
  closeChannel();
  render();
  toast("처음 예시 데이터로 되돌렸습니다");
});

// ---------- 9. 시작! ----------
render();
