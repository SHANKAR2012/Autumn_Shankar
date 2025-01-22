from django.http import JsonResponse
from django.shortcuts import get_object_or_404
from django.contrib.auth import login, authenticate
from django.contrib.auth.decorators import login_required
from rest_framework import generics, permissions, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.decorators import api_view
from .models import Group, Assignment, Submission, Comment, Subtask
from django.views.decorators.csrf import csrf_exempt
import json
from rest_framework import status

from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied

from .serializers import (
    UserSerializer,
    GroupSerializer,
    AssignmentSerializer,
    SubmissionSerializer,
    CommentSerializer,
    SubtaskSerializer,
    LoginSerializer,
)
from rest_framework import status
from django.utils import timezone
from django.shortcuts import get_object_or_404


User = get_user_model()

# User views
@csrf_exempt
def delete_submission(request, submission_id):
    try:
        # Use 'submission_id' instead of 'id'
        submission = Submission.objects.get(submission_id=submission_id)
        
        # Delete the submission
        submission.delete()
        
        return JsonResponse({"message": "Submission deleted successfully"}, status=200)
    except Submission.DoesNotExist:
        return JsonResponse({"message": "Submission not found"}, status=404)

class UserListCreateView(generics.ListCreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]  # Disable authentication for user registration

    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)  # Return 201 status on success

class UserDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

# Group views


# class GroupDetailView(generics.RetrieveUpdateDestroyAPIView):
#     queryset = Group.objects.all()
#     serializer_class = GroupSerializer
#     permission_classes = [IsAuthenticated]

# Assignment views
class AssignmentListCreateView(generics.ListCreateAPIView):
    queryset = Assignment.objects.all()
    serializer_class = AssignmentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if 'my-assignments' in self.request.path:
            # Return only assignments where the current user is a reviewee
            return Assignment.objects.filter(reviewees=user)
        # Return all assignments created by the current user if they are a reviewer
        return Assignment.objects.filter(creator=user)

    @action(detail=False, methods=['get'], url_path='my-assignments')  # Define the custom URL path for the action
    def my_assignments(self, request):
        """
        A custom action for retrieving assignments where the current user is a reviewee
        """
        user = request.user
        # Return only assignments where the current user is a reviewee
        queryset = Assignment.objects.filter(reviewees=user)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    def post(self, request):
        try:
            # Collecting data from the request
            title = request.POST.get('title')
            description = request.POST.get('description')
            deadline = request.POST.get('deadline')
            attachment = request.FILES.get('attachment')

            # Parse reviewees and reviewers
            reviewees_str = request.POST.get('reviewees', '')
            reviewers_str = request.POST.get('reviewers', '')
            reviewees = [int(x) for x in reviewees_str.split(',') if x]
            reviewers = [int(x) for x in reviewers_str.split(',') if x]

            # Construct data dictionary
            data = {
                'title': title,
                'description': description,
                'deadline': deadline,
                'attachment': attachment,
                'reviewees': reviewees,
                'reviewers': reviewers
            }

            # Initialize serializer with data
            serializer = AssignmentSerializer(data=data)
            if serializer.is_valid():
                # Save the assignment, setting the creator manually
                serializer.save(creator=request.user)
                return JsonResponse({'message': 'Success'}, status=status.HTTP_201_CREATED)
            else:
                # If data is invalid, return errors
                return JsonResponse(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        except ValueError:
            return JsonResponse({'error': 'Invalid number format in reviewers or reviewees'}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

class AssignmentDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Assignment.objects.all()
    serializer_class = AssignmentSerializer
    permission_classes = [IsAuthenticated]

# Submission views
class SubmissionListCreateView(generics.ListCreateAPIView):
    serializer_class = SubmissionSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(reviewee=self.request.user)

    def get_queryset(self):
        user = self.request.user

        # Check if the user is a reviewer on any assignments.
        reviewer_assignments = Assignment.objects.filter(reviewers=user)

        if reviewer_assignments.exists():
            # If the user is a reviewer, show submissions related to assignments they are reviewing.
            return Submission.objects.filter(
                assignment__in=reviewer_assignments
            ).select_related('assignment')
        else:
            # If the user is a reviewee, show only their own submissions.
            return Submission.objects.filter(reviewee=user).select_related('assignment')

class SubmissionDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Submission.objects.all()
    serializer_class = SubmissionSerializer
    permission_classes = [IsAuthenticated]

# Comment views


# List and create comments for a submission
class CommentListCreateView(generics.ListCreateAPIView):
    serializer_class = CommentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Filter comments by submission
        submission_id = self.kwargs['submission_id']
        return Comment.objects.filter(submission=submission_id)

    def perform_create(self, serializer):
        # Ensure the reviewer is authorized to comment on the submission
        submission_id = self.kwargs['submission_id']
        submission = Submission.objects.get(id=submission_id)
        reviewer = self.request.user
        
        # Check if the reviewer is part of the assignment reviewers
        if reviewer not in submission.assignment.reviewers.all():
            raise PermissionDenied("You are not authorized to comment on this submission.")

        # Create the comment with the submission and reviewer linked
        serializer.save(submission=submission, reviewer=reviewer)

    def create(self, request, *args, **kwargs):
        # Custom create method to handle adding a comment
        submission_id = self.kwargs['submission_id']
        submission = Submission.objects.get(id=submission_id)
        
        # Check if the reviewer is authorized to add a comment
        reviewer = request.user
        if reviewer not in submission.assignment.reviewers.all():
            return Response({"detail": "You are not authorized to comment on this submission."},
                            status=status.HTTP_403_FORBIDDEN)
        
        # If authorized, proceed to create the comment
        return super().create(request, *args, **kwargs)

# Retrieve, update, and delete a single comment
class CommentDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Comment.objects.all()
    serializer_class = CommentSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        # Get the comment object
        comment = super().get_object()

        # Ensure the user is the reviewer of this comment or an admin
        if self.request.user != comment.reviewer and not self.request.user.is_staff:
            raise PermissionDenied("You are not authorized to modify this comment.")
        
        return comment

    def perform_update(self, serializer):
        # Ensure the reviewer is authorized to update the comment
        comment = self.get_object()
        if self.request.user != comment.reviewer:
            raise PermissionDenied("You are not authorized to update this comment.")
        serializer.save()

    def perform_destroy(self, instance):
        # Ensure the reviewer is authorized to delete the comment
        if self.request.user != instance.reviewer:
            raise PermissionDenied("You are not authorized to delete this comment.")
        instance.delete()


# Subtask views
class SubtaskListCreateView(generics.ListCreateAPIView):
    queryset = Subtask.objects.all()
    serializer_class = SubtaskSerializer
    permission_classes = [IsAuthenticated]

class SubtaskDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Subtask.objects.all()
    serializer_class = SubtaskSerializer
    permission_classes = [IsAuthenticated]

# Login view
class LoginView(generics.GenericAPIView):
    serializer_class = LoginSerializer
    permission_classes = [AllowAny]  # Allow any user to access this endpoint

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        username = serializer.validated_data.get('username')
        password = serializer.validated_data.get('password')
        role = serializer.validated_data.get('role')

        user = authenticate(username=username, password=password)

        if user is not None and role in user.roles:  # Adjust this according to your roles logic
            refresh = RefreshToken.for_user(user)
            return Response({
                "access": str(refresh.access_token),
                "refresh": str(refresh),
            }, status=status.HTTP_200_OK)

        return Response({"detail": "Invalid credentials or role."}, status=status.HTTP_401_UNAUTHORIZED)

# Current User view
class CurrentUserView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        serializer = UserSerializer(user)
        return Response(serializer.data)

# Request Review View (modified to remove notifications)
class RequestReviewView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        # Fetch the submission for the given ID and ensure it belongs to the reviewee
        submission = get_object_or_404(Submission, submission_id=pk, reviewee=request.user)
        
        # Make sure the status is 'unchecked' before requesting a review
        if submission.status == 'unchecked':
            submission.status = 'review_requested'
            submission.save()  # Save the updated status

            return Response({
                'message': 'Review requested successfully',
                'submission_id': submission.submission_id,
                'status': submission.status
            }, status=status.HTTP_200_OK)
        
        # If the submission's status isn't 'unchecked', we can't request a review
        return Response({
            'error': 'Cannot request review for this submission'
        }, status=status.HTTP_400_BAD_REQUEST)

class ReviewerSubmissionsView(generics.ListAPIView):
    serializer_class = SubmissionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Get the current authenticated user
        user = self.request.user
        
        # Check if the user has the 'reviewer' role
        if 'reviewer' not in user.roles:
            raise PermissionDenied("You do not have permission to view these submissions.")

        # Get all submissions for assignments where the current user is a reviewer
        return Submission.objects.filter(
            assignment__reviewers=user
        ).select_related('assignment')

class ReviewSubmissionView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, pk):
        # Get the submission based on the provided primary key (pk)
        submission = get_object_or_404(Submission, submission_id=pk)
        
        # Extract new review comments from the request data
        review_comment = request.data.get("review_comment")

        if review_comment:
            # Add the comment to the submission
            comment = Comment.objects.create(
                submission=submission,
                comment=review_comment,
                reviewer=request.user
            )
            return Response({
                'message': 'Review submitted successfully',
                'comment': CommentSerializer(comment).data
            }, status=status.HTTP_200_OK)

        return Response({
            'error': 'Review comment is required.'
        }, status=status.HTTP_400_BAD_REQUEST)

from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Submission
from .serializers import SubmissionSerializer

class RequestReviewView(APIView):
    def post(self, request, pk):
        try:
            submission = Submission.objects.get(pk=pk)
            if submission.status == 'submitted':
                submission.status = 'pending_review'
                submission.save()

                # Optionally, create a notification for the reviewer
                # Notification logic here

                return Response({"message": "Review request sent successfully."}, status=status.HTTP_200_OK)
            else:
                return Response({"message": "Submission already reviewed or not in the correct state."}, status=status.HTTP_400_BAD_REQUEST)
        except Submission.DoesNotExist:
            return Response({"message": "Submission not found."}, status=status.HTTP_404_NOT_FOUND)
        from rest_framework import status

from .models import Notification, Assignment, User
from .serializers import NotificationSerializer


class CreateNotificationView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        # Ensure the user is a reviewee (user must have the 'reviewee' role)
        if 'reviewee' not in request.user.roles:
            return Response({"detail": "Only reviewees can send notifications."}, status=status.HTTP_403_FORBIDDEN)

        # Get data from the request
        assignment_id = request.data.get('assignment_id')
        message = request.data.get('message')

        try:
            assignment = Assignment.objects.get(id=assignment_id)
        except Assignment.DoesNotExist:
            return Response({"detail": "Assignment not found."}, status=status.HTTP_404_NOT_FOUND)

        # Fetch reviewers for the assignment (assumes reviewers are assigned)
        reviewers = assignment.reviewers.all()
        if not reviewers:
            return Response({"detail": "No reviewers assigned to this assignment."}, status=status.HTTP_404_NOT_FOUND)

        # Create notifications for all reviewers
        notifications = []
        for reviewer in reviewers:
            notification = Notification.objects.create(
                user=reviewer,  # Reviewer receives the notification
                message=message,
                read=False,
            )
            notifications.append(notification)

        # Serialize and return the created notifications
        serializer = NotificationSerializer(notifications, many=True)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class GetNotificationsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Ensure the user is a reviewer (user must have the 'reviewer' role)
        if 'reviewer' not in request.user.roles:
            return Response({"detail": "Only reviewers can view notifications."}, status=status.HTTP_403_FORBIDDEN)

        # Fetch notifications for the reviewer
        notifications = Notification.objects.filter(user=request.user).order_by('-created_at')
        serializer = NotificationSerializer(notifications, many=True)
        return Response(serializer.data)


class MarkNotificationAsReadView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, notification_id):
        # Ensure the user is a reviewer (user must have the 'reviewer' role)
        if 'reviewer' not in request.user.roles:
            return Response({"detail": "Only reviewers can mark notifications as read."}, status=status.HTTP_403_FORBIDDEN)

        try:
            notification = Notification.objects.get(notification_id=notification_id, user=request.user)
        except Notification.DoesNotExist:
            return Response({"detail": "Notification not found."}, status=status.HTTP_404_NOT_FOUND)

        # Mark the notification as read
        notification.read = True
        notification.save()

        return Response({"detail": "Notification marked as read."}, status=status.HTTP_200_OK)

class SubmitCommentView(APIView):
    permission_classes = []

    def post(self, request, submission_id):
        try:
            # Get the submission object
            submission = Submission.objects.get(pk=submission_id)

            # Check if the current user is a reviewer for the submission's assignment
            if not submission.assignment.reviewers.filter(id=request.user.id).exists():
                return Response({'error': 'You are not authorized to comment on this submission.'}, status=status.HTTP_403_FORBIDDEN)

            # Serialize and validate the comment data
            comment_data = {
                "submission": submission_id,
                "comment_text": request.data.get("comment_text"),
            }
            serializer = CommentSerializer(data=comment_data, context={'request': request})

            if serializer.is_valid():
                # Save the comment with the current user as the reviewer
                comment = serializer.save(reviewer=request.user, submission=submission)

                # Update the submission's status if provided in the request
                new_status = request.data.get("status")
                if new_status and new_status in dict(Submission.STATUS_CHOICES):
                    submission.status = new_status
                    submission.reviewed_at = timezone.now()  # Set the reviewed timestamp
                    submission.save()

                # Return the newly created comment and submission status
                return Response({
                    "message": "Comment added and submission status updated successfully.",
                    "comment": serializer.data,
                    "submission_status": submission.status,
                }, status=status.HTTP_201_CREATED)
            else:
                # If serializer is invalid, return errors
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Submission.DoesNotExist:
            return Response({'error': 'Submission not found.'}, status=status.HTTP_404_NOT_FOUND)

class GroupCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        user = request.user

        # Ensure only users with 'reviewer' role can create a group
        if "reviewer" not in user.roles:
            return Response(
                {'error': 'Only reviewers can create groups.'},
                status=status.HTTP_403_FORBIDDEN
            )

        # Get group details and members from the request data
        group_name = request.data.get('group_name')
        description = request.data.get('description', '')
        member_ids = request.data.get('members', [])  # List of user IDs to add to the group

        # Validate group name
        if not group_name:
            return Response({'error': 'Group name is required.'}, status=status.HTTP_400_BAD_REQUEST)

        # Create the group
        group = Group.objects.create(
            group_name=group_name,
            description=description,
            created_by=user
        )

        # Add members to the group
        try:
            members = User.objects.filter(id__in=member_ids)
            group.members.add(*members)
        except User.DoesNotExist:
            return Response({'error': 'Some users could not be found.'}, status=status.HTTP_400_BAD_REQUEST)

        return Response(
            {'message': 'Group created successfully', 'group_id': group.id},
            status=status.HTTP_201_CREATED
        )


from .models import Assignment, Group, User
from .serializers import AssignmentSerializer


class GroupAssignmentCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        user = request.user

        # Ensure only reviewers can create group assignments
        if "reviewer" not in user.roles:
            return Response(
                {'error': 'Only reviewers can create group assignments.'},
                status=status.HTTP_403_FORBIDDEN
            )

        try:
            # Get the group and assignment data from the request
            group_data = request.data.get('group')  # Can be a single group (int) or a list of groups (list)
            title = request.data.get('title')
            description = request.data.get('description')
            deadline = request.data.get('deadline')
            attachment = request.FILES.get('attachment')

            reviewers_data = request.data.get('reviewers', '')  # Get reviewers from request
            try:
                reviewers = [reviewer['id'] for reviewer in reviewers_data if 'id' in reviewer]
            except (TypeError, KeyError):
                return Response(
                    {'error': 'Reviewers data format is invalid. Ensure it is a list of objects with an "id" key.'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Validate required fields
            if not group_data or not title or not description or not deadline:
                return Response(
                    {'error': 'Group, title, description, and deadline are required.'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Handle group_data (convert to list if it's a single value)
            if isinstance(group_data, str):  # If it's a string (e.g., a single group ID as a string)
                group_data = [int(group_data)]  # Convert to a list of integers
            elif isinstance(group_data, int):  # If it's a single integer
                group_data = [group_data]  # Convert to a list
            elif isinstance(group_data, list):  # If it's already a list
                group_data = [int(g) for g in group_data]
            else:
                return Response({'error': 'Invalid group data format.'}, status=status.HTTP_400_BAD_REQUEST)

            # Retrieve groups using group_ids (group_data should now be a list of integers)
            groups = Group.objects.filter(id__in=group_data)
            if groups.count() != len(group_data):  # Check if all groups exist
                return Response({'error': 'One or more groups not found.'}, status=status.HTTP_404_NOT_FOUND)

            # Retrieve members of the groups (both reviewers and reviewees)
            group_members = User.objects.filter(groups__in=groups)  # All members of the selected groups

            # Validate reviewers (ensure they exist in the system)
            valid_reviewers = User.objects.filter(id__in=reviewers)
            if len(valid_reviewers) != len(reviewers):
                return Response(
                    {'error': 'One or more reviewers are invalid.'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Create the assignment data
            data = {
                'title': title,
                'description': description,
                'deadline': deadline,
                'attachment': attachment,
                'creator': user.id  # Assign the creator of the assignment as the current user
            }

            # Initialize the Assignment serializer with data
            serializer = AssignmentSerializer(data=data)
            if serializer.is_valid():
                # Save the assignment
                assignment = serializer.save(creator=user)

                # Link assignment to the groups
                assignment.groups.set(groups)

                # Add all members of the group (reviewees) to the assignment
                assignment.reviewees.add(*group_members)

                # Add reviewers to the assignment
                assignment.reviewers.add(*valid_reviewers)

                return Response(
                    {
                        'message': f'Assignment "{title}" successfully created and assigned to groups.',
                        'reviewers': [reviewer.username for reviewer in valid_reviewers],
                        'reviewees': [member.username for member in group_members],
                    },
                    status=status.HTTP_201_CREATED
                )
            else:
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


class GroupListView(generics.ListAPIView):
    serializer_class = GroupSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        if "reviewer" in user.roles:
            # Reviewers see only the groups they created
            return Group.objects.filter(created_by=user)
        elif "reviewee" in user.roles:
            # Reviewees see all groups they are a member of
            return Group.objects.filter(members=user)
        else:
            # For other roles, return an empty queryset
            return Group.objects.none()

class GroupAssignmentsForRevieweeView(generics.ListAPIView):
    serializer_class = AssignmentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        # Return assignments where the user is a member of a group
        return Assignment.objects.filter(group__members=user)


            