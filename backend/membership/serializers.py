from django.contrib.auth.password_validation import validate_password
from django.db import transaction
from rest_framework import serializers
from .models import Application, Profile, User


class SignupSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = ('username', 'password')

    def validate(self, attrs):
        validate_password(attrs['password'], user=User(username=attrs['username']))
        return attrs

    @transaction.atomic
    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        Profile.objects.create(user=user)
        Application.objects.create(user=user)
        return user


class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = ('display_name', 'birth_date', 'gender', 'region', 'occupation', 'introduction', 'updated_at')
        read_only_fields = ('updated_at',)


class ApplicationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Application
        fields = ('id', 'status', 'reason', 'submitted_at', 'updated_at')
        read_only_fields = fields


class ReviewSerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=Application.Status.choices)
    reason = serializers.CharField(required=False, default='', allow_blank=True)
