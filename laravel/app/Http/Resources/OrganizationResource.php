<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrganizationResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [

            'id' => $this->id,
            'name' => $this->name,
            'code' => $this->code,
            'authorityFullname' => $this->authority_fullname,
            'authorityCi' => $this->authority_ci,
            "municipalityId" => $this->municipality_id ?? null,
            "municipalityName" => $this->municipality->name ?? null,
            "parishId" => $this->parish_id ?? null,
            "parishName" => $this->parish->name ?? null,
        ];
    }
}
