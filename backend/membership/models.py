from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """Identity is verified only by a future trusted provider callback."""

    identity_verified = models.BooleanField(default=False)


class Profile(models.Model):
    class Gender(models.TextChoices):
        FEMALE = 'FEMALE', '여성'
        MALE = 'MALE', '남성'

    user = models.OneToOneField(User, on_delete=models.CASCADE)
    display_name = models.CharField(max_length=40, blank=True)
    birth_date = models.DateField(null=True, blank=True)
    gender = models.CharField(max_length=6, choices=Gender.choices, blank=True)
    region = models.CharField(max_length=80, blank=True)
    occupation = models.CharField(max_length=100, blank=True)
    introduction = models.TextField(max_length=2000, blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.display_name or self.user.username


class Application(models.Model):
    class Status(models.TextChoices):
        DRAFT = 'DRAFT', '작성 중'
        SUBMITTED = 'SUBMITTED', '제출 완료'
        UNDER_REVIEW = 'UNDER_REVIEW', '심사 중'
        REVISION_REQUESTED = 'REVISION_REQUESTED', '보완 요청'
        WAITLISTED = 'WAITLISTED', '대기'
        APPROVED = 'APPROVED', '승인'
        REJECTED = 'REJECTED', '반려'

    user = models.OneToOneField(User, on_delete=models.CASCADE)
    status = models.CharField(max_length=24, choices=Status.choices, default=Status.DRAFT)
    reason = models.TextField(blank=True)
    photos_checked = models.BooleanField(default=False)
    documents_checked = models.BooleanField(default=False)
    submitted_at = models.DateTimeField(null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f'{self.user.username} / {self.get_status_display()}'


class ReviewEvent(models.Model):
    application = models.ForeignKey(Application, on_delete=models.PROTECT)
    actor = models.ForeignKey(User, on_delete=models.PROTECT)
    previous_status = models.CharField(max_length=24)
    new_status = models.CharField(max_length=24)
    reason = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
