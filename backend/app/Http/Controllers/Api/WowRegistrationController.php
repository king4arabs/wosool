<?php
namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use App\Mail\{WosoolMail,BilingualEmail};
use App\Services\Mailer;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class WowRegistrationController extends Controller
{
 private const URL = 'https://luma.com/8fccrqkx';
 public function show(Request $request) {
  $record = DB::table('wow_event_registrations')->where('user_id',$request->user()->id)->first();
  return response()->json(['registration'=>$record,'ticket_url'=>$record ? self::URL : null])->header('Cache-Control','no-store');
 }
 public function store(Request $request) {
  abort_if(now()->gte(\Carbon\Carbon::parse('2026-12-12T00:00:00+03:00')),410,'Registration is closed.');
  $data=$request->validate(['phone'=>'required|string|max:50','company'=>'required|string|max:255','eo_interest'=>'required|boolean','eoa_interest'=>'required|boolean','consent'=>'accepted']);
  unset($data['consent']);
  $user=$request->user();
  $record=DB::transaction(function() use ($user,$data) {
   User::whereKey($user->id)->lockForUpdate()->firstOrFail();
   $existing=DB::table('wow_event_registrations')->where('user_id',$user->id)->first();
   if ($existing) return $existing;
   $id=DB::table('wow_event_registrations')->insertGetId([...$data,'user_id'=>$user->id,'consented_at'=>now(),'created_at'=>now(),'updated_at'=>now()]);
   return DB::table('wow_event_registrations')->where('id',$id)->first();
  });
  if (!$record->ticket_email_sent_at) {
   // Claim delivery before sending to avoid duplicate concurrent messages.
   $claimed=DB::table('wow_event_registrations')->where('id',$record->id)->whereNull('ticket_email_sent_at')->update(['ticket_email_sent_at'=>now()]);
   if ($claimed) {
    $mail=new WosoolMail('wow-rsvp','أكمل حجز تذكرتك | EO Riyadh WOW','Complete your RSVP | EO Riyadh WOW',BilingualEmail::data(
     ar:['title'=>'أكمل حجز تذكرتك','lines'=>['تم حفظ تسجيلك في وصول. أكمل طلب الحضور عبر Luma بنفس البريد الإلكتروني. التذكرة تصدر بعد موافقة المنظمين.','الجمعة 11 ديسمبر 2026، Golf Club Wadi Safar.']],
     en:['title'=>'Complete your ticket registration','lines'=>['Your Wosool registration is saved. Complete your RSVP in Luma using the same email address. Admission is subject to organizer approval.','Friday, December 11, 2026, Golf Club Wadi Safar.']],
     action:BilingualEmail::action(self::URL,'أكمل حجز التذكرة','Complete RSVP')
    ));
    if (!Mailer::safely($user->email,$mail,['wow_registration_id'=>$record->id])) DB::table('wow_event_registrations')->where('id',$record->id)->update(['ticket_email_sent_at'=>null]);
   }
  }
  return $this->show($request);
 }
}
