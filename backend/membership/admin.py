from django.contrib import admin, messages
from django.contrib.auth.admin import UserAdmin
from rest_framework.exceptions import APIException
from .models import Application, Profile, ReviewEvent, User
from .services import review_application


@admin.register(User)
class MemberAdmin(UserAdmin):
    readonly_fields = ('identity_verified',)
    fieldsets = UserAdmin.fieldsets + (('본인인증', {'fields': ('identity_verified',)}),)


@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ('display_name', 'region', 'occupation')
    readonly_fields = tuple(field.name for field in Profile._meta.fields)

    def has_add_permission(self, request):
        return False

    def has_delete_permission(self, request, obj=None):
        return False


@admin.register(Application)
class ApplicationAdmin(admin.ModelAdmin):
    list_display = ('user', 'status', 'submitted_at', 'updated_at')
    list_filter = ('status',)
    search_fields = ('user__username',)
    readonly_fields = ('user', 'status', 'submitted_at', 'updated_at')
    actions = ['start_review', 'approve', 'request_revision', 'waitlist', 'reject']

    def has_add_permission(self, request):
        return False

    def has_delete_permission(self, request, obj=None):
        return False

    def transition(self, request, queryset, target):
        for application in queryset:
            try:
                review_application(application.pk, request.user, target, application.reason)
            except APIException as exc:
                self.message_user(request, f'{application}: {exc.detail}', messages.ERROR)
            else:
                self.message_user(request, f'{application.user}: {target}', messages.SUCCESS)

    @admin.action(description='심사 시작')
    def start_review(self, request, queryset):
        self.transition(request, queryset, 'UNDER_REVIEW')

    @admin.action(description='승인 (본인·사진·서류 확인 필수)')
    def approve(self, request, queryset):
        self.transition(request, queryset, 'APPROVED')

    @admin.action(description='보완 요청 (상세 화면에 사유 먼저 저장)')
    def request_revision(self, request, queryset):
        self.transition(request, queryset, 'REVISION_REQUESTED')

    @admin.action(description='대기 (사유 필수)')
    def waitlist(self, request, queryset):
        self.transition(request, queryset, 'WAITLISTED')

    @admin.action(description='반려 (사유 필수)')
    def reject(self, request, queryset):
        self.transition(request, queryset, 'REJECTED')


@admin.register(ReviewEvent)
class ReviewEventAdmin(admin.ModelAdmin):
    list_display = ('application', 'actor', 'previous_status', 'new_status', 'created_at')
    readonly_fields = tuple(field.name for field in ReviewEvent._meta.fields)

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False

    def has_delete_permission(self, request, obj=None):
        return False


admin.site.site_header = 'SUITE ONE 운영'
admin.site.site_title = 'SUITE ONE'
