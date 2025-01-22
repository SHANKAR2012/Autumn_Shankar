from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Group, Assignment, Submission, Comment, Subtask, Notification

User = get_user_model()

# User serializer for registration and user details
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'password', 'branch', 'enrollment_no', 'roles', 'email']
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
    members = serializers.PrimaryKeyRelatedField(queryset=User.objects.all(), many=True)
    
    class Meta:
        model = Group
        fields = ['id', 'group_name', 'description', 'created_by', 'created_at', 'members']
        read_only_fields = ['created_at', 'created_by']

    def validate_members(self, value):
        # You can add extra validation for members (e.g., ensure that members are valid users)
        if not value:
            raise serializers.ValidationError('At least one member is required.')
        return value

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        representation['members'] = [member.username for member in instance.members.all()]
        return representation

# Assignment serializer
class AssignmentSerializer(serializers.ModelSerializer):
    creator = serializers.CharField(source='creator.username', read_only=True)
    reviewees = serializers.PrimaryKeyRelatedField(queryset=User.objects.all(), many=True)
    reviewers = serializers.PrimaryKeyRelatedField(queryset=User.objects.all(), many=True)
    group = serializers.PrimaryKeyRelatedField(queryset=Group.objects.all(), many=True, required=False)

    class Meta:
        model = Assignment
        fields = ['id', 'title', 'description', 'attachment', 'creator', 'reviewees', 'group', 'reviewers', 'deadline', 'created_at']
        read_only_fields = ['creator', 'created_at']

    def to_internal_value(self, data):
        """
        Custom to_internal_value to handle single integer or list for the group field.
        """
        if isinstance(data.get('group'), (int, str)):
            data['group'] = [data['group']]
        return super().to_internal_value(data)

    def validate_group(self, value):
        """
        Ensures all group IDs provided are valid.
        """
        if not value:
            raise serializers.ValidationError("Group field cannot be empty.")
        return value

# Submission serializer
class SubmissionSerializer(serializers.ModelSerializer):
    assignment_title = serializers.CharField(source='assignment.title', read_only=True)
    reviewee_username = serializers.CharField(source='reviewee.username', read_only=True)

    class Meta:
        model = Submission
        fields = ['submission_id', 'assignment', 'assignment_title', 'attachment', 'created_at', 'reviewed_at', 'status', 'reviewee_comment', 'reviewee_username']
        read_only_fields = ['reviewee']  # Mark reviewee as read-only since it's set in perform_create

# Comment serializer
class CommentSerializer(serializers.ModelSerializer):
    submission = serializers.PrimaryKeyRelatedField(queryset=Submission.objects.all())
    reviewer = serializers.CharField(source='reviewer.username', read_only=True)

    class Meta:
        model = Comment
        fields = ['comment_id', 'submission', 'comment_text', 'created_at', 'reviewer']

    def create(self, validated_data):
        # Automatically set the reviewer to the logged-in user
        request = self.context.get('request')  # Get the request from the serializer context
        if request and request.user:
            validated_data['reviewer'] = request.user
        return super().create(validated_data)

# Subtask serializer
class SubtaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subtask
        fields = '__all__'

# Notification serializer
class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ['notification_id', 'user', 'message', 'read', 'created_at']
