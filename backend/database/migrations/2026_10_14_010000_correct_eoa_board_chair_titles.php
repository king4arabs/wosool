<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Titles confirmed by the EO Riyadh program chair on 14 October 2026.
        $titles = [
            'mohamed-balsharaf' => ['Partnership Chair', 'رئيس الشراكات'],
            'gilbert-rustom' => ['Marketing and Communication Chair', 'رئيس التسويق والاتصال المؤسسي'],
            'faisal-alqarni' => ['Financial Chair', 'رئيس الشؤون المالية'],
            'abdulaziz-alothaim' => ['Engagement Chair', 'رئيس تفاعل الأعضاء'],
        ];

        DB::transaction(function () use ($titles) {
            foreach ($titles as $slug => [$english, $arabic]) {
                DB::table('eoa_board_members')
                    ->whereIn('program_id', DB::table('programs')->select('id')->where('slug', 'eo-riyadh-accelerator'))
                    ->where('board_term', '2026/27')
                    ->where('slug', $slug)
                    ->update([
                        'position_en' => $english,
                        'position_ar' => $arabic,
                        'version' => DB::raw('version + 1'),
                        'updated_at' => now(),
                    ]);
            }
        });
    }

    public function down(): void
    {
        // Keep confirmed content and any subsequent administrator edits on rollback.
    }
};
