<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\FounderResource;
use App\Models\FounderProfile;
use App\Support\{CommunityEngagement, DirectoryGeography, FounderSearch};
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FounderController extends Controller
{
    private function profiles(): Builder
    {
        return CommunityEngagement::withCounts(FounderProfile::query()->publiclyListed())
            ->with(['user:id,name', 'companies' => fn ($q) => DirectoryGeography::visible($q->getQuery())
                ->where('is_public', true)->where('status', 'active')]);
    }

    /** A stable slice for one visit. Two indexed ranges avoid a table-wide random sort. */
    public function discover(Request $request): JsonResponse
    {
        $params = $request->validate(['start' => 'required|uuid']);
        $limit = 24;
        $base = $this->profiles()->orderBy('founder_uid');
        $cards = (clone $base)->where('founder_uid', '>=', $params['start'])->limit($limit)->get();
        if ($cards->count() < $limit) {
            $cards = $cards->concat((clone $base)->where('founder_uid', '<', $params['start'])
                ->limit($limit - $cards->count())->get());
        }

        return FounderResource::collection($cards)->response()->header('Cache-Control', 'no-store');
    }

    public function index(Request $request): JsonResponse
    {
        $request->validate([
            'country' => 'sometimes|string|size:2', 'region' => 'sometimes|in:saudi,gcc,mena,other',
            'search' => 'sometimes|string|max:120', 'slug' => 'sometimes|string|max:255',
            'companies' => 'sometimes|array|min:1|max:10', 'companies.*' => 'required|string|max:255',
        ]);
        $query = $this->profiles();

        if ($request->boolean('community')) { $query->whereNotNull('user_id')->where(fn ($q) => $q->whereNull('directory_key')->orWhereNotNull('claimed_at')); }

        $facets = $request->boolean('facets') ? [
            'sectors' => (clone $query)->setEagerLoads([])->select(['sector', 'translations'])->get()->map(fn ($p) => ['en' => $p->sector, 'ar' => data_get($p->translations, 'ar.sector', $p->sector)])->filter(fn ($s) => filled($s['en']))->unique('en')->values(),
            'stages' => (clone $query)->whereNotNull('stage')->where('stage', '<>', '')->distinct()->pluck('stage'),
        ] : [];
        // Exact public-card lookup for member dashboard deep links. Publication and geography rules apply first.
        if ($request->filled('slug')) $query->where('slug', $request->string('slug')->toString());
        if ($request->filled('country')) DirectoryGeography::filterCountry($query, strtoupper(trim($request->country)));
        if ($request->filled('region')) DirectoryGeography::filterRegion($query, $request->region);

        if ($request->has('companies')) {
            $aliases = $request->input('companies');
            $query->whereHas('companies', fn ($q) => DirectoryGeography::visible($q)->where('is_public', true)
                ->where('status', 'active')->where(fn ($names) => $names->whereIn('slug', $aliases)
                    ->orWhereIn('name', $aliases)->orWhereIn('translations->ar->name', $aliases)
                    ->orWhereIn('translations->en->name', $aliases)));
        }
        if ($request->has('sector')) {
            $query->where(fn ($q) => $q->where('sector', $request->sector)->orWhere('translations->ar->sector', $request->sector));
        }
        if ($request->has('stage')) {
            $query->where('stage', $request->stage);
        }
        if ($request->filled('search')) FounderSearch::apply($query, $request->string('search')->toString());
        if ($request->boolean('featured')) {
            $query->where('is_featured', true);
        }

        $founders = DirectoryGeography::orderFounders($query)
            ->orderBy('is_featured', 'desc')
            ->orderBy('created_at', 'desc')
            ->orderBy('id', 'desc')
            ->paginate(max(1, min(24, $request->integer('per_page', 12))))
            ->withQueryString();

        return FounderResource::collection($founders)->additional(['meta' => $facets])->response();
    }

    public function show(string $slug): JsonResponse
    {
        $founder = $this->profiles()->where('slug', $slug)
            ->firstOrFail();

        return response()->json([
            'data' => new FounderResource($founder),
        ]);
    }

    /**
     * Return the authenticated user's founder profile.
     */
    public function myProfile(Request $request): JsonResponse
    {
        $user = $request->user();
        $profile = $user->founderProfile()
            ?->with(['companies', 'scorecard'])
            ->first();

        if (! $profile) {
            return response()->json(['message' => 'No founder profile found.'], 404);
        }

        return response()->json(['data' => new FounderResource($profile)]);
    }
}
