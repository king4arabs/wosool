<?php
namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Models\AdminAction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class EventPartnerController extends Controller
{
 public function show(Event $event) {
  return response()->json(['data'=>$event->sponsor_partner_blocks ?? []])->header('Cache-Control','no-store');
 }
 public function update(Request $request, Event $event) {
  $data=$request->validate([
   'partners'=>'present|array|max:50',
   'partners.*'=>'array:name,logo_url,cta_link,type,published',
   'partners.*.name'=>'required|string|max:160',
   'partners.*.logo_url'=>'required|url:https|max:500',
   'partners.*.cta_link'=>'nullable|url:https|max:500',
   'partners.*.type'=>'required|in:partner,sponsor,venue,media,community',
   'partners.*.published'=>'required|boolean',
  ]);
  $event=DB::transaction(function() use($event,$data,$request) {
   $locked=Event::whereKey($event->id)->lockForUpdate()->firstOrFail();
   $before=$locked->sponsor_partner_blocks;
   $locked->update(['sponsor_partner_blocks'=>array_values($data['partners'])]);
   AdminAction::log($request->user()->id,'event.partners.updated','event',$locked->id,$locked->title,['partners'=>$before],['partners'=>$locked->sponsor_partner_blocks]);
   return $locked;
  });
  return $this->show($event);
 }
}
