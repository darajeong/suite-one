from datetime import date
from django.conf import settings
from django.core.management.base import BaseCommand, CommandError
from membership.models import User, Profile, Application
from membership.services import submit_application


class Command(BaseCommand):
    help = 'DEBUG 모드에서만 합성 테스트 회원과 심사 신청 1건을 생성합니다.'

    def handle(self, *args, **options):
        if not settings.DEBUG:
            raise CommandError('DEBUG=True인 로컬 환경에서만 실행할 수 있습니다.')
        user, created = User.objects.get_or_create(username='demo-applicant')
        if not created:
            self.stdout.write('데모 회원이 이미 존재합니다. 기존 데이터는 변경하지 않았습니다.')
            return
        user.set_unusable_password()
        user.identity_verified = True
        user.save()
        Profile.objects.create(user=user, display_name='가상 테스트 회원', birth_date=date(1992, 1, 1),
                               gender='FEMALE', region='서울', occupation='가상 직업',
                               introduction='이 프로필은 개발 검증을 위한 가상의 회원 정보입니다. ' * 6)
        Application.objects.create(user=user)
        submit_application(user)
        self.stdout.write(self.style.SUCCESS('가상 회원 심사 신청 1건을 생성했습니다. 실제 인증 결과가 아닙니다.'))
