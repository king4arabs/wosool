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
    'validation' => [
        'application' => [
            'full_name_required' => 'اكتب اسمك الكامل.',
            'email_required' => 'اكتب بريدك الإلكتروني.',
            'email_email' => 'اكتب بريدًا إلكترونيًا صحيحًا.',
            'phone_required' => 'اكتب رقم جوالك.',
            'company_name_required' => 'اكتب اسم شركتك.',
            'sector_required' => 'اختر قطاع شركتك.',
            'stage_required' => 'اختر مرحلة شركتك.',
            'location_required' => 'اكتب مدينتك أو موقعك.',
            'motivation_required' => 'أخبرنا لماذا تريد الانضمام إلى وصول.',
        ],
        'contact' => [
            'name_required' => 'اكتب اسمك.',
            'email_required' => 'اكتب بريدك الإلكتروني.',
            'email_email' => 'اكتب بريدًا إلكترونيًا صحيحًا.',
            'category_required' => 'اختر نوع الرسالة.',
            'subject_required' => 'اكتب عنوانًا قصيرًا للرسالة.',
            'message_required' => 'اكتب رسالتك.',
        ],
        'program_application' => [
            'motivation_required' => 'يرجى توضيح سبب رغبتك في الانضمام.',
            'motivation_min' => 'يرجى كتابة 20 حرفًا على الأقل في حقل الدافع.',
        ],
        'introduction' => [
            'target_required' => 'اختر المؤسس الذي تريد التعرّف عليه.',
            'target_exists' => 'ملف هذا المؤسس لم يعد موجودًا.',
            'brief_required' => 'أضف ملاحظة قصيرة عن سبب طلب التعارف.',
            'brief_min' => 'اكتب 20 حرفًا على الأقل عن سبب طلب التعارف.',
        ],
    ],
];
