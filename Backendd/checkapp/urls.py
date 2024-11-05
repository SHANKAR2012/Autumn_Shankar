from django.urls import path
from .views import (
    RequestReviewView,
    UserListCreateView,
    UserDetailView,
    GroupListCreateView,
    GroupDetailView,
    AssignmentListCreateView,
    AssignmentDetailView,
    SubmissionListCreateView,
    SubmissionDetailView,
    CommentListCreateView,
    CommentDetailView,
    SubtaskListCreateView,
    SubtaskDetailView,
    LoginView,
    CurrentUserView,
)

urlpatterns = [
    # User URLs
    path('users/', UserListCreateView.as_view(), name='user-list-create'),
    path('users/<int:pk>/', UserDetailView.as_view(), name='user-detail'),

    # Group URLs
    path('groups/', GroupListCreateView.as_view(), name='group-list-create'),
    path('groups/<int:pk>/', GroupDetailView.as_view(), name='group-detail'),

    # Assignment URLs
    path('assignments/', AssignmentListCreateView.as_view(), name='assignment-list-create'),
    path('assignments/<int:pk>/', AssignmentDetailView.as_view(), name='assignment-detail'),

    # Submission URLs
    path('submissions/', SubmissionListCreateView.as_view(), name='submission-list-create'),
    path('submissions/<int:pk>/', SubmissionDetailView.as_view(), name='submission-detail'),

    # Comment URLs
    path('comments/', CommentListCreateView.as_view(), name='comment-list-create'),
    path('comments/<int:pk>/', CommentDetailView.as_view(), name='comment-detail'),

    # Subtask URLs
    path('subtasks/', SubtaskListCreateView.as_view(), name='subtask-list-create'),
    path('subtasks/<int:pk>/', SubtaskDetailView.as_view(), name='subtask-detail'),

    # Authentication URLs
    path('login/', LoginView.as_view(), name='login'),
    path('current-user/', CurrentUserView.as_view(), name='current-user'),
    path('assignments/my-assignments/', 
         AssignmentListCreateView.as_view(http_method_names=['get']), 
         name='my-assignments'),
    path('submissions/my-submissions/', 
         SubmissionListCreateView.as_view(http_method_names=['get']), 
         name='my-submissions'),
    path('submissions/<int:pk>/request-review/', 
         RequestReviewView.as_view(), 
         name='request-review'),
]
