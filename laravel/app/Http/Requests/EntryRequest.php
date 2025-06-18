<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class EntryRequest extends FormRequest
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

            'area' => [
                'nullable',
                'string',
                'max:255'
            ],
            'product_id' => [
                'required',
                'integer',
                'exists:products,id'
            ],
            'quantity' => [
                'nullable',
                'integer',
                'min:1',
            ],
            'serial_number' => [
                'required',
                'string',
                'max:30'
            ],
            'national_code' => [
                'required',
                'string',
                'max:30'
            ],
            'organization_id' => [
                'required',
                'integer',
                'exists:organizations,id'
            ],
            'machine_status_id' => [
                'required',
                'integer',
                'exists:machine_statuses,id'
            ],
            'components' => [
                'required',
                'array'
            ],
            'arrival_time' => [
                'required',
                'string',
                'regex:/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/' // Formato HH:MM
            ],

            'arrival_date' => [
                'required',
                'string',
            ],
        ];
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array
     */
    public function messages()
    {
        return [
            'product_id.required' => 'El producto es requerido',
            'product_id.exists' => 'El producto especificado no existe',
            'serial_number.required' => 'El número de serie es requerido',
            'national_code.required' => 'El código nacional es requerido',
            'organization_id.required' => 'La organizacion de origen es requerido',
            'machine_status_id.required' => 'El estado del equipo es requerido',
            'components.required' => 'Los componentes son requeridos',
            'arrival_time.required' => 'La hora de llegada es requerida',
            'arrival_time.regex' => 'El formato de hora debe ser HH:MM',
        ];
    }




}

