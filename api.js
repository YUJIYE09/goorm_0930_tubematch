// =========================================
// api.js : 유튜브 데이터를 가져오는 곳
//
// 지금은 API 키가 비어 있어서 "가짜 데이터"를 돌려줍니다.
// 진짜 유튜브 데이터를 보고 싶다면:
//   1) Google Cloud 콘솔에서 프로젝트를 만들고
//   2) "YouTube Data API v3"를 사용 설정한 뒤
//   3) API 키를 발급받아 아래 YOUTUBE_API_KEY 에 붙여 넣으세요.
// ⚠️ API 키가 들어간 파일은 깃허브 등에 공개로 올리지 마세요.
// =========================================

const YOUTUBE_API_KEY = ""; // 예: "AIza..."

// 사용자가 붙여 넣은 주소에서 @핸들을 뽑아냅니다.
// "https://www.youtube.com/@abc" → "@abc",  "abc" → "@abc"
function extractHandle(text) {
  const match = text.match(/@[\w.\-]+/);
  if (match) return match[0];
  return "@" + text.trim().replace(/\s+/g, "");
}

// 채널 하나의 정보를 가져옵니다. (기획서 F2 "채널 URL로 추가")
// async 함수라서 결과를 받을 때 await 를 붙여야 합니다.
async function fetchChannel(text) {
  const handle = extractHandle(text);

  // ① API 키가 없으면: 가짜 채널을 만들어 돌려줍니다.
  if (!YOUTUBE_API_KEY) {
    await new Promise((r) => setTimeout(r, 600)); // 불러오는 척 0.6초 기다리기
    const subs = 5000 + Math.floor(Math.random() * 200000);
    return {
      id: "new-" + Date.now(),
      name: handle.slice(1) + " 채널",
      handle: handle,
      category: "기타",
      subs: subs,
      views: subs * 150,
      videoCount: 50 + Math.floor(Math.random() * 300),
      lastUpload: 1 + Math.floor(Math.random() * 20),
      avgViews: Math.round(subs * 0.2),
      shortsRatio: Math.random(),
      color: "#5f6878",
      isFake: true,
    };
  }

  // ② API 키가 있으면: 진짜 YouTube Data API를 부릅니다.
  //    channels.list 는 호출 1번에 쿼터 1 유닛을 씁니다. (하루 기본 10,000 유닛)
  const url =
    "https://www.googleapis.com/youtube/v3/channels" +
    "?part=snippet,statistics" +
    "&forHandle=" + encodeURIComponent(handle) +
    "&key=" + YOUTUBE_API_KEY;

  const response = await fetch(url);
  const data = await response.json();

  if (!data.items || data.items.length === 0) {
    throw new Error("채널을 찾지 못했습니다. 주소나 @핸들을 확인하세요.");
  }

  // 유튜브가 준 결과를 우리 앱 모양으로 바꿉니다.
  const item = data.items[0];
  return {
    id: item.id,
    name: item.snippet.title,
    handle: item.snippet.customUrl || handle,
    category: "기타",
    subs: Number(item.statistics.subscriberCount || 0),
    views: Number(item.statistics.viewCount || 0),
    videoCount: Number(item.statistics.videoCount || 0),
    lastUpload: null,   // 최근 업로드일은 playlistItems.list 를 한 번 더 불러야 알 수 있어요 (연습 과제!)
    avgViews: null,
    shortsRatio: null,
    color: "#c4302b",
    isFake: false,
  };
}
