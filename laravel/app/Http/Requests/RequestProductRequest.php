<?php

namespace App\Http\Requests;

use Illuminate\Validation\Rule;
use App\Enums\InventoryMoveStatus;
use Illuminate\Foundation\Http\FormRequest;

class RequestProductRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'entity_code' => [
                'required',
                'string',
                'max:255',
                Rule::exists('hierarchy_entities', 'code')
            ],
            'entity_code_destiny' => [
                'required',
                'string',
                'max:255',
                Rule::exists('hierarchy_entities', 'code'),
                'different:entity_code' // Asegura que no sea la misma entidad
            ],
            'comment' => [
                'nullable',
                'string',
                'max:500'
            ],
            'status' => [
                'sometimes',
                'integer',
            ],
            'output_general_id' => [
                'nullable',
                'integer',
            ],
            'product_id' => [
                'required',
                'integer',
                Rule::exists('products', 'id')
            ]
        ];
    }

     protected function prepareForValidation()
    {
        $this->merge([
            'status' => InventoryMoveStatus::SIN_CONFIRMAR->value,
            'entity_code' => auth()->user()->entity_code,
        ]);
    }
}
