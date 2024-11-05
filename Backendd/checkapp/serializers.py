from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Group, Assignment, Submission, Comment, Subtask

User = get_user_model()

# User serializer for registration and user details
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'password', 'branch', 'enrollment_no', 'roles','email']
        extra_kwargs = {
            'password': {'write_only': True}  # Ensure password is write-only
        }

    def create(self, validated_data):
        user = User(**validated_data)
        user.set_password(validated_data['password'])  
        user.save()
        return user

# Login serializer
class LoginSerializer(serializers.Serializer):
    username = serializers.CharField(required=True)
    password = serializers.CharField(required=True, write_only=True)
    role = serializers.CharField(required=True)

# Group serializer
class GroupSerializer(serializers.ModelSerializer):
    class Meta:
        model = Group
        fields = '__all__'

# Assignment serializer
class AssignmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Assignment
        fields = '__all__'
        read_only_fields = ['creator', 'created_at']

# Submission serializer
from rest_framework import serializers
from .models import Submission

class SubmissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Submission
        fields = ['submission_id', 'assignment', 'reviewee', 'attachment', 'status', 'created_at', 'reviewed_at']
        read_only_fields = ['submission_id', 'reviewee', 'created_at', 'reviewed_at']  # Set read-only fields


# Comment serializer
class CommentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Comment
        fields = '__all__'

# Subtask serializer
class SubtaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subtask
        fields = '__all__'
