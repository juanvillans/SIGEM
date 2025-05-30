<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class RequestProductResource extends JsonResource
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
            'entityCode' => $this->entity_code,
            'entityCodeName' => $this->entity->name,
            'entityCodeDestiny' => $this->entity_code_destiny,
            'entityCodeDestinyName' => $this->entityDestiny->name,
            'code' => $this->code,
            'day' => $this->day,
            'month' => $this->month,
            'year' => $this->year,
            'date' => $this->created_at->format('Y-m-d'),
            'time' => substr($this->created_time, 0, -3),
            'status' => $this->status,
            'userFullName' => $this->created_by,
            'comment' => $this->comment,
        ];
    }
}
