<?php

namespace App\Http\Resources;

use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ServiceRequestResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $createdAt = $this->getOriginal('created_at')
            ? Carbon::parse($this->getOriginal('created_at'))
            : null;


        return [
            "id" => $this->id,
            "entity_code" => $this->entity_code,
            "body" => $this->body,
            "status" => $this->status,
            "day" => $createdAt ? $createdAt->format('d') : null,
            "month" => $createdAt ? $createdAt->format('m') : null,
            "year" => $createdAt ? $createdAt->format('Y') : null,
            "created_at" => $this->created_at,
            "updated_at" => $this->updated_at,
            "entityId" => $this->entity->id,
            "entityCode" => $this->entity->code,
            "entityName" => $this->entity->name,
        ];
    }
}
