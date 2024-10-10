

from django.db import models
from django.contrib.auth.models import AbstractUser
from django.contrib.postgres.fields import ArrayField
from django.contrib.auth.hashers import make_password
from django.utils import timezone

class User(AbstractUser):
    branch = models.CharField(max_length=100)
    enrollment_no = models.CharField(max_length=20)
    rolenames = ArrayField(
        models.CharField(max_length=50),
        size=3,
        default=list
    )

    def __str__(self):
        return self.username

class Group(models.Model):
    group_name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    created_by = models.ForeignKey('User', on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    members = ArrayField(
        models.CharField(max_length=50),
        blank=True,
        default=list
    )

    def __str__(self):
        return self.group_name

class Assignment(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField()
    attachment = models.FileField(upload_to='assignments/', blank=True, null=True)
    creator = models.ForeignKey('User', on_delete=models.CASCADE)
    reviewees = ArrayField(
        models.IntegerField(),
        blank=True,
        default=list
    )
    group = models.ForeignKey('Group', on_delete=models.SET_NULL, blank=True, null=True)
    reviewers = ArrayField(
        models.IntegerField(),
        blank=True,
        default=list
    )
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
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='unchecked')
    created_at = models.DateTimeField(default=timezone.now)
    reviewed_at = models.DateTimeField(blank=True, null=True)

    def __str__(self):
        return f'Submission {self.submission_id} for {self.assignment.title}'

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
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f'Subtask {self.subtask_id} for Submission {self.submission.submission_id}'

