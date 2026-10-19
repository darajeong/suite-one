from django.shortcuts import get_object_or_404
from django.contrib.auth import logout
from drf_spectacular.utils import extend_schema
from rest_framework import generics, permissions, status
from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework.response import Response
from rest_framework.throttling import AnonRateThrottle
from rest_framework.views import APIView
from .models import Application
from .serializers import ApplicationSerializer, ProfileSerializer, ReviewSerializer, SignupSerializer
from .services import review_application, save_profile, submit_application


class SignupView(generics.CreateAPIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = SignupSerializer


class LoginView(ObtainAuthToken):
    throttle_classes = [AnonRateThrottle]


class ProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = ProfileSerializer
    http_method_names = ['get', 'patch', 'head', 'options']

    def get_object(self):
        return self.request.user.profile

    def perform_update(self, serializer):
        serializer.instance = save_profile(self.request.user, serializer.validated_data)


class ApplicationView(generics.RetrieveAPIView):
    serializer_class = ApplicationSerializer

    def get_object(self):
        return self.request.user.application


class SubmitView(APIView):
    @extend_schema(request=None, responses=ApplicationSerializer)
    def post(self, request):
        return Response(ApplicationSerializer(submit_application(request.user)).data)


class ReviewView(APIView):
    permission_classes = [permissions.IsAdminUser]

    @extend_schema(request=ReviewSerializer, responses=ApplicationSerializer)
    def post(self, request, pk):
        get_object_or_404(Application, pk=pk)
        serializer = ReviewSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        application = review_application(pk, request.user, **serializer.validated_data)
        return Response(ApplicationSerializer(application).data)


class LogoutView(APIView):
    @extend_schema(request=None, responses={204: None})
    def post(self, request):
        from rest_framework.authtoken.models import Token
        Token.objects.filter(user=request.user).delete()
        logout(request)
        return Response(status=status.HTTP_204_NO_CONTENT)
