<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ContactMessage extends Model
{
    /** Labels match the choices on the public contact form, so the team sees what the sender picked. */
    public const CATEGORIES = [
        'general' => ['سؤال عام', 'General question'],
        'founder-support' => ['دعم المؤسسين', 'Founder support'],
        'partnerships' => ['شراكة', 'Partnership'],
        'sponsorship' => ['رعاية', 'Sponsorship'],
        'media' => ['إعلام', 'Media'],
        'office-hours' => ['جلسة مع الفريق', 'Time with the team'],
    ];

    protected $table = 'contact_messages';

    protected $fillable = [
        'name',
        'email',
        'company',
        'category',
        'subject',
        'message',
        'ip_address',
        'responded_at',
        'responded_by',
    ];

    protected $casts = [
        'responded_at' => 'datetime',
    ];

    public function responder(): BelongsTo
    {
        return $this->belongsTo(User::class, 'responded_by');
    }
}
