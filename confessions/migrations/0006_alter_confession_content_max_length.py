from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('confessions', '0005_comment_author'),
    ]

    operations = [
        migrations.AlterField(
            model_name='confession',
            name='content',
            field=models.TextField(max_length=1000),
        ),
    ]
