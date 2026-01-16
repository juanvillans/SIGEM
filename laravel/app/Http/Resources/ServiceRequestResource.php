<?php

namespace App\Http\Resources;

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
        return [
            "id" => $this->id,
            "entity_code" => $this->entity_code,
            "title" => $this->title,
            "body" => $this->body,
            "status" => $this->status,
            "created_at" => $this->created_at,
            "updated_at" => $this->updated_at,
            "entityId" => $this->entity->id,
            "entityCode" => $this->entity->code,
            "entityName" => $this->entity->name,
        ];
    }
}
