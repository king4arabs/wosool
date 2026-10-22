<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
class StartupDirectoryEntry extends Model
{
    protected $guarded = ['id'];
    protected function casts(): array { return ['profile' => 'array', 'source_keys' => 'array', 'is_published' => 'boolean']; }
}
