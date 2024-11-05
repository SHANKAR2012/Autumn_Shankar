# Generated by Django 4.2 on 2024-11-02 09:32

from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("checkapp", "0007_alter_user_email"),
    ]

    operations = [
        migrations.RemoveField(
            model_name="group",
            name="member_ids",
        ),
        migrations.RemoveField(
            model_name="user",
            name="rolenames",
        ),
        migrations.AddField(
            model_name="group",
            name="members",
            field=models.ManyToManyField(
                related_name="member_groups", to=settings.AUTH_USER_MODEL
            ),
        ),
        migrations.RemoveField(
            model_name="assignment",
            name="reviewees",
        ),
        migrations.RemoveField(
            model_name="assignment",
            name="reviewers",
        ),
        migrations.AddField(
            model_name="assignment",
            name="reviewees",
            field=models.ManyToManyField(
                related_name="assigned_reviewees", to=settings.AUTH_USER_MODEL
            ),
        ),
        migrations.AddField(
            model_name="assignment",
            name="reviewers",
            field=models.ManyToManyField(
                related_name="assigned_reviewers", to=settings.AUTH_USER_MODEL
            ),
        ),
    ]