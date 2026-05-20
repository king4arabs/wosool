<?php

namespace App\Models;

use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Spatie\Permission\Traits\HasRoles;

#[Fillable(['name', 'email', 'password', 'password_hash', 'role_token', 'email_verified_at'])]
#[Hidden(['password', 'password_hash', 'remember_token'])]
class User extends Authenticatable
{
    use HasFactory, HasRoles, Notifiable;

    /** @use HasFactory<UserFactory> */
    protected function casts(): array
    {
        return [
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

        if (array_key_exists('password_hash', $attributes)) {
            return 'password_hash';
        }

        return 'password';
    }

    public function getAuthPassword(): string
    {
        $attributes = $this->getAttributes();

        if (array_key_exists('password_hash', $attributes)) {
            return (string) ($attributes['password_hash'] ?? '');
        }

        return (string) ($attributes['password'] ?? '');
    }

    public function founderProfile(): HasOne
    {
        return $this->hasOne(FounderProfile::class);
    }

    public function programApplications(): HasMany
    {
        return $this->hasMany(ProgramApplication::class);
    }

    public function eventRsvps(): BelongsToMany
    {
        return $this->belongsToMany(Event::class, 'event_rsvps')
            ->withPivot('status')
            ->withTimestamps();
    }
}
