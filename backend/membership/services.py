from django.db import transaction
from django.utils import timezone
from rest_framework.exceptions import PermissionDenied, ValidationError

from .models import Application, Profile, ReviewEvent


def validate_profile(profile):
    required = ('display_name', 'birth_date', 'gender', 'region', 'occupation')
    missing = [key for key in required if not getattr(profile, key)]
    if missing:
        raise ValidationError({'missing_fields': missing})
    today = timezone.localdate()
    born = profile.birth_date
    age = today.year - born.year - ((today.month, today.day) < (born.month, born.day))
    if age < 25:
        raise ValidationError('만 25세 이상만 신청할 수 있습니다.')
    if not 100 <= len(profile.introduction.strip()) <= 2000:
        raise ValidationError('자기소개는 100~2000자로 작성해주세요.')


def record_change(application, actor, status, reason=''):
    ReviewEvent.objects.create(
        application=application, actor=actor, previous_status=application.status,
        new_status=status, reason=reason,
    )
    application.status = status
    application.reason = reason
    application.save()


@transaction.atomic
def save_profile(user, data):
    application = Application.objects.select_for_update().get(user=user)
    if application.status not in (Application.Status.DRAFT, Application.Status.REVISION_REQUESTED):
        raise ValidationError('현재 심사 상태에서는 프로필을 수정할 수 없습니다.')
    profile = Profile.objects.get(user=user)
    for key, value in data.items():
        setattr(profile, key, value)
    profile.full_clean()
    profile.save()
    return profile


@transaction.atomic
def submit_application(user):
    application = Application.objects.select_for_update().get(user=user)
    if application.status not in (Application.Status.DRAFT, Application.Status.REVISION_REQUESTED):
        raise ValidationError('이미 제출했거나 제출할 수 없는 상태입니다.')
    if not user.identity_verified:
        raise ValidationError('본인인증을 먼저 완료해주세요.')
    validate_profile(Profile.objects.get(user=user))
    application.photos_checked = False
    application.documents_checked = False
    application.submitted_at = timezone.now()
    record_change(application, user, Application.Status.SUBMITTED)
    return application


@transaction.atomic
def review_application(application_id, actor, status, reason=''):
    if not actor.is_active or not actor.is_staff or not actor.has_perm('membership.change_application'):
        raise PermissionDenied('심사 권한이 필요합니다.')
    application = Application.objects.select_for_update().select_related('user').get(pk=application_id)
    allowed = {
        Application.Status.SUBMITTED: {Application.Status.UNDER_REVIEW},
        Application.Status.WAITLISTED: {Application.Status.UNDER_REVIEW},
        Application.Status.UNDER_REVIEW: {
            Application.Status.APPROVED, Application.Status.REJECTED,
            Application.Status.REVISION_REQUESTED, Application.Status.WAITLISTED,
        },
    }
    if status not in allowed.get(application.status, set()):
        raise ValidationError('허용되지 않는 상태 변경입니다.')
    if status in ('REJECTED', 'REVISION_REQUESTED', 'WAITLISTED') and not reason.strip():
        raise ValidationError('사유를 입력해주세요.')
    if status == Application.Status.APPROVED:
        if not (application.user.identity_verified and application.photos_checked and application.documents_checked):
            raise ValidationError('본인·사진·필요 서류 검토를 모두 완료해야 승인할 수 있습니다.')
        validate_profile(application.user.profile)
    record_change(application, actor, status, reason.strip())
    return application
