# 유튜브 콘티 v3.1.1 · 촬영용 스토리보드

https://rivaljin.github.io/youtube-tools/cook-conti.html

촬영 보기는 **한 장면씩 스케치 · 멘트 · 자막 · 주의/팁**을 표시합니다.
이전/다음 또는 장면 선택으로 이동하고 촬영 완료를 체크합니다. 순서 변경은
각 장면의 ‘촬영 순서 조정’에, 준비 목록·조리 순서는 접힌 참고 영역에 있습니다.
기존 입력을 줄이거나 삭제하지 않습니다. 구도 정보가 없는 과거 콘티는 기존
촬영 메모를 유지합니다. 구도만 선택해도 카메라 배치를 그리며, 화면 설명에 탑뷰/45도/정면/클로즈업이 명시돼 있으면 참고 스케치로 연결합니다. →로 연결한 2~4개 장면은 단면·꺼내기·감싸기 등 설명의 장면 흐름으로 표시합니다. 원고는 바꾸지 않고, 서로 다른 시점이 섞였거나 부정된 설명에서는 각도를 임의로 선택하지 않습니다. 카메라 시점이 적혀 있지 않으면 그 점을 표시합니다.

## GPT와 함께 만들기

편집 화면에서 GPT 콘티 가져오기 → GPT용 형식 안내 복사 → GPT 대화에 붙여넣기.
합의한 콘티 JSON을 받아 가져오기 → 내용 확인 → 교체하면 됩니다. 도구가 GPT에
자동 접속하거나 실제 원고를 서버로 업로드하지 않습니다.

멘트는 1~2문장, 자막은 핵심어, 주의·팁은 한 줄을 권장합니다. 길이를 강제로
자르지는 않습니다. 스케치는 실제 촬영 사진이나 정확한 카메라 보정도가 아니라
합의한 구도를 보여주는 로컬 SVG 참고 그림입니다.

## 스케치 필드 (JSON version 1의 선택 필드)

기존 seg1~seg8의 time/screen/script/subtitle을 유지하고 다음 문자열 필드를
추가했습니다. 예: seg1_angle, seg1_subject, seg1_motion, seg1_notes.

- angle: top(탑뷰), oblique(45도), front(정면), close(클로즈업), 미지정은 빈 문자열.
- subject: board(도마), bowl(그릇), pan(팬), plate(접시), hands(손), roll(롤), section(단면), mold(성형틀), sheet(감싸기), 미지정은 빈 문자열.
- motion: none 또는 빈 문자열(없음), left/right/down/up/in(화면 안 피사체·손의 이동 방향).
- notes: 주의·팁. screen은 짧은 구도 설명, script는 멘트, subtitle은 자막입니다.

구도는 GPT와 논의해 정하며 근거 없이 추정하지 않습니다. JSON/Markdown 모두
스케치 정보·팁을 보존합니다. 촬영 체크·순서·현재 장면까지 보관하려면 JSON 백업을
사용하세요. 공개 예시는 도구 확인용 가상 내용뿐이며 실제 원고는 비공개 nampy-assets에 둡니다.

## 저장과 이전

v3.1은 cookContiV31 / cookContiShootV31 키를 사용합니다. 같은 브라우저에서
기존 cookContiV2 / cookContiShootV3가 있으면 처음 시작할 때 복사하고 원래 키는
수정·삭제하지 않습니다. 이후 버전 간 저장은 분리해 구형 도구가 새 스케치 필드를
덮어쓰지 않게 합니다. 브라우저·홈 화면 앱·기기가 다르면 자동 복사가 안 될 수 있으므로
기존 JSON 백업을 보관하고 새 도구에서 복원하세요. 새 버전 파일은 새 도구에서 엽니다.
초기화는 현재 버전만 지우며 과거 버전 자료를 다시 자동 복원하지 않습니다.

## 오프라인과 화면 유지

새 /youtube-tools/ 경로의 HTML/JS/CSS/SVG 도구 코드를 로컬 캐시합니다.
온라인으로 한 번 열어 준비 완료를 확인하고, 업데이트 시 모든 콘티 창을 닫았다
다시 여세요. 이전 캐시와 기기 원고는 다른 것이며 브라우저 데이터 삭제는 권하지 않습니다.
캐시 버전 변경 시 설치 요청은 cache:reload로 최신 자산을 받습니다.
지원 브라우저에서는 화면 켜짐을 요청하지만 저전력 모드 등에서 거부될 수 있습니다.

## 검증

로컬 서버 제공 후 아래를 실행합니다. Playwright와 /usr/bin/chromium이 필요합니다.

- CONTI_TEST_URL=http://127.0.0.1:8767/youtube-tools/cook-conti.html node tests/conti.test.cjs
- node tests/path-offline.test.cjs
- node tests/storyboard.test.cjs
- node tests/legacy-save.test.cjs

iOS 실기기 검증은 별도입니다. 실제 배포 확인과 로컬 브라우저 기능 검증을 구분합니다.
