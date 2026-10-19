# 로컬 개발

현재 구현 범위: 계정 생성·토큰 로그인·로그아웃, 소유자 전용 기본 프로필 임시저장, 심사 제출·조회, 관리자 상태 변경, 심사 이력, OpenAPI.

## 실행

저장소 루트에서:

```sh
python3 -m venv .venv
.venv/bin/pip install -r backend/requirements.txt
.venv/bin/python backend/manage.py migrate
.venv/bin/python backend/manage.py createsuperuser
DEBUG=True .venv/bin/python backend/manage.py seed_demo
DEBUG=True .venv/bin/python backend/manage.py runserver 127.0.0.1:8000
```

- 관리자: http://127.0.0.1:8000/admin/
- API 문서: http://127.0.0.1:8000/api/docs/
- 개발 DB: SQLite. `DATABASE_URL` 설정 시 PostgreSQL 사용.
- API 인증: 로그인 응답의 token을 `Authorization: Token <token>` 헤더로 전송.
- seed_demo는 DEBUG 환경에서만 가상 회원을 생성하며 로그인 비밀번호를 만들지 않습니다.

## 관리자 확인 순서

1. Applications에서 가상 회원을 선택하고 `심사 시작` 실행.
2. 상세 화면에서 사진·서류 확인을 체크하고 저장.
3. 목록에서 `승인` 실행.
4. Review events에서 제출·심사 시작·승인 이력 확인.
5. 보완·대기·반려는 상세 화면에 사유를 먼저 저장하고 목록 작업 실행.

## 검증

```sh
cd backend
../.venv/bin/python manage.py check
../.venv/bin/pytest -q
../.venv/bin/python manage.py spectacular --file ../docs/api/openapi.yaml --validate
```

## 구현 제한

이 코드는 로컬 개발용 첫 단계입니다. 아직 실서비스에 배포하지 않습니다.

- Flutter SDK와 모바일 프로젝트는 아직 설치·생성하지 않았습니다.
- 본인인증·사진·서류 업로드는 미연동입니다. 일반 계정은 실제 본인인증이 없어 제출할 수 없습니다.
- 사진·서류 체크는 관리자 검토용 임시 필드이며 업로드나 진위 확인을 수행하지 않습니다.
- 현재 계정은 개발용 username/password 방식이며 확정된 휴대전화 인증 로그인으로 연결할 예정입니다.
- 프로필은 핵심 필드만 구현했습니다. 전체 PRD 필드와 동의 이력은 후속 개발 대상입니다.
- 토큰 만료·회전, 관리자 2단계 인증, 파일 열람 감사, 자동 삭제는 아직 미구현입니다.
- 매칭·결제·일정·알림·신고·메시지는 아직 미구현입니다.
- 개인정보·가격·보관기간 정책은 출시 전 검토가 필요한 설계 기본값이며 계약이나 법률검토 완료를 뜻하지 않습니다.

## 다음 구현

1. Flutter 가입·프로필·심사 화면과 위 API 연결
2. 본인인증 어댑터, 동의 이력, 비공개 사진·서류 업로드
3. 전체 프로필 필드·선호조건과 검증
4. 자동 매칭과 소개 응답, 일정, Pass 원장

관리자 계정·업체 계약·결제 활성화·스토어 제출은 실제 소유자 계정이 필요할 때 진행합니다. 비밀번호나 API 비밀키를 채팅으로 공유하지 않습니다.
