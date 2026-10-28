<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
class FounderOutreach extends Model {
    protected $table = 'founder_outreach';
    protected $guarded = ['id'];
    protected $hidden = ['email', 'evidence'];
    protected function casts(): array { return ['email' => 'encrypted', 'verified_at' => 'datetime', 'next_attempt_at' => 'datetime']; }
    public function founder(): BelongsTo { return $this->belongsTo(FounderProfile::class, 'founder_profile_id'); }
    public function admin(): BelongsTo { return $this->belongsTo(User::class, 'requested_by'); }
    public function adminData(): array {
        return $this->only(['status', 'email', 'evidence', 'source_url', 'verified_at', 'attempts', 'next_attempt_at', 'last_error']);
    }
}
