# دليل تنصيب SmartBuild Pro على VPS

## المتطلبات الأساسية

### متطلبات النظام
- **نظام التشغيل**: Ubuntu 20.04+ أو CentOS 8+ أو Debian 11+
- **الذاكرة**: 2GB RAM كحد أدنى (4GB مُوصى به)
- **التخزين**: 10GB مساحة فارغة كحد أدنى
- **المعالج**: 1 CPU core كحد أدنى (2+ مُوصى به)
- **الشبكة**: اتصال إنترنت مستقر

### البرامج المطلوبة
- Node.js 18.0.0 أو أحدث
- npm 8.0.0 أو أحدث
- Git
- PM2 (لإدارة العمليات)
- Nginx (كخادم ويب عكسي)

## خطوات التنصيب

### 1. تحديث النظام
```bash
# Ubuntu/Debian
sudo apt update && sudo apt upgrade -y

# CentOS/RHEL
sudo yum update -y
# أو للإصدارات الأحدث
sudo dnf update -y
```

### 2. تنصيب Node.js و npm
```bash
# تنصيب Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# التحقق من التنصيب
node --version
npm --version
```

### 3. تنصيب Git
```bash
sudo apt install git -y
```

### 4. إنشاء مستخدم للتطبيق
```bash
sudo adduser smartbuild
sudo usermod -aG sudo smartbuild
su - smartbuild
```

### 5. استنساخ المشروع
```bash
cd /home/smartbuild
git clone https://github.com/your-username/smartbuild-pro.git
cd smartbuild-pro
```

### 6. تنصيب التبعيات
```bash
npm install
```

### 7. إعداد متغيرات البيئة
```bash
cp .env.example .env
nano .env
```

أضف المتغيرات التالية:
```env
# إعدادات الخادم
NODE_ENV=production
PORT=3000
HOST=0.0.0.0

# مفاتيح API
OPENAI_API_KEY=your_openai_key_here
ANTHROPIC_API_KEY=your_anthropic_key_here
GOOGLE_API_KEY=your_google_key_here
OPENROUTER_API_KEY=your_openrouter_key_here

# إعدادات الأمان
JWT_SECRET=your_super_secret_jwt_key_here
ENCRYPTION_KEY=your_32_character_encryption_key

# إعدادات قاعدة البيانات (اختياري)
DATABASE_URL=postgresql://user:password@localhost:5432/smartbuild

# إعدادات CORS
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

### 8. بناء التطبيق
```bash
npm run build
```

### 9. تنصيب PM2
```bash
sudo npm install -g pm2
```

### 10. إنشاء ملف تكوين PM2
```bash
nano ecosystem.config.js
```

أضف المحتوى التالي:
```javascript
module.exports = {
  apps: [{
    name: 'smartbuild-pro',
    script: 'npm',
    args: 'start',
    cwd: '/home/smartbuild/smartbuild-pro',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: '/home/smartbuild/logs/err.log',
    out_file: '/home/smartbuild/logs/out.log',
    log_file: '/home/smartbuild/logs/combined.log',
    time: true,
    max_memory_restart: '1G',
    restart_delay: 4000,
    max_restarts: 10,
    min_uptime: '10s'
  }]
};
```

### 11. إنشاء مجلد السجلات
```bash
mkdir -p /home/smartbuild/logs
```

### 12. تشغيل التطبيق
```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### 13. تنصيب وإعداد Nginx
```bash
sudo apt install nginx -y
```

إنشاء ملف تكوين Nginx:
```bash
sudo nano /etc/nginx/sites-available/smartbuild
```

أضف التكوين التالي:
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # إعادة توجيه HTTP إلى HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    # شهادات SSL (ستحتاج لإعدادها)
    ssl_certificate /etc/ssl/certs/smartbuild.crt;
    ssl_certificate_key /etc/ssl/private/smartbuild.key;

    # إعدادات SSL الأمنية
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;

    # إعدادات الأمان
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;

    # إعدادات الضغط
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private must-revalidate auth;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/javascript;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 86400;
    }

    # إعدادات الملفات الثابتة
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### 14. تفعيل الموقع
```bash
sudo ln -s /etc/nginx/sites-available/smartbuild /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 15. إعداد شهادة SSL مع Let's Encrypt
```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

### 16. إعداد جدار الحماية
```bash
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

## إعدادات إضافية

### مراقبة التطبيق
```bash
# عرض حالة التطبيق
pm2 status

# عرض السجلات
pm2 logs smartbuild-pro

# إعادة تشغيل التطبيق
pm2 restart smartbuild-pro

# إيقاف التطبيق
pm2 stop smartbuild-pro
```

### النسخ الاحتياطي التلقائي
إنشاء سكريبت النسخ الاحتياطي:
```bash
nano /home/smartbuild/backup.sh
```

```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/home/smartbuild/backups"
APP_DIR="/home/smartbuild/smartbuild-pro"

mkdir -p $BACKUP_DIR

# نسخ احتياطي للتطبيق
tar -czf $BACKUP_DIR/smartbuild_$DATE.tar.gz -C $APP_DIR .

# حذف النسخ الاحتياطية الأقدم من 7 أيام
find $BACKUP_DIR -name "smartbuild_*.tar.gz" -mtime +7 -delete

echo "تم إنشاء النسخة الاحتياطية: smartbuild_$DATE.tar.gz"
```

جعل السكريبت قابل للتنفيذ:
```bash
chmod +x /home/smartbuild/backup.sh
```

إضافة مهمة cron للنسخ الاحتياطي اليومي:
```bash
crontab -e
```

أضف السطر التالي:
```
0 2 * * * /home/smartbuild/backup.sh
```

### تحديث التطبيق
```bash
cd /home/smartbuild/smartbuild-pro
git pull origin main
npm install
npm run build
pm2 restart smartbuild-pro
```

## استكشاف الأخطاء

### مشاكل شائعة وحلولها

1. **خطأ في الاتصال بالمنفذ**
   ```bash
   sudo netstat -tulpn | grep :3000
   sudo lsof -i :3000
   ```

2. **مشاكل الذاكرة**
   ```bash
   free -h
   pm2 monit
   ```

3. **مشاكل SSL**
   ```bash
   sudo certbot renew --dry-run
   sudo nginx -t
   ```

4. **فحص السجلات**
   ```bash
   pm2 logs smartbuild-pro --lines 100
   sudo tail -f /var/log/nginx/error.log
   ```

## الأمان

### تحديثات الأمان
```bash
# تحديث النظام بانتظام
sudo apt update && sudo apt upgrade -y

# تحديث Node.js و npm
npm update -g npm
```

### إعدادات إضافية للأمان
1. تغيير منفذ SSH الافتراضي
2. تعطيل تسجيل الدخول كـ root
3. استخدام مفاتيح SSH بدلاً من كلمات المرور
4. تفعيل fail2ban لحماية من الهجمات

## الدعم والمساعدة

إذا واجهت أي مشاكل:
1. تحقق من السجلات: `pm2 logs smartbuild-pro`
2. تحقق من حالة الخدمات: `sudo systemctl status nginx`
3. راجع ملفات التكوين
4. تواصل مع فريق الدعم

---

**ملاحظة**: تأكد من استبدال `yourdomain.com` بنطاقك الفعلي وإعداد مفاتيح API الصحيحة قبل التشغيل في الإنتاج.