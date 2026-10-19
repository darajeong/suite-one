# Architecture Decision Record

## 시스템 구성

| 영역 | 선택 |
|---|---|
| Mobile | Flutter, Riverpod, go_router, Dio |
| API | Django REST Framework |
| Admin | Django Admin |
| Database | PostgreSQL |
| Async jobs | Celery + Redis |
| Files | AWS S3 private bucket + expiring signed URLs |
| Push | Firebase Cloud Messaging |
| Error tracking | Sentry |
| Identity | NICE 본인확인 연동 어댑터 |
| Places | Kakao Local API 연동 어댑터 |
| SMS | SOLAPI 연동 어댑터 |
| Email | AWS SES 연동 어댑터 |
| Payments | Apple StoreKit + Google Play Billing, server verification |
| CI/CD | GitHub Actions |

외부 서비스는 도메인 코드와 분리한 adapter interface 뒤에 둔다. 개발과 테스트에서는 fake adapter를 사용하므로 계약 전에도 핵심 흐름을 구현할 수 있다.

## 백엔드 모듈

- `accounts`: 계정, 인증, 권한, 탈퇴
- `profiles`: 프로필, 선호조건, 사진
- `applications`: 증빙자료, 가입 심사
- `matching`: 후보 산정, 소개, 응답, 만료
- `meetings`: 가능 일정, 장소, 만남, 피드백
- `passes`: 상품, 구매, 차감, 복구
- `safety`: 신고, 차단, 제재
- `notifications`: 푸시·이메일·문자 발송 기록
- `audit`: 관리자 민감정보 접근과 변경 이력

## 중요한 일관성 규칙

- 데이터베이스 제약과 트랜잭션으로 회원당 활성 소개 한 건을 보장한다.
- 결제 검증 이벤트와 Pass 거래에는 idempotency key를 사용한다.
- 소개·만남·심사 상태 변경은 서비스 계층을 통해서만 수행한다.
- 외부 알림은 상태 변경 커밋 후 비동기 발송한다.
- 원본 서류는 객체 저장소에만 두고 데이터베이스에는 키와 심사 결과만 저장한다.
