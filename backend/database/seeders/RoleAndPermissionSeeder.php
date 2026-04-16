<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RoleAndPermissionSeeder extends Seeder
{
    public function run(): void
    {
        // Reset cached roles and permissions
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // Create permissions
        $permissions = [
            // Profile management
            'profile.view',
            'profile.edit',

            // Company management
            'company.view',
            'company.edit',
            'company.create',

            // Community
            'community.view',
            'matches.view',
            'matches.respond',
            'messages.send',
            'messages.view',

            // Events
            'events.view',
            'events.rsvp',
            'events.manage',

            // Programs
            'programs.view',
            'programs.apply',
            'programs.manage',

            // Admin
            'admin.dashboard',
            'admin.members.manage',
            'admin.applications.manage',
            'admin.content.manage',
            'admin.analytics.view',
            'admin.settings.manage',
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission, 'guard_name' => 'web']);
        }

        // Create roles and assign permissions
        $memberRole = Role::firstOrCreate(['name' => 'member', 'guard_name' => 'web']);
        $memberRole->syncPermissions([
            'profile.view',
            'profile.edit',
            'company.view',
            'company.edit',
            'company.create',
            'community.view',
            'matches.view',
            'matches.respond',
            'messages.send',
            'messages.view',
            'events.view',
            'events.rsvp',
            'programs.view',
            'programs.apply',
        ]);

        $adminRole = Role::firstOrCreate(['name' => 'admin', 'guard_name' => 'web']);
        $adminRole->syncPermissions(Permission::all());
    }
}
