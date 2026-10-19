'use strict';

const steps = [
  ['welcome', '서비스 소개', '조용하고 신뢰감 있는 첫인상', '네이비와 샴페인 골드, 넉넉한 여백으로 프라이빗 서비스의 분위기를 담았습니다.'],
  ['consent', '이용 동의', '필요한 동의만, 명확하게', '필수 동의와 선택 동의를 구분합니다. 마케팅 수신은 기본으로 선택하지 않습니다.'],
  ['account', '계정 만들기', '연락 가능한 계정을 먼저', '이메일과 비밀번호를 입력합니다. 실제 앱에서는 이메일 확인과 중복 계정 검사를 연결합니다.'],
  ['identity', '본인 확인', '안심할 수 있는 시작', '실제 서비스에서는 휴대전화 본인확인을 연결합니다. 시안에서는 체험 버튼으로 흐름만 확인합니다.'],
  ['profile', '기본 정보', '소개에 필요한 기본 정보', '프로필 이름과 생년월일, 성별, 주 활동 지역을 입력합니다. 실명과 연락처는 상대에게 공개하지 않습니다.'],
  ['career', '학력과 직업', '신뢰를 만드는 객관적인 정보', '최종 학력과 현재 하는 일을 입력합니다. 상세 직장명은 공개 범위를 따로 선택할 수 있습니다.'],
  ['lifestyle', '생활 정보', '일상의 호흡도 중요한 조건', '키, 종교, 흡연·음주, 혼인·자녀 여부를 한 화면에서 정리합니다.'],
  ['personality', '성격과 취미', '나를 설명하는 작은 단서', '성격은 2개, 취미는 최대 8개까지 선택합니다.'],
  ['preferences', '원하는 만남', '조건은 분명하게, 사람은 넓게', '연령과 지역 등 꼭 필요한 선호만 받습니다. 지나치게 세밀한 조건은 필수화하지 않습니다.'],
  ['introduction', '자기소개', '빈칸 앞에서 망설이지 않도록', '짧은 작성 힌트와 글자 수를 제공합니다. 입력 내용은 이 시안의 메모리에만 저장됩니다.'],
  ['photos', '프로필 사진', '사진 등록 기준을 먼저 안내', '필수 3장과 선택 3장을 구분합니다. 로컬 미리보기이며 서버로 전송하지 않습니다.'],
  ['verification', '추가 인증', '인증의 목적을 분명하게', '서류는 상대에게 보여주지 않는다는 점과 보관 원칙을 먼저 안내합니다.'],
  ['review', '최종 확인', '제출 전에 한 번 더', '작성한 내용을 요약하고 각 단계로 돌아가 수정할 수 있습니다.'],
  ['waiting', '심사 대기', '신청 이후에도 명확한 안내', '검토 단계와 예상 시간을 안내합니다. 진행 상태는 가상 예시입니다.'],
  ['result', '심사 결과', '모든 결과에 다음 행동을 제시', '승인·보완·대기·반려 네 상태의 문구와 행동을 한 화면에서 확인할 수 있습니다.'],
];

const empty = () => ({
  terms: false, privacy: false, sensitive: false, marketing: false,
  email: '', password: '', identity: false,
  name: '', birth: '', gender: '', region: '', subregion: '',
  education: '', school: '', occupation: '', company: '', companyPublic: false,
  height: '', bodyType: '', religion: '', smoking: '', drinking: '', marriage: '', children: '',
  personality: [], hobbies: [], preferredAgeMin: '28', preferredAgeMax: '38',
  preferredRegions: [], preferredSmoking: '', preferredReligion: '',
  intro: '', photos: [null, null, null, null, null, null], document: false,
  confirm: false, submitted: false, result: 'approved',
});

let data = empty(), current = 0;
const app = document.querySelector('#app');
const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
const personalities = ['성실한', '다정한', '유머러스한', '밝은', '차분한', '긍정적인', '섬세한', '사교적인'];
const hobbies = ['여행', '영화', '독서', '전시', '음악', '요리', '와인', '러닝', '헬스', '골프', '등산', '산책', '사진', '캠핑', '베이킹', '자기계발'];
const regions = ['서울', '경기', '인천', '부산', '대구', '대전', '광주', '울산', '세종', '강원', '충북', '충남', '전북', '전남', '경북', '경남', '제주'];
const sampleIntro = '안녕하세요. 일에서는 꾸준히 성장하고, 일상에서는 작은 즐거움을 발견하는 걸 좋아합니다. 주말에는 전시를 보거나 새로운 동네를 산책하며 쉬곤 해요. 서로의 이야기를 편하게 나누고, 각자의 시간을 존중하면서도 함께하는 순간을 소중히 여기는 분을 만나고 싶습니다.';

function field(label, key, type = 'text', placeholder = '', attributes = '') { return `<label class="field"><span>${label}</span><input type="${type}" data-field="${key}" value="${esc(data[key])}" placeholder="${placeholder}" ${attributes}></label>`; }
function select(label, key, options, optional = false) { return `<label class="field"><span>${label}${optional ? ' <i class="optional">선택</i>' : ''}</span><select data-field="${key}"><option value="">선택해주세요</option>${options.map(v => `<option ${data[key] === v ? 'selected' : ''}>${v}</option>`).join('')}</select></label>`; }
function head(kicker, title, lead) { return `<span class="eyebrow">${kicker}</span><h2>${title}</h2><p class="lead">${lead}</p>`; }
function chipGroup(key, options, label) { return `<div class="chips" role="group" aria-label="${label}">${options.map(v => `<button class="chip" type="button" data-group="${key}" data-value="${v}" aria-pressed="${data[key].includes(v)}">${v}</button>`).join('')}</div>`; }
function age() { const b = new Date(data.birth + 'T00:00:00'), now = new Date(); let value = now.getFullYear() - b.getFullYear(); if (now.getMonth() < b.getMonth() || (now.getMonth() === b.getMonth() && now.getDate() < b.getDate())) value--; return Number.isFinite(b.getTime()) ? value : NaN; }

function issue(step) {
  switch (step) {
    case 1: return data.terms && data.privacy && data.sensitive ? '' : '필수 동의 항목을 확인해주세요.';
    case 2: return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email) && data.password.length >= 8 ? '' : '올바른 이메일과 8자리 이상의 비밀번호를 입력해주세요.';
    case 3: return data.identity ? '' : '본인확인 체험 버튼을 눌러주세요.';
    case 4: if (!data.name.trim() || !data.birth || !data.gender || !data.region) return '기본 정보를 모두 입력해주세요.'; return age() < 25 || age() > 120 ? '만 25세 이상인 생년월일을 입력해주세요.' : '';
    case 5: return data.education && data.occupation.trim() ? '' : '최종 학력과 하는 일을 입력해주세요.';
    case 6: return data.height && data.religion && data.smoking && data.drinking && data.marriage && data.children ? '' : '생활 정보를 모두 선택해주세요.';
    case 7: return data.personality.length === 2 ? '' : '성격을 2개 선택해주세요.';
    case 8: { const min = Number(data.preferredAgeMin), max = Number(data.preferredAgeMax); if (!min || !max || min > max) return '선호 연령 범위를 확인해주세요.'; return data.preferredRegions.length ? '' : '선호 활동 지역을 한 곳 이상 선택해주세요.'; }
    case 9: return data.intro.trim().length >= 100 ? '' : '자기소개를 100자 이상 작성해주세요.';
    case 10: return data.photos.slice(0, 3).every(Boolean) ? '' : '필수 사진 3장을 선택하거나 예시를 채워주세요.';
    case 11: return data.gender === '남성' && !data.document ? '남성 회원은 인증자료가 필요해요. 예시 서류를 첨부해주세요.' : '';
    case 12: for (let i = 1; i <= 11; i++) if (issue(i)) return `${steps[i][1]} 단계: ${issue(i)}`; return data.confirm ? '' : '입력 내용 확인에 체크해주세요.';
    default: return '';
  }
}

function photoSlots() {
  const labels = ['대표 · 필수', '얼굴 · 필수', '상반신/전신 · 필수', '일상 · 선택', '취미 · 선택', '추가 · 선택'];
  return data.photos.map((photo, i) => `<div class="photo-wrap"><label class="photo" aria-label="${labels[i]} 사진 선택">${photo?.url ? `<img alt="선택한 사진 ${i + 1}" src="${photo.url}">` : photo ? `<span class="sample-photo"><b>${String(i + 1).padStart(2, '0')}</b><span>사진 자리 예시</span></span>` : '<b>＋</b><span>사진 추가</span>'}<span class="photo-label">${labels[i]}</span><input type="file" accept="image/jpeg,image/png,image/webp" data-photo="${i}"></label>${photo ? `<button type="button" class="photo-remove" data-remove-photo="${i}" aria-label="사진 ${i + 1} 삭제">×</button>` : ''}</div>`).join('');
}

function resultContent() {
  const result = {approved: ['WELCOME TO SUITE ONE', '가입 심사가<br>승인되었어요.', '소개 가능 상태를 켜면 조건에 맞는 한 사람을 세심하게 찾아드릴게요.', '✓'], revision: ['ONE MORE CHECK', '조금만 보완하면<br>심사를 이어갈 수 있어요.', '직업 인증자료의 발급일과 회사명이 선명하게 보이는 파일로 다시 등록해주세요.', '!'], waitlist: ['ON THE WAITLIST', '좋은 소개를 위해<br>잠시 기다려주세요.', '현재 조건에 맞는 소개 가능 인원을 살피고 있어요. 14일 이내에 다시 안내드릴게요.', '…'], rejected: ['APPLICATION REVIEWED', '이번에는 가입을<br>도와드리기 어려워요.', '제출 정보가 현재 운영 기준에 맞지 않았어요. 90일 후 정보가 달라졌다면 재심사를 신청할 수 있어요.', '×']}[data.result];
  return head(result[0], result[1], result[2]) + `<div class="result-seal ${data.result}">${result[3]}</div><div class="result-switch" role="group" aria-label="심사 결과 시안 선택">${[['approved', '승인'], ['revision', '보완'], ['waitlist', '대기'], ['rejected', '반려']].map(([key, label]) => `<button type="button" data-result="${key}" aria-pressed="${data.result === key}">${label}</button>`).join('')}</div><div class="info-card"><strong>결과 화면 시안</strong>위 네 가지 상태를 눌러 안내와 다음 행동을 비교할 수 있어요. 실제 심사 결과가 아닙니다.</div>`;
}

function content() {
  switch (current) {
    case 0: return `<div class="welcome"><div class="hero"><span class="star">✦</span><span class="monogram">S</span><span class="hero-caption">ONE CONNECTION. MORE MEANING.</span></div><h2>많은 사람보다,<br>나와 맞는 한 사람.</h2><p class="lead">신중하게 확인하고, 세심하게 소개합니다.<br>당신을 위한 프라이빗 매칭, SUITE ONE.</p><div class="welcome-features"><span>본인 확인</span><span>프라이빗 소개</span><span>일정 조율</span></div></div>`;
    case 1: return head('WELCOME ABOARD', '만남의 시작,<br>함께 지킬 약속.', '편안하고 안전한 이용을 위해 확인해주세요.') + `<label class="consent all"><input type="checkbox" id="all-consent" ${data.terms && data.privacy && data.sensitive ? 'checked' : ''}><span>필수 항목에 모두 동의합니다</span></label>${[['terms', '[필수] 서비스 이용약관', '회원 간 존중과 서비스 이용 기준'], ['privacy', '[필수] 개인정보 수집·이용', '가입 심사와 소개에 필요한 정보 처리'], ['sensitive', '[필수] 민감정보 별도 동의', '종교·혼인·자녀 등 선택 정보 처리'], ['marketing', '[선택] 혜택 및 소식 받기', '선택하지 않아도 서비스를 이용할 수 있어요.']].map(([key, label, note]) => `<label class="consent"><input type="checkbox" data-field="${key}" ${data[key] ? 'checked' : ''}><span>${label}<small>${note}</small></span></label>`).join('')}<div class="info-card"><strong>화면 구성 확인용 동의 항목입니다.</strong>실제 약관 동의나 개인정보 수집은 진행되지 않아요.</div>`;
    case 2: return head('01 / ACCOUNT', '먼저, 이용할 계정을<br>만들어주세요.', '심사 결과와 소개 알림을 받을 수 있는<br>이메일을 사용해주세요.') + field('이메일', 'email', 'email', 'name@example.com', 'autocomplete="email"') + field('비밀번호', 'password', 'password', '영문·숫자 포함 8자리 이상', 'minlength="8" autocomplete="new-password"') + '<div class="info-card"><strong>실제 저장되지 않아요</strong>시안에서는 입력 형식만 확인하며 계정 생성이나 이메일 발송을 하지 않습니다.</div>';
    case 3: return head('02 / IDENTITY', '서로를 믿을 수 있도록,<br>본인부터 확인해요.', 'SUITE ONE은 본인확인을 마친 회원만<br>소개를 받을 수 있어요.') + `<div class="identity-icon">✓</div><div class="info-card"><strong>내 정보는 필요한 만큼만</strong>실명과 연락처는 소개 프로필에 표시하지 않아요. 실제 서비스에서는 본인 명의 휴대전화로 인증합니다.</div>${data.identity ? '<div class="success-line">✓ 본인확인 화면 체험을 완료했어요. 실제 인증은 아닙니다.</div>' : '<button class="secondary" data-action="verify">본인확인 체험하기</button>'}`;
    case 4: return head('03 / ABOUT YOU', '당신의 기본 정보를<br>알려주세요.', '상대에게는 프로필 이름과 연령대만 보여주며<br>실명과 생년월일은 공개하지 않아요.') + field('프로필 이름', 'name', 'text', '상대에게 보여줄 이름', 'maxlength="20" autocomplete="off"') + `<div class="field-row">${field('생년월일', 'birth', 'date')}${select('성별', 'gender', ['여성', '남성'])}</div>${select('주 활동 지역', 'region', regions)}${field('세부 지역', 'subregion', 'text', '예: 강남·서초', 'maxlength="30"')}<p class="helper">법적 성별 외 다양한 정체성과 매칭 범위 지원은 정식 출시 전 정책·수요 검토 후 확장합니다.</p>`;
    case 5: return head('04 / CAREER', '어떤 길을 걸어왔는지<br>알려주세요.', '학력과 직업은 가입 심사에 사용되며,<br>상대에게는 승인된 정보만 간단히 보여드려요.') + select('최종 학력', 'education', ['고등학교 졸업', '전문대 재학', '전문대 졸업', '대학교 재학', '대학교 졸업', '대학원 재학', '대학원 졸업', '(해외) 대학교 재학', '(해외) 대학교 졸업', '(해외) 대학원 재학', '(해외) 대학원 졸업', '기타']) + field('학교명', 'school', 'text', '예: SUITE 대학교', 'maxlength="80"') + field('하는 일', 'occupation', 'text', '예: 브랜드 디자이너', 'maxlength="80"') + field('직장·사업체명', 'company', 'text', '예: SUITE 스튜디오', 'maxlength="80"') + `<label class="consent compact"><input type="checkbox" data-field="companyPublic" ${data.companyPublic ? 'checked' : ''}><span>소개 프로필에 직장·사업체명을 표시해도 좋아요.<small>선택하지 않으면 업종과 직무만 표시합니다.</small></span></label>`;
    case 6: return head('05 / LIFESTYLE', '일상의 모습도<br>조금 알려주세요.', '조건을 평가하기보다 서로의 생활 방식을<br>미리 이해하기 위한 정보예요.') + `<div class="field-row">${field('키', 'height', 'number', 'cm', 'min="130" max="220"')}${select('체형', 'bodyType', ['슬림', '보통', '탄탄', '통통'], true)}</div>${select('종교', 'religion', ['무교', '기독교', '천주교', '불교', '원불교', '기타'])}<div class="field-row">${select('흡연', 'smoking', ['비흡연', '금연 중', '전자담배', '흡연'])}${select('음주', 'drinking', ['전혀 안 함', '피할 수 없을 때만', '가끔', '즐기는 편'])}</div><div class="field-row">${select('혼인 여부', 'marriage', ['미혼', '이혼', '사별'])}${select('자녀 여부', 'children', ['자녀 없음', '자녀 비양육', '자녀 양육'])}</div><p class="helper">종교·혼인·자녀 정보는 별도 동의와 엄격한 접근 권한을 적용합니다.</p>`;
    case 7: return head('06 / YOUR DETAILS', '어떤 순간에<br>가장 나다워지나요?', '작은 공통점이 좋은 대화의 시작이 될 수 있어요.') + `<p class="field-title">나를 표현하는 성격 <span class="optional">2개 선택</span></p>${chipGroup('personality', personalities, '성격 선택')}<p class="field-title section-gap">좋아하는 일 <span class="optional">최대 8개 · 선택</span></p>${chipGroup('hobbies', hobbies, '취미 선택')}`;
    case 8: return head('07 / PREFERENCES', '어떤 만남을<br>기대하고 있나요?', '꼭 필요한 조건만 알려주세요.<br>나머지는 사람의 이야기를 보고 판단할 수 있어요.') + `<div class="field-row">${field('선호 연령 최소', 'preferredAgeMin', 'number', '최소', 'min="25" max="80"')}${field('선호 연령 최대', 'preferredAgeMax', 'number', '최대', 'min="25" max="80"')}</div><p class="field-title section-gap">선호 활동 지역 <span class="optional">복수 선택</span></p>${chipGroup('preferredRegions', regions, '선호 지역 선택')}${select('흡연 선호', 'preferredSmoking', ['상관없음', '비흡연만'], true)}${select('종교 선호', 'preferredReligion', ['상관없음', '무교', '기독교', '천주교', '불교', '원불교', '기타'], true)}<div class="info-card"><strong>선호는 보장이 아니라 탐색 기준이에요.</strong>서로의 필수 조건을 먼저 확인한 뒤, 운영 기준에 따라 한 번에 한 명씩 소개합니다.</div>`;
    case 9: return head('08 / YOUR STORY', '당신의 이야기를<br>들려주세요.', '스펙보다 오래 기억에 남는 건,<br>당신만의 생각과 일상이에요.') + `<div class="prompt">요즘 어떤 일에 마음을 쓰고 있나요?<br>쉬는 날에는 무엇을 하며 보내나요?<br>어떤 관계를 함께 만들고 싶나요?</div><label class="field"><span>자기소개</span><textarea data-field="intro" maxlength="2000" placeholder="안녕하세요. 저는…">${esc(data.intro)}</textarea></label><div class="counter ${data.intro.trim().length >= 100 ? 'complete' : ''}" id="intro-counter"><span>최소 100자 · 권장 300자</span><span>${data.intro.length} / 2,000</span></div>`;
    case 10: return head('09 / FIRST IMPRESSION', '가장 자연스러운<br>당신을 보여주세요.', '얼굴이 잘 보이는 최근 사진을 등록해주세요.<br>소개가 진행되는 상대에게만 보여드려요.') + `<div class="photos">${photoSlots()}</div><div class="photo-guide"><span>대표·얼굴·상반신 또는 전신 사진 3장 필수</span><span>혼자 나온 최근 사진 · 과도한 보정 없이</span><span>선택 사진을 포함해 최대 6장</span></div><p class="helper">시안: 사진은 업로드되지 않으며 기기 안에서만 표시됩니다. JPG·PNG·WebP, 장당 10MB까지.</p>`;
    case 11: return head('10 / VERIFICATION', '신뢰를 더하는<br>작은 확인.', '직업이나 활동을 확인할 수 있는 자료를<br>등록해주세요. 원본은 상대에게 공개하지 않아요.') + `<div class="info-card"><strong>${data.gender === '남성' ? '직업·사업·자격·소득·자산 중 하나' : '추가 인증으로 프로필에 신뢰를 더해요'}</strong>${data.gender === '남성' ? '남성 회원은 한 종류의 인증자료가 필요해요.' : '여성 회원은 추가 서류 인증을 선택할 수 있어요.'}</div><button class="document-upload" style="width:100%;text-align:left" data-action="document"><b>${data.document ? '✓' : '＋'}</b><span>${data.document ? '재직증명서_예시.pdf' : '예시 인증자료 첨부'}<small>${data.document ? '가상 문서 · 실제 파일 없음' : '시안에서는 실제 서류를 받지 않아요'}</small></span></button>${data.document ? '<button class="secondary" data-action="remove-document">예시 자료 삭제</button>' : ''}<p class="helper">실제 서비스에서는 심사에 필요한 정보만 요청하고,<br>보관기간과 삭제 기준을 업로드 전에 안내합니다.</p>`;
    case 12: { const rows = [[4, '기본 정보', [data.name, data.region, data.subregion].filter(Boolean).join(' · ') || '미작성'], [5, '학력과 직업', [data.education, data.occupation].filter(Boolean).join(' · ') || '미작성'], [6, '생활 정보', [data.height && `${data.height}cm`, data.smoking, data.drinking].filter(Boolean).join(' · ') || '미작성'], [7, '성격과 취미', data.personality.join(' · ') || '미선택'], [8, '원하는 만남', `${data.preferredAgeMin || '?'}–${data.preferredAgeMax || '?'}세 · ${data.preferredRegions.join('·') || '지역 미선택'}`], [9, '자기소개', `${data.intro.length}자 작성`], [10, '프로필 사진', `${data.photos.filter(Boolean).length} / 6장`], [11, '인증자료', data.document ? '예시 자료 1건' : data.gender === '남성' ? '미첨부' : '선택 안 함']]; return head('READY TO CHECK IN', '준비가 되었어요.<br>마지막으로 확인해요.', '신청 후에는 검토가 시작되어 일부 정보를<br>바로 수정하기 어려울 수 있어요.') + `<ul class="checklist">${rows.map(([step, title, value]) => `<li><span>${issue(step) ? '○' : '✓'}</span><span>${title}<small>${esc(value)}</small></span><button data-goto="${step}">수정 ›</button></li>`).join('')}</ul><label class="consent"><input type="checkbox" data-field="confirm" ${data.confirm ? 'checked' : ''}><span>입력 내용과 심사 안내를 확인했어요.<small>시안에서는 실제 신청이나 정보 전송이 일어나지 않습니다.</small></span></label>`; }
    case 13: return head('CHECK-IN RECEIVED', `${esc(data.name || '회원')}님,<br>좋은 만남을 준비할게요.`, '프로필을 세심하게 살펴본 후 알려드릴게요.<br>검토는 보통 24시간 이내를 목표로 해요.') + `<div class="ticket"><div class="ticket-head">SUITE ONE · CHECK-IN</div><dl><dt>신청자</dt><dd>${esc(data.name || '예시 회원')}</dd><dt>현재 상태</dt><dd>심사 대기 · 시안</dd><dt>안내 방식</dt><dd>앱 알림</dd></dl></div><div class="timeline"><div class="current"><i>1</i><span>프로필 접수<small>작성하신 내용을 확인하는 단계예요.</small></span></div><div><i>2</i><span>가입 심사<small>보완할 내용이 있으면 안내해드려요.</small></span></div><div><i>3</i><span>첫 소개 준비<small>승인 후 소개 가능 상태를 설정해요.</small></span></div></div><div class="info-card">실제 심사는 접수되지 않았습니다.<br>다음 화면에서 네 가지 결과 상태를 확인할 수 있어요.</div>`;
    case 14: return resultContent();
    default: return '';
  }
}

function actionLabel() { if (current === 0) return ['체크인 시작하기', '→']; if (current === 12) return ['심사 신청 체험하기', '→']; if (current === 13) return ['심사 결과 화면 보기', '→']; if (current === 14) return [data.result === 'approved' ? '소개 준비 화면은 다음 단계에서' : '처음으로 돌아가기', data.result === 'approved' ? '✓' : '↺']; return ['다음', '→']; }
function render(focus = false) {
  const [label, arrow] = actionLabel();
  document.querySelector('#screen-nav').innerHTML = steps.map((step, i) => `<button class="nav-item ${current === i ? 'active' : ''}" data-goto="${i}" ${current === i ? 'aria-current="step"' : ''}><span>${String(i + 1).padStart(2, '0')}</span>${step[1]}</button>`).join('');
  document.querySelector('#note-title').textContent = steps[current][2]; document.querySelector('#note-body').textContent = steps[current][3];
  app.innerHTML = `<header class="app-header"><button class="back" data-action="back" aria-label="이전 화면" ${current === 0 ? 'style="visibility:hidden"' : ''}>‹</button><span class="wordmark">SUITE ONE</span><span class="step-counter">${current === 0 ? '' : String(current).padStart(2, '0') + ' / ' + String(steps.length - 1).padStart(2, '0')}</span></header>${current > 0 ? `<div class="progress" aria-label="진행 ${current} / ${steps.length - 1}"><span style="width:${current / (steps.length - 1) * 100}%"></span></div>` : ''}<section class="screen" tabindex="-1">${content()}</section><div class="actions"><div id="error" class="error" role="alert"></div><button class="primary" data-action="next" ${current === 14 && data.result === 'approved' ? 'disabled' : ''}>${label} <span aria-hidden="true">${arrow}</span></button>${current === 0 ? '<p class="action-note">가입 신청과 심사는 무료예요.</p>' : current === 14 ? '' : '<div class="mobile-tools"><button data-action="fill">예시로 채우기</button><button data-action="reset">다시 시작</button></div>'}</div>`;
  if (focus) app.querySelector('.screen').focus({preventScroll: true});
}
function go(index) { current = Math.max(0, Math.min(steps.length - 1, index)); history.replaceState(null, '', '#' + steps[current][0]); render(true); }
function showError(message) { const error = document.querySelector('#error'); if (error) error.textContent = message; }
function fill() {
  switch (current) {
    case 0: go(1); return; case 1: data.terms = data.privacy = data.sensitive = true; break;
    case 2: Object.assign(data, {email: 'daon@example.com', password: 'Suiteone1'}); break; case 3: data.identity = true; break;
    case 4: Object.assign(data, {name: '다온', birth: '1994-05-12', gender: '여성', region: '서울', subregion: '강남·서초'}); break;
    case 5: Object.assign(data, {education: '대학교 졸업', school: 'SUITE 대학교', occupation: '브랜드 디자이너', company: '라이프스타일 스튜디오'}); break;
    case 6: Object.assign(data, {height: '165', bodyType: '보통', religion: '무교', smoking: '비흡연', drinking: '가끔', marriage: '미혼', children: '자녀 없음'}); break;
    case 7: data.personality = ['다정한', '긍정적인']; data.hobbies = ['전시', '여행', '산책']; break;
    case 8: Object.assign(data, {preferredAgeMin: '30', preferredAgeMax: '39', preferredRegions: ['서울', '경기'], preferredSmoking: '비흡연만', preferredReligion: '상관없음'}); break;
    case 9: data.intro = sampleIntro; break; case 10: data.photos = data.photos.map((photo, i) => photo || (i < 4 ? {sample: true} : null)); break;
    case 11: data.document = true; break; case 12: data.confirm = true; break; case 13: go(14); return; case 14: data.result = 'approved'; break;
  } render();
}
function reset() { data.photos.forEach(photo => { if (photo?.url) URL.revokeObjectURL(photo.url); }); data = empty(); go(0); }

document.addEventListener('click', event => {
  const button = event.target.closest('button'); if (!button) return;
  if (button.dataset.goto !== undefined) { go(Number(button.dataset.goto)); return; }
  if (button.dataset.result) { data.result = button.dataset.result; render(); return; }
  if (button.dataset.removePhoto !== undefined) { const index = Number(button.dataset.removePhoto); if (data.photos[index]?.url) URL.revokeObjectURL(data.photos[index].url); data.photos[index] = null; render(); return; }
  if (button.dataset.group) { const key = button.dataset.group, value = button.dataset.value, max = key === 'personality' ? 2 : key === 'hobbies' ? 8 : 5, list = data[key]; if (list.includes(value)) data[key] = list.filter(item => item !== value); else if (list.length < max) list.push(value); else { showError(`최대 ${max}개까지 선택할 수 있어요.`); return; } button.setAttribute('aria-pressed', data[key].includes(value)); showError(''); return; }
  switch (button.dataset.action) {
    case 'next': if (current === 14) { if (data.result !== 'approved') reset(); return; } if (issue(current)) { showError(issue(current)); return; } if (current === 12) data.submitted = true; go(current + 1); break;
    case 'back': go(current - 1); break; case 'verify': data.identity = true; render(); break; case 'document': data.document = true; render(); break; case 'remove-document': data.document = false; render(); break; case 'fill': fill(); break; case 'reset': reset(); break;
  }
});
document.addEventListener('input', event => { const element = event.target, key = element.dataset.field; if (!key) return; data[key] = element.type === 'checkbox' ? element.checked : element.value; showError(''); if (key === 'intro') { const counter = document.querySelector('#intro-counter'); counter.classList.toggle('complete', data.intro.trim().length >= 100); counter.lastElementChild.textContent = `${data.intro.length} / 2,000`; } if (['terms', 'privacy', 'sensitive'].includes(key)) document.querySelector('#all-consent').checked = data.terms && data.privacy && data.sensitive; });
document.addEventListener('change', event => { const element = event.target; if (element.id === 'all-consent') { data.terms = data.privacy = data.sensitive = element.checked; render(); } if (element.dataset.photo !== undefined) { const file = element.files[0]; if (!file) return; if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 10 * 1024 * 1024) { showError('10MB 이하의 JPG·PNG·WebP 사진을 선택해주세요.'); element.value = ''; return; } const index = Number(element.dataset.photo); if (data.photos[index]?.url) URL.revokeObjectURL(data.photos[index].url); data.photos[index] = {url: URL.createObjectURL(file)}; render(); } });
document.querySelector('#fill-demo').addEventListener('click', fill); document.querySelector('#reset').addEventListener('click', reset);
window.addEventListener('hashchange', () => { const index = steps.findIndex(step => step[0] === location.hash.slice(1)); if (index >= 0) { current = index; render(true); } });
const initial = steps.findIndex(step => step[0] === location.hash.slice(1)); if (initial >= 0) current = initial; render();
