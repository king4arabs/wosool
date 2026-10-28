<?php

namespace App\Models;

use Database\Factories\UserFactory;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Spatie\Permission\Traits\HasRoles;

#[Fillable(['name', 'email', 'password', 'password_hash', 'role_token', 'email_verified_at', 'is_accelerator_applicant', 'privacy_accepted_at', 'community_registration_started_at'])]
#[Hidden(['password', 'password_hash', 'remember_token'])]
class User extends Authenticatable implements MustVerifyEmail
{
    use HasFactory, HasRoles, Notifiable;

    protected $attributes = ['is_accelerator_applicant' => false, 'community_registration_started_at' => null];

    /** @use HasFactory<UserFactory> */
    protected function casts(): array
    {
        return [
            'is_accelerator_applicant' => 'boolean',
            'privacy_accepted_at' => 'datetime',
            'community_registration_started_at' => 'datetime',
            'password' => 'hashed',
            'password_hash' => 'hashed',
            'email_verified_at' => 'datetime',
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
        ];
    }

    public function getAuthPasswordName(): string
    {
        $attributes = $this->getAttributes();

        if (! empty($attributes['password_hash'])) {
            return 'password_hash';
        }

        return 'password';
    }

    public function getAuthPassword(): string
    {
        $attributes = $this->getAttributes();

        if (! empty($attributes['password_hash'])) {
            return (string) $attributes['password_hash'];
        }

        return (string) ($attributes['password'] ?? '');
    }

    public function founderProfile(): HasOne
    {
        return $this->hasOne(FounderProfile::class);
    }

    public function userSetting(): HasOne
    {
        return $this->hasOne(UserSetting::class);
    }

    public function programApplications(): HasMany
    {
        return $this->hasMany(ProgramApplication::class);
    }

    public function programParticipants(): HasMany
    {
        return $this->hasMany(ProgramParticipant::class);
    }

    public function eventRsvps(): BelongsToMany
    {
        return $this->belongsToMany(Event::class, 'event_rsvps')
            ->withPivot('status')
            ->withTimestamps();
    }

    /**
     * Legacy deployments carry a `role_token` column; current schemas use Spatie roles only.
     * Read it without tripping strict-mode missing-attribute exceptions.
     */
    public function roleToken(): ?string
    {
        $value = $this->getAttributes()['role_token'] ?? null;

        return $value !== null && $value !== '' ? (string) $value : null;
    }

    public function isPlatformAdmin(): bool
    {
        return $this->roleToken() === 'admin' || $this->hasRole('admin');
    }
}
