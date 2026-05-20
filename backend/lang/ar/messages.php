<?php

return [
    'auth' => [
        'csrf_initialized' => 'تم تهيئة رمز الحماية CSRF.',
        'invalid_credentials' => 'بيانات تسجيل الدخول غير صحيحة.',
        'login_success' => 'تم تسجيل الدخول بنجاح.',
        'email_not_approved' => 'هذا البريد غير معتمد بعد. يرجى تقديم طلب انضمام أولًا أو انتظار الموافقة.',
        'invalid_invite_token' => 'رمز الدعوة غير صالح أو منتهي الصلاحية.',
        'account_created' => 'تم إنشاء الحساب بنجاح.',
        'logout_success' => 'تم تسجيل الخروج بنجاح.',
    ],
    'founder' => [
        'profile_not_found' => 'لا يوجد ملف مؤسس مرتبط بهذا الحساب.',
        'profile_created' => 'تم إنشاء الملف الشخصي.',
        'profile_updated' => 'تم تحديث الملف الشخصي.',
    ],
    'scorecard' => [
        'not_found' => 'لا توجد بطاقة تقييم حالياً.',
        'founder_not_found' => 'تعذر العثور على ملف المؤسس.',
        'recalculated' => 'تمت إعادة حساب بطاقة التقييم بنجاح.',
    ],
    'intro' => [
        'founder_not_found' => 'تعذر العثور على ملف المؤسس للمستخدم الحالي.',
        'active_limit_reached' => 'تم الوصول إلى الحد الأقصى لطلبات التعريف النشطة.',
        'active_limit_detail' => 'لديك بالفعل 3 طلبات INTRO_PENDING نشطة. الرجاء الموافقة أو الرفض أو الانتظار حتى انتهاء الصلاحية قبل إنشاء طلب جديد.',
        'created' => 'تم إنشاء مسار التعريف بنجاح.',
        'approve_unauthorized' => 'غير مصرح لك بالموافقة على مسار التعريف هذا.',
        'approve_invalid_status' => 'يمكن الموافقة فقط على الطلبات بحالة INTRO_PENDING.',
        'decline_unauthorized' => 'غير مصرح لك برفض مسار التعريف هذا.',
        'decline_invalid_status' => 'يمكن الرفض فقط للطلبات بحالة INTRO_PENDING.',
        'approved' => 'تمت الموافقة على مسار التعريف بنجاح.',
        'declined' => 'تم رفض مسار التعريف بنجاح.',
    ],
];

