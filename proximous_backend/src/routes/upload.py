import os
import uuid
from flask import Blueprint, request, jsonify, send_from_directory, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.utils import secure_filename

upload_bp = Blueprint('upload', __name__)

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'webp', 'gif'}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5 MB

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@upload_bp.route('/photo', methods=['POST'])
@jwt_required()
def upload_photo():
    """
    Upload a photo.
    Supports Cloudinary if configured via CLOUDINARY_URL or CLOUDINARY_CLOUD_NAME.
    Falls back to secure local static storage.
    """
    try:
        current_user_id = get_jwt_identity()
        if not current_user_id:
            return jsonify({'error': 'Unauthorized'}), 401

        if 'file' not in request.files and 'photo' not in request.files:
            return jsonify({'error': 'No file provided in form data'}), 400

        file = request.files.get('file') or request.files.get('photo')
        if file.filename == '':
            return jsonify({'error': 'No selected file'}), 400

        if not allowed_file(file.filename):
            return jsonify({'error': 'Invalid file format. Allowed formats: PNG, JPG, JPEG, WEBP, GIF'}), 400

        # Check Cloudinary configuration
        cloudinary_url = os.environ.get('CLOUDINARY_URL')
        cloudinary_name = os.environ.get('CLOUDINARY_CLOUD_NAME')
        cloudinary_key = os.environ.get('CLOUDINARY_API_KEY')
        cloudinary_secret = os.environ.get('CLOUDINARY_API_SECRET')

        if cloudinary_url or (cloudinary_name and cloudinary_key and cloudinary_secret):
            try:
                import cloudinary
                import cloudinary.uploader
                
                if cloudinary_name and cloudinary_key and cloudinary_secret:
                    cloudinary.config(
                        cloud_name=cloudinary_name,
                        api_key=cloudinary_key,
                        api_secret=cloudinary_secret,
                        secure=True
                    )

                upload_result = cloudinary.uploader.upload(
                    file,
                    folder="proximous_profiles",
                    resource_type="image",
                    transformation=[
                        {'width': 1080, 'height': 1080, 'crop': 'limit'},
                        {'quality': 'auto', 'fetch_format': 'auto'}
                    ]
                )
                photo_url = upload_result.get('secure_url')
                return jsonify({
                    'message': 'Photo uploaded successfully',
                    'photo_url': photo_url,
                    'public_id': upload_result.get('public_id')
                }), 201
            except Exception as ce:
                print(f"Cloudinary upload failed ({ce}), falling back to local storage.")
                try:
                    file.seek(0)
                except Exception:
                    pass

        # Local storage fallback with Pillow optimization
        upload_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'static', 'uploads')
        os.makedirs(upload_dir, exist_ok=True)

        ext = file.filename.rsplit('.', 1)[1].lower()
        unique_filename = f"{uuid.uuid4().hex}_{secure_filename(file.filename.rsplit('.', 1)[0])}.{ext}"
        filepath = os.path.join(upload_dir, unique_filename)

        try:
            from PIL import Image, ImageOps
            img = Image.open(file)
            img = ImageOps.exif_transpose(img)
            
            # Downscale if larger than 1440x1440
            max_size = (1440, 1440)
            img.thumbnail(max_size, Image.Resampling.LANCZOS)
            
            # Save compressed according to format
            if ext in ['jpg', 'jpeg']:
                if img.mode in ('RGBA', 'P'):
                    img = img.convert('RGB')
                img.save(filepath, format='JPEG', quality=85, optimize=True)
            elif ext == 'png':
                img.save(filepath, format='PNG', optimize=True)
            elif ext == 'webp':
                img.save(filepath, format='WEBP', quality=85)
            else:
                file.seek(0)
                file.save(filepath)
        except Exception:
            file.seek(0)
            file.save(filepath)

        # Generate access URL
        base_url = os.environ.get('BACKEND_PUBLIC_URL') or os.environ.get('VITE_API_URL', 'http://localhost:5001')
        base_url = base_url.replace('/api', '').rstrip('/')
        photo_url = f"{base_url}/api/upload/files/{unique_filename}"

        return jsonify({
            'message': 'Photo uploaded successfully',
            'photo_url': photo_url,
            'filename': unique_filename
        }), 201

    except Exception as e:
        return jsonify({'error': 'Upload failed', 'details': str(e)}), 500

@upload_bp.route('/files/<filename>', methods=['GET'])
def serve_uploaded_file(filename):
    """Serves locally stored uploaded files"""
    upload_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'static', 'uploads')
    return send_from_directory(upload_dir, filename)
