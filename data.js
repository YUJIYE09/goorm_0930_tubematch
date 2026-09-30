// =========================================
// data.js : 연습용 예시 데이터
// 실제 유튜브 채널이 아닌 가상의 채널입니다.
// 진짜 데이터를 쓰려면 api.js를 보세요.
// =========================================

// 채널 목록
// subs: 구독자 수, views: 누적 조회수, videoCount: 영상 수
// lastUpload: 마지막 업로드가 며칠 전인지, avgViews: 최근 영상 평균 조회수
// shortsRatio: 최근 영상 중 쇼츠 비율(0~1, 영상 길이로 추정한 값)
const SAMPLE_CHANNELS = [
  { id: "c1", name: "오늘의 피부일기", handle: "@skin_diary_today", category: "뷰티", subs: 284000, views: 61200000, videoCount: 412, lastUpload: 2, avgViews: 52400, shortsRatio: 0.38, color: "#c65a7a" },
  { id: "c2", name: "살림하는 도윤", handle: "@doyun_home", category: "라이프", subs: 96300, views: 18400000, videoCount: 233, lastUpload: 5, avgViews: 21800, shortsRatio: 0.61, color: "#3d8a6e" },
  { id: "c3", name: "한끼연구소", handle: "@hankki_lab", category: "푸드", subs: 512000, views: 143000000, videoCount: 684, lastUpload: 1, avgViews: 118000, shortsRatio: 0.27, color: "#d0782f" },
  { id: "c4", name: "민낯메이크업", handle: "@barefacemakeup", category: "뷰티", subs: 41800, views: 5900000, videoCount: 158, lastUpload: 9, avgViews: 14300, shortsRatio: 0.72, color: "#8a5bb5" },
  { id: "c5", name: "출근룩 아카이브", handle: "@officelook_arc", category: "패션", subs: 167000, views: 32700000, videoCount: 301, lastUpload: 3, avgViews: 38900, shortsRatio: 0.45, color: "#4a6fb8" },
  { id: "c6", name: "캠핑 가는 부부", handle: "@campingcouple", category: "여행", subs: 228000, views: 49800000, videoCount: 276, lastUpload: 42, avgViews: 61200, shortsRatio: 0.18, color: "#6b7f3a" },
  { id: "c7", name: "자취생 밥상", handle: "@jachi_bap", category: "푸드", subs: 18900, views: 2100000, videoCount: 94, lastUpload: 4, avgViews: 9100, shortsRatio: 0.83, color: "#b8583f" },
  { id: "c8", name: "향기수집가", handle: "@scent_collector", category: "뷰티", subs: 73500, views: 11600000, videoCount: 189, lastUpload: 6, avgViews: 19700, shortsRatio: 0.33, color: "#a0703b" },
];

// 최근 영상 예시: 채널마다 평균 조회수에 아래 배율을 곱해서 만듭니다.
// sponsor 값이 있으면 협찬 영상입니다.
const SAMPLE_VIDEO_TEMPLATE = [
  { title: "요즘 제일 자주 쓰는 것들", daysAgo: 2, ratio: 1.2, sponsor: null },
  { title: "#shorts 아침 3분 루틴", daysAgo: 6, ratio: 1.8, sponsor: null },
  { title: "3만원대 제품 5종 비교해 봤어요", daysAgo: 10, ratio: 0.9, sponsor: "라운드랩" },
  { title: "한 달 동안 써 본 솔직 후기", daysAgo: 15, ratio: 0.7, sponsor: null },
  { title: "#shorts 파우치 공개", daysAgo: 19, ratio: 1.4, sponsor: null },
  { title: "구독자 질문에 답해 드려요", daysAgo: 25, ratio: 0.6, sponsor: null },
];

// 섭외 단계 5개 (기획서 8-2 (3) 섭외 칸반)
const STATUSES = ["후보", "연락함", "협의 중", "확정", "거절"];

// 처음 실행할 때 보여 줄 예시 섭외·캠페인 데이터
const STARTER_DATA = {
  // 채널 id → 섭외 상태. 여기 들어 있는 채널이 "그룹에 담긴" 채널입니다.
  pipeline: { c1: "협의 중", c2: "연락함", c4: "확정", c8: "후보" },
  // 채널 id → 팀 메모 목록
  memos: {
    c1: [{ who: "김서연", when: "9월 26일", text: "원고료 180만 원 제시받음. 쇼츠 1편 추가 조건으로 협상 중." }],
    c4: [{ who: "김서연", when: "9월 21일", text: "10월 2주차 업로드 확정. 제품 발송 완료." }],
  },
  // 캠페인에 등록한 협찬 영상
  campaign: {
    name: "가을 수분크림 런칭",
    budget: 6000000,
    videos: [
      { channelId: "c4", title: "민낯으로 시작하는 수분 루틴 (유료 광고 포함)", views: 48200, likes: 1630, comments: 212, fee: 900000 },
      { channelId: "c8", title: "향 좋은 수분크림 찾았어요", views: 23900, likes: 720, comments: 88, fee: 700000 },
    ],
  },
  // "채널 URL로 추가"로 새로 넣은 채널
  addedChannels: [],
};
