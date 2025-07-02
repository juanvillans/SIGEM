<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Validation\ValidationException;
use Illuminate\Validation\Rule;

class OutputRequest extends FormRequest
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
            'departure_date' => ['required','string'],
            'departure_time'=> [
                'required',
                'string',
                'regex:/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/'
            ],
            'inventory_general_id' => [
                'required',
                'integer',
                'exists:inventory_generals,id'
            ],
            'organization_id' => [
                'required',
                'integer',
                'exists:organizations,id'
            ],
            'area' => [
                'nullable',
                'string',
                'max:255'
            ],

            'description' => [
                'nullable',
                'string',
                'max:255'
            ],
        ];
    }

    public function messages()
    {
        return [
            'inventory_general_id.required' => 'El producto es requerido',
            'inventory_general_id.exists' => 'El producto especificado no existe en inventario',
            'organization_id.required' => 'La organizacion de destino es requerido',
            'departure_time.required' => 'La hora de salida es requerida',
            'departure_time.regex' => 'El formato de hora debe ser HH:MM',
        ];
    }
}
