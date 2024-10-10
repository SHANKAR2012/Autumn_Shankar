from rest_framework import serializers
from .models import User, Group, Assignment, Submission, Comment, Subtask

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'branch', 'enrollment_no', 'rolenames']  # Add other fields as needed

class GroupSerializer(serializers.ModelSerializer):
    created_by = UserSerializer(read_only=True)

    class Meta:
        model = Group
        fields = ['id', 'group_name', 'description', 'created_by', 'created_at', 'members']

class AssignmentSerializer(serializers.ModelSerializer):
    creator = UserSerializer(read_only=True)
    group = GroupSerializer(read_only=True)

    class Meta:
        model = Assignment
        fields = ['id', 'title', 'description', 'attachment', 'creator', 'reviewees', 'group', 'reviewers', 'deadline', 'created_at']

class SubmissionSerializer(serializers.ModelSerializer):
    reviewee = UserSerializer(read_only=True)
    assignment = AssignmentSerializer(read_only=True)

    class Meta:
        model = Submission
        fields = ['submission_id', 'assignment', 'reviewee', 'attachment', 'status', 'created_at', 'reviewed_at']

class CommentSerializer(serializers.ModelSerializer):
    reviewer = UserSerializer(read_only=True)
    submission = SubmissionSerializer(read_only=True)

    class Meta:
        model = Comment
        fields = ['comment_id', 'submission', 'reviewer', 'comment_text', 'created_at']

class SubtaskSerializer(serializers.ModelSerializer):
    reviewee = UserSerializer(read_only=True)
    submission = SubmissionSerializer(read_only=True)

    class Meta:
        model = Subtask
        fields = ['subtask_id', 'submission', 'reviewee', 'title', 'description', 'deadline', 'status', 'created_at']
