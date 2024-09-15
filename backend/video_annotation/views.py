from django.http import FileResponse, HttpResponse
from rest_framework import viewsets, permissions
from rest_framework.response import Response
from .models import Video, Annotation, Tag
from .serializers import VideoSerializer, TagSerializer, AnnotationSerializer
import os
import mimetypes
import logging
from rest_framework.exceptions import PermissionDenied
from rest_framework_simplejwt.authentication import JWTAuthentication

logger = logging.getLogger(__name__)


class IsOwnerOrReadOnly(permissions.BasePermission):
    """
    Custom permission to only allow owners of an object to edit it.
    """

    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj.user == request.user


class VideoViewSet(viewsets.ModelViewSet):
    queryset = Video.objects.all()  # Add this line
    serializer_class = VideoSerializer
    permission_classes = [permissions.IsAuthenticated]
    authentication_classes = [JWTAuthentication]

    def get_queryset(self):
        return Video.objects.filter(user=self.request.user).order_by('-uploaded_at')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        if request.query_params.get('play'):
            if instance.user != request.user:
                raise PermissionDenied(
                    "You do not have permission to access this video.")
            file_path = instance.file.path
            if os.path.exists(file_path):
                file_size = os.path.getsize(file_path)
                content_type, encoding = mimetypes.guess_type(file_path)

                logger.info(f"Serving video: {file_path}")
                logger.info(f"File size: {file_size} bytes")
                logger.info(f"Content-Type: {content_type}")
                logger.info(f"Encoding: {encoding}")

                response = FileResponse(
                    open(file_path, 'rb'), content_type=content_type or 'video/mp4')
                response['Content-Length'] = str(file_size)
                response['Accept-Ranges'] = 'bytes'
                response['Content-Disposition'] = f'inline; filename="{
                    os.path.basename(file_path)}"'

                for header, value in response.items():
                    logger.info(f"Response header - {header}: {value}")

                return response
            else:
                logger.error(f"Video file not found: {file_path}")
                return Response({'error': 'Video file not found'}, status=404)
        serializer = self.get_serializer(instance)
        return Response(serializer.data)


class TagViewSet(viewsets.ModelViewSet):
    queryset = Tag.objects.all()  # Add this line
    serializer_class = TagSerializer
    permission_classes = [permissions.IsAuthenticated]
    authentication_classes = [JWTAuthentication]

    def get_queryset(self):
        return Tag.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class AnnotationViewSet(viewsets.ModelViewSet):
    queryset = Annotation.objects.all()  # Add this line
    serializer_class = AnnotationSerializer
    permission_classes = [permissions.IsAuthenticated]
    authentication_classes = [JWTAuthentication]

    def get_queryset(self):
        return Annotation.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
