# SUITE ONE — Verified Private Matching

신원과 프로필을 확인한 회원에게 제한된 소개를 제공하는 프라이빗 매칭 서비스입니다.

> 현재 SUITE ONE은 기획 및 MVP 개발 단계입니다.  
> PRD에 포함된 문제 정의, 운영정책, 가격과 성공지표 중 일부는 아직 검증되지 않은 가설입니다.

## Product Vision

SUITE ONE은 많은 프로필을 반복해서 탐색하는 방식 대신, 회원에게 한 번에 한 명의 상대를 소개하는 것을 목표로 합니다.

가입 심사, 제한적인 프로필 공개, 소개 수락, 일정 및 장소 조율 과정을 하나의 서비스 안에서 제공하여 더욱 신뢰할 수 있고 집중도 높은 만남 경험을 만들고자 합니다.

## Current Problem Hypotheses

현재 다음 문제들이 존재할 수 있다고 가정하고 있습니다.

- 많은 프로필을 반복해서 탐색하는 과정에서 피로를 느낄 수 있습니다.
- 상대방의 신원과 프로필 정보가 사실인지 판단하기 어렵습니다.
- 사진과 개인정보가 불특정 다수에게 노출될 수 있습니다.
- 상호 호감 이후 일정과 장소를 조율하는 과정이 번거롭습니다.
- 심사, 소개, 취소 및 환불 기준이 불명확하면 유료 서비스에 대한 신뢰가 낮아질 수 있습니다.

이 문제들은 아직 실제 사용자 조사를 통해 검증되지 않았습니다. 잠재 사용자 인터뷰와 비공개 베타를 통해 확인할 예정입니다.

## MVP Flow

1. 계정 생성 및 휴대전화 본인인증
2. 프로필과 선호조건 작성
3. 사진과 인증자료 제출
4. 관리자 가입 심사
5. 승인 회원에게 한 명의 상대 소개
6. 양측의 순차적인 수락 또는 거절
7. 상호 수락 후 일정과 장소 조율
8. 만남 확정 및 알림
9. 참석 확인, 피드백 및 신고 처리

## Core Principles

- 한 번에 한 명만 소개합니다.
- 프로필은 필요한 상대에게 제한적으로 공개합니다.
- 상대 회원에게 원본 인증자료를 공개하지 않습니다.
- 외모나 자산에 대한 주관적인 점수를 저장하지 않습니다.
- 결혼, 연애 또는 실제 만남의 성공을 보장하지 않습니다.
- 민감한 심사와 신고·분쟁에는 관리자가 개입합니다.

## Current Status

- [x] 제품 기본 방향 정리
- [x] PRD v0.3 Draft 작성
- [x] 가입·심사 화면 프로토타입 제작
- [x] Django 백엔드 기초 구성
- [x] Flutter 및 iOS 개발환경 구성
- [ ] 핵심 사용자와 문제 가설 검증
- [ ] 소개 운영방식 확정
- [ ] Flutter 모바일 앱 구현
- [ ] 모바일 앱과 백엔드 연결
- [ ] 매칭·일정·결제·안전 기능 개발
- [ ] 비공개 베타 운영

## Documentation

- [Product Requirements Document v0.3](docs/PRD-v0.3.md)

## Decisions Under Review

다음 사항은 아직 최종 결정되지 않았습니다.

- 핵심 사용자의 연령대와 관계 목적
- 이성 간 매칭으로 MVP를 제한할지 여부
- 운영자가 상대를 직접 선택할지, 시스템이 자동 선정할지 여부
- 가입 승인·대기·반려의 객관적인 기준
- 성별에 따라 서로 다른 인증 기준을 적용할지 여부
- Introduction Pass 가격과 차감 시점
- 메시지 기능의 제공 범위
- 본인인증·지도·문자·파일 저장 업체
- 개인정보와 결제정책에 대한 법률 검토 방법

## Proposed Technology Stack

기술 구성 역시 MVP 개발 과정에서 변경될 수 있습니다.

- Mobile: Flutter
- Backend API: Django REST Framework
- Admin: Django Admin
- Database: PostgreSQL
- File Storage: Private object storage
- Push Notifications: Firebase Cloud Messaging
- Error Tracking: Sentry
- CI/CD: GitHub Actions

## Repository Structure

```text
suite-one/
├── mobile/      Flutter 사용자 앱
├── backend/     Django API와 관리자 기능
├── design/      화면 프로토타입
├── docs/        PRD와 설계 문서
└── README.md
```

## Disclaimer

이 저장소는 현재 개발 중인 프로젝트입니다.

서비스 운영 전 개인정보처리방침, 이용약관, 심사 기준, 결제·환불 정책 및 관련 법률 검토가 필요합니다.
