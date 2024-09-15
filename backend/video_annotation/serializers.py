from rest_framework import serializers
from .models import Video, Annotation, Tag
from django.contrib.auth import get_user_model

User = get_user_model()

class VideoSerializer(serializers.ModelSerializer):
    file_url = serializers.SerializerMethodField()
    file_size = serializers.SerializerMethodField()
    user = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = Video
        fields = ['id', 'title', 'file', 'uploaded_at', 'file_url', 'file_size', 'user']

    def get_file_url(self, obj):
        if obj.file:
            return self.context['request'].build_absolute_uri(obj.file.url)
        return None

    def get_file_size(self, obj):
        if obj.file:
            return obj.file.size
        return None

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)

class TagSerializer(serializers.ModelSerializer):
    user = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = Tag
        fields = ['id', 'name', 'color', 'user']

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)

class AnnotationSerializer(serializers.ModelSerializer):
    user = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = Annotation
        fields = ['id', 'video', 'timestamp', 'tag', 'x', 'y', 'width', 'height', 'created_at', 'user']

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)

    def validate_video(self, value):
        if value.user != self.context['request'].user:
            raise serializers.ValidationError("You can only create annotations for your own videos.")
        return value

    def validate_tag(self, value):
        if value.user != self.context['request'].user:
            raise serializers.ValidationError("You can only use your own tags.")
        return value