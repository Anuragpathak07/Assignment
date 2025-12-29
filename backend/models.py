from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class Article(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(255), nullable=False)
    content = db.Column(db.Text, nullable=False)
    source_url = db.Column(db.String(500))
    type = db.Column(db.String(20), default="original")  # original | updated
    references = db.Column(db.Text)  # comma-separated URLs

    def to_dict(self):
        return {
            "id": self.id,
            "title": self.title,
            "content": self.content,
            "source_url": self.source_url,
            "type": self.type,
            "references": self.references.split(",") if self.references else []
        }
