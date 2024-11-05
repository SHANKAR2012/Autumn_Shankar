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
from rest_framework.decorators import action

from .serializers import (
    UserSerializer,
    GroupSerializer,
    AssignmentSerializer,
    SubmissionSerializer,
    CommentSerializer,
    SubtaskSerializer,
    LoginSerializer,
)

User = get_user_model()

# User views
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
class GroupListCreateView(generics.ListCreateAPIView):
    queryset = Group.objects.all()
    serializer_class = GroupSerializer
    permission_classes = [IsAuthenticated]

class GroupDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Group.objects.all()
    serializer_class = GroupSerializer
    permission_classes = [IsAuthenticated]

# Assignment views
class AssignmentListCreateView(generics.ListCreateAPIView):
    queryset = Assignment.objects.all()
    serializer_class = AssignmentSerializer
    permission_classes = [IsAuthenticated]
    
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
    queryset = Submission.objects.all()
    serializer_class = SubmissionSerializer
    permission_classes = [IsAuthenticated]
    def perform_create(self, serializer):
        # Automatically set the reviewee to the current authenticated user
        serializer.save(reviewee=self.request.user)

class SubmissionDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Submission.objects.all()
    serializer_class = SubmissionSerializer
    permission_classes = [IsAuthenticated]

# Comment views
class CommentListCreateView(generics.ListCreateAPIView):
    queryset = Comment.objects.all()
    serializer_class = CommentSerializer
    permission_classes = [IsAuthenticated]

class CommentDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Comment.objects.all()
    serializer_class = CommentSerializer
    permission_classes = [IsAuthenticated]

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
class RequestReviewView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        submission = get_object_or_404(Submission, submission_id=pk, reviewee=request.user)
        if submission.status == 'unchecked':
            submission.status = 'review_requested'
            submission.save()
            
            # Get the assignment's reviewers
            reviewers = submission.assignment.reviewers.all()
            
            # Here you would typically send notifications to reviewers
            # This is a placeholder for notification logic
            # You can implement this using Django signals or a notification system
            
            return Response({
                'message': 'Review requested successfully',
                'submission_id': submission.submission_id,
                'status': submission.status
            }, status=status.HTTP_200_OK)
        
        return Response({
            'error': 'Cannot request review for this submission'
        }, status=status.HTTP_400_BAD_REQUEST)