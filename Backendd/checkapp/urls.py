from django.urls import path
from . import views
from .views import (
    CreateNotificationView,
    GetNotificationsView,
    GroupAssignmentCreateView,
    GroupCreateView,
    GroupListView,
    MarkNotificationAsReadView,
    RequestReviewView,
    ReviewerSubmissionsView,
    UserListCreateView,
    UserDetailView,
   
    
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
    ReviewSubmissionView,
    SubmitCommentView,
)

urlpatterns = [
    # User URLs
    path('users/', UserListCreateView.as_view(), name='user-list-create'),
    path('users/<int:pk>/', UserDetailView.as_view(), name='user-detail'),

    # Group URLs
#     path('groups/', GroupListCreateView.as_view(), name='group-list-create'),
    # path('groups/<int:pk>/', GroupDetailView.as_view(), name='group-detail'),
    path('groups/create',GroupCreateView.as_view(), name='group-create'),
    path('groups/', GroupListView.as_view(), name='group-list'),
    path('groups/assignments/create/', GroupAssignmentCreateView.as_view(), name='create-group-assignment'),
     

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

    # Specific Routes
    path('assignments/my-assignments/', 
         AssignmentListCreateView.as_view(http_method_names=['get']), 
         name='my-assignments'),
    path('submissions/my-submissions/', 
         SubmissionListCreateView.as_view(http_method_names=['get']), 
         name='my-submissions'),
    path('submissions/<int:pk>/request-review/', 
         RequestReviewView.as_view(), 
         name='request-review'),
    path('submissions/reviewer/', 
         ReviewerSubmissionsView.as_view(), 
         name='reviewer-submissions'),  
     path('delete_submission/<int:submission_id>/', views.delete_submission, name='delete_submission'),
     # This should list all submissions for reviewers
       path('review_submission/<int:submission_id>/', ReviewSubmissionView.as_view(), name='review_submission'),
        path('submissions/<int:submission_id>/comments/', CommentListCreateView.as_view(), name='comment-list-create'),
    
    # For retrieving, updating, or deleting a specific comment
    path('comments/<int:pk>/', CommentDetailView.as_view(), name='comment-detail'),
    path('submit-comment/<int:submission_id>/', SubmitCommentView.as_view(), name='submit_comment'),
     path('create_notification/', CreateNotificationView.as_view(), name='create_notification'),
    path('get_notifications/', GetNotificationsView.as_view(), name='get_notifications'),
    path('mark_notification_as_read/<int:notification_id>/', MarkNotificationAsReadView.as_view(), name='mark_notification_as_read'),
]
