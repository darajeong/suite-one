from datetime import date
import pytest
from rest_framework.test import APIClient
from rest_framework.exceptions import ValidationError, PermissionDenied
from .models import Application, Profile, ReviewEvent, User
from .services import review_application, submit_application

pytestmark = pytest.mark.django_db


@pytest.fixture
def member():
    user = User.objects.create_user(username='member', password='Unique-test-pass-273!', identity_verified=True)
    Profile.objects.create(user=user, display_name='테스트', birth_date=date(1990, 1, 1),
                           gender='FEMALE', region='서울', occupation='개발자', introduction='가' * 100)
    Application.objects.create(user=user)
    return user


@pytest.fixture
def reviewer():
    return User.objects.create_superuser(username='reviewer', password='Unique-test-pass-274!')


def test_signup_cannot_escalate_permissions():
    client = APIClient()
    response = client.post('/api/auth/signup/', {'username': 'new', 'password': 'Unique-test-pass-275!',
                                                'is_staff': True, 'identity_verified': True})
    assert response.status_code == 201
    user = User.objects.get(username='new')
    assert not user.is_staff and not user.identity_verified
    assert user.check_password('Unique-test-pass-275!')
    assert user.application.status == 'DRAFT'
    assert 'password' not in response.data


def test_profile_is_private_and_owner_scoped(member):
    client = APIClient()
    assert client.get('/api/profile/').status_code == 401
    client.force_authenticate(member)
    response = client.patch('/api/profile/', {'display_name': '수정', 'identity_verified': True})
    assert response.status_code == 200
    assert response.data['display_name'] == '수정'
    assert client.get('/api/admin/applications/1/review/').status_code == 403


def test_identity_required(member):
    member.identity_verified = False
    member.save()
    with pytest.raises(ValidationError):
        submit_application(member)
    assert ReviewEvent.objects.count() == 0


def test_age_and_introduction_required(member):
    profile = member.profile
    profile.birth_date = date.today()
    profile.save()
    with pytest.raises(ValidationError):
        submit_application(member)


def test_approval_requires_review_and_evidence(member, reviewer):
    application = submit_application(member)
    with pytest.raises(ValidationError):
        review_application(application.pk, reviewer, 'APPROVED')
    review_application(application.pk, reviewer, 'UNDER_REVIEW')
    with pytest.raises(ValidationError):
        review_application(application.pk, reviewer, 'APPROVED')
    Application.objects.filter(pk=application.pk).update(photos_checked=True, documents_checked=True)
    result = review_application(application.pk, reviewer, 'APPROVED')
    assert result.status == 'APPROVED'
    assert ReviewEvent.objects.count() == 3


def test_revision_reason_and_resubmit(member, reviewer):
    application = submit_application(member)
    review_application(application.pk, reviewer, 'UNDER_REVIEW')
    with pytest.raises(ValidationError):
        review_application(application.pk, reviewer, 'REVISION_REQUESTED')
    review_application(application.pk, reviewer, 'REVISION_REQUESTED', '자기소개를 보완해주세요.')
    assert submit_application(member).status == 'SUBMITTED'


def test_member_cannot_review(member):
    application = submit_application(member)
    with pytest.raises(PermissionDenied):
        review_application(application.pk, member, 'UNDER_REVIEW')


def test_submitted_profile_locked_and_duplicate_submit_rejected(member):
    submit_application(member)
    client = APIClient()
    client.force_authenticate(member)
    assert client.patch('/api/profile/', {'region': '부산'}).status_code == 400
    assert client.post('/api/application/submit/').status_code == 400


def test_staff_without_review_permission_rejected(member):
    staff = User.objects.create_user(username='staff', is_staff=True)
    application = submit_application(member)
    with pytest.raises(PermissionDenied):
        review_application(application.pk, staff, 'UNDER_REVIEW')


def test_login_logout_revokes_token(member):
    client = APIClient()
    response = client.post('/api/auth/login/', {'username': 'member', 'password': 'Unique-test-pass-273!'})
    assert response.status_code == 200
    client.credentials(HTTP_AUTHORIZATION=f"Token {response.data['token']}")
    assert client.get('/api/profile/').status_code == 200
    assert client.post('/api/auth/logout/').status_code == 204
    assert client.get('/api/profile/').status_code == 401


def test_invalid_profile_does_not_partially_save(member):
    client = APIClient()
    client.force_authenticate(member)
    response = client.patch('/api/profile/', {'region': '부산', 'gender': 'INVALID'})
    assert response.status_code == 400
    member.profile.refresh_from_db()
    assert member.profile.region == '서울'
