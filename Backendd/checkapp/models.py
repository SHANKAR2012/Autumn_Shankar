from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils import timezone
from django.contrib.postgres.fields import ArrayField

class User(AbstractUser):
    email = models.EmailField()
    branch = models.CharField(max_length=100)
    enrollment_no = models.CharField(max_length=20)
    roles = ArrayField(models.CharField(max_length=50), blank=True, default=list)

    def __str__(self):
        return self.username

    def display_rolenames(self):
        return ", ".join(self.roles)

    display_rolenames.short_description = 'Roles'


class Group(models.Model):
    group_name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    created_by = models.ForeignKey('User', on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    members = models.ManyToManyField('User', related_name='member_groups')
    assignments = models.ManyToManyField('Assignment', related_name='assigned_groups', blank=True)

    def __str__(self):
        return self.group_name


class Assignment(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField()
    attachment = models.FileField(upload_to='assignments/', blank=True, null=True)
    creator = models.ForeignKey('User', on_delete=models.CASCADE)
    reviewees = models.ManyToManyField('User', related_name='assigned_reviewees')
    group = models.ManyToManyField('Group', related_name='assigned_assignments')  # Changed to Many-to-Many
    reviewers = models.ManyToManyField('User', related_name='assigned_reviewers')
    deadline = models.DateTimeField()
    created_at = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return self.title

class Submission(models.Model):
    STATUS_CHOICES = [
        ('unchecked', 'Unchecked'),
        ('checked', 'Checked'),
    ]
 
    submission_id = models.AutoField(primary_key=True)
    assignment = models.ForeignKey('Assignment', on_delete=models.CASCADE)
    reviewee = models.ForeignKey('User', on_delete=models.CASCADE)
    attachment = models.FileField(upload_to='submissions/', blank=True, null=True)
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default='unchecked')
    created_at = models.DateTimeField(default=timezone.now)
    reviewed_at = models.DateTimeField(blank=True, null=True)
    reviewee_comment = models.TextField(blank=True, null=True)

    class Meta:
        # unique_together = ('assignment', 'reviewee')
        pass;

    def __str__(self):
        return f'Submission {self.submission_id} for {self.assignment.title} by {self.reviewee.username}'

class Comment(models.Model):
    comment_id = models.AutoField(primary_key=True)
    submission = models.ForeignKey('Submission', on_delete=models.CASCADE)
    reviewer = models.ForeignKey('User', on_delete=models.CASCADE)
    comment_text = models.TextField()
    created_at = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f'Comment {self.comment_id} on Submission {self.submission.submission_id} by {self.reviewer.username}'

class Subtask(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('completed', 'Completed'),
    ]

    subtask_id = models.AutoField(primary_key=True)
    submission = models.ForeignKey('Submission', on_delete=models.CASCADE)
    reviewee = models.ForeignKey('User', on_delete=models.CASCADE)
    title = models.CharField(max_length=100)
    description = models.TextField()
    deadline = models.DateTimeField()
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f'Subtask {self.subtask_id} for Submission {self.submission.submission_id} by {self.reviewee.username}'
class Notification(models.Model):
    notification_id = models.AutoField(primary_key=True)
    user = models.ForeignKey('User', on_delete=models.CASCADE)  # User receiving the notification
    message = models.TextField()  # The content of the notification
    read = models.BooleanField(default=False)  # Whether the notification has been read
    created_at = models.DateTimeField(default=timezone.now)  # When the notification was created

    def __str__(self):
        return f"Notification {self.notification_id} for {self.user.username}"